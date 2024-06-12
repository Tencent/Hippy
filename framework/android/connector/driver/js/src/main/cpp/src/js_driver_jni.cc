/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

#include "connector/js_driver_jni.h"

#include <android/asset_manager_jni.h>
#include <condition_variable>

#include "connector/bridge.h"
#include "connector/convert_utils.h"
#include "connector/exception_handler.h"
#include "connector/java_turbo_module.h"
#include "connector/java2js.h"
#include "connector/js2java.h"
#include "connector/turbo_module_manager.h"
#include "driver/js_driver_utils.h"
#include "footstone/check.h"
#include "footstone/logging.h"
#include "footstone/persistent_object_map.h"
#include "footstone/string_view_utils.h"
#include "footstone/worker_manager.h"
#include "jni/data_holder.h"
#include "jni/jni_env.h"
#include "jni/jni_invocation.h"
#include "jni/jni_register.h"
#include "jni/jni_utils.h"
#include "jni/scoped_java_ref.h"
#include "vfs/handler/asset_handler.h"
#include "vfs/handler/file_handler.h"
#include "vfs/handler/jni_delegate_handler.h"
#include "vfs/uri_loader.h"
#include "vfs/uri.h"
#include "vfs/vfs_resource_holder.h"

#include <unistd.h>

#ifdef JS_V8
#include "driver/vm/v8/v8_vm.h"
#endif

#ifdef ENABLE_INSPECTOR
#include "devtools/devtools_data_source.h"
#include "devtools/vfs/devtools_handler.h"
#include "devtools/devtools_jni.h"
#endif

