/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#include "com_tencent_mtt_hippy_bridge_HippyBridgeImpl.h"  // NOLINT(build/include)

#include <android/asset_manager.h>
#include <android/asset_manager_jni.h>
#include <jni.h>
#include <stdint.h>
#include <sys/stat.h>

#include <future>

#include "core/base/common.h"
#include "core/base/file.h"
#include "core/base/logging.h"
#include "core/base/macros.h"
#include "core/engine.h"
#include "core/napi/native-source-code.h"
#include "core/napi/v8/js-native-api-v8.h"
#include "core/scope.h"
#include "core/task/common-task.h"
#include "core/task/javascript-task-runner.h"
#include "core/task/javascript-task.h"
#include "core/task/worker-task-runner.h"
#include "exception-handler.h"  // NOLINT(build/include_subdir)
#include "hippy-buffer.h"       // NOLINT(build/include_subdir)
#include "inspector/v8-inspector-client-impl.h"
#include "jni-env.h"    // NOLINT(build/include_subdir)
#include "jni-utils.h"  // NOLINT(build/include_subdir)
#include "runtime.h"    // NOLINT(build/include_subdir)
#include "scoped-java-ref.h"

using namespace v8;
using namespace hippy::napi;

using RegisterMap = hippy::base::RegisterMap;
using RegisterFunction = hippy::base::RegisterFunction;
using Ctx = hippy::napi::Ctx;

static std::unordered_map<int64_t, std::pair<std::shared_ptr<Engine>, uint32_t>>
    ReUseEngine;
static std::unordered_map<int64_t, std::shared_ptr<V8Runtime>> RuntimeMap;
static std::unordered_map<int64_t, std::shared_ptr<int64_t>> RuntimeKeyMap;

static std::mutex runtime_mutex;
static std::mutex engine_mutex;
static const int64_t kDefaultEngineId = -1;
static const int64_t kDebuggerEngineId = -9999;
static int64_t global_runtime_key = 0;

std::shared_ptr<V8InspectorClientImpl> global_inspector = nullptr;

namespace {

void CallJavaMethod(jobject obj, jlong value) {
  HIPPY_DLOG(hippy::Debug, "CallJavaMethod begin");
  jclass j_class = nullptr;

  do {
    if (!obj) {
      HIPPY_DLOG(hippy::Debug, "CallJavaMethod obj is nullptr");
      break;
    }

    j_class = JNIEnvironment::AttachCurrentThread()->GetObjectClass(obj);
    if (!j_class) {
      HIPPY_LOG(hippy::Error, "CallJavaMethod j_class error");
      break;
    }

    jmethodID j_cb_id = JNIEnvironment::AttachCurrentThread()->GetMethodID(
        j_class, "Callback", "(J)V");
    if (!j_cb_id) {
      HIPPY_LOG(hippy::Error, "CallJavaMethod j_cb_id error");
      break;
    }

    HIPPY_DLOG(hippy::Debug, "CallJavaMethod call method");
    JNIEnvironment::AttachCurrentThread()->CallVoidMethod(obj, j_cb_id, value);
    JNIEnvironment::ClearJEnvException(JNIEnvironment::AttachCurrentThread());
  } while (0);

  if (j_class) {
    JNIEnvironment::AttachCurrentThread()->DeleteLocalRef(j_class);
  }
  HIPPY_DLOG(hippy::Debug, "CallJavaMethod end");
}
}  // namespace

