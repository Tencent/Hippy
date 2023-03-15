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

#include "connector/bridge.h"
#include "connector/convert_utils.h"
#include "connector/exception_handler.h"
#include "connector/java_turbo_module.h"
#include "connector/java2js.h"
#include "connector/js2java.h"
#include "connector/turbo_module_manager.h"
#include "driver/runtime/v8/runtime.h"
#include "driver/runtime/v8/v8_bridge_utils.h"
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
             "JILcom/openhippy/connector/JsDriver$V8InitParams;I)I",
             CreateJsDriver)

REGISTER_JNI("com/openhippy/connector/JsDriver", // NOLINT(cert-err58-cpp)
             "onDestroy",
             "(IZZLcom/openhippy/connector/NativeCallback;)V",
             DestroyJsDriver)

REGISTER_JNI("com/openhippy/connector/JsDriver", // NOLINT(cert-err58-cpp)
             "loadInstance",
             "(I[BII)V",
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

using string_view = footstone::stringview::string_view;
using u8string = footstone::string_view::u8string;
using StringViewUtils = footstone::stringview::StringViewUtils;
using Ctx = hippy::driver::Ctx;
using Bridge = hippy::Bridge;
using V8VMInitParam = hippy::driver::V8VMInitParam;
using V8BridgeUtils = hippy::driver::V8BridgeUtils;
using WorkerManager = footstone::WorkerManager;

enum INIT_CB_STATE {
  DESTROY_ERROR = -2,
  RUN_SCRIPT_ERROR = -1,
  SUCCESS = 0,
};

constexpr char kHippyCurDirKey[] = "__HIPPYCURDIR__";
constexpr char kAssetSchema[] = "asset";

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
                    jint j_devtools_id) {
  FOOTSTONE_LOG(INFO) << "InitInstance begin, j_single_thread_mode = "
                      << static_cast<uint32_t>(j_single_thread_mode)
                      << ", j_bridge_param_json = "
                      << static_cast<uint32_t>(j_enable_v8_serialization)
                      << ", j_is_dev_module = "
                      << static_cast<uint32_t>(j_is_dev_module)
                      << ", j_group_id = " << j_group_id;
  string_view global_config = JniUtils::JByteArrayToStrView(j_env, j_global_config);
  std::shared_ptr<JavaRef> save_object = std::make_shared<JavaRef>(j_env, j_callback);

  std::shared_ptr<V8VMInitParam> param = std::make_shared<V8VMInitParam>();
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
  RegisterFunction scope_cb = [save_object_ = std::move(save_object)](void*) {
    FOOTSTONE_LOG(INFO) << "run scope cb";
    hippy::bridge::CallJavaMethod(save_object_->GetObj(), INIT_CB_STATE::SUCCESS);
  };
  auto call_native_cb = [](CallbackInfo& info, void* data) {
    auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
    auto scope = scope_wrapper->scope.lock();
    FOOTSTONE_CHECK(scope);
    auto runtime_id = static_cast<int32_t>(reinterpret_cast<size_t>(data));
    hippy::bridge::CallNative(info, runtime_id);
  };
  V8BridgeUtils::SetOnThrowExceptionToJS([](const std::shared_ptr<Runtime>& runtime,
                                            const string_view& desc,
                                            const string_view& stack) {
    ExceptionHandler::ReportJsException(runtime, desc, stack);
  });
  auto dom_manager_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_dom_manager_id);
  std::any dom_manager;
  auto flag = hippy::global_data_holder.Find(dom_manager_id, dom_manager);
  FOOTSTONE_CHECK(flag);
  auto dom_manager_object = std::any_cast<std::shared_ptr<DomManager>>(dom_manager);
  auto dom_task_runner = dom_manager_object->GetTaskRunner();
  auto runtime_id = V8BridgeUtils::InitInstance(
      static_cast<bool>(j_enable_v8_serialization),
      static_cast<bool>(j_is_dev_module),
      global_config,
      static_cast<int64_t>(j_group_id),
      dom_manager_object->GetWorkerManager(),
      dom_task_runner,
      param,
      std::make_shared<Bridge>(j_env, j_object),
      scope_cb,
      call_native_cb,
      static_cast<uint32_t>(j_devtools_id));
  return runtime_id;
}

