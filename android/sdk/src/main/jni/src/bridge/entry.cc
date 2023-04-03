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

#include "bridge/adr_bridge.h"
#include "bridge/java2js.h"
#include "bridge/js2java.h"
#include "bridge/runtime.h"
#include "core/core.h"
#include "core/napi/v8/v8_ctx.h"
#include "core/napi/v8/v8_ctx_value.h"
#include "core/vm/v8/v8_vm.h"
#include "core/vm/v8/snapshot_data.h"
#include "jni/turbo_module_manager.h"
#include "jni/exception_handler.h"
#include "jni/java_turbo_module.h"
#include "jni/jni_env.h"
#include "jni/jni_register.h"
#include "jni/jni_utils.h"
#include "jni/uri.h"
#include "loader/adr_loader.h"

using unicode_string_view = tdf::base::unicode_string_view;
using u8string = unicode_string_view::u8string;
using RegisterMap = hippy::base::RegisterMap;
using RegisterFunction = hippy::base::RegisterFunction;
using Ctx = hippy::napi::Ctx;
using V8Ctx = hippy::napi::V8Ctx;
using StringViewUtils = hippy::base::StringViewUtils;
using HippyFile = hippy::base::HippyFile;
using VM = hippy::vm::VM;
using V8VM = hippy::vm::V8VM;
using V8SnapshotVM = hippy::vm::V8SnapshotVM;
using V8VMInitParam = hippy::vm::V8VMInitParam;
#ifndef V8_WITHOUT_INSPECTOR
using V8InspectorClientImpl = hippy::inspector::V8InspectorClientImpl;
#endif

constexpr char kLogTag[] = "native";
constexpr char kGlobalKey[] = "global";
constexpr char kNativeGlobalKey[] = "__HIPPYNATIVEGLOBAL__";
constexpr char kCallNativesKey[] = "hippyCallNatives";
constexpr char kCurDir[] = "__HIPPYCURDIR__";

std::vector<intptr_t> external_references{};