bool RunScript(std::shared_ptr<V8Runtime> runtime,
               const std::string& file_name,
               bool is_use_code_cache,
               const std::string& code_cache_dir,
               const std::string& file_path,
               AAssetManager* asset_manager) {
  HIPPY_LOG(hippy::Info,
            "RunScript begin, file_name = %s, is_use_code_cache = %d, "
            "code_cache_dir = %s, file_path = %s, asset_manager = %d",
            file_name.c_str(), is_use_code_cache, code_cache_dir.c_str(),
            file_path.c_str(), asset_manager);
  std::unique_ptr<std::vector<char>> script_content;
  std::shared_ptr<std::vector<char>> code_cache_content;
  uint64_t modify_time = 0;
  std::string code_cache_path;
  std::string code_cache_dir_path;
  std::shared_ptr<hippy::base::WorkerTaskRunner> task_runner;
  if (is_use_code_cache) {
    if (!asset_manager) {
      const std::string& full_path = code_cache_dir + file_name;

      auto time1 = std::chrono::time_point_cast<std::chrono::microseconds>(
                       std::chrono::system_clock::now())
                       .time_since_epoch()
                       .count();
      modify_time = hippy::base::HippyFile::GetFileModifytime(full_path);

      auto time2 = std::chrono::time_point_cast<std::chrono::microseconds>(
                       std::chrono::system_clock::now())
                       .time_since_epoch()
                       .count();

      HIPPY_LOG(hippy::Debug, "GetFileModifytime cost %lld microseconds",
                time2 - time1);
    }
    code_cache_path =
        code_cache_dir + file_name + "_" + std::to_string(modify_time);
    code_cache_dir_path = code_cache_dir.substr(0, code_cache_dir.length() - 1);
    std::promise<std::unique_ptr<std::vector<char>>> read_file_promise;
    std::future<std::unique_ptr<std::vector<char>>> read_file_future =
        read_file_promise.get_future();
    std::unique_ptr<CommonTask> task = std::make_unique<CommonTask>();
    task->func_ = hippy::base::MakeCopyable([p = std::move(read_file_promise),
                                             code_cache_path,
                                             code_cache_dir_path]() mutable {
      std::unique_ptr<std::vector<char>> content =
          hippy::base::HippyFile::ReadFile(code_cache_path.c_str(), true);
      if (content->empty()) {
        HIPPY_DLOG(hippy::Debug, "Read code cache failed ");
        int ret =
            hippy::base::HippyFile::RmFullPath(code_cache_dir_path.c_str());

        HIPPY_DLOG(hippy::Debug, "RmFullPath ret = %d", ret);
        HIPPY_USE(ret);
      } else {
        HIPPY_DLOG(hippy::Debug, "Read code cache succ");
      }
      p.set_value(std::move(content));
    });

    std::shared_ptr<Engine> engine = runtime->engine_;
    task_runner = engine->GetWorkerTaskRunner();
    task_runner->PostTask(std::move(task));

    if (!asset_manager) {
      script_content =
          hippy::base::HippyFile::ReadFile(file_path.c_str(), true);
    } else {
      script_content = hippy::base::HippyFile::ReadAssetFile(
          asset_manager, file_path.c_str(), true);
    }

    code_cache_content = read_file_future.get();
  } else {
    if (!asset_manager) {
      script_content =
          hippy::base::HippyFile::ReadFile(file_path.c_str(), true);
    } else {
      script_content = hippy::base::HippyFile::ReadAssetFile(
          asset_manager, file_path.c_str(), true);
    }
  }

  if (script_content->empty()) {
    HIPPY_LOG(hippy::Error, "script content empty");
    return false;
  }

  bool flag = std::static_pointer_cast<V8Ctx>(runtime->scope_->GetContext())
                  ->RunScriptWithCache(std::move(script_content), file_name,
                                       is_use_code_cache, code_cache_content);
  if (is_use_code_cache) {
    if (code_cache_content->size() > 0) {
      std::unique_ptr<CommonTask> task = std::make_unique<CommonTask>();
      task->func_ = [code_cache_path, code_cache_dir_path, code_cache_content] {
        std::string parent_dir = code_cache_dir_path.substr(
            0, code_cache_dir_path.find_last_of('/'));
        HIPPY_DLOG(hippy::Debug, "parent_dir = %s", parent_dir.c_str());

        int check_parent_dir_ret =
            hippy::base::HippyFile::CheckDir(parent_dir.c_str(), F_OK);
        HIPPY_DLOG(hippy::Debug, "check_parent_dir_ret = %d",
                   check_parent_dir_ret);
        if (check_parent_dir_ret) {
          /*
          std::string grandfather_dir = parent_dir.substr(0,
          parent_dir.find_last_of('/')); if
          (hippy::base::HippyFile::CheckDir(grandfather_dir.c_str(), F_OK)) {
            int create_grandfather_ret = hippy::base::HippyFile::CreateDir(
                grandfather_dir.c_str(), S_IRWXU);
            HIPPY_DLOG(hippy::Debug, "create_grandfather_ret = %d",
                      create_grandfather_ret);
          }
          */
          hippy::base::HippyFile::CreateDir(parent_dir.c_str(), S_IRWXU);
        }

        int check_dir_ret =
            hippy::base::HippyFile::CheckDir(code_cache_dir_path.c_str(), F_OK);
        HIPPY_DLOG(hippy::Debug, "check_dir_ret = %d", check_dir_ret);
        if (check_dir_ret) {
          hippy::base::HippyFile::CreateDir(code_cache_dir_path.c_str(),
                                            S_IRWXU);
        }

        bool save_file_ret = hippy::base::HippyFile::SaveFile(
            code_cache_path.c_str(), code_cache_content);
        HIPPY_DLOG(hippy::Debug, "save_file_ret = %d", save_file_ret);
        HIPPY_USE(save_file_ret);
      };
      task_runner->PostTask(std::move(task));
    }
  }

  HIPPY_DLOG(hippy::Debug, "runScript end, flag = %d", flag);
  return flag;
}

