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

#include "bridge/entry.h"

#include <android/asset_manager.h>
#include <android/asset_manager_jni.h>
#include <sys/stat.h>

#include <future>
#include <memory>
#include <mutex>
#include <unordered_map>

#include "bridge/js2java.h"
#include "bridge/runtime.h"
#include "core/core.h"
#include "jni/exception_handler.h"
#include "jni/jni_env.h"
#include "jni/jni_register.h"
#include "jni/uri.h"
#include "loader/adr_loader.h"

namespace hippy {
namespace bridge {

REGISTER_JNI("com/tencent/mtt/hippy/bridge/HippyBridgeImpl",
             "initJSFramework",
             "([BZZZLcom/tencent/mtt/hippy/bridge/NativeCallback;J)J",
             InitInstance)

REGISTER_JNI("com/tencent/mtt/hippy/bridge/HippyBridgeImpl",
             "runScriptFromUri",
             "(Ljava/lang/String;Landroid/content/res/AssetManager;ZLjava/lang/"
             "String;JLcom/tencent/mtt/hippy/bridge/NativeCallback;)Z",
             RunScriptFromUri)

REGISTER_JNI("com/tencent/mtt/hippy/bridge/HippyBridgeImpl",
             "destroy",
             "(JZLcom/tencent/mtt/hippy/bridge/NativeCallback;)V",
             DestroyInstance)

using RegisterMap = hippy::base::RegisterMap;
using RegisterFunction = hippy::base::RegisterFunction;
using Ctx = hippy::napi::Ctx;
using V8InspectorClientImpl = hippy::inspector::V8InspectorClientImpl;

static std::unordered_map<int64_t, std::pair<std::shared_ptr<Engine>, uint32_t>>
    reuse_engine_map;
static std::mutex engine_mutex;

static const int64_t kDefaultEngineId = -1;
static const int64_t kDebuggerEngineId = -9999;
static const uint32_t kRuntimeKeyIndex = 0;

std::shared_ptr<V8InspectorClientImpl> global_inspector = nullptr;

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

    script_content =
        runtime->GetScope()->GetUriLoader()->RequestUntrustedContent(uri);
    code_cache_content = read_file_future.get();
  } else {
    script_content =
        runtime->GetScope()->GetUriLoader()->RequestUntrustedContent(uri);
  }

  HIPPY_DLOG(hippy::Error, "uri = %s, len = %d, script content = %s",
             uri.c_str(), script_content.length(), script_content.c_str());

  if (script_content.empty()) {
    HIPPY_LOG(hippy::Error, "script content empty, uri = %s", uri.c_str());
    return false;
  }