void DestroyJsDriver(__unused JNIEnv* j_env,
                     __unused jobject j_object,
                     jint j_runtime_id,
                     __unused jboolean j_single_thread_mode,
                     jboolean j_is_reload,
                     jobject j_callback) {
  auto cb = std::make_shared<JavaRef>(j_env, j_callback);
  V8BridgeUtils::DestroyInstance(footstone::check::checked_numeric_cast<jint, int32_t>(j_runtime_id),
                                 [cb](bool ret) {
                                   if (ret) {
                                     hippy::bridge::CallJavaMethod(cb->GetObj(),
                                                                   INIT_CB_STATE::SUCCESS);
                                   } else {
                                     hippy::bridge::CallJavaMethod(cb->GetObj(),
                                                                   INIT_CB_STATE::DESTROY_ERROR);
                                   }
                                 }, static_cast<bool>(j_is_reload));
}

void LoadInstance(JNIEnv* j_env,
                  __unused jobject j_obj,
                  jint j_runtime_id,
                  jbyteArray j_byte_array,
                  jint j_offset,
                  jint j_length) {
  auto buffer_data = JniUtils::AppendJavaByteArrayToBytes(j_env, j_byte_array, j_offset, j_length);
  V8BridgeUtils::LoadInstance(footstone::check::checked_numeric_cast<jlong, int32_t>(j_runtime_id),
                              std::move(buffer_data));
}

void UnloadInstance(JNIEnv* j_env,
                    __unused jobject j_obj,
                    jint j_runtime_id,
                    jbyteArray j_byte_array,
                    jint j_offset,
                    jint j_length) {
  auto buffer_data = JniUtils::AppendJavaByteArrayToBytes(j_env, j_byte_array, j_offset, j_length);
  V8BridgeUtils::UnloadInstance(footstone::check::checked_numeric_cast<jlong,
                                                                       int32_t>(j_runtime_id),
                                std::move(buffer_data));
}