// to do json str err
void HandleUncaughtJsError(v8::Local<v8::Message> message,
                           v8::Local<v8::Value> data) {
  HIPPY_DLOG(hippy::Debug, "HandleUncaughtJsError begin");

  if (data.As<v8::External>().IsEmpty()) {
    HIPPY_LOG(hippy::Error, "HandleUncaughtJsError data_ is empty");
    return;
  }

  int64_t runtime_key =
      *(reinterpret_cast<int64_t*>(data.As<v8::External>()->Value()));
  std::shared_ptr<V8Runtime> runtime;
  {
    std::lock_guard<std::mutex> lock(runtime_mutex);
    auto runtime_it = RuntimeMap.find(runtime_key);
    if (runtime_it == RuntimeMap.end()) {
      return;
    }
    runtime = runtime_it->second;
  }

  std::shared_ptr<hippy::napi::V8Ctx> ctx =
      std::static_pointer_cast<hippy::napi::V8Ctx>(
          runtime->scope_->GetContext());
  v8::Isolate* isolate = ctx->isolate_;
  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> context =
      v8::Local<v8::Context>::New(isolate, ctx->context_persistent_);
  v8::Context::Scope context_scope(context);

  std::stringstream description_stream;
  std::stringstream stack_stream;

  {
    v8::String::Utf8Value msg(isolate, message->Get());
    v8::String::Utf8Value filename(isolate,
                                   message->GetScriptOrigin().ResourceName());
    const char* filename_string =
        *filename ? *filename : "<string conversion failed>";
    int linenum = message->GetLineNumber(context).FromMaybe(-1);
    int start = message->GetStartColumn(context).FromMaybe(-1);
    int end = message->GetEndColumn(context).FromMaybe(-1);

    std::string des_msg = *msg ? *msg : "<string conversion failed>";
    description_stream << filename_string << ":" << linenum << ": " << start
                       << "-" << end << ": " << des_msg << " \\n ";

    HIPPY_DLOG(hippy::Debug, "description_stream = %s",
               description_stream.str().c_str());
  }

  v8::Local<v8::StackTrace> trace = message->GetStackTrace();
  if (!trace.IsEmpty()) {
    int len = trace->GetFrameCount();
    for (int i = 0; i < len; ++i) {
      v8::Local<v8::StackFrame> frame = trace->GetFrame(isolate, i);
      v8::String::Utf8Value script_name(isolate, frame->GetScriptName());
      v8::String::Utf8Value function_name(isolate, frame->GetFunctionName());
      std::string stack_script_name =
          *script_name ? *script_name : "<string conversion failed>";
      std::string stack_function_name =
          *function_name ? *function_name : "<string conversion failed>";
      stack_stream << stack_script_name << ":" << frame->GetLineNumber() << ":"
                   << frame->GetColumn() << ": " << stack_function_name
                   << " \\n ";

      HIPPY_DLOG(hippy::Debug, "stack_stream = %s", stack_stream.str().c_str());
    }
  }

  ExceptionHandler::ReportJsException(runtime, description_stream,
                                      stack_stream);

  // send error to js callback if exist
  auto source_code = hippy::GetNativeSourceCode("ExceptionHandle.js");
  HIPPY_DCHECK(source_code.data_ && source_code.length_);
  std::shared_ptr<CtxValue> function = ctx->EvaluateJavascript(
      source_code.data_, source_code.length_, "ExceptionHandle.js");
  bool is_func = ctx->IsFunction(function);
  HIPPY_CHECK_WITH_MSG(
      is_func == true,
      "HandleUncaughtJsError ExceptionHandle.js don't return function!!!");

  std::shared_ptr<CtxValue> args[2];
  args[0] = ctx->CreateString("uncaughtException");
  std::string json_str =
      std::string("{\"message\":\"") + description_stream.str() +
      std::string("\",\"stack\":\"") + stack_stream.str() + std::string("\"}");
  HIPPY_DLOG(hippy::Debug, "json_str = %s", json_str.c_str());
  std::shared_ptr<CtxValue> js_obj = ctx->CreateObject(json_str.c_str());
  if (!js_obj) {
    HIPPY_LOG(hippy::Error,
              "HandleUncaughtJsError parse json error, description_stream = %s",
              description_stream.str().c_str());
    HIPPY_LOG(hippy::Error, "HandleUncaughtJsError stack_stream = %s",
              stack_stream.str().c_str());
    return;
  }
  args[1] = js_obj;
  std::shared_ptr<CtxValue> ret_value = ctx->CallFunction(function, 2, args);
  HIPPY_DLOG(hippy::Debug, "HandleUncaughtJsError end");
}