namespace hippy {
inline namespace framework {
inline namespace connector {
inline namespace driver {

REGISTER_JNI("com/openhippy/connector/JsDriver", // NOLINT(cert-err58-cpp)
             "onCreate",
             "([BZZZLcom/openhippy/connector/NativeCallback;"
             "JILcom/openhippy/connector/JsDriver$V8InitParams;IIZ)I",
             CreateJsDriver)

REGISTER_JNI("com/openhippy/connector/JsDriver", // NOLINT(cert-err58-cpp)
             "onDestroy",
             "(IZZLcom/openhippy/connector/NativeCallback;)V",
             DestroyJsDriver)

REGISTER_JNI("com/openhippy/connector/JsDriver", // NOLINT(cert-err58-cpp)
             "loadInstance",
             "(I[BIILcom/openhippy/connector/NativeCallback;)V",
             LoadInstance)

REGISTER_JNI("com/openhippy/connector/JsDriver", // NOLINT(cert-err58-cpp)
             "unloadInstance",
             "(I[BII)V",
             UnloadInstance)

REGISTER_JNI("com/openhippy/connector/JsDriver", // NOLINT(cert-err58-cpp)
             "runScriptFromUri",
             "(ILjava/lang/String;Landroid/content/res/AssetManager;ZLjava/lang/"
             "String;ILcom/openhippy/connector/NativeCallback;)Z",
             RunScriptFromUri)

REGISTER_JNI("com/openhippy/connector/JsDriver", // NOLINT(cert-err58-cpp)
             "attachToRoot",
             "(II)V",
             SetRootNode)

REGISTER_JNI("com/openhippy/connector/JsDriver", // NOLINT(cert-err58-cpp)
             "attachToDom",
             "(II)V",
             SetDomManager)

REGISTER_JNI("com/openhippy/connector/JsDriver", // NOLINT(cert-err58-cpp)
             "onNativeInitEnd",
             "(IJJ)V",
             OnNativeInitEnd)

REGISTER_JNI("com/openhippy/connector/JsDriver", // NOLINT(cert-err58-cpp)
             "onFirstPaintEnd",
             "(IJ)V",
             OnFirstPaintEnd)

REGISTER_JNI("com/openhippy/connector/JsDriver", // NOLINT(cert-err58-cpp)
             "onFirstContentfulPaintEnd",
             "(IJ)V",
             OnFirstContentfulPaintEnd)

REGISTER_JNI("com/openhippy/connector/JsDriver", // NOLINT(cert-err58-cpp)
             "onResourceLoadEnd",
             "(ILjava/lang/String;JJJLjava/lang/String;)V",
             OnResourceLoadEnd)

using string_view = footstone::stringview::string_view;
using u8string = footstone::string_view::u8string;
using StringViewUtils = footstone::stringview::StringViewUtils;
using Ctx = hippy::Ctx;
using Bridge = hippy::Bridge;
using JsDriverUtils = hippy::JsDriverUtils;
using WorkerManager = footstone::WorkerManager;

#ifdef JS_V8
using V8VMInitParam = hippy::V8VMInitParam;
#endif

enum INIT_CB_STATE {
  DESTROY_ERROR = -2,
  RUN_SCRIPT_ERROR = -1,
  SUCCESS = 0,
};

constexpr char kHippyCurDirKey[] = "__HIPPYCURDIR__";
constexpr char kAssetSchema[] = "asset";

static std::mutex holder_mutex;
static std::mutex scope_mutex;
// scope has two phases:
// 1. create scope object.
// 2. Initializing scope object in JS thread.
// scope_initialized true means scope finished in js thread.
// destroy js driver should wait after scope initialization.
static std::unordered_map<uint32_t, bool> scope_initialized_map;
static std::unordered_map<uint32_t, std::unique_ptr<std::condition_variable>> scope_cv_map;
static std::unordered_map<void*, std::shared_ptr<Engine>> engine_holder;

std::shared_ptr<Scope> GetScope(jint j_scope_id) {
  std::any scope_object;
  auto scope_id = footstone::checked_numeric_cast<jint, uint32_t>(j_scope_id);
  auto flag = hippy::global_data_holder.Find(scope_id, scope_object);
  if (!flag) {
    FOOTSTONE_LOG(ERROR) << "Can't find scope, scope id = " << scope_id;
    return nullptr;
  }
  return std::any_cast<std::shared_ptr<Scope>>(scope_object);
}

void OnNativeInitEnd(JNIEnv* j_env, jobject j_object, jint j_scope_id, jlong startTime, jlong endTime) {
  auto scope = GetScope(j_scope_id);
  if (!scope) {
    return;
  }
  auto engine = scope->GetEngine().lock();
  if (!engine) {
    return;
  }
  auto runner = engine->GetJsTaskRunner();
  if (runner) {
    std::weak_ptr<Scope> weak_scope = scope;
    auto task = [weak_scope, startTime, endTime]() {
      auto scope = weak_scope.lock();
      if (scope) {
        auto entry = scope->GetPerformance()->PerformanceNavigation("hippyInit");
        entry->SetHippyNativeInitStart(footstone::TimePoint::FromEpochDelta(footstone::TimeDelta::FromMilliseconds(startTime)));
        entry->SetHippyNativeInitEnd(footstone::TimePoint::FromEpochDelta(footstone::TimeDelta::FromMilliseconds(endTime)));
      }
    };
    runner->PostTask(std::move(task));
  }
}

void OnFirstPaintEnd(JNIEnv* j_env, jobject j_object, jint j_scope_id, jlong time) {
  auto scope = GetScope(j_scope_id);
  if (!scope) {
    return;
  }
  auto engine = scope->GetEngine().lock();
  if (!engine) {
    return;
  }
  auto runner = engine->GetJsTaskRunner();
  if (runner) {
    std::weak_ptr<Scope> weak_scope = scope;
    auto task = [weak_scope, time]() {
      auto scope = weak_scope.lock();
      if (!scope) {
        return;
      }
      auto dom_manager = scope->GetDomManager().lock();
      if (!dom_manager) {
        return;
      }
      auto entry = scope->GetPerformance()->PerformanceNavigation("hippyInit");
      entry->SetHippyDomStart(dom_manager->GetDomStartTimePoint());
      entry->SetHippyDomEnd(dom_manager->GetDomEndTimePoint());
      entry->SetHippyFirstFrameStart(dom_manager->GetDomEndTimePoint());
      entry->SetHippyFirstFrameEnd(footstone::TimePoint::FromEpochDelta(footstone::TimeDelta::FromMilliseconds(time)));
    };
    runner->PostTask(std::move(task));
  }
}

void OnFirstContentfulPaintEnd(JNIEnv* j_env, jobject j_object, jint j_scope_id, jlong time) {
  auto scope = GetScope(j_scope_id);
  if (!scope) {
    return;
  }
  auto engine = scope->GetEngine().lock();
  if (!engine) {
    return;
  }
  auto runner = engine->GetJsTaskRunner();
  if (runner) {
    std::weak_ptr<Scope> weak_scope = scope;
    auto task = [weak_scope, time]() {
      auto scope = weak_scope.lock();
      if (!scope) {
        return;
      }
      auto entry = scope->GetPerformance()->PerformanceNavigation("hippyInit");
      entry->SetHippyFirstContentfulPaintEnd(footstone::TimePoint::FromEpochDelta(footstone::TimeDelta::FromMilliseconds(time)));
    };
    runner->PostTask(std::move(task));
  }
}

void OnResourceLoadEnd(JNIEnv* j_env, jobject j_object, jint j_scope_id, jstring j_uri,
                       jlong j_start_time, jlong j_end_time, jlong j_ret_code, jstring j_error_msg) {
  if (!j_uri) {
    return;
  }
  auto uri = JniUtils::ToStrView(j_env, j_uri);
  auto ret_code = static_cast<int32_t>(j_ret_code);
  auto error_msg = j_error_msg ? JniUtils::ToStrView(j_env, j_error_msg) : string_view("");
  auto scope = GetScope(j_scope_id);
  if (!scope) {
    return;
  }
  auto engine = scope->GetEngine().lock();
  if (!engine) {
    return;
  }
  auto runner = engine->GetJsTaskRunner();
  if (runner) {
    std::weak_ptr<Scope> weak_scope = scope;
    auto task = [weak_scope, uri, j_start_time, j_end_time, ret_code, error_msg]() {
      auto scope = weak_scope.lock();
      if (scope) {
        auto entry = scope->GetPerformance()->PerformanceResource(uri);
        if (entry) {
          entry->SetLoadSourceStart(footstone::TimePoint::FromEpochDelta(footstone::TimeDelta::FromMilliseconds(j_start_time)));
          entry->SetLoadSourceEnd(footstone::TimePoint::FromEpochDelta(footstone::TimeDelta::FromMilliseconds(j_end_time)));
        }
        if (ret_code != 0) {
          scope->HandleUriLoaderError(uri, ret_code, error_msg);
        }
      }
    };
    runner->PostTask(std::move(task));
  }
}

jint CreateJsDriver(JNIEnv* j_env,
                    jobject j_object,
                    jbyteArray j_global_config,
                    jboolean j_single_thread_mode,
                    jboolean j_enable_v8_serialization,
                    jboolean j_is_dev_module,
                    jobject j_callback,
                    jlong j_group_id,
                    jint j_dom_manager_id,
                    jobject j_vm_init_param,
                    jint j_vfs_id,
                    jint j_devtools_id,
                    jboolean j_is_reload) {
  FOOTSTONE_LOG(INFO) << "CreateJsDriver begin, j_single_thread_mode = "
                      << static_cast<uint32_t>(j_single_thread_mode)
                      << ", j_bridge_param_json = "
                      << static_cast<uint32_t>(j_enable_v8_serialization)
                      << ", j_is_dev_module = "
                      << static_cast<uint32_t>(j_is_dev_module)
                      << ", j_group_id = " << j_group_id;

  // perfromance start time
  auto perf_start_time = footstone::TimePoint::SystemNow();

  auto global_config = JniUtils::JByteArrayToStrView(j_env, j_global_config);
  auto java_callback = std::make_shared<JavaRef>(j_env, j_callback);

#ifdef JS_V8
  auto param = std::make_shared<V8VMInitParam>();
  param->enable_v8_serialization =  static_cast<bool>(j_enable_v8_serialization);
  param->is_debug = static_cast<bool>(j_is_dev_module);
  if (j_vm_init_param) {
    jclass cls = j_env->GetObjectClass(j_vm_init_param);
    jfieldID init_field = j_env->GetFieldID(cls, "initialHeapSize", "J");
    jlong initial_heap_size_in_bytes = j_env->GetLongField(j_vm_init_param, init_field);
    param->initial_heap_size_in_bytes = footstone::check::checked_numeric_cast<jlong, size_t>(
        initial_heap_size_in_bytes);
    jfieldID max_field = j_env->GetFieldID(cls, "maximumHeapSize", "J");
    jlong maximum_heap_size_in_bytes = j_env->GetLongField(j_vm_init_param, max_field);
    param->maximum_heap_size_in_bytes = footstone::check::checked_numeric_cast<jlong, size_t>(
        maximum_heap_size_in_bytes);
    FOOTSTONE_CHECK(initial_heap_size_in_bytes <= maximum_heap_size_in_bytes);
  }
#else
  auto param = std::make_shared<VMInitParam>();
#endif
#ifdef ENABLE_INSPECTOR
  if (param->is_debug) {
    auto devtools_data_source = devtools::DevtoolsDataSource::Find(
        footstone::checked_numeric_cast<jlong, uint32_t>(j_devtools_id));
    param->devtools_data_source = devtools_data_source;
  }
#endif
  auto call_host_callback = [](CallbackInfo& info, void* data) {
    hippy::bridge::CallHost(info);
  };
  param->uncaught_exception_callback = ([](const std::any& bridge, const string_view& description, const string_view& stack) {
    ExceptionHandler::ReportJsException(bridge, description, stack);
  });
  auto dom_manager_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_dom_manager_id);
  std::any dom_manager;
  auto flag = hippy::global_data_holder.Find(dom_manager_id, dom_manager);
  FOOTSTONE_CHECK(flag);
  auto dom_manager_object = std::any_cast<std::shared_ptr<DomManager>>(dom_manager);
  auto dom_task_runner = dom_manager_object->GetTaskRunner();
  auto bridge = std::make_shared<Bridge>(j_env, j_object);
  auto scope_id = hippy::global_data_holder_key.fetch_add(1);
  scope_initialized_map.insert({scope_id, false});
  scope_cv_map.insert({scope_id, std::make_unique<std::condition_variable>()});

  auto scope_initialized_callback = [perf_start_time,
      scope_id, java_callback, bridge, &holder = hippy::global_data_holder](std::shared_ptr<Scope> scope) {
    scope->SetBridge(bridge);
    holder.Insert(scope_id, scope);

    // perfromance end time
    auto entry = scope->GetPerformance()->PerformanceNavigation("hippyInit");
    entry->SetHippyJsEngineInitStart(perf_start_time);
    entry->SetHippyJsEngineInitEnd(footstone::TimePoint::SystemNow());

    FOOTSTONE_LOG(INFO) << "run scope cb";
    hippy::bridge::CallJavaMethod(java_callback->GetObj(), INIT_CB_STATE::SUCCESS);
    {
      std::unique_lock<std::mutex> lock(scope_mutex);
      scope_initialized_map[scope_id] = true;
      scope_cv_map[scope_id]->notify_all();
    }
  };
  auto engine = JsDriverUtils::CreateEngineAndAsyncInitialize(
      dom_task_runner, param, static_cast<int64_t>(j_group_id), static_cast<bool>(j_is_reload));
  {
    std::lock_guard<std::mutex> lock(holder_mutex);
    engine_holder[engine.get()] = engine;
  }
  JsDriverUtils::InitInstance(
      engine,
      param,
      global_config,
      scope_initialized_callback,
      call_host_callback);
  return footstone::checked_numeric_cast<uint32_t, jint>(scope_id);
}

void DestroyJsDriver(__unused JNIEnv* j_env,
                     __unused jobject j_object,
                     jint j_scope_id,
                     __unused jboolean j_single_thread_mode,
                     jboolean j_is_reload,
                     jobject j_callback) {
  auto bridge_callback_object = std::make_shared<JavaRef>(j_env, j_callback);
  {
    std::unique_lock<std::mutex> lock(scope_mutex);
    auto scope_id = footstone::checked_numeric_cast<jint, uint32_t>(j_scope_id);
    if (!scope_initialized_map[scope_id]) {
      auto iter = scope_cv_map.find(scope_id);
      if (iter != scope_cv_map.end()) {
        auto& cv = iter->second;
        cv->wait(lock, [scope_id]{
          return scope_initialized_map[scope_id];
        });
      }
    }
    scope_initialized_map.erase(scope_id);
    scope_cv_map.erase(scope_id);
  }
  auto scope = GetScope(j_scope_id);
  auto engine = scope->GetEngine().lock();
  FOOTSTONE_CHECK(engine);
  {
    std::lock_guard<std::mutex> lock(holder_mutex);
    auto it = engine_holder.find(engine.get());
    if (it != engine_holder.end()) {
      engine_holder.erase(it);
    }
  }
  auto scope_id = footstone::checked_numeric_cast<jint, uint32_t>(j_scope_id);
  auto flag = hippy::global_data_holder.Erase(scope_id);
  FOOTSTONE_CHECK(flag);
  JsDriverUtils::DestroyInstance(std::move(engine), std::move(scope), [bridge_callback_object](bool ret) {
      if (ret) {
        hippy::bridge::CallJavaMethod(bridge_callback_object->GetObj(),INIT_CB_STATE::SUCCESS);
      } else {
        hippy::bridge::CallJavaMethod(bridge_callback_object->GetObj(),INIT_CB_STATE::DESTROY_ERROR);
      }
    }, static_cast<bool>(j_is_reload));
}

void LoadInstance(JNIEnv* j_env,
                  __unused jobject j_obj,
                  jint j_scope_id,
                  jbyteArray j_byte_array,
                  jint j_offset,
                  jint j_length,
                  jobject j_callback) {
  auto buffer_data = JniUtils::AppendJavaByteArrayToBytes(j_env, j_byte_array, j_offset, j_length);
  auto scope = GetScope(j_scope_id);
  JsDriverUtils::LoadInstance(scope, std::move(buffer_data));
}

void UnloadInstance(JNIEnv* j_env,
                    __unused jobject j_obj,
                    jint j_scope_id,
                    jbyteArray j_byte_array,
                    jint j_offset,
                    jint j_length) {
  auto buffer_data = JniUtils::AppendJavaByteArrayToBytes(j_env, j_byte_array, j_offset, j_length);
  auto scope = GetScope(j_scope_id);
  JsDriverUtils::UnloadInstance(scope, std::move(buffer_data));
}

jboolean RunScriptFromUri(JNIEnv* j_env,
                          __unused jobject j_obj,
                          jint j_scope_id,
                          jstring j_uri,
                          jobject j_aasset_manager,
                          jboolean j_can_use_code_cache,
                          jstring j_code_cache_dir,
                          jint j_vfs_id,
                          jobject j_callback) {
  auto time_begin = std::chrono::time_point_cast<std::chrono::microseconds>(
      std::chrono::system_clock::now())
      .time_since_epoch()
      .count();
  if (!j_uri) {
    FOOTSTONE_DLOG(WARNING) << "HippyBridgeImpl runScriptFromUri, j_uri invalid";
    return false;
  }
  auto uri = JniUtils::ToStrView(j_env, j_uri);
  auto code_cache_dir = JniUtils::ToStrView(j_env, j_code_cache_dir);
  auto pos = StringViewUtils::FindLastOf(uri, EXTEND_LITERAL('/'));
  auto len = StringViewUtils::GetLength(uri);
  auto script_name = StringViewUtils::SubStr(uri, pos + 1, len);
  auto base_path = StringViewUtils::SubStr(uri, 0, pos + 1);
  FOOTSTONE_DLOG(INFO) << "runScriptFromUri uri = " << uri
                       << ", script_name = " << script_name
                       << ", base_path = " << base_path
                       << ", code_cache_dir = " << code_cache_dir;
  auto scope = GetScope(j_scope_id);
  auto runner = scope->GetTaskRunner();
  auto ctx = scope->GetContext();
  runner->PostTask([ctx, base_path] {
    auto key = ctx->CreateString(kHippyCurDirKey);
    auto value = ctx->CreateString(base_path);
    auto global = ctx->GetGlobalObject();
    ctx->SetProperty(global, key, value);
  });

  std::any vfs_instance;
  auto vfs_id = footstone::checked_numeric_cast<jint, uint32_t>(j_vfs_id);
  auto flag = hippy::global_data_holder.Find(vfs_id, vfs_instance);
  FOOTSTONE_CHECK(flag);
  auto loader = std::any_cast<std::shared_ptr<UriLoader>>(vfs_instance);
  auto bridge = std::any_cast<std::shared_ptr<Bridge>>(scope->GetBridge());
  auto ref = bridge->GetRef();
  scope->SetUriLoader(loader);
  auto engine = scope->GetEngine().lock();
  FOOTSTONE_CHECK(engine);
  if (j_aasset_manager) {
    auto asset_handler = std::make_shared<hippy::AssetHandler>();
    loader->RegisterUriHandler(kAssetSchema, asset_handler);
  }
#ifdef ENABLE_INSPECTOR
  auto devtools_data_source = scope->GetDevtoolsDataSource();
  if (devtools_data_source) {
    auto network_notification = devtools_data_source->GetNotificationCenter()->network_notification;
    auto devtools_handler = std::make_shared<hippy::devtools::DevtoolsHandler>();
    devtools_handler->SetNetworkNotification(network_notification);
    loader->RegisterUriInterceptor(devtools_handler);
  }
#endif
  auto callback_object = std::make_shared<JavaRef>(j_env, j_callback);
  auto is_local_file = j_aasset_manager != nullptr;
  auto func = [scope, callback_object = std::move(callback_object), script_name,
      j_can_use_code_cache, code_cache_dir, uri, is_local_file,
      time_begin] {
    FOOTSTONE_DLOG(INFO) << "runScriptFromUri enter";
    bool flag = JsDriverUtils::RunScript(scope, script_name, j_can_use_code_cache,
                                         code_cache_dir, uri, is_local_file);
    auto time_end = std::chrono::time_point_cast<std::chrono::microseconds>(
        std::chrono::system_clock::now())
        .time_since_epoch()
        .count();

    FOOTSTONE_DLOG(INFO) << "runScriptFromUri time = " << (time_end - time_begin) << ", uri = " << uri;
    if (flag) {
      hippy::bridge::CallJavaMethod(callback_object->GetObj(), INIT_CB_STATE::SUCCESS);
    } else {
      JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
      jstring j_msg = JniUtils::StrViewToJString(j_env, u"run script error");
      CallJavaMethod(callback_object->GetObj(), INIT_CB_STATE::RUN_SCRIPT_ERROR, j_msg);
      j_env->DeleteLocalRef(j_msg);
    }
    return flag;
  };

  runner->PostTask(std::move(func));

  return true;
}

void SetRootNode(__unused JNIEnv* j_env,
                 __unused jobject j_obj,
                 jint j_scope_id,
                 jint j_root_id) {
  auto scope = GetScope(j_scope_id);
  if (scope == nullptr) return;
  auto root_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_root_id);
  std::shared_ptr<RootNode> root_node;
  auto& persistent_map = RootNode::PersistentMap();
  auto flag = persistent_map.Find(root_id, root_node);
  FOOTSTONE_CHECK(flag);
  scope->SetRootNode(root_node);
}

void SetDomManager(__unused JNIEnv* j_env,
                   __unused jobject j_obj,
                   jint j_scope_id,
                   jint j_dom_manager_id) {
  auto dom_manager_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_dom_manager_id);
  std::any dom_manager;
  auto flag = hippy::global_data_holder.Find(dom_manager_id, dom_manager);
  FOOTSTONE_CHECK(flag);
  auto dom_manager_object = std::any_cast<std::shared_ptr<DomManager>>(dom_manager);

  auto scope = GetScope(j_scope_id);
  scope->SetDomManager(dom_manager_object);
}

static jint JNI_OnLoad(__unused JavaVM* j_vm, __unused void* reserved) {
  auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  hippy::AssetHandler::Init(j_env);
  hippy::ExceptionHandler::Init(j_env);
  hippy::ConvertUtils::Init(j_env);
  hippy::JavaTurboModule::Init(j_env);
  hippy::TurboModuleManager::Init(j_env);
  hippy::InitBridge(j_env);
  return JNI_VERSION_1_4;
}

static void JNI_OnUnload(__unused JavaVM* j_vm, __unused void* reserved) {
  auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  hippy::V8VM::PlatformDestroy();
  hippy::TurboModuleManager::Destroy(j_env);
  hippy::JavaTurboModule::Destroy(j_env);
  hippy::ConvertUtils::Destroy(j_env);
  hippy::AssetHandler::Destroy(j_env);
}

REGISTER_JNI_ONLOAD(JNI_OnLoad)
REGISTER_JNI_ONUNLOAD(JNI_OnUnload)

}
}
}
}