jboolean RunScriptFromUri(JNIEnv* j_env,
                          __unused jobject j_obj,
                          jint j_runtime_id,
                          jstring j_uri,
                          jobject j_aasset_manager,
                          jboolean j_can_use_code_cache,
                          jstring j_code_cache_dir,
                          jint j_vfs_id,
                          jobject j_cb) {
  FOOTSTONE_DLOG(INFO) << "runScriptFromUri begin, j_runtime_id = "
                       << j_runtime_id;
  auto runtime_id = footstone::check::checked_numeric_cast<jlong, int32_t>(j_runtime_id);
  auto runtime = Runtime::Find(runtime_id);
  FOOTSTONE_DCHECK(runtime);
  if (!runtime) {
    FOOTSTONE_DLOG(WARNING) << "HippyBridgeImpl runScriptFromUri, j_runtime_id invalid";
    return false;
  }

  auto time_begin = std::chrono::time_point_cast<std::chrono::microseconds>(
      std::chrono::system_clock::now())
      .time_since_epoch()
      .count();
  if (!j_uri) {
    FOOTSTONE_DLOG(WARNING) << "HippyBridgeImpl runScriptFromUri, j_uri invalid";
    return false;
  }
  const string_view uri = JniUtils::ToStrView(j_env, j_uri);
  const string_view code_cache_dir =
      JniUtils::ToStrView(j_env, j_code_cache_dir);
  auto pos = StringViewUtils::FindLastOf(uri, EXTEND_LITERAL('/'));
  size_t len = StringViewUtils::GetLength(uri);
  string_view script_name = StringViewUtils::SubStr(uri, pos + 1, len);
  string_view base_path = StringViewUtils::SubStr(uri, 0, pos + 1);
  FOOTSTONE_DLOG(INFO) << "runScriptFromUri uri = " << uri
                       << ", script_name = " << script_name
                       << ", base_path = " << base_path
                       << ", code_cache_dir = " << code_cache_dir;

  auto runner = runtime->GetEngine()->GetJsTaskRunner();
  auto ctx = runtime->GetScope()->GetContext();
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
  FOOTSTONE_CHECK(runtime->HasData(kBridgeSlot));
  auto bridge = std::any_cast<std::shared_ptr<Bridge>>(runtime->GetData(kBridgeSlot));
  auto ref = bridge->GetRef();
  runtime->GetScope()->SetUriLoader(loader);
  if (j_aasset_manager) {
    auto asset_handler = std::make_shared<hippy::AssetHandler>();
    asset_handler->SetWorkerTaskRunner(runtime->GetEngine()->GetWorkerTaskRunner());
    loader->RegisterUriHandler(kAssetSchema, asset_handler);
  }
#ifdef ENABLE_INSPECTOR
  auto devtools_data_source = runtime->GetDevtoolsDataSource();
  if (devtools_data_source) {
    auto network_notification = devtools_data_source->GetNotificationCenter()->network_notification;
    auto devtools_handler = std::make_shared<hippy::devtools::DevtoolsHandler>();
    devtools_handler->SetNetworkNotification(network_notification);
    loader->RegisterUriInterceptor(devtools_handler);
  }
#endif
  auto save_object = std::make_shared<JavaRef>(j_env, j_cb);
  auto is_local_file = j_aasset_manager != nullptr;
  auto func = [runtime, save_object_ = std::move(save_object), script_name,
      j_can_use_code_cache, code_cache_dir, uri, is_local_file,
      time_begin] {
    FOOTSTONE_DLOG(INFO) << "runScriptFromUri enter";
    bool flag = V8BridgeUtils::RunScript(runtime, script_name, j_can_use_code_cache,
                                         code_cache_dir, uri, is_local_file);
    auto time_end = std::chrono::time_point_cast<std::chrono::microseconds>(
        std::chrono::system_clock::now())
        .time_since_epoch()
        .count();

    FOOTSTONE_DLOG(INFO) << "runScriptFromUri time = " << (time_end - time_begin) << ", uri = " << uri;
    if (flag) {
      hippy::bridge::CallJavaMethod(save_object_->GetObj(), INIT_CB_STATE::SUCCESS);
    } else {
      JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
      jstring j_msg = JniUtils::StrViewToJString(j_env, u"run script error");
      CallJavaMethod(save_object_->GetObj(), INIT_CB_STATE::RUN_SCRIPT_ERROR, j_msg);
      j_env->DeleteLocalRef(j_msg);
    }
    return flag;
  };

  runner->PostTask(std::move(func));

  return true;
}

void SetRootNode(JNIEnv* j_env,
                 __unused jobject j_obj,
                 jint j_runtime_id,
                 jint j_root_id) {
  auto runtime_id = footstone::check::checked_numeric_cast<jlong, int32_t>(j_runtime_id);
  auto runtime = Runtime::Find(runtime_id);
  FOOTSTONE_CHECK(runtime);
  auto root_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_root_id);
  std::shared_ptr<RootNode> root_node;
  auto& persistent_map = RootNode::PersistentMap();
  auto flag = persistent_map.Find(root_id, root_node);
  FOOTSTONE_CHECK(flag);
  runtime->GetScope()->SetRootNode(root_node);
}

void SetDomManager(JNIEnv* j_env,
                   __unused jobject j_obj,
                   jint j_runtime_id,
                   jint j_dom_manager_id) {
  auto runtime_id = footstone::check::checked_numeric_cast<jlong, int32_t>(j_runtime_id);
  auto runtime = Runtime::Find(runtime_id);
  FOOTSTONE_CHECK(runtime);

  auto dom_manager_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_dom_manager_id);
  std::any dom_manager;
  auto flag = hippy::global_data_holder.Find(dom_manager_id, dom_manager);
  FOOTSTONE_CHECK(flag);
  auto dom_manager_object = std::any_cast<std::shared_ptr<DomManager>>(dom_manager);
  runtime->GetScope()->SetDomManager(dom_manager_object);
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