// Js to Native
static void CallNative(void* data) {
  HIPPY_DLOG(hippy::Debug, "CallNative");
  CBDataTuple* tuple = reinterpret_cast<CBDataTuple*>(data);
  int64_t runtime_key = *(reinterpret_cast<int64_t*>(tuple->cb_tuple_.data_));
  std::shared_ptr<V8Runtime> runtime;
  {
    std::lock_guard<std::mutex> lock(runtime_mutex);
    auto runtime_it = RuntimeMap.find(runtime_key);
    if (runtime_it == RuntimeMap.end()) {
      return;
    }
    runtime = runtime_it->second;
  }

  const v8::FunctionCallbackInfo<v8::Value>& info = tuple->info_;
  v8::Isolate* isolate = info.GetIsolate();
  if (!isolate) {
    HIPPY_LOG(hippy::Error, "CallNative isolate error");
    return;
  }

  v8::HandleScope handle_scope(isolate);
  std::shared_ptr<V8Ctx> ctx =
      std::static_pointer_cast<V8Ctx>(runtime->scope_->GetContext());
  v8::Local<v8::Context> v8_context = ctx->context_persistent_.Get(isolate);
  v8::Context::Scope context_scope(v8_context);
  if (v8_context.IsEmpty()) {
    HIPPY_LOG(hippy::Error, "CallNative context empty");
    return;
  }

  jstring j_module_name = nullptr;
  if (info.Length() >= 1 && !info[0].IsEmpty()) {
    v8::String::Utf8Value module_name(isolate, info[0]);
    j_module_name = JNIEnvironment::AttachCurrentThread()->NewStringUTF(
        JniUtils::ToCString(module_name));
    HIPPY_DLOG(hippy::Debug, "CallNative module_name = %s",
               JniUtils::ToCString(module_name));
  }

  jstring j_module_func = nullptr;
  if (info.Length() >= 2 && !info[1].IsEmpty()) {
    v8::String::Utf8Value module_func(isolate, info[1]);
    j_module_func = JNIEnvironment::AttachCurrentThread()->NewStringUTF(
        JniUtils::ToCString(module_func));
    HIPPY_DLOG(hippy::Debug, "CallNative module_func = %s",
               JniUtils::ToCString(module_func));
  }

  jstring j_cb_id = nullptr;
  if (info.Length() >= 3 && !info[2].IsEmpty()) {
    v8::String::Utf8Value cb_id(isolate, info[2]);
    j_cb_id = JNIEnvironment::AttachCurrentThread()->NewStringUTF(
        JniUtils::ToCString(cb_id));
    HIPPY_DLOG(hippy::Debug, "CallNative cb_id = %s",
               JniUtils::ToCString(cb_id));
  }

  jbyteArray j_params_str = nullptr;
  HippyBuffer* hippy_buffer = nullptr;
  if (info.Length() >= 4 && !info[3].IsEmpty() && info[3]->IsObject()) {
    if (!runtime->bridge_param_json_) {
      hippy_buffer = JniUtils::WriteToBuffer(
          isolate, v8::Local<v8::Object>::Cast(info[3]));
      if (hippy_buffer != nullptr && hippy_buffer->data != nullptr) {
        j_params_str = JNIEnvironment::AttachCurrentThread()->NewByteArray(
            hippy_buffer->position);
        JNIEnvironment::AttachCurrentThread()->SetByteArrayRegion(
            j_params_str, 0, hippy_buffer->position,
            reinterpret_cast<const jbyte*>(hippy_buffer->data));
      }
    } else {
      v8::Handle<v8::Object> global = v8_context->Global();
      v8::Handle<v8::Value> JSON =
          global->Get(v8::String::NewFromUtf8(isolate, "JSON"));
      v8::Handle<v8::Value> fun = v8::Handle<v8::Object>::Cast(JSON)->Get(
          v8::String::NewFromUtf8(isolate, "stringify"));
      v8::Handle<v8::Value> argv[1] = {info[3]};
      v8::Handle<v8::Value> s =
          v8::Handle<v8::Function>::Cast(fun)->Call(JSON, 1, argv);

      v8::String::Utf8Value json(isolate, s);
      HIPPY_DLOG(hippy::Debug, "CallNative json = %s",
                 JniUtils::ToCString(json));
      int str_len = strlen(JniUtils::ToCString(json));
      j_params_str =
          JNIEnvironment::AttachCurrentThread()->NewByteArray(str_len);
      JNIEnvironment::AttachCurrentThread()->SetByteArrayRegion(
          j_params_str, 0, str_len,
          reinterpret_cast<const jbyte*>(JniUtils::ToCString(json)));
    }
  }

  JNIEnvironment::AttachCurrentThread()->CallVoidMethod(
      runtime->bridge_->GetObj(),
      JNIEnvironment::GetInstance()->wrapper_.call_natives_method_id,
      j_module_name, j_module_func, j_cb_id, j_params_str);

  JNIEnvironment::ClearJEnvException(JNIEnvironment::AttachCurrentThread());

  // delete local ref
  JNIEnvironment::AttachCurrentThread()->DeleteLocalRef(j_module_name);
  JNIEnvironment::AttachCurrentThread()->DeleteLocalRef(j_module_func);
  JNIEnvironment::AttachCurrentThread()->DeleteLocalRef(j_cb_id);
  JNIEnvironment::AttachCurrentThread()->DeleteLocalRef(j_params_str);
  if (hippy_buffer != nullptr) {
    ReleaseBuffer(hippy_buffer);
  }
  hippy_buffer = nullptr;
}