  auto ret = std::static_pointer_cast<hippy::napi::V8Ctx>(
                 runtime->GetScope()->GetContext())
                 ->RunScript(std::move(script_content), file_name,
                             is_use_code_cache, &code_cache_content);
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

jboolean RunScriptFromUri(JNIEnv* j_env,
                          jobject j_obj,
                          jstring j_uri,
                          jobject j_aasset_manager,
                          jboolean j_can_use_code_cache,
                          jstring j_code_cache_dir,
                          jlong j_runtime_id,
                          jobject j_cb) {
  HIPPY_DLOG(hippy::Debug, "runScriptFromUri begin, j_runtime_id = %lld",
             j_runtime_id);
  std::shared_ptr<Runtime> runtime = Runtime::Find(j_runtime_id);
  if (!runtime) {
    HIPPY_LOG(hippy::Warning,
              "HippyBridgeImpl runScriptFromUri, j_runtime_id invalid");
    return false;
  }

  auto time_begin = std::chrono::time_point_cast<std::chrono::microseconds>(
                        std::chrono::system_clock::now())
                        .time_since_epoch()
                        .count();

  const std::string uri = JniUtils::CovertJavaStringToString(j_env, j_uri);
  const std::string code_cache_dir =
      JniUtils::CovertJavaStringToString(j_env, j_code_cache_dir);

  std::shared_ptr<Uri> uri_obj = std::make_shared<Uri>(uri);
  std::string uri_path = uri_obj->GetPath();
  auto pos = uri.find_last_of('/');
  const std::string script_name = uri.substr(pos + 1);
  const std::string base_path = uri.substr(0, pos + 1);
  HIPPY_LOG(hippy::Debug,
            "runScriptFromUri uri = %s, script_name = %s, base_path = %s, "
            "code_cache_dir = %s",
            uri.c_str(), script_name.c_str(), base_path.c_str(),
            code_cache_dir.c_str());

  auto runner = runtime->GetEngine()->GetJSRunner();
  std::shared_ptr<Ctx> ctx = runtime->GetScope()->GetContext();
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback = [ctx, base_path] {
    ctx->SetGlobalStrVar("__HIPPYCURDIR__", base_path.c_str());
  };
  runner->PostTask(task);

  std::shared_ptr<ADRLoader> loader = std::make_shared<ADRLoader>();
  loader->SetBridge(runtime->GetBridge());
  loader->SetWorkerTaskRunner(runtime->GetEngine()->GetWorkerTaskRunner());
  runtime->GetScope()->SetUriLoader(loader);
  AAssetManager* aasset_manager = nullptr;
  if (j_aasset_manager) {
    aasset_manager = AAssetManager_fromJava(j_env, j_aasset_manager);
    loader->SetAAssetManager(aasset_manager);
  }

  std::shared_ptr<JavaRef> save_object = std::make_shared<JavaRef>(j_env, j_cb);
  task = std::make_shared<JavaScriptTask>();
  task->callback = [runtime, save_object_ = std::move(save_object), script_name,
                    j_can_use_code_cache, code_cache_dir, uri, aasset_manager,
                    time_begin] {
    HIPPY_DLOG(hippy::Debug, "runScriptFromUri enter tast");
    bool flag = RunScript(runtime, script_name, j_can_use_code_cache,
                          code_cache_dir, uri, aasset_manager);
    jlong value = flag == false ? 0 : 1;
    hippy::bridge::CallJavaMethod(save_object_->GetObj(), value);

    auto time_end = std::chrono::time_point_cast<std::chrono::microseconds>(
                        std::chrono::system_clock::now())
                        .time_since_epoch()
                        .count();

    HIPPY_LOG(hippy::Debug, "runScriptFromUri = %lld, uri = %s",
              (time_end - time_begin), uri.c_str());

    return flag;
  };

  runner->PostTask(task);

  return true;
}

void HandleUncaughtJsError(v8::Local<v8::Message> message,
                           v8::Local<v8::Value> error) {
  HIPPY_DLOG(hippy::Debug, "HandleUncaughtJsError begin");

  if (error.IsEmpty()) {
    HIPPY_LOG(hippy::Error, "HandleUncaughtJsError error is empty");
    return;
  }

  v8::Isolate* isolate = message->GetIsolate();
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
  ctx->ThrowExceptionToJS(
      std::make_shared<hippy::napi::V8CtxValue>(isolate, error));

  HIPPY_DLOG(hippy::Debug, "HandleUncaughtJsError end");
}

jlong InitInstance(JNIEnv* j_env,
                   jobject j_object,
                   jbyteArray j_global_config,
                   jboolean j_single_thread_mode,
                   jboolean j_bridge_param_json,
                   jboolean j_is_dev_module,
                   jobject j_callback,
                   jlong j_group_id) {
  HIPPY_DLOG(
      hippy::Debug,
      "InitInstance begin, j_single_thread_mode = %d, "
      "j_bridge_param_json = %d, j_is_dev_module = %d, j_group_id = %lld",
      j_single_thread_mode, j_bridge_param_json, j_is_dev_module, j_group_id);
  std::shared_ptr<Runtime> runtime =
      std::make_shared<Runtime>(std::make_shared<JavaRef>(j_env, j_object),
                                j_bridge_param_json, j_is_dev_module);
  int64_t runtime_id = runtime->GetId();
  Runtime::Insert(runtime);
  std::shared_ptr<int64_t> runtime_key = Runtime::GetKey(runtime);
  RegisterFunction vm_cb = [runtime_key](void* vm) {
    hippy::napi::V8VM* v8_vm = reinterpret_cast<hippy::napi::V8VM*>(vm);
    v8::Isolate* isolate = v8_vm->isolate_;
    v8::HandleScope handle_scope(isolate);
    isolate->AddMessageListener(HandleUncaughtJsError);
    isolate->SetData(kRuntimeKeyIndex, runtime_key.get());
  };

  std::unique_ptr<RegisterMap> engine_cb_map = std::make_unique<RegisterMap>();
  engine_cb_map->insert(std::make_pair(hippy::base::kVMCreateCBKey, vm_cb));

  std::string global_config =
      JniUtils::AppendJavaByteArrayToString(j_env, j_global_config);
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  std::shared_ptr<JavaRef> save_object =
      std::make_shared<JavaRef>(j_env, j_callback);

  RegisterFunction context_cb = [runtime, global_config,
                                 runtime_key](void* scopeWrapper) {
    HIPPY_DLOG(hippy::Debug, "InitInstance register hippyCallNatives");
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
        global_inspector = std::make_shared<V8InspectorClientImpl>(scope);
        global_inspector->Connect(runtime->GetBridge());
      } else {
        global_inspector->Reset(scope, runtime->GetBridge());
      }
      global_inspector->CreateContext();
    }

