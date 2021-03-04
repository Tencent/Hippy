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

#include "jni/com_tencent_mtt_hippy_bridge_HippyBridgeImpl.h"  // NOLINT(build/include)

#include <android/asset_manager.h>
#include <android/asset_manager_jni.h>
#include <jni.h>
#include <stdint.h>
#include <sys/stat.h>

#include <future>
#include <memory>

#include "core/core.h"
#include "inspector/v8_inspector_client_impl.h"
#include "jni/exception_handler.h"  // NOLINT(build/include_subdir)
#include "jni/hippy_buffer.h"       // NOLINT(build/include_subdir)
#include "jni/jni_env.h"            // NOLINT(build/include_subdir)
#include "jni/jni_utils.h"          // NOLINT(build/include_subdir)
#include "jni/runtime.h"            // NOLINT(build/include_subdir)
#include "jni/scoped_java_ref.h"
#include "jni/uri.h"
#include "loader/asset_loader.h"
#include "loader/file_loader.h"
#include "loader/http_loader.h"

using namespace v8;
using namespace hippy::napi;

using RegisterMap = hippy::base::RegisterMap;
using RegisterFunction = hippy::base::RegisterFunction;
using Ctx = hippy::napi::Ctx;

static std::unordered_map<int64_t, std::pair<std::shared_ptr<Engine>, uint32_t>>
    ReUseEngine;
static std::mutex engine_mutex;
static const int64_t kDefaultEngineId = -1;
static const int64_t kDebuggerEngineId = -9999;
static const uint32_t kRuntimeKeyIndex = 0;

static std::shared_ptr<V8InspectorClientImpl> global_inspector = nullptr;

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