JNIEXPORT jlong JNICALL
Java_com_tencent_mtt_hippy_bridge_HippyBridgeImpl_initJSFramework(
    JNIEnv* env,
    jobject object,
    jbyteArray globalConfig,
    jboolean singleThreadMode,
    jboolean bridgeParamJson,
    jboolean isDevModule,
    jobject jcallback,
    jlong groupId) {
  HIPPY_DLOG(hippy::Debug,
             "HippyBridgeImpl_initJSFramework begin, singleThreadMode = %d, "
             "bridgeParamJson = %d, isDevModule = %d, groupId = %lld, "
             "global_runtime_key = %lld",
             singleThreadMode, bridgeParamJson, isDevModule, groupId,
             global_runtime_key);
  std::shared_ptr<V8Runtime> runtime = std::make_shared<V8Runtime>();
  global_runtime_key += 1;
  std::shared_ptr<int64_t> runtime_key =
      std::make_shared<int64_t>(global_runtime_key);
  {
    std::lock_guard<std::mutex> lock(engine_mutex);
    RuntimeKeyMap[global_runtime_key] = runtime_key;
    RuntimeMap[global_runtime_key] = runtime;
  }

  runtime->bridge_func_ = nullptr;
  runtime->bridge_ = std::make_shared<JavaRef>(env, object);

  runtime->is_dev_module_ = isDevModule;
  if (bridgeParamJson) {
    runtime->bridge_param_json_ = true;
  } else {
    runtime->bridge_param_json_ = false;
  }

  RegisterFunction vm_cb = [runtime_key](void* vm) {
    V8VM* v8_vm = reinterpret_cast<V8VM*>(vm);
    v8::Isolate* isolate = v8_vm->isolate_;
    v8::HandleScope handle_scope(isolate);
    isolate->AddMessageListener(
        HandleUncaughtJsError,
        v8::External::New(isolate, (void*)runtime_key.get()));
  };

  std::unique_ptr<RegisterMap> engine_cb_map = std::make_unique<RegisterMap>();
  engine_cb_map->insert(std::make_pair(hippy::base::kVMCreateCBKey, vm_cb));

  std::shared_ptr<std::vector<uint8_t>> global_config =
      std::make_shared<std::vector<uint8_t>>();
  JniUtils::AppendJavaByteArrayToByteVector(env, globalConfig, global_config);
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  std::shared_ptr<JavaRef> save_object =
      std::make_shared<JavaRef>(env, jcallback);

  RegisterFunction context_cb = [runtime, global_config,
                                 runtime_key](void* scopeWrapper) {
    HIPPY_DLOG(hippy::Debug, "HippyBridgeImpl register hippyCallNatives");
    HIPPY_DCHECK_WITH_MSG(scopeWrapper, "scopeWrapper is nullptr");
    ScopeWrapper* wrapper = reinterpret_cast<ScopeWrapper*>(scopeWrapper);
    HIPPY_DCHECK_WITH_MSG(wrapper, "wrapper is nullptr");
    std::shared_ptr<Scope> scope = wrapper->scope_.lock();
    if (!scope) {
      HIPPY_LOG(hippy::Error, "register hippyCallNatives, scope error");
      return;
    }

    if (runtime->is_dev_module_) {
      if (!global_inspector) {
        global_inspector =
            std::make_shared<V8InspectorClientImpl>(runtime->scope_);
        global_inspector->Connect(runtime->bridge_);
      } else {
        global_inspector->Reset(runtime->scope_, runtime->bridge_);
      }
      global_inspector->CreateContext();
    }

    std::shared_ptr<Ctx> ctx = scope->GetContext();
    ctx->RegisterGlobalInJs();
    ctx->RegisterNativeBinding("hippyCallNatives", CallNative,
                               (void*)runtime_key.get());
    std::string json(global_config->begin(), global_config->end());
    bool ret = ctx->SetGlobalVar("__HIPPYNATIVEGLOBAL__", json.c_str());
    if (!ret) {
      HIPPY_LOG(hippy::Error, "register __HIPPYNATIVEGLOBAL__ failed");
      ExceptionHandler exception;
      exception.JSONException(runtime, (char*)global_config->data());
    }
  };
  std::unique_ptr<RegisterMap> scope_cb_map = std::make_unique<RegisterMap>();
  scope_cb_map->insert(
      std::make_pair(hippy::base::kContextCreatedCBKey, context_cb));

  RegisterFunction scope_cb = [save_object_ = std::move(save_object),
                               runtime_key](void*) {
    HIPPY_DLOG(hippy::Debug, "run scope cb");
    CallJavaMethod(save_object_->GetObj(), *runtime_key);
  };
  scope_cb_map->insert(
      std::make_pair(hippy::base::KScopeInitializedCBKey, scope_cb));

  int64_t group = groupId;
  if (isDevModule) {
    HIPPY_DLOG(hippy::Debug, "debug mode");
    group = kDebuggerEngineId;
    auto it = ReUseEngine.find(group);
    if (it != ReUseEngine.end()) {
      runtime->engine_ = std::get<std::shared_ptr<Engine>>(it->second);
    } else {
      runtime->engine_ = std::make_shared<Engine>(std::move(engine_cb_map));
      ReUseEngine[group] = std::make_pair(runtime->engine_, 1);
    }
  } else if (group != kDefaultEngineId) {
    std::lock_guard<std::mutex> lock(engine_mutex);
    auto it = ReUseEngine.find(group);
    if (it != ReUseEngine.end()) {
      HIPPY_DLOG(hippy::Debug, "engine reuse");
      runtime->engine_ = std::get<std::shared_ptr<Engine>>(it->second);
      std::get<uint32_t>(it->second) += 1;
      HIPPY_DLOG(hippy::Debug, "engine cnt = %d, use_count = %d",
                 std::get<uint32_t>(it->second), runtime->engine_.use_count());
    } else {
      HIPPY_DLOG(hippy::Debug, "engine create");
      runtime->engine_ = std::make_shared<Engine>(std::move(engine_cb_map));
      ReUseEngine[group] = std::make_pair(runtime->engine_, 1);
    }
  } else {  // kDefaultEngineId
    HIPPY_DLOG(hippy::Debug, "default create engine");
    runtime->engine_ = std::make_shared<Engine>(std::move(engine_cb_map));
  }
  runtime->scope_ = runtime->engine_->CreateScope("", std::move(scope_cb_map));
  HIPPY_DLOG(hippy::Debug, "group = %lld", group);
  runtime->group_id_ = group;
  HIPPY_DLOG(hippy::Debug, "HippyBridgeImpl_initJSFramework end");

  return global_runtime_key;
}

