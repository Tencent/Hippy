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
#include <string>
#include <unordered_map>

#include "bridge/java2js.h"
#include "bridge/js2java.h"
#include "bridge/runtime.h"
#include "core/core.h"
#include "jni/turbo_module_manager.h"
#include "jni/exception_handler.h"
#include "jni/java_turbo_module.h"
#include "jni/jni_env.h"
#include "jni/jni_register.h"
#include "jni/jni_utils.h"
#include "jni/uri.h"
#include "loader/adr_loader.h"

namespace hippy {
namespace bridge {

REGISTER_STATIC_JNI("com/tencent/mtt/hippy/HippyEngine", // NOLINT(cert-err58-cpp)
                    "setNativeLogHandler",
                    "(Lcom/tencent/mtt/hippy/adapter/HippyLogAdapter;)V",
                    setNativeLogHandler)

REGISTER_JNI("com/tencent/mtt/hippy/bridge/HippyBridgeImpl", // NOLINT(cert-err58-cpp)
             "initJSFramework",
             "([BZZZLcom/tencent/mtt/hippy/bridge/NativeCallback;"
             "JLcom/tencent/mtt/hippy/HippyEngine$V8InitParams;)J",
             InitInstance)

REGISTER_JNI("com/tencent/mtt/hippy/bridge/HippyBridgeImpl", // NOLINT(cert-err58-cpp)
             "runScriptFromUri",
             "(Ljava/lang/String;Landroid/content/res/AssetManager;ZLjava/lang/"
             "String;JLcom/tencent/mtt/hippy/bridge/NativeCallback;)Z",
             RunScriptFromUri)

REGISTER_JNI("com/tencent/mtt/hippy/bridge/HippyBridgeImpl", // NOLINT(cert-err58-cpp)
             "destroy",
             "(JZLcom/tencent/mtt/hippy/bridge/NativeCallback;)V",
             DestroyInstance)

REGISTER_JNI("com/tencent/mtt/hippy/bridge/HippyBridgeImpl", // NOLINT(cert-err58-cpp)
             "runScript",
             "(JLjava/lang/String;)V",
             RunScript)

using unicode_string_view = tdf::base::unicode_string_view;
using u8string = unicode_string_view::u8string;
using RegisterMap = hippy::base::RegisterMap;
using RegisterFunction = hippy::base::RegisterFunction;
using Ctx = hippy::napi::Ctx;
using StringViewUtils = hippy::base::StringViewUtils;
using HippyFile = hippy::base::HippyFile;
using V8VM = hippy::napi::V8VM;
using V8VMInitParam = hippy::napi::V8VMInitParam;
#ifndef V8_WITHOUT_INSPECTOR
using V8InspectorClientImpl = hippy::inspector::V8InspectorClientImpl;
std::mutex inspector_mutex;
std::shared_ptr<V8InspectorClientImpl> global_inspector = nullptr;
#endif

constexpr char kLogTag[] = "native";

static std::unordered_map<int64_t, std::pair<std::shared_ptr<Engine>, uint32_t>>
    reuse_engine_map;
static std::mutex engine_mutex;
static std::mutex log_mutex;
static bool is_inited = false;

constexpr int64_t kDefaultEngineId = -1;
constexpr int64_t kDebuggerEngineId = -9999;
constexpr uint32_t kRuntimeSlotIndex = 0;
// -1 means single isolate multi-context mode
constexpr int32_t kReuseRuntimeId = -1;

enum INIT_CB_STATE {
  RUN_SCRIPT_ERROR = -1,
  SUCCESS = 0,
};

void setNativeLogHandler(JNIEnv* j_env, __unused jobject j_object, jobject j_logger) {
  if (!j_logger) {
    return;
  }

  jclass j_cls = j_env->GetObjectClass(j_logger);
  if (!j_cls) {
    return;
  }

  jmethodID j_method =
      j_env->GetMethodID(j_cls, "onReceiveLogMessage", "(ILjava/lang/String;Ljava/lang/String;)V");
  if (!j_method) {
    return;
  }
  std::shared_ptr<JavaRef> logger = std::make_shared<JavaRef>(j_env, j_logger);
  {
    std::lock_guard<std::mutex> lock(log_mutex);
    if (!is_inited) {
      tdf::base::LogMessage::InitializeDelegate([logger, j_method](
          const std::ostringstream& stream,
          tdf::base::LogSeverity severity) {
        std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
        JNIEnv* j_env = instance->AttachCurrentThread();

        std::string str = stream.str();
        jstring j_logger_str = j_env->NewStringUTF((str.c_str()));
        jstring j_tag_str = j_env->NewStringUTF(kLogTag);
        jint j_level = static_cast<jint>(severity);
        j_env->CallVoidMethod(logger->GetObj(), j_method, j_level, j_tag_str, j_logger_str);
        JNIEnvironment::ClearJEnvException(j_env);
        j_env->DeleteLocalRef(j_tag_str);
        j_env->DeleteLocalRef(j_logger_str);
      });
      is_inited = true;
    }
  }
}

void RunScript(JNIEnv* j_env, __unused jobject, jlong j_runtime_id, jstring j_script) {
  TDF_BASE_DLOG(INFO) << "RunScript, j_runtime_id = " << j_runtime_id;
  auto runtime = Runtime::Find(hippy::base::checked_numeric_cast<jlong, int32_t>(j_runtime_id));
  if (!runtime) {
    TDF_BASE_DLOG(WARNING) << "HippyBridgeImpl RunScript, j_runtime_id invalid";
    return;
  }
  const unicode_string_view script = JniUtils::ToStrView(j_env, j_script);
  TDF_BASE_DLOG(INFO) << "RunScript, script = " << script;
  auto runner = runtime->GetEngine()->GetJSRunner();
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback = [runtime, script{std::move(script)}] () mutable {
    auto context = std::static_pointer_cast<hippy::napi::V8Ctx>(runtime->GetScope()->GetContext());
    auto ret = context->RunScript(script, "");
  };
  runner->PostTask(task);
}

bool RunScriptInternal(const std::shared_ptr<Runtime>& runtime,
                       const unicode_string_view& file_name,
                       bool is_use_code_cache,
                       const unicode_string_view& code_cache_dir,
                       const unicode_string_view& uri,
                       AAssetManager* asset_manager) {
  TDF_BASE_LOG(INFO) << "RunScriptInternal begin, file_name = " << file_name
                     << ", is_use_code_cache = " << is_use_code_cache
                     << ", code_cache_dir = " << code_cache_dir
                     << ", uri = " << uri
                     << ", asset_manager = " << asset_manager;
  unicode_string_view script_content;
  bool read_script_flag;
  unicode_string_view code_cache_content;
  uint64_t modify_time = 0;

  std::shared_ptr<WorkerTaskRunner> task_runner;
  unicode_string_view code_cache_path;
  if (is_use_code_cache) {
    if (!asset_manager) {
      modify_time = HippyFile::GetFileModifytime(uri);
    }

    code_cache_path = code_cache_dir + file_name + unicode_string_view("_") +
                      unicode_string_view(std::to_string(modify_time));

    std::promise<u8string> read_file_promise;
    std::future<u8string> read_file_future = read_file_promise.get_future();
    std::unique_ptr<CommonTask> task = std::make_unique<CommonTask>();
    task->func_ =
        hippy::base::MakeCopyable([p = std::move(read_file_promise),
                                   code_cache_path, code_cache_dir]() mutable {
          u8string content;
          HippyFile::ReadFile(code_cache_path, content, true);
          if (content.empty()) {
            TDF_BASE_DLOG(INFO) << "Read code cache failed";
            int ret = HippyFile::RmFullPath(code_cache_dir);
            TDF_BASE_DLOG(INFO) << "RmFullPath ret = " << ret;
            HIPPY_USE(ret);
          } else {
            TDF_BASE_DLOG(INFO) << "Read code cache succ";
          }
          p.set_value(std::move(content));
        });

    std::shared_ptr<Engine> engine = runtime->GetEngine();
    task_runner = engine->GetWorkerTaskRunner();
    task_runner->PostTask(std::move(task));
    u8string content;
    read_script_flag = runtime->GetScope()->GetUriLoader()
        ->RequestUntrustedContent(uri, content);
    if (read_script_flag) {
      script_content = unicode_string_view(std::move(content));
    }
    code_cache_content = read_file_future.get();
  } else {
    u8string content;
    read_script_flag = runtime->GetScope()->GetUriLoader()
        ->RequestUntrustedContent(uri, content);
    if (read_script_flag) {
      script_content = unicode_string_view(std::move(content));
    }
  }

  TDF_BASE_DLOG(INFO) << "uri = " << uri
                      << "read_script_flag = " << read_script_flag
                      << ", script content = " << script_content;

  if (!read_script_flag || StringViewUtils::IsEmpty(script_content)) {
    TDF_BASE_LOG(WARNING) << "read_script_flag = " << read_script_flag
                          << ", script content empty, uri = " << uri;
    return false;
  }

  auto ret = std::static_pointer_cast<hippy::napi::V8Ctx>(
                 runtime->GetScope()->GetContext())
                 ->RunScript(script_content, file_name, is_use_code_cache,
                             &code_cache_content, true);
  if (is_use_code_cache) {
    if (!StringViewUtils::IsEmpty(code_cache_content)) {
      std::unique_ptr<CommonTask> task = std::make_unique<CommonTask>();
      task->func_ = [code_cache_path, code_cache_dir, code_cache_content] {
        int check_dir_ret = HippyFile::CheckDir(code_cache_dir, F_OK);
        TDF_BASE_DLOG(INFO) << "check_parent_dir_ret = " << check_dir_ret;
        if (check_dir_ret) {
          HippyFile::CreateDir(code_cache_dir, S_IRWXU);
        }

        size_t pos =
            StringViewUtils::FindLastOf(code_cache_path, EXTEND_LITERAL('/'));
        unicode_string_view code_cache_parent_dir =
            StringViewUtils::SubStr(code_cache_path, 0, pos);
        int check_parent_dir_ret =
            HippyFile::CheckDir(code_cache_parent_dir, F_OK);
        TDF_BASE_DLOG(INFO)
            << "check_parent_dir_ret = " << check_parent_dir_ret;
        if (check_parent_dir_ret) {
          HippyFile::CreateDir(code_cache_parent_dir, S_IRWXU);
        }

        std::string u8_code_cache_content =
            StringViewUtils::ToU8StdStr(code_cache_content);
        bool save_file_ret =
            HippyFile::SaveFile(code_cache_path, u8_code_cache_content);
        TDF_BASE_LOG(INFO) << "code cache save_file_ret = " << save_file_ret;
        HIPPY_USE(save_file_ret);
      };
      task_runner->PostTask(std::move(task));
    }
  }

  bool flag = (ret != nullptr);
  TDF_BASE_LOG(INFO) << "runScript end, flag = " << flag;
  return flag;
}

jboolean RunScriptFromUri(JNIEnv* j_env,
                          __unused jobject j_obj,
                          jstring j_uri,
                          jobject j_aasset_manager,
                          jboolean j_can_use_code_cache,
                          jstring j_code_cache_dir,
                          jlong j_runtime_id,
                          jobject j_cb) {
  TDF_BASE_DLOG(INFO) << "runScriptFromUri begin, j_runtime_id = "
                      << j_runtime_id;
  auto runtime = Runtime::Find(hippy::base::checked_numeric_cast<jlong, int32_t>(j_runtime_id));
  if (!runtime) {
    TDF_BASE_DLOG(WARNING)
        << "HippyBridgeImpl runScriptFromUri, j_runtime_id invalid";
    return JNI_FALSE;
  }

  auto time_begin = std::chrono::time_point_cast<std::chrono::microseconds>(
                        std::chrono::system_clock::now())
                        .time_since_epoch()
                        .count();
  if (!j_uri) {
    TDF_BASE_DLOG(WARNING) << "HippyBridgeImpl runScriptFromUri, j_uri invalid";
    return JNI_FALSE;
  }
  const unicode_string_view uri = JniUtils::ToStrView(j_env, j_uri);
  const unicode_string_view code_cache_dir =
      JniUtils::ToStrView(j_env, j_code_cache_dir);
  auto pos = StringViewUtils::FindLastOf(uri, EXTEND_LITERAL('/'));
  size_t len = StringViewUtils::GetLength(uri);
  unicode_string_view script_name = StringViewUtils::SubStr(uri, pos + 1, len);
  unicode_string_view base_path = StringViewUtils::SubStr(uri, 0, pos + 1);
  TDF_BASE_DLOG(INFO) << "runScriptFromUri uri = " << uri
                      << ", script_name = " << script_name
                      << ", base_path = " << base_path
                      << ", code_cache_dir = " << code_cache_dir;

  auto runner = runtime->GetEngine()->GetJSRunner();
  std::shared_ptr<Ctx> ctx = runtime->GetScope()->GetContext();
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback = [ctx, base_path] {
    ctx->SetGlobalStrVar("__HIPPYCURDIR__", base_path);
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
    TDF_BASE_DLOG(INFO) << "runScriptFromUri enter";
    bool flag = RunScriptInternal(runtime, script_name, j_can_use_code_cache,
                                  code_cache_dir, uri, aasset_manager);
    auto time_end = std::chrono::time_point_cast<std::chrono::microseconds>(
                        std::chrono::system_clock::now())
                        .time_since_epoch()
                        .count();

    TDF_BASE_DLOG(INFO) << "runScriptFromUri = " << (time_end - time_begin)
                        << ", uri = " << uri;

    if (flag) {
      hippy::bridge::CallJavaMethod(save_object_->GetObj(),
                                    INIT_CB_STATE::SUCCESS);
    } else {
      JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
      jstring j_msg = JniUtils::StrViewToJString(j_env, u"run script error");
      CallJavaMethod(save_object_->GetObj(), INIT_CB_STATE::RUN_SCRIPT_ERROR,
                     j_msg);
      j_env->DeleteLocalRef(j_msg);
    }
    return flag;
  };

  runner->PostTask(task);

  return JNI_TRUE;
}

void HandleUncaughtJsError(v8::Local<v8::Message> message,
                           v8::Local<v8::Value> error) {
  TDF_BASE_DLOG(INFO) << "HandleUncaughtJsError begin";

  if (error.IsEmpty()) {
    TDF_BASE_DLOG(ERROR) << "HandleUncaughtJsError error is empty";
    return;
  }

  v8::Isolate* isolate = message->GetIsolate();
  std::shared_ptr<Runtime> runtime = Runtime::Find(isolate);
  if (!runtime) {
    return;
  }

  auto scope = runtime->GetScope();
  if (!scope) {
    return;
  }
  auto context = scope->GetContext();
  if (!context) {
    return;
  }
  std::shared_ptr<hippy::napi::V8Ctx> ctx = std::static_pointer_cast<hippy::napi::V8Ctx>(context);
  TDF_BASE_LOG(ERROR) << "HandleUncaughtJsError, runtime_id = "
                      << runtime->GetId()
                      << ", desc = "
                      << ctx->GetMsgDesc(message)
                      << ", stack = " << ctx->GetStackInfo(message);
  ExceptionHandler::ReportJsException(runtime, ctx->GetMsgDesc(message),
                                      ctx->GetStackInfo(message));
  ctx->HandleUncaughtException(
      std::make_shared<hippy::napi::V8CtxValue>(isolate, error));

  TDF_BASE_DLOG(INFO) << "HandleUncaughtJsError end";
}

jlong InitInstance(JNIEnv* j_env,
                   jobject j_object,
                   jbyteArray j_global_config,
                   jboolean j_single_thread_mode,
                   jboolean j_enable_v8_serialization,
                   jboolean j_is_dev_module,
                   jobject j_callback,
                   jlong j_group_id,
                   jobject j_vm_init_param) {
  TDF_BASE_LOG(INFO) << "InitInstance begin, j_single_thread_mode = "
                     << static_cast<uint32_t>(j_single_thread_mode)
                     << ", j_enable_v8_serialization = "
                     << static_cast<uint32_t>(j_enable_v8_serialization)
                     << ", j_is_dev_module = "
                     << static_cast<uint32_t>(j_is_dev_module)
                     << ", j_group_id = " << j_group_id;
  std::shared_ptr<Runtime> runtime =
      std::make_shared<Runtime>(std::make_shared<JavaRef>(j_env, j_object),
                                j_enable_v8_serialization, j_is_dev_module);
  int32_t runtime_id = runtime->GetId();
  Runtime::Insert(runtime);
  int64_t group = j_group_id;
  RegisterFunction vm_cb = [group, runtime_id](void* vm) {
    V8VM* v8_vm = reinterpret_cast<V8VM*>(vm);
    v8::Isolate* isolate = v8_vm->isolate_;
    v8::HandleScope handle_scope(isolate);
    if (group == kDefaultEngineId) {
      TDF_BASE_LOG(INFO) << "isolate->SetData runtime_id = " << runtime_id;
      isolate->SetData(kRuntimeSlotIndex, reinterpret_cast<void*>(runtime_id));
    } else {
      TDF_BASE_LOG(INFO) << "isolate->SetData runtime_id = " << kReuseRuntimeId;
      isolate->SetData(kRuntimeSlotIndex, reinterpret_cast<void*>(kReuseRuntimeId));
    }
    isolate->AddMessageListener(HandleUncaughtJsError);
  };

  std::unique_ptr<RegisterMap> engine_cb_map = std::make_unique<RegisterMap>();
  engine_cb_map->insert(std::make_pair(hippy::base::kVMCreateCBKey, vm_cb));

  unicode_string_view global_config = JniUtils::JByteArrayToStrView(j_env, j_global_config);
  TDF_BASE_DLOG(INFO) << "global_config = " << global_config;
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  std::shared_ptr<JavaRef> save_object = std::make_shared<JavaRef>(j_env, j_callback);

  RegisterFunction context_cb = [runtime, global_config,
                                 runtime_id](void* scopeWrapper) {
    TDF_BASE_LOG(INFO) << "InitInstance register hippyCallNatives, runtime_id = " << runtime_id;
    TDF_BASE_CHECK(scopeWrapper);
    auto* wrapper = reinterpret_cast<ScopeWrapper*>(scopeWrapper);
    TDF_BASE_CHECK(wrapper);
    std::shared_ptr<Scope> scope = wrapper->scope_.lock();
    if (!scope) {
      TDF_BASE_DLOG(ERROR) << "register hippyCallNatives, scope error";
      return;
    }
#ifndef V8_WITHOUT_INSPECTOR
    if (runtime->IsDebug()) {
      std::lock_guard<std::mutex> lock(inspector_mutex);
      if (!global_inspector) {
        global_inspector = std::make_shared<V8InspectorClientImpl>(scope);
        global_inspector->Connect(runtime->GetBridge());
      } else {
        global_inspector->Reset(scope, runtime->GetBridge());
      }
      global_inspector->CreateContext();
    }
#endif
    std::shared_ptr<Ctx> ctx = scope->GetContext();
    ctx->RegisterGlobalInJs();
    auto fn =
        TO_REGISTER_FUNCTION(hippy::bridge::CallJava, hippy::napi::CBDataTuple)
    ctx->RegisterNativeBinding("hippyCallNatives", fn, reinterpret_cast<void*>(runtime_id));
    bool ret = ctx->SetGlobalJsonVar("__HIPPYNATIVEGLOBAL__", global_config);
    if (!ret) {
      TDF_BASE_DLOG(ERROR) << "register __HIPPYNATIVEGLOBAL__ failed";
      ExceptionHandler::ReportJsException(runtime, u"global_config parse error",
                                          global_config);
    }
  };
  std::unique_ptr<RegisterMap> scope_cb_map = std::make_unique<RegisterMap>();
  scope_cb_map->insert(
      std::make_pair(hippy::base::kContextCreatedCBKey, context_cb));

  RegisterFunction scope_cb = [save_object_ = std::move(save_object)](void*) {
    TDF_BASE_LOG(INFO) << "run scope cb";
    hippy::bridge::CallJavaMethod(save_object_->GetObj(),
                                  INIT_CB_STATE::SUCCESS);
  };

  scope_cb_map->insert(
      std::make_pair(hippy::base::KScopeInitializedCBKey, scope_cb));

  std::shared_ptr<V8VMInitParam> param;
  if (j_vm_init_param) {
    param = std::make_shared<V8VMInitParam>();
    jclass cls = j_env->GetObjectClass(j_vm_init_param);
    jfieldID init_field = j_env->GetFieldID(cls,"initialHeapSize","J");
    param->initial_heap_size_in_bytes =
        hippy::base::checked_numeric_cast<jlong, size_t>(j_env->GetLongField(j_vm_init_param,
                                                                             init_field));
    jfieldID max_field = j_env->GetFieldID(cls,"maximumHeapSize","J");
    param->maximum_heap_size_in_bytes =
        hippy::base::checked_numeric_cast<jlong, size_t>(j_env->GetLongField(j_vm_init_param,
                                                                             max_field));
    TDF_BASE_CHECK(param->initial_heap_size_in_bytes <= param->maximum_heap_size_in_bytes);
  }
  std::shared_ptr<Engine> engine;
  if (j_is_dev_module) {
    std::lock_guard<std::mutex> lock(engine_mutex);
    TDF_BASE_DLOG(INFO) << "debug mode";
    group = kDebuggerEngineId;
    auto it = reuse_engine_map.find(group);
    if (it != reuse_engine_map.end()) {
      engine = std::get<std::shared_ptr<Engine>>(it->second);
      runtime->SetEngine(engine);

      std::shared_ptr<V8VM> v8_vm = std::static_pointer_cast<V8VM>(engine->GetVM());
      v8::Isolate* isolate = v8_vm->isolate_;
      isolate->SetData(kRuntimeSlotIndex, reinterpret_cast<void*>(runtime_id));
    } else {
      engine = std::make_shared<Engine>(std::move(engine_cb_map), param);
      runtime->SetEngine(engine);
      reuse_engine_map[group] = std::make_pair(engine, 1);
    }
  } else if (group != kDefaultEngineId) {
    std::lock_guard<std::mutex> lock(engine_mutex);
    auto it = reuse_engine_map.find(group);
    if (it != reuse_engine_map.end()) {
      TDF_BASE_DLOG(INFO) << "engine reuse";
      engine = std::get<std::shared_ptr<Engine>>(it->second);
      runtime->SetEngine(engine);
      std::get<uint32_t>(it->second) += 1;
      TDF_BASE_DLOG(INFO) << "engine cnt = " << std::get<uint32_t>(it->second)
                          << ", use_count = " << engine.use_count();
    } else {
      TDF_BASE_DLOG(INFO) << "engine create";
      engine = std::make_shared<Engine>(std::move(engine_cb_map), param);
      runtime->SetEngine(engine);
      reuse_engine_map[group] = std::make_pair(engine, 1);
    }
  } else {  // kDefaultEngineId
    TDF_BASE_DLOG(INFO) << "default create engine";
    engine = std::make_shared<Engine>(std::move(engine_cb_map), param);
    runtime->SetEngine(engine);
  }
  runtime->SetScope(
      runtime->GetEngine()->CreateScope("", std::move(scope_cb_map)));
  TDF_BASE_DLOG(INFO) << "group = " << group;
  runtime->SetGroupId(group);
  TDF_BASE_LOG(INFO) << "InitInstance end, runtime_id = " << runtime_id;

  return runtime_id;
}

void DestroyInstance(__unused JNIEnv* j_env,
                     __unused jobject j_object,
                     jlong j_runtime_id,
                     __unused jboolean j_single_thread_mode,
                     jobject j_callback) {
  TDF_BASE_DLOG(INFO) << "DestroyInstance begin, j_runtime_id = "
                      << j_runtime_id;
  auto runtime_id = static_cast<int32_t>(j_runtime_id);
  std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
  if (!runtime) {
    TDF_BASE_DLOG(WARNING) << "HippyBridgeImpl destroy, j_runtime_id invalid";
    return;
  }

  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  std::shared_ptr<JavaRef> cb = std::make_shared<JavaRef>(j_env, j_callback);
  task->callback = [runtime, runtime_id, cb] {
    TDF_BASE_LOG(INFO) << "js destroy begin, runtime_id " << runtime_id;
#ifndef V8_WITHOUT_INSPECTOR
    if (runtime->IsDebug()) {
      std::lock_guard<std::mutex> lock(inspector_mutex);
      global_inspector->DestroyContext();
      global_inspector->Reset(nullptr, runtime->GetBridge());
    } else {
      runtime->GetScope()->WillExit();
    }
#else
    runtime->GetScope()->WillExit();
#endif
    TDF_BASE_LOG(INFO) << "erase runtime";
    Runtime::Erase(runtime);
    TDF_BASE_LOG(INFO) << "js destroy end";
    hippy::bridge::CallJavaMethod(cb->GetObj(), INIT_CB_STATE::SUCCESS);
  };
  int64_t group = runtime->GetGroupId();
  if (group == kDebuggerEngineId) {
    runtime->GetScope()->WillExit();
  }
  runtime->GetEngine()->GetJSRunner()->PostTask(task);
  TDF_BASE_DLOG(INFO) << "destroy, group = " << group;
  if (group == kDebuggerEngineId) {
  } else if (group == kDefaultEngineId) {
    runtime->GetEngine()->TerminateRunner();
  } else {
    std::lock_guard<std::mutex> lock(engine_mutex);
    auto it = reuse_engine_map.find(group);
    if (it != reuse_engine_map.end()) {
      auto engine = std::get<std::shared_ptr<Engine>>(it->second);
      uint32_t cnt = std::get<uint32_t>(it->second);
      TDF_BASE_DLOG(INFO) << "reuse_engine_map cnt = " << cnt;
      if (cnt == 1) {
        reuse_engine_map.erase(it);
        engine->TerminateRunner();
      } else {
        std::get<uint32_t>(it->second) = cnt - 1;
      }
    } else {
      TDF_BASE_DLOG(FATAL) << "engine not find";
    }
  }
  TDF_BASE_DLOG(INFO) << "destroy end";
}

}  // namespace bridge
}  // namespace hippy

jint JNI_OnLoad(JavaVM* j_vm, __unused void* reserved) {
  JNIEnv* j_env;
  jint onLoad_err = -1;
  if ((j_vm)->GetEnv(reinterpret_cast<void**>(&j_env), JNI_VERSION_1_4) !=
      JNI_OK) {
    return onLoad_err;
  }
  if (!j_env) {
    return onLoad_err;
  }

  bool ret = JNIRegister::RegisterMethods(j_env);
  if (!ret) {
    return onLoad_err;
  }

  JNIEnvironment::GetInstance()->init(j_vm, j_env);

  Uri::Init();
  JavaTurboModule::Init();
  ConvertUtils::Init();
  TurboModuleManager::Init();

  return JNI_VERSION_1_4;
}

void JNI_OnUnload(__unused JavaVM* j_vm, __unused void* reserved) {
  hippy::napi::V8VM::PlatformDestroy();

  Uri::Destroy();
  JavaTurboModule::Destroy();
  ConvertUtils::Destroy();
  TurboModuleManager::Destroy();

  JNIEnvironment::DestroyInstance();
}