bool RunScript(std::shared_ptr<Runtime> runtime,
               const std::string& file_name,
               bool is_use_code_cache,
               const std::string& code_cache_dir,
               const std::string& uri,
               AAssetManager* asset_manager) {
  HIPPY_LOG(hippy::Info,
            "RunScript begin, file_name = %s, is_use_code_cache = %d, "
            "code_cache_dir = %s, uri = %s, asset_manager = %d",
            file_name.c_str(), is_use_code_cache, code_cache_dir.c_str(),
            uri.c_str(), asset_manager);
  std::string script_content;
  std::string code_cache_content;
  uint64_t modify_time = 0;
  std::string code_cache_path;
  std::string code_cache_dir_path;
  std::shared_ptr<WorkerTaskRunner> task_runner;
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
    std::promise<std::string> read_file_promise;
    std::future<std::string> read_file_future = read_file_promise.get_future();
    std::unique_ptr<CommonTask> task = std::make_unique<CommonTask>();
    task->func_ = hippy::base::MakeCopyable([p = std::move(read_file_promise),
                                             code_cache_path,
                                             code_cache_dir_path]() mutable {
      const std::string content =
          hippy::base::HippyFile::ReadFile(code_cache_path.c_str(), true);
      if (content.empty()) {
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

    std::shared_ptr<Engine> engine = runtime->GetEngine();
    task_runner = engine->GetWorkerTaskRunner();
    task_runner->PostTask(std::move(task));

    script_content = runtime->GetScope()->GetUriLoader()->Load(uri);
    code_cache_content = read_file_future.get();
  } else {
    script_content = runtime->GetScope()->GetUriLoader()->Load(uri);
  }

  HIPPY_DLOG(hippy::Error, "uri = %s, len = %d, script content = %s",
             uri.c_str(), script_content.length(), script_content.c_str());

  if (script_content.empty()) {
    HIPPY_LOG(hippy::Error, "script content empty, uri = %s", uri.c_str());
    return false;
  }

  auto ret = std::static_pointer_cast<V8Ctx>(runtime->GetScope()->GetContext())
                 ->RunScript(std::move(script_content), file_name, is_use_code_cache,
                             &code_cache_content);
  if (is_use_code_cache) {
    if (code_cache_content.length() > 0) {
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

  bool flag = !!ret;
  HIPPY_DLOG(hippy::Debug, "runScript end, flag = %d", flag);
  return flag;
}

void HandleUncaughtJsError(v8::Local<v8::Message> message,
                           v8::Local<v8::Value> error) {
  HIPPY_DLOG(hippy::Debug, "HandleUncaughtJsError begin");

  if (error.IsEmpty()) {
    HIPPY_LOG(hippy::Error, "HandleUncaughtJsError error is empty");
    return;
  }

  Isolate* isolate = message->GetIsolate();
  int64_t runtime_key =
      *(reinterpret_cast<int64_t*>(isolate->GetData(kRuntimeKeyIndex)));
  std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_key);
  if (!runtime) {
    return;
  }

  std::shared_ptr<hippy::napi::V8Ctx> ctx =
      std::static_pointer_cast<hippy::napi::V8Ctx>(
          runtime->GetScope()->GetContext());

  ExceptionHandler::ReportJsException(runtime, ctx->GetMsgDesc(message),
                                      ctx->GetStackInfo(message));

  std::string handler_name("HippyExceptionHandler");
  std::shared_ptr<CtxValue>  exception_handler =
      ctx->GetGlobalObjVar(handler_name);
  if (!ctx->IsFunction(exception_handler)) {
    auto source_code = hippy::GetNativeSourceCode("ExceptionHandle.js");
    HIPPY_DCHECK(source_code.data_ && source_code.length_);
    exception_handler = ctx->RunScript(
        source_code.data_, source_code.length_, "ExceptionHandle.js");
    bool is_func = ctx->IsFunction(exception_handler);
    HIPPY_CHECK_WITH_MSG(
        is_func == true,
        "HandleUncaughtJsError ExceptionHandle.js don't return function!!!");
    ctx->SetGlobalObjVar(handler_name, exception_handler);
  }

  std::shared_ptr<CtxValue> args[2];
  args[0] = ctx->CreateString("uncaughtException");
  args[1] = std::make_shared<V8CtxValue>(isolate, error);
  std::shared_ptr<CtxValue> ret_value =
      ctx->CallFunction(exception_handler, 2, args);
  HIPPY_DLOG(hippy::Debug, "HandleUncaughtJsError end");
}

// Js to Native
static void CallNative(void* data) {
  HIPPY_DLOG(hippy::Debug, "CallNative");
  CBDataTuple* tuple = reinterpret_cast<CBDataTuple*>(data);
  int64_t runtime_key = *(reinterpret_cast<int64_t*>(tuple->cb_tuple_.data_));
  std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_key);
  if (!runtime) {
    return;
  }

  const v8::FunctionCallbackInfo<v8::Value>& info = tuple->info_;
  v8::Isolate* isolate = info.GetIsolate();
  if (!isolate) {
    HIPPY_LOG(hippy::Error, "CallNative isolate error");
    return;
  }

  v8::HandleScope handle_scope(isolate);
  std::shared_ptr<hippy::napi::V8Ctx> ctx =
      std::static_pointer_cast<hippy::napi::V8Ctx>(
          runtime->GetScope()->GetContext());
  v8::Local<v8::Context> context = ctx->context_persistent_.Get(isolate);
  v8::Context::Scope context_scope(context);
  if (context.IsEmpty()) {
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
    if (!runtime->IsParamJson()) {
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
      v8::Handle<v8::Object> global = context->Global();
      v8::Handle<v8::Value> JSON = global->Get(
          v8::String::NewFromUtf8(isolate, "JSON", v8::NewStringType::kNormal)
              .FromMaybe(v8::Local<v8::String>()));
      v8::Handle<v8::Value> fun = v8::Handle<v8::Object>::Cast(JSON)->Get(
          v8::String::NewFromUtf8(isolate, "stringify",
                                  v8::NewStringType::kNormal)
              .FromMaybe(v8::Local<v8::String>()));
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
      runtime->GetBridge()->GetObj(),
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
             "bridgeParamJson = %d, isDevModule = %d, groupId = %lld, ",
             singleThreadMode, bridgeParamJson, isDevModule, groupId);
  std::shared_ptr<Runtime> runtime = std::make_shared<Runtime>(
      std::make_shared<JavaRef>(env, object), bridgeParamJson, isDevModule);
  int64_t runtime_id = runtime->GetId();
  Runtime::Insert(runtime);
  std::shared_ptr<int64_t> runtime_key = Runtime::GetKey(runtime);
  RegisterFunction vm_cb = [runtime_key](void* vm) {
    V8VM* v8_vm = reinterpret_cast<V8VM*>(vm);
    v8::Isolate* isolate = v8_vm->isolate_;
    v8::HandleScope handle_scope(isolate);
    isolate->AddMessageListener(
        HandleUncaughtJsError);
    isolate->SetData(0, runtime_key.get());
  };

  std::unique_ptr<RegisterMap> engine_cb_map = std::make_unique<RegisterMap>();
  engine_cb_map->insert(std::make_pair(hippy::base::kVMCreateCBKey, vm_cb));

  std::string global_config =
      JniUtils::AppendJavaByteArrayToString(env, globalConfig);
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

    if (runtime->IsDebug()) {
      if (!global_inspector) {
        global_inspector =
            std::make_shared<V8InspectorClientImpl>(runtime->GetScope());
        global_inspector->Connect(runtime->GetBridge());
      } else {
        global_inspector->Reset(runtime->GetScope(), runtime->GetBridge());
      }
      global_inspector->CreateContext();
    }

    std::shared_ptr<Ctx> ctx = scope->GetContext();
    ctx->RegisterGlobalInJs();
    ctx->RegisterNativeBinding("hippyCallNatives", CallNative,
                               (void*)runtime_key.get());
    bool ret =
        ctx->SetGlobalJsonVar("__HIPPYNATIVEGLOBAL__", global_config.c_str());
    if (!ret) {
      HIPPY_LOG(hippy::Error, "register __HIPPYNATIVEGLOBAL__ failed");
      ExceptionHandler exception;
      exception.JSONException(runtime, global_config.c_str());
    }
  };
  std::unique_ptr<RegisterMap> scope_cb_map = std::make_unique<RegisterMap>();
  scope_cb_map->insert(
      std::make_pair(hippy::base::kContextCreatedCBKey, context_cb));

  RegisterFunction scope_cb = [save_object_ = std::move(save_object),
                               runtime_id](void*) {
    HIPPY_DLOG(hippy::Debug, "run scope cb");
    CallJavaMethod(save_object_->GetObj(), runtime_id);
  };
  scope_cb_map->insert(
      std::make_pair(hippy::base::KScopeInitializedCBKey, scope_cb));

  int64_t group = groupId;
  std::shared_ptr<Engine> engine;
  if (isDevModule) {
    std::lock_guard<std::mutex> lock(engine_mutex);
    HIPPY_DLOG(hippy::Debug, "debug mode");
    group = kDebuggerEngineId;
    auto it = ReUseEngine.find(group);

    if (it != ReUseEngine.end()) {
      engine = std::get<std::shared_ptr<Engine>>(it->second);
      runtime->SetEngine(engine);
    } else {
      engine = std::make_shared<Engine>(std::move(engine_cb_map));
      runtime->SetEngine(engine);
      ReUseEngine[group] = std::make_pair(engine, 1);
    }
  } else if (group != kDefaultEngineId) {
    std::lock_guard<std::mutex> lock(engine_mutex);
    auto it = ReUseEngine.find(group);
    if (it != ReUseEngine.end()) {
      HIPPY_DLOG(hippy::Debug, "engine reuse");
      engine = std::get<std::shared_ptr<Engine>>(it->second);
      runtime->SetEngine(engine);
      std::get<uint32_t>(it->second) += 1;
      HIPPY_DLOG(hippy::Debug, "engine cnt = %d, use_count = %d",
                 std::get<uint32_t>(it->second), engine.use_count());
    } else {
      HIPPY_DLOG(hippy::Debug, "engine create");
      engine = std::make_shared<Engine>(std::move(engine_cb_map));
      runtime->SetEngine(engine);
      ReUseEngine[group] = std::make_pair(engine, 1);
    }
  } else {  // kDefaultEngineId
    HIPPY_DLOG(hippy::Debug, "default create engine");
    engine = std::make_shared<Engine>(std::move(engine_cb_map));
    runtime->SetEngine(engine);
  }
  runtime->SetScope(
      runtime->GetEngine()->CreateScope("", std::move(scope_cb_map)));
  HIPPY_DLOG(hippy::Debug, "group = %lld", group);
  runtime->SetGroupId(group);
  HIPPY_DLOG(hippy::Debug, "HippyBridgeImpl_initJSFramework end");

  return runtime_id;
}

JNIEXPORT jboolean JNICALL
Java_com_tencent_mtt_hippy_bridge_HippyBridgeImpl_runScriptFromUri(
    JNIEnv* env,
    jobject j_obj,
    jstring j_uri,
    jobject j_asset_manager,
    jboolean j_can_use_code_cache,
    jstring j_code_cache_dir,
    jlong j_runtime_id,
    jobject j_cb) {
  std::shared_ptr<Runtime> runtime = Runtime::Find(j_runtime_id);
  if (!runtime) {
    HIPPY_LOG(hippy::Warning,
              "HippyBridgeImpl runScriptFromUri, v8RuntimePtr invalid");
    return false;
  }

  HIPPY_DLOG(hippy::Debug, "runScriptFromUri begin");
  auto time_begin = std::chrono::time_point_cast<std::chrono::microseconds>(
                        std::chrono::system_clock::now())
                        .time_since_epoch()
                        .count();

  const std::string uri = JniUtils::CovertJavaStringToString(env, j_uri);
  const std::string code_cache_dir =
      JniUtils::CovertJavaStringToString(env, j_code_cache_dir);

  std::shared_ptr<Uri> uri_obj = std::make_shared<Uri>(uri);
  std::string uri_schema = uri_obj->GetScheme();
  std::string uri_path = uri_obj->GetPath();
  auto pos = uri.find_last_of('/');
  const std::string script_name = uri.substr(pos + 1);
  const std::string base_path = uri.substr(0, pos + 1);
  HIPPY_LOG(hippy::Debug,
            "runScriptFromUri uri = %s,  uri_schema = %s, uri_path = %s, "
            "script_name = %s, base_path = %s,  code_cache_dir = %s",
            uri.c_str(), uri_schema.c_str(), uri_path.c_str(),
            script_name.c_str(), base_path.c_str(), code_cache_dir.c_str());

  auto runner = runtime->GetEngine()->GetJSRunner();
  std::shared_ptr<Ctx> ctx = runtime->GetScope()->GetContext();
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback = [ctx, base_path] {
    ctx->SetGlobalStrVar("__HIPPYCURDIR__", base_path.c_str());
  };
  runner->PostTask(task);

  AAssetManager* aasset_manager = nullptr;
  if (uri_schema == "file") {
    HIPPY_LOG(hippy::Debug, "FileLoader");
    std::shared_ptr<FileLoader> loader =
        std::make_shared<FileLoader>(base_path);
    runtime->GetScope()->SetUriLoader(loader);
  } else if (uri_schema == "http" || uri_schema == "https" || uri_schema == "debug") {
    HIPPY_LOG(hippy::Debug, "HttpLoader");
    std::shared_ptr<HttpLoader> loader = std::make_shared<HttpLoader>();
    loader->SetBridge(runtime->GetBridge());
    runtime->GetScope()->SetUriLoader(loader);
  } else if (uri_schema == "asset") {
    HIPPY_LOG(hippy::Debug, "AssetLoader");
    aasset_manager = AAssetManager_fromJava(env, j_asset_manager);
    std::shared_ptr<AssetLoader> loader =
        std::make_shared<AssetLoader>(aasset_manager, base_path);
    runtime->GetScope()->SetUriLoader(loader);
  } else {
    HIPPY_LOG(hippy::Error, "schema error, schema = %s", uri_schema.c_str());
    return false;
  }

  std::shared_ptr<JavaRef> save_object = std::make_shared<JavaRef>(env, j_cb);
  task = std::make_shared<JavaScriptTask>();
  task->callback = [runtime, save_object_ = std::move(save_object), script_name,
                    j_can_use_code_cache, code_cache_dir, uri, aasset_manager,
                    time_begin] {
    HIPPY_DLOG(hippy::Debug, "runScriptFromUri enter tast");
    bool flag = RunScript(runtime, script_name, j_can_use_code_cache,
                          code_cache_dir, uri, aasset_manager);
    jlong value = flag == false ? 0 : 1;
    CallJavaMethod(save_object_->GetObj(), value);

    auto time_end = std::chrono::time_point_cast<std::chrono::microseconds>(
                        std::chrono::system_clock::now())
                        .time_since_epoch()
                        .count();

    HIPPY_LOG(hippy::Debug, "pollytime runScriptFromUri = %lld, uri = %s",
              (time_end - time_begin), uri.c_str());

    return flag;
  };

  runner->PostTask(task);

  return true;
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
  return false;
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
  return false;
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
  std::shared_ptr<Runtime> runtime = Runtime::Find(v8RuntimePtr);
  if (!runtime) {
    HIPPY_LOG(hippy::Warning,
              "HippyBridgeImpl callFunction, v8RuntimePtr invalid");
    return;
  }

  std::shared_ptr<JavaScriptTaskRunner> runner =
      runtime->GetEngine()->GetJSRunner();
  if (!runner) {
    HIPPY_LOG(hippy::Warning, "HippyBridgeImpl callFunction, runner invalid");
    return;
  }
  std::string action_name = JniUtils::CovertJavaStringToString(env, action);

  std::string hippy_params = JniUtils::AppendJavaByteArrayToString(env, params);
  HIPPY_DLOG(hippy::Debug, "callFunction action_name = %s, hippy_params = %s",
             action_name.c_str(), hippy_params.c_str());
  std::shared_ptr<JavaRef> save_object =
      std::make_shared<JavaRef>(env, jcallback);
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback = [runtime, save_object_ = std::move(save_object), action_name,
                    hippy_params] {
    HIPPY_DLOG(hippy::Debug, "js callFunction action_name = %s, hippy_params = %s",
               action_name.c_str(), hippy_params.c_str());
    std::shared_ptr<Ctx> context = runtime->GetScope()->GetContext();
    if (runtime->IsDebug() && !action_name.compare("onWebsocketMsg")) {
      global_inspector->SendMessageToV8(hippy_params);
    } else {
      if (!runtime->GetBridgeFunc()) {
        HIPPY_DLOG(hippy::Debug, "bridge_func_ init");
        std::string name("hippyBridge");
        std::shared_ptr<CtxValue> fn = context->GetJsFn(name);
        bool is_fn = context->IsFunction(fn);
        HIPPY_DLOG(hippy::Debug, "is_fn = %d", is_fn);
        if (!is_fn) {
          CallJavaMethod(save_object_->GetObj(), 0);
          return;
        } else {
          runtime->SetBridgeFunc(fn);
        }
      }
      // to do params_str invalid
      std::shared_ptr<CtxValue> action =
          context->CreateString(action_name.c_str());
      std::shared_ptr<CtxValue> params =
          context->CreateObject(hippy_params.c_str());
      std::shared_ptr<CtxValue> argv[] = {action, params};
      context->CallFunction(runtime->GetBridgeFunc(), 2, argv);
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
  int64_t runtime_id = v8RuntimePtr;
  std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
  if (!runtime) {
    HIPPY_LOG(hippy::Warning, "HippyBridgeImpl destroy, v8RuntimePtr invalid");
    return;
  }

  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback = [runtime, runtime_id] {
    HIPPY_LOG(hippy::Debug, "js destroy");
    if (runtime->IsDebug()) {
      global_inspector->DestroyContext();
      global_inspector->Reset(nullptr, runtime->GetBridge());
    } else {
      runtime->GetScope()->WillExit();
    }

    runtime->SetScope(nullptr);
    Runtime::Erase(runtime);
    Runtime::ReleaseKey(runtime_id);
  };
  int64_t group = runtime->GetGroupId();
  if (group == kDebuggerEngineId) {
    runtime->GetScope()->WillExit();
  }
  runtime->GetEngine()->GetJSRunner()->PostTask(task);
  HIPPY_DLOG(hippy::Debug, "destroy, group = %lld", group);
  if (group == kDebuggerEngineId) {
  
  } else if (group == kDefaultEngineId) {
    runtime->GetEngine()->TerminateRunner();
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

  Uri::Init();

  return JNI_VERSION_1_4;
}

void JNI_OnUnload(JavaVM* vm, void* reserved) {
  // todo
  hippy::napi::V8VM::PlatformDestroy();

  Uri::Destory();

  JNIEnvironment::DestroyInstance();
}