JNIEXPORT jboolean JNICALL
Java_com_tencent_mtt_hippy_bridge_HippyBridgeImpl_runScriptFromFile(
    JNIEnv* env,
    jobject obj,
    jstring filePath,
    jstring scriptName,
    jboolean canUseCodeCache,
    jstring codeCacheDir,
    jlong v8RuntimePtr,
    jobject jcallback) {
  std::shared_ptr<V8Runtime> runtime;
  {
    std::lock_guard<std::mutex> lock(runtime_mutex);
    auto runtime_it = RuntimeMap.find(v8RuntimePtr);
    if (runtime_it == RuntimeMap.end()) {
      HIPPY_LOG(hippy::Warning,
                "HippyBridgeImpl runScriptFromFile, v8RuntimePtr invalid");
      return false;
    }
    runtime = runtime_it->second;
  }

  HIPPY_DLOG(hippy::Debug, "runScriptFromFile begin");
  auto time1 = std::chrono::time_point_cast<std::chrono::microseconds>(
                   std::chrono::system_clock::now())
                   .time_since_epoch()
                   .count();

  const char* char_filePath = env->GetStringUTFChars(filePath, nullptr);
  const char* char_scriptName = env->GetStringUTFChars(scriptName, nullptr);
  const char* char_codeCacheDir = env->GetStringUTFChars(codeCacheDir, nullptr);

  const std::string file_path(char_filePath);
  const std::string script_path(char_scriptName);
  uint32_t pos = script_path.find_last_of('/');
  if (pos == -1) {
    pos = 0;
  } else if (pos == script_path.length() - 1) {
  } else {
    pos += 1;
  }
  const std::string script_name = script_path.substr(pos);
  const std::string code_cache_dir(char_codeCacheDir);

  HIPPY_LOG(hippy::Debug,
            "runScriptFromFile char_filePath = %s, script_name = %s, "
            "char_codeCacheDir = %s",
            char_filePath, script_name.c_str(), char_codeCacheDir);

  HIPPY_LOG(hippy::Debug, "pollytime runScriptFromFile start = %s",
            char_scriptName);

  env->ReleaseStringUTFChars(filePath, char_filePath);
  env->ReleaseStringUTFChars(scriptName, char_scriptName);
  env->ReleaseStringUTFChars(codeCacheDir, char_codeCacheDir);

  std::shared_ptr<JavaRef> save_object =
      std::make_shared<JavaRef>(env, jcallback);
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback = [runtime, save_object_ = std::move(save_object), script_name,
                    canUseCodeCache, code_cache_dir, file_path, time1] {
    HIPPY_DLOG(hippy::Debug, "runScriptFromFile enter tast");
    bool flag = RunScript(runtime, script_name, canUseCodeCache, code_cache_dir,
                          file_path, nullptr);
    jlong value = flag == false ? 0 : 1;
    CallJavaMethod(save_object_->GetObj(), value);

    auto time2 = std::chrono::time_point_cast<std::chrono::microseconds>(
                     std::chrono::system_clock::now())
                     .time_since_epoch()
                     .count();

    HIPPY_LOG(hippy::Debug,
              "pollytime runScriptFromFile = %lld, file_path = %s",
              (time2 - time1), file_path.c_str());

    return flag;
  };

  runtime->engine_->GetJSRunner()->PostTask(task);

  return true;
}