void HandleUncaughtJsError(v8::Local<v8::Message> message,
                           v8::Local<v8::Value> data) {
  TDF_BASE_DLOG(INFO) << "HandleUncaughtJsError begin";

  if (message.IsEmpty()) {
    TDF_BASE_DLOG(ERROR) << "HandleUncaughtJsError message is empty";
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
  auto ctx = std::static_pointer_cast<hippy::napi::V8Ctx>(context);
  auto description = ctx->GetMsgDesc(message);
  auto stack = ctx->GetStackInfo(message);

  TDF_BASE_LOG(ERROR) << "HandleUncaughtJsError, runtime_id = "
                      << runtime->GetId()
                      << ", desc = "
                      << description
                      << ", stack = "
                      << stack;
  ExceptionHandler::ReportJsException(runtime, description, stack);
  auto error = ctx->CreateError(message);
  ctx->HandleUncaughtException(error);
  TDF_BASE_DLOG(INFO) << "HandleUncaughtJsError end";
}

namespace hippy {
namespace bridge {

REGISTER_STATIC_JNI("com/tencent/mtt/hippy/HippyEngine", // NOLINT(cert-err58-cpp)
                    "setNativeLogHandler",
                    "(Lcom/tencent/mtt/hippy/adapter/HippyLogAdapter;)V",
                    setNativeLogHandler)

REGISTER_STATIC_JNI("com/tencent/mtt/hippy/bridge/HippyBridgeImpl", // NOLINT(cert-err58-cpp)
                    "createSnapshot",
                    "([Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)I",
                    CreateSnapshot)

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
             "(JZZLcom/tencent/mtt/hippy/bridge/NativeCallback;)V",
             DestroyInstance)

REGISTER_JNI("com/tencent/mtt/hippy/bridge/HippyBridgeImpl", // NOLINT(cert-err58-cpp)
             "runScript",
             "(JLjava/lang/String;)V",
             RunScript)

REGISTER_JNI("com/tencent/mtt/hippy/bridge/HippyBridgeImpl", // NOLINT(cert-err58-cpp)
             "runInJsThread",
             "(JLcom/tencent/mtt/hippy/common/Callback;)V",
             RunInJsThread)


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
  SNAPSHOT_INVALID = -2,
  RUN_SCRIPT_ERROR = -1,
  SUCCESS = 0,
};

void NativeCallback(const hippy::napi::CallbackInfo& info, void* data) {
  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
  auto scope = scope_wrapper->scope.lock();
  TDF_BASE_CHECK(scope);
  auto v8_ctx = std::static_pointer_cast<V8Ctx>(scope->GetContext());
  TDF_BASE_CHECK(v8_ctx->HasFuncExternalData(data));
  auto runtime_id = static_cast<int32_t>(reinterpret_cast<size_t>(v8_ctx->GetFuncExternalData(data)));
  hippy::bridge::CallJava(info, runtime_id);
}

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
                       AAssetManager* asset_manager,
                       std::chrono::time_point<std::chrono::system_clock> &load_start,
                       std::chrono::time_point<std::chrono::system_clock> &load_end) {
  TDF_BASE_LOG(INFO) << "RunScriptInternal begin, file_name = " << file_name
                     << ", is_use_code_cache = " << is_use_code_cache
                     << ", code_cache_dir = " << code_cache_dir
                     << ", uri = " << uri
                     << ", asset_manager = " << asset_manager;
  unicode_string_view script_content;
  bool read_script_flag;
  unicode_string_view code_cache_content;
  uint64_t modify_time = 0;

  load_start = std::chrono::system_clock::now();
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
    task->func_ = hippy::base::MakeCopyable([p = std::move(read_file_promise),
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
    read_script_flag = runtime->GetScope()->GetUriLoader()->RequestUntrustedContent(uri, content);
    if (read_script_flag) {
      script_content = unicode_string_view(std::move(content));
    }
    code_cache_content = read_file_future.get();
  } else {
    u8string content;
    read_script_flag = runtime->GetScope()->GetUriLoader()->RequestUntrustedContent(uri, content);
    if (read_script_flag) {
      script_content = unicode_string_view(std::move(content));
    }
  }
  load_end = std::chrono::system_clock::now();

  TDF_BASE_DLOG(INFO) << "uri = " << uri
                      << "read_script_flag = " << read_script_flag
                      << ", script content = " << script_content;

  if (!read_script_flag || StringViewUtils::IsEmpty(script_content)) {
    TDF_BASE_LOG(WARNING) << "read_script_flag = " << read_script_flag
                          << ", script content empty, uri = " << uri;
    return false;
  }

  auto ret = std::static_pointer_cast<hippy::napi::V8Ctx>(
      runtime->GetScope()->GetContext())->RunScript(
          script_content, file_name, is_use_code_cache,&code_cache_content, true);
  if (is_use_code_cache) {
    if (!StringViewUtils::IsEmpty(code_cache_content)) {
      std::unique_ptr<CommonTask> task = std::make_unique<CommonTask>();
      task->func_ = [code_cache_path, code_cache_dir, code_cache_content] {
        int check_dir_ret = HippyFile::CheckDir(code_cache_dir, F_OK);
        TDF_BASE_DLOG(INFO) << "check_parent_dir_ret = " << check_dir_ret;
        if (check_dir_ret) {
          HippyFile::CreateDir(code_cache_dir, S_IRWXU);
        }

        size_t pos = StringViewUtils::FindLastOf(code_cache_path, EXTEND_LITERAL('/'));
        unicode_string_view code_cache_parent_dir = StringViewUtils::SubStr(code_cache_path, 0, pos);
        int check_parent_dir_ret =
            HippyFile::CheckDir(code_cache_parent_dir, F_OK);
        TDF_BASE_DLOG(INFO)
            << "check_parent_dir_ret = " << check_parent_dir_ret;
        if (check_parent_dir_ret) {
          HippyFile::CreateDir(code_cache_parent_dir, S_IRWXU);
        }

        std::string u8_code_cache_content =
            StringViewUtils::ToU8StdStr(code_cache_content);
        bool save_file_ret = HippyFile::SaveFile(code_cache_path, u8_code_cache_content);
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

enum class CreateSnapshotResult {
  kSuccess, kFailed, kRunScriptError, kSnapshotBlobInvalid, kSaveSnapshotFailed
};

jint CreateSnapshot(JNIEnv* j_env,
                    __unused jobject j_obj,
                    jobjectArray j_script_array,
                    jstring j_snapshot_uri,
                    jstring j_config) {
  auto time_begin = std::chrono::time_point_cast<std::chrono::microseconds>(
      std::chrono::system_clock::now())
      .time_since_epoch()
      .count();
  auto vm = std::make_shared<V8SnapshotVM>();
  auto engine = std::make_shared<Engine>();
  engine->SyncInit(vm);
  auto global_config = JniUtils::ToStrView(j_env, j_config);
  TDF_BASE_LOG(INFO) << "CreateSnapshot global_config = " << global_config;
  auto context_cb = [global_config](void* wrapper) {
    TDF_BASE_CHECK(wrapper);
    auto* scope_wrapper = reinterpret_cast<ScopeWrapper*>(wrapper);
    TDF_BASE_CHECK(scope_wrapper);
    auto scope = scope_wrapper->scope.lock();
    TDF_BASE_CHECK(scope);
    auto ctx = scope->GetContext();
    auto global_object = ctx->GetGlobalObject();
    auto user_global_object_key = ctx->CreateString(kGlobalKey);
    ctx->SetProperty(global_object, user_global_object_key, global_object);
    auto native_global_key = ctx->CreateString(kNativeGlobalKey);
    auto global_config_object = V8VM::ParseJson(ctx, global_config);
    ctx->SetProperty(global_object, native_global_key, global_config_object);
  };
  std::unique_ptr<RegisterMap> scope_cb_map = std::make_unique<RegisterMap>();
  scope_cb_map->insert({hippy::base::kContextCreatedCBKey, context_cb});
  auto scope = engine->SyncCreateScope(std::move(scope_cb_map));
  auto v8_ctx = std::static_pointer_cast<hippy::napi::V8Ctx>(scope->GetContext());
  auto cnt = j_env->GetArrayLength(j_script_array);
  for (auto i = 0; i < cnt; ++i) {
    auto j_script = reinterpret_cast<jstring>(j_env->GetObjectArrayElement(j_script_array, i));
    auto script = JniUtils::ToStrView(j_env, j_script);
    hippy::napi::V8TryCatch try_catch(true, v8_ctx);
    auto result = v8_ctx->RunScript(script, "");
    if (try_catch.HasCaught()) {
      TDF_BASE_LOG(ERROR) << "RunScript error, error = " << try_catch.GetExceptionMsg();
      return static_cast<jint>(CreateSnapshotResult::kRunScriptError);
    }
  }
  auto creator = vm->snapshot_creator_;
  v8_ctx->SetDefaultContext(creator);
  TDF_BASE_LOG(INFO) << "CreateBlob";
  v8_ctx = nullptr;
  scope = nullptr;
  auto blob = creator->CreateBlob(v8::SnapshotCreator::FunctionCodeHandling::kKeep);
#if (V8_MAJOR_VERSION >= 9)
  if (!blob.IsValid()) {
    return static_cast<jint>(CreateSnapshotResult::kSnapshotBlobInvalid);
  }
#endif
  SnapshotData snapshot_data;
  snapshot_data.WriteMetaData(blob);
  auto time_end = std::chrono::time_point_cast<std::chrono::microseconds>(
      std::chrono::system_clock::now())
      .time_since_epoch()
      .count();
  TDF_BASE_LOG(INFO) << "blob size = " << blob.raw_size << ", buffer size = " << snapshot_data.buffer_holder.size()
    << ", cost = " << (time_end - time_begin);
  auto snapshot_uri = JniUtils::ToStrView(j_env, j_snapshot_uri);
  bool save_file_ret = HippyFile::SaveFile(snapshot_uri, snapshot_data.buffer_holder);
  if (!save_file_ret) {
    return static_cast<jint>(CreateSnapshotResult::kSaveSnapshotFailed);
  }
  return static_cast<jint>(CreateSnapshotResult::kSuccess);
}

jboolean RunScriptFromUri(JNIEnv* j_env,
                          __unused jobject j_obj,
                          jstring j_uri,
                          jobject j_aasset_manager,
                          jboolean j_can_use_code_cache,
                          jstring j_code_cache_dir,
                          jlong j_runtime_id,
                          jobject j_cb) {
  TDF_BASE_DLOG(INFO) << "runScriptFromUri begin, j_runtime_id = " << j_runtime_id;
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
    auto key = ctx->CreateString(kCurDir);
    auto value = ctx->CreateString(base_path);
    auto global = ctx->GetGlobalObject();
    ctx->SetProperty(global, key, value);
  };
  runner->PostTask(task);

  auto loader = std::make_shared<ADRLoader>();
  auto bridge = std::static_pointer_cast<ADRBridge>(runtime->GetBridge());
  loader->SetBridge(bridge->GetRef());
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
    std::chrono::time_point<std::chrono::system_clock> load_start;
    std::chrono::time_point<std::chrono::system_clock> load_end;
    bool flag = RunScriptInternal(runtime, script_name, j_can_use_code_cache,
                                  code_cache_dir, uri, aasset_manager, load_start, load_end);
    auto time_end = std::chrono::time_point_cast<std::chrono::microseconds>(
                        std::chrono::system_clock::now())
                        .time_since_epoch()
                        .count();

    TDF_BASE_DLOG(INFO) << "runScriptFromUri = " << (time_end - time_begin) << ", uri = " << uri;

    JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
    auto load_start_millis = std::chrono::time_point_cast<std::chrono::milliseconds>(load_start)
        .time_since_epoch()
        .count();
    auto load_end_millis = std::chrono::time_point_cast<std::chrono::milliseconds>(load_end)
        .time_since_epoch()
        .count();
    std::string payload = "{\"load_start_millis\":" + std::to_string(load_start_millis)
            + ", \"load_end_millis\": "+ std::to_string(load_end_millis) + "}";
    jstring j_payload = JniUtils::StrViewToJString(j_env, unicode_string_view(payload));
    if (flag) {
      hippy::bridge::CallJavaMethod(save_object_->GetObj(), INIT_CB_STATE::SUCCESS, nullptr, j_payload);
    } else {
      jstring j_msg = JniUtils::StrViewToJString(j_env, u"run script error");
      hippy::bridge::CallJavaMethod(save_object_->GetObj(), INIT_CB_STATE::RUN_SCRIPT_ERROR, j_msg, j_payload);
      j_env->DeleteLocalRef(j_msg);
    }
    j_env->DeleteLocalRef(j_payload);
    return flag;
  };

  runner->PostTask(task);

  return JNI_TRUE;
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
  std::shared_ptr<ADRBridge> bridge = std::make_shared<ADRBridge>(j_env, j_object);
  auto runtime = std::make_shared<Runtime>(std::move(bridge), j_enable_v8_serialization, j_is_dev_module);
  int32_t runtime_id = runtime->GetId();
  Runtime::Insert(runtime);
  int64_t group = j_group_id;

  bool use_snapshot = false;
  std::shared_ptr<V8VMInitParam> param;
  if (j_vm_init_param) {
    jclass cls = j_env->GetObjectClass(j_vm_init_param);
    jfieldID init_field = j_env->GetFieldID(cls, "initialHeapSize", "J");
    auto initial_heap_size_in_bytes = j_env->GetLongField(j_vm_init_param, init_field);
    jfieldID max_field = j_env->GetFieldID(cls, "maximumHeapSize", "J");
    auto maximum_heap_size_in_bytes = j_env->GetLongField(j_vm_init_param, max_field);
    param = std::make_shared<V8VMInitParam>();
    param->initial_heap_size_in_bytes =
        hippy::base::checked_numeric_cast<jlong, size_t>(initial_heap_size_in_bytes);
    param->maximum_heap_size_in_bytes =
        hippy::base::checked_numeric_cast<jlong, size_t>(maximum_heap_size_in_bytes);
    TDF_BASE_CHECK(param->initial_heap_size_in_bytes <= param->maximum_heap_size_in_bytes);
    auto type_field = j_env->GetFieldID(cls, "type", "I");
    auto j_type = j_env->GetIntField(j_vm_init_param,type_field);
    param->type = static_cast<V8VMInitParam::V8VMSnapshotType>(j_type);
    auto j_uri_field = j_env->GetFieldID(cls, "uri", "Ljava/lang/String;");
    if (param->type == V8VMInitParam::V8VMSnapshotType::kUseSnapshot) {
      bool is_valid = false;
      do {
        auto j_uri = reinterpret_cast<jstring>(j_env->GetObjectField(j_vm_init_param, j_uri_field));
        // Currently only support the file protocol
        if (j_uri) {
          auto uri = JniUtils::ToStrView(j_env, j_uri);
          auto uri_obj = Uri::Create(uri);
          if (!uri_obj) {
            is_valid = false;
            break;
          }
          auto path = uri_obj->GetPath();
          is_valid = HippyFile::ReadFile(uri, param->snapshot_data.buffer_holder, false);
          if (!is_valid) {
            break;
          }
          is_valid = param->snapshot_data.ReadMetadata();
        } else {
          auto j_blob_field = j_env->GetFieldID(cls, "blob", "Ljava/nio/ByteBuffer;");
          auto j_buffer = j_env->GetObjectField(j_vm_init_param, j_blob_field);
          if (j_buffer) {
            auto capacity = hippy::base::checked_numeric_cast<jlong, size_t>(j_env->GetDirectBufferCapacity(j_buffer));
            if (capacity <= 0) {
              is_valid = false;
              break;
            }
            auto buffer_pointer = reinterpret_cast<uint8_t*>(j_env->GetDirectBufferAddress(j_buffer));
            param->snapshot_data.external_buffer_holder = std::make_shared<JavaRef>(j_env, j_buffer);
            is_valid = param->snapshot_data.ReadMetaData(buffer_pointer, capacity);
          } else {
            is_valid = false;
            break;
          }
        }
        if (!is_valid) {
          break;
        }
#if (V8_MAJOR_VERSION >= 9)
        is_valid = param->snapshot_data.startup_data.IsValid();
#endif
      } while (false);
      if (!is_valid) {
        TDF_BASE_LOG(ERROR) << "snapshot invalid";
        hippy::bridge::CallJavaMethod(j_callback, INIT_CB_STATE::SNAPSHOT_INVALID);
        return 0;
      }
      use_snapshot = true;
    }
  }

  auto vm_cb = [group, runtime_id](void* vm) {
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
    auto runtime = Runtime::Find(runtime_id);
    auto interrupt_queue = std::make_shared<hippy::InterruptQueue>(isolate);
    interrupt_queue->SetTaskRunner(runtime->GetEngine()->GetJSRunner());
    runtime->SetInterruptQueue(interrupt_queue);
    auto& map = InterruptQueue::GetPersistentMap();
    map.Insert(interrupt_queue->GetId(), interrupt_queue);
#ifndef V8_WITHOUT_INSPECTOR
    if (runtime->IsDebug()) {
      auto inspector = std::make_shared<V8InspectorClientImpl>(runtime->GetEngine()->GetJSRunner());
      runtime->GetEngine()->SetInspectorClient(inspector);
    }
#endif
  };

  std::unique_ptr<RegisterMap> engine_cb_map = std::make_unique<RegisterMap>();
  engine_cb_map->insert(std::make_pair(hippy::base::kVMCreateCBKey, vm_cb));

  unicode_string_view global_config = JniUtils::JByteArrayToStrView(j_env, j_global_config);
  TDF_BASE_DLOG(INFO) << "global_config = " << global_config;
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  std::shared_ptr<JavaRef> save_object = std::make_shared<JavaRef>(j_env, j_callback);

  auto context_cb = [runtime, global_config, runtime_id](void* wrapper) {
    TDF_BASE_CHECK(wrapper);
    auto* scope_wrapper = reinterpret_cast<ScopeWrapper*>(wrapper);
    TDF_BASE_CHECK(scope_wrapper);
    auto scope = scope_wrapper->scope.lock();
    TDF_BASE_CHECK(scope);
#ifndef V8_WITHOUT_INSPECTOR
      if (runtime->IsDebug()) {
        auto inspector_client = runtime->GetEngine()->GetInspectorClient();
        if (inspector_client) {
          inspector_client->CreateInspector(scope);
          auto inspector_context = inspector_client->CreateInspectorContext(scope, runtime->GetBridge());
          runtime->SetInspectorContext(inspector_context);
        }
      }
#endif
    auto ctx = scope->GetContext();
    auto global_object = ctx->GetGlobalObject();
    auto user_global_object_key = ctx->CreateString(kGlobalKey);
    ctx->SetProperty(global_object, user_global_object_key, global_object);
    TDF_BASE_DLOG(INFO) << "bridge bind runtime_id = " << runtime_id;
    auto func_wrapper = std::make_unique<hippy::napi::FuncWrapper>(NativeCallback,
                                                                   reinterpret_cast<void*>(runtime_id));
    auto native_func_cb = ctx->CreateFunction(func_wrapper);
    scope->SaveFuncWrapper(std::move(func_wrapper));
    auto call_natives_key = ctx->CreateString(kCallNativesKey);
    ctx->SetProperty(global_object, call_natives_key, native_func_cb, hippy::napi::PropertyAttribute::ReadOnly);
    auto native_global_key = ctx->CreateString(kNativeGlobalKey);
    auto global_config_object = VM::ParseJson(ctx, global_config);
    ctx->SetProperty(global_object, native_global_key, global_config_object);
  };

  RegisterFunction scope_cb = [save_object_ = std::move(save_object)](void*) {
    TDF_BASE_LOG(INFO) << "run scope cb";
    hippy::bridge::CallJavaMethod(save_object_->GetObj(),INIT_CB_STATE::SUCCESS);
  };
  std::unique_ptr<RegisterMap> scope_cb_map = std::make_unique<RegisterMap>();
  scope_cb_map->insert({hippy::base::kContextCreatedCBKey, context_cb});
  scope_cb_map->insert({hippy::base::KScopeInitializedCBKey, scope_cb});
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
      engine = std::make_shared<Engine>();
      reuse_engine_map[group] = std::make_pair(engine, 1);
      runtime->SetEngine(engine);
      engine->AsyncInit(param, std::move(engine_cb_map));
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
      engine = std::make_shared<Engine>();
      runtime->SetEngine(engine);
      reuse_engine_map[group] = std::make_pair(engine, 1);
      engine->AsyncInit(param, std::move(engine_cb_map));
    }
  } else {  // kDefaultEngineId
    TDF_BASE_DLOG(INFO) << "default create engine";
    engine = std::make_shared<Engine>();
    runtime->SetEngine(engine);
    engine->AsyncInit(param, std::move(engine_cb_map));
  }
  std::unordered_map<std::string, std::string> init_param = {
      { hippy::base::kUseSnapshot,  use_snapshot ? "1" : "0" }
  };
  runtime->SetScope(engine->AsyncCreateScope("", std::move(init_param), std::move(scope_cb_map)));
  TDF_BASE_DLOG(INFO) << "group = " << group;
  runtime->SetGroupId(group);
  TDF_BASE_LOG(INFO) << "InitInstance end, runtime_id = " << runtime_id;
  return runtime_id;
}

void DestroyInstance(__unused JNIEnv* j_env,
                     __unused jobject j_object,
                     jlong j_runtime_id,
                     __unused jboolean j_single_thread_mode,
                     jboolean j_is_reload,
                     jobject j_callback) {
  TDF_BASE_DLOG(INFO) << "DestroyInstance begin, j_runtime_id = "
                      << j_runtime_id;
  auto runtime_id = static_cast<int32_t>(j_runtime_id);
  std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
  if (!runtime) {
    TDF_BASE_LOG(WARNING) << "HippyBridgeImpl destroy, j_runtime_id invalid";
    return;
  }

  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  std::shared_ptr<JavaRef> cb = std::make_shared<JavaRef>(j_env, j_callback);
  auto is_reload = static_cast<bool>(j_is_reload);
  task->callback = [runtime, runtime_id, cb, is_reload] {
    TDF_BASE_LOG(INFO) << "js destroy begin, runtime_id = " << runtime_id << ", is_reload = " << is_reload;
    if (!runtime->GetScope()) {
      Runtime::Erase(runtime);
      TDF_BASE_LOG(INFO) << "scope is null, js destroy end";
      hippy::bridge::CallJavaMethod(cb->GetObj(), INIT_CB_STATE::SUCCESS);
      return;
    }
#ifndef V8_WITHOUT_INSPECTOR
    if (runtime->IsDebug()) {
        auto inspector_client = runtime->GetEngine()->GetInspectorClient();
        if (inspector_client) {
          auto inspector_context = runtime->GetInspectorContext();
          inspector_client->DestroyInspectorContext(is_reload, inspector_context);
        }
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

void RunInJsThread(JNIEnv *j_env,
                   jobject j_object,
                   jlong j_runtime_id,
                   jobject j_callback) {
  auto runtime = Runtime::Find(hippy::base::checked_numeric_cast<jlong, int32_t>(j_runtime_id));
  TDF_BASE_CHECK(runtime);
  auto cb = std::make_shared<JavaRef>(j_env, j_callback);
  auto task_runner = runtime->GetEngine()->GetJSRunner();
  TDF_BASE_CHECK(task_runner);
  auto task = std::make_unique<JavaScriptTask>();
  task->callback = [cb]() {
    auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
    auto j_callback = cb->GetObj();
    auto j_cb_class = j_env->GetObjectClass(j_callback);
    auto j_cb_method_id = j_env->GetMethodID(j_cb_class, "callback",
                                             "(Ljava/lang/Object;Ljava/lang/Throwable;)V");
    j_env->CallVoidMethod(j_callback, j_cb_method_id, nullptr, nullptr);
    JNIEnvironment::ClearJEnvException(j_env);
  };
  task_runner->PostTask(std::move(task));
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
  V8VM::PlatformDestroy();

  Uri::Destroy();
  JavaTurboModule::Destroy();
  ConvertUtils::Destroy();
  TurboModuleManager::Destroy();

  JNIEnvironment::DestroyInstance();
}