    std::shared_ptr<Ctx> ctx = scope->GetContext();
    ctx->RegisterGlobalInJs();
    hippy::base::RegisterFunction fn =
        TO_REGISTER_FUNCTION(hippy::bridge::CallJava, hippy::napi::CBDataTuple);
    ctx->RegisterNativeBinding("hippyCallNatives", fn,
                               static_cast<void*>(runtime_key.get()));
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
    hippy::bridge::CallJavaMethod(save_object_->GetObj(), runtime_id);
  };
  scope_cb_map->insert(
      std::make_pair(hippy::base::KScopeInitializedCBKey, scope_cb));

  int64_t group = j_group_id;
  std::shared_ptr<Engine> engine;
  if (j_is_dev_module) {
    std::lock_guard<std::mutex> lock(engine_mutex);
    HIPPY_DLOG(hippy::Debug, "debug mode");
    group = kDebuggerEngineId;
    auto it = reuse_engine_map.find(group);

    if (it != reuse_engine_map.end()) {
      engine = std::get<std::shared_ptr<Engine>>(it->second);
      runtime->SetEngine(engine);
    } else {
      engine = std::make_shared<Engine>(std::move(engine_cb_map));
      runtime->SetEngine(engine);
      reuse_engine_map[group] = std::make_pair(engine, 1);
    }
  } else if (group != kDefaultEngineId) {
    std::lock_guard<std::mutex> lock(engine_mutex);
    auto it = reuse_engine_map.find(group);
    if (it != reuse_engine_map.end()) {
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
      reuse_engine_map[group] = std::make_pair(engine, 1);
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
  HIPPY_LOG(hippy::Debug, "InitInstance end, runtime_id = %lld", runtime_id);

  return runtime_id;
}

void DestroyInstance(JNIEnv* j_env,
                     jobject j_object,
                     jlong j_runtime_id,
                     jboolean j_single_thread_mode,
                     jobject j_callback) {
  HIPPY_LOG(hippy::Debug, "DestroyInstance begin, j_runtime_id = %lld",
            j_runtime_id);
  int64_t runtime_id = j_runtime_id;
  std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
  if (!runtime) {
    HIPPY_LOG(hippy::Warning, "HippyBridgeImpl destroy, j_runtime_id invalid");
    return;
  }

  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback = [runtime, runtime_id] {
    HIPPY_LOG(hippy::Debug, "js destroy begin");
    if (runtime->IsDebug()) {
      global_inspector->DestroyContext();
      global_inspector->Reset(nullptr, runtime->GetBridge());
    } else {
      runtime->GetScope()->WillExit();
    }

    runtime->SetScope(nullptr);
    HIPPY_LOG(hippy::Debug, "erase runtime");
    Runtime::Erase(runtime);
    HIPPY_LOG(hippy::Debug, "ReleaseKey");
    Runtime::ReleaseKey(runtime_id);
    HIPPY_LOG(hippy::Debug, "js destroy end");
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
    auto it = reuse_engine_map.find(group);
    if (it != reuse_engine_map.end()) {
      auto engine = std::get<std::shared_ptr<Engine>>(it->second);
      uint32_t cnt = std::get<uint32_t>(it->second);
      HIPPY_DLOG(hippy::Debug, "reuse_engine_map cnt = %d", cnt);
      if (cnt == 1) {
        reuse_engine_map.erase(it);
        engine->TerminateRunner();
      } else {
        std::get<uint32_t>(it->second) = cnt - 1;
      }
    } else {
      HIPPY_LOG(hippy::Fatal, "engine not find");
    }
  }
  hippy::bridge::CallJavaMethod(j_callback, 1);
  HIPPY_DLOG(hippy::Debug, "destroy end");
}

}  // namespace bridge
}  // namespace hippy

jint JNI_OnLoad(JavaVM* vm, void* reserved) {
  JNIEnv* env;
  jint onLoad_err = -1;
  if ((vm)->GetEnv(reinterpret_cast<void**>(&env), JNI_VERSION_1_4) != JNI_OK) {
    return onLoad_err;
  }
  if (!env) {
    return onLoad_err;
  }

  bool ret = JNIRegister::RegisterMethods(env);
  if (!ret) {
    return onLoad_err;
  }

  JNIEnvironment::GetInstance()->init(vm, env);

  Uri::Init();

  return JNI_VERSION_1_4;
}

void JNI_OnUnload(JavaVM* vm, void* reserved) {
  hippy::napi::V8VM::PlatformDestroy();

  Uri::Destory();

  JNIEnvironment::DestroyInstance();
}