JNIEXPORT jboolean JNICALL
Java_com_tencent_mtt_hippy_bridge_HippyBridgeImpl_runScriptFromAssets(
    JNIEnv* env,
    jobject obj,
    jstring assetName,
    jobject assetManager,
    jboolean canUseCodeCache,
    jstring codeCacheDir,
    jlong v8RuntimePtr,
    jobject jcallback) {
  HIPPY_DLOG(hippy::Debug, "runScriptFromAssets begin");

  std::shared_ptr<V8Runtime> runtime;
  {
    std::lock_guard<std::mutex> lock(runtime_mutex);
    auto runtime_it = RuntimeMap.find(v8RuntimePtr);
    if (runtime_it == RuntimeMap.end()) {
      HIPPY_LOG(hippy::Warning,
                "HippyBridgeImpl runScriptFromAssets, v8RuntimePtr invalid");
      return false;
    }
    runtime = runtime_it->second;
  }

  auto begin_time = std::chrono::time_point_cast<std::chrono::microseconds>(
                        std::chrono::system_clock::now())
                        .time_since_epoch()
                        .count();

  const char* char_asset_name = env->GetStringUTFChars(assetName, nullptr);
  const char* char_code_cache_dir =
      env->GetStringUTFChars(codeCacheDir, nullptr);

  HIPPY_DLOG(hippy::Debug, "runScriptFromAssets asset_name = %s",
             char_asset_name);

  const std::string asset_path(char_asset_name);
  uint32_t pos = asset_path.find_last_of('/');
  if (pos == -1) {
    pos = 0;
  } else if (pos == asset_path.length() - 1) {
  } else {
    pos += 1;
  }
  const std::string asset_name = asset_path.substr(pos);
  const std::string code_cache_dir(char_code_cache_dir);

  env->ReleaseStringUTFChars(assetName, char_asset_name);
  env->ReleaseStringUTFChars(codeCacheDir, char_code_cache_dir);
  AAssetManager* aassetManager = AAssetManager_fromJava(env, assetManager);
  std::shared_ptr<JavaRef> save_object =
      std::make_shared<JavaRef>(env, jcallback);
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback = [runtime, save_object_ = std::move(save_object),
                    aassetManager, canUseCodeCache, asset_name, code_cache_dir,
                    asset_path, begin_time] {
    HIPPY_DLOG(hippy::Debug,
               "runScriptFromAssets enter task, aassetManager = %d",
               aassetManager);
    bool flag;
    if (aassetManager) {
      flag = RunScript(runtime, asset_name, canUseCodeCache, code_cache_dir,
                       asset_path, aassetManager);
    } else {
      HIPPY_LOG(hippy::Error, "runScriptFromAssets aassetManager error",
                aassetManager);
      CallJavaMethod(save_object_->GetObj(), 0);
      return;
    }

    jlong value = flag == true ? 1 : 0;
    CallJavaMethod(save_object_->GetObj(), value);

    HIPPY_DLOG(hippy::Debug, "runScriptFromAssets leave task");

    auto end_time = std::chrono::time_point_cast<std::chrono::microseconds>(
                        std::chrono::system_clock::now())
                        .time_since_epoch()
                        .count();
    HIPPY_LOG(hippy::Debug,
              "runScriptFromAssets cost %lld microseconds, asset_path = %s",
              (end_time - begin_time), asset_path.c_str());
  };

  HIPPY_DLOG(hippy::Debug, "runScriptFromAssets task id = %d", task->id_);
  runtime->engine_->GetJSRunner()->PostTask(task);
  HIPPY_DLOG(hippy::Debug, "runScriptFromAssets end");

  return true;
}

JNIEXPORT void JNICALL
Java_com_tencent_mtt_hippy_bridge_HippyBridgeImpl_callFunction(
    JNIEnv* env,
    jobject obj,
    jstring action,
    jbyteArray params,
    jint offset,
    jint length,
    jlong v8RuntimePtr,
    jobject jcallback) {
  HIPPY_DLOG(hippy::Debug, "HippyBridgeImpl callFunction");
  std::shared_ptr<V8Runtime> runtime;
  {
    std::lock_guard<std::mutex> lock(runtime_mutex);
    auto runtime_it = RuntimeMap.find(v8RuntimePtr);
    if (runtime_it == RuntimeMap.end()) {
      HIPPY_LOG(hippy::Warning,
                "HippyBridgeImpl callFunction, v8RuntimePtr invalid");
      return;
    }
    runtime = runtime_it->second;
  }

  std::shared_ptr<JavaScriptTaskRunner> runner =
      runtime->engine_->GetJSRunner();
  if (!runner) {
    HIPPY_LOG(hippy::Warning, "HippyBridgeImpl callFunction, runner invalid");
    return;
  }
  std::string action_name = JniUtils::CovertJavaStringToString(env, action);
  std::shared_ptr<std::vector<uint8_t>> hippy_params =
      std::make_shared<std::vector<uint8_t>>();

  JniUtils::AppendJavaByteArrayToByteVector(env, params, hippy_params);
  HIPPY_DLOG(
      hippy::Debug, "callFunction action_name = %s, hippy_params = %s",
      action_name.c_str(),
      std::string((char*)hippy_params->data(), hippy_params->size()).c_str());
  std::shared_ptr<JavaRef> save_object =
      std::make_shared<JavaRef>(env, jcallback);
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback = [runtime, save_object_ = std::move(save_object), action_name,
                    hippy_params] {
    std::shared_ptr<Ctx> context = runtime->scope_->GetContext();
    if (runtime->is_dev_module_ && !action_name.compare("onWebsocketMsg")) {
      global_inspector->SendMessageToV8(hippy_params);
    } else {
      if (!runtime->bridge_func_) {
        HIPPY_DLOG(hippy::Debug, "bridge_func_ init");
        std::string name("hippyBridge");
        std::shared_ptr<CtxValue> fn = context->GetJsFn(name);
        bool is_fn = context->IsFunction(fn);
        HIPPY_DLOG(hippy::Debug, "is_fn = %d", is_fn);
        if (!is_fn) {
          CallJavaMethod(save_object_->GetObj(), 0);
          return;
        } else {
          runtime->bridge_func_ = fn;
        }
      }
      std::string params_str((char*)hippy_params->data(), hippy_params->size());
      // to do params_str invalid
      std::shared_ptr<CtxValue> action =
          context->CreateString(action_name.c_str());
      std::shared_ptr<CtxValue> params =
          context->CreateObject(params_str.c_str());
      std::shared_ptr<CtxValue> argv[] = {action, params};
      context->CallFunction(runtime->bridge_func_, 2, argv);
    }

    CallJavaMethod(save_object_->GetObj(), 1);
  };

  runner->PostTask(task);
}

JNIEXPORT void JNICALL
Java_com_tencent_mtt_hippy_bridge_HippyBridgeImpl_runNativeRunnable(
    JNIEnv* env,
    jobject object,
    jstring codeCachePath,
    jlong runnableId,
    jlong v8RuntimePtr,
    jobject jcallback) {
  HIPPY_DLOG(hippy::Debug, "runNativeRunnable start");
}

JNIEXPORT jstring JNICALL
Java_com_tencent_mtt_hippy_bridge_HippyBridgeImpl_getCrashMessage(
    JNIEnv* env,
    jobject object) {
  return env->NewStringUTF("crash report");
}

JNIEXPORT void JNICALL
Java_com_tencent_mtt_hippy_bridge_HippyBridgeImpl_destroy(
    JNIEnv* env,
    jobject object,
    jlong v8RuntimePtr,
    jboolean singleThreadMode,
    jobject jcallback) {
  HIPPY_DLOG(hippy::Debug, "destroy begin");
  std::shared_ptr<V8Runtime> runtime;
  {
    std::lock_guard<std::mutex> lock(runtime_mutex);
    auto runtime_it = RuntimeMap.find(v8RuntimePtr);
    if (runtime_it == RuntimeMap.end()) {
      HIPPY_LOG(hippy::Warning,
                "HippyBridgeImpl destroy, v8RuntimePtr invalid");
      return;
    }
    runtime = runtime_it->second;
    RuntimeMap.erase(runtime_it);
  }

  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback = [runtime, v8RuntimePtr] {
    if (runtime->is_dev_module_) {
      global_inspector->DestroyContext();
    }

    runtime->scope_ = nullptr;
    std::lock_guard<std::mutex> lock(runtime_mutex);
    auto runtime_key_it = RuntimeKeyMap.find(v8RuntimePtr);
    RuntimeKeyMap.erase(runtime_key_it);
  };
  runtime->engine_->GetJSRunner()->PostTask(task);
  int64_t group = runtime->group_id_;
  HIPPY_DLOG(hippy::Debug, "destroy, group = %lld", group);
  if (group == kDebuggerEngineId) {
  } else if (group == kDefaultEngineId) {
    runtime->engine_->TerminateRunner();
  } else {
    std::lock_guard<std::mutex> lock(engine_mutex);
    auto it = ReUseEngine.find(group);
    if (it != ReUseEngine.end()) {
      auto engine = std::get<std::shared_ptr<Engine>>(it->second);
      long cnt = std::get<uint32_t>(it->second);
      HIPPY_DLOG(hippy::Debug, "ReUseEngine cnt = %d", cnt);
      if (cnt == 1) {
        ReUseEngine.erase(it);
        engine->TerminateRunner();
      } else {
        std::get<uint32_t>(it->second) = cnt - 1;
      }
    } else {
      HIPPY_LOG(hippy::Fatal, "engine not find");
    }
  }

  CallJavaMethod(jcallback, 1);
  HIPPY_DLOG(hippy::Debug, "destroy end");
}

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void* reserved) {
  JNIEnv* env;
  jint onLoad_err = -1;
  if ((vm)->GetEnv((void**)&env, JNI_VERSION_1_4) != JNI_OK) {
    return onLoad_err;
  }
  if (env == nullptr) {
    return onLoad_err;
  }

  JNIEnvironment::GetInstance()->init(vm, env);

  return JNI_VERSION_1_4;
}

void JNI_OnUnload(JavaVM* vm, void* reserved) {
  // todo
  hippy::napi::V8VM::PlatformDestroy();

  JNIEnvironment::DestroyInstance();
}
