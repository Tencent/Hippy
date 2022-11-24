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

#include <sys/stat.h>

#include <any>
#include <future>
#include <memory>
#include <mutex>
#include <string>
#include <unordered_map>

#include "bridge/bridge.h"
#include "bridge/entry.h"
#include "bridge/java2js.h"
#include "bridge/js2java.h"
#include "driver/runtime/v8/runtime.h"
#include "driver/runtime/v8/v8_bridge_utils.h"
#include "dom/animation/animation_manager.h"
#include "dom/dom_manager.h"
#include "dom/node_props.h"
#include "dom/dom_manager.h"
#include "footstone/persistent_object_map.h"
#include "footstone/deserializer.h"
#include "footstone/hippy_value.h"
#include "footstone/string_view_utils.h"
#include "footstone/worker_manager.h"
#include "jni/data_holder.h"
#include "jni/exception_handler.h"
#include "jni/java_turbo_module.h"
#include "jni/jni_env.h"
#include "jni/jni_register.h"
#include "jni/jni_utils.h"
#include "jni/turbo_module_manager.h"
#include "vfs/handler/asset_handler.h"
#include "vfs/handler/file_handler.h"
#include "vfs/handler/jni_delegate_handler.h"
#include "vfs/uri_loader.h"
#include "vfs/uri.h"
#include "vfs/vfs_resource_holder.h"

#ifdef ANDROID_NATIVE_RENDER
#include "render/native_render_manager.h"
#include "render/native_render_jni.h"
#endif
#ifdef ENABLE_TDF_RENDER
#include "render/tdf_render_bridge.h"
#include "renderer/tdf/tdf_render_manager.h"
#endif
#ifdef ENABLE_INSPECTOR
#include "devtools/vfs/devtools_handler.h"
#include "devtools/devtools_macro.h"
#endif

namespace hippy {
inline namespace framework {
inline namespace bridge {

REGISTER_STATIC_JNI("com/tencent/mtt/hippy/HippyEngine", // NOLINT(cert-err58-cpp)
                    "setNativeLogHandler",
                    "(Lcom/tencent/mtt/hippy/adapter/HippyLogAdapter;)V",
                    setNativeLogHandler)

REGISTER_JNI("com/tencent/link_supplier/Linker", // NOLINT(cert-err58-cpp)
             "createWorkerManager",
             "()I",
             CreateWorkerManager)

REGISTER_JNI("com/tencent/link_supplier/Linker", // NOLINT(cert-err58-cpp)
             "destroyWorkerManager",
             "(I)V",
             DestroyWorkerManager)

REGISTER_JNI("com/tencent/mtt/hippy/bridge/HippyBridgeImpl", // NOLINT(cert-err58-cpp)
             "initJSFramework",
             "([BZZZLcom/tencent/mtt/hippy/bridge/NativeCallback;"
             "JIILcom/tencent/mtt/hippy/HippyEngine$V8InitParams;I)J",
             InitInstance)

REGISTER_JNI("com/tencent/mtt/hippy/bridge/HippyBridgeImpl", // NOLINT(cert-err58-cpp)
             "runScriptFromUri",
             "(Ljava/lang/String;Landroid/content/res/AssetManager;ZLjava/lang/"
             "String;JILcom/tencent/mtt/hippy/bridge/NativeCallback;)Z",
             RunScriptFromUri)

REGISTER_JNI("com/tencent/mtt/hippy/bridge/HippyBridgeImpl", // NOLINT(cert-err58-cpp)
             "destroy",
             "(JZZLcom/tencent/mtt/hippy/bridge/NativeCallback;)V",
             DestroyInstance)

REGISTER_JNI("com/tencent/link_supplier/Linker", // NOLINT(cert-err58-cpp)
             "doBind",
             "(III)V",
             DoBind)

REGISTER_JNI("com/tencent/link_supplier/Linker", // NOLINT(cert-err58-cpp)
             "addRoot",
             "(II)V",
             AddRoot)

REGISTER_JNI("com/tencent/link_supplier/Linker", // NOLINT(cert-err58-cpp)
             "removeRoot",
             "(II)V",
             RemoveRoot)

REGISTER_JNI("com/tencent/link_supplier/Linker", // NOLINT(cert-err58-cpp)
             "doConnect",
             "(II)V",
             DoConnect)

REGISTER_JNI("com/tencent/link_supplier/Linker", // NOLINT(cert-err58-cpp)
             "createDomInstance",
             "(I)I",
             CreateDomInstance)

REGISTER_JNI("com/tencent/link_supplier/Linker", // NOLINT(cert-err58-cpp)
             "destroyDomInstance",
             "(II)V",
             DestroyDomInstance)

REGISTER_JNI("com/tencent/mtt/hippy/bridge/HippyBridgeImpl", // NOLINT(cert-err58-cpp)
                   "loadInstance",
                   "(J[BII)V",
                   LoadInstance)

REGISTER_JNI("com/tencent/mtt/hippy/bridge/HippyBridgeImpl", // NOLINT(cert-err58-cpp)
                  "destroyInstance",
                  "(J[BII)V",
                  UnloadInstance)

REGISTER_JNI("com/tencent/mtt/hippy/HippyEngineManagerImpl", // NOLINT(cert-err58-cpp)
             "onCreateVfs",
             "(Lcom/tencent/vfs/VfsManager;)I",
             OnCreateVfs)

REGISTER_JNI("com/tencent/mtt/hippy/HippyEngineManagerImpl", // NOLINT(cert-err58-cpp)
             "onDestroyVfs",
             "(I)V",
             OnDestroyVfs)

REGISTER_JNI("com/tencent/devtools/DevtoolsManager", // NOLINT(cert-err58-cpp)
             "onCreateDevtools",
             "(ILjava/lang/String;Ljava/lang/String;)I",
             OnCreateDevtools)

REGISTER_JNI("com/tencent/devtools/DevtoolsManager", // NOLINT(cert-err58-cpp)
             "onDestroyDevtools",
             "(IZ)V",
             OnDestroyDevtools)

using string_view = footstone::stringview::string_view;
using TaskRunner = footstone::runner::TaskRunner;
using Task = footstone::runner::Task;
using WorkerManager = footstone::WorkerManager;
using u8string = string_view::u8string;
using StringViewUtils = footstone::stringview::StringViewUtils;
using V8BridgeUtils = hippy::runtime::V8BridgeUtils;
using Ctx = hippy::napi::Ctx;
using Bridge = hippy::Bridge;
using V8VMInitParam = hippy::napi::V8VMInitParam;
using RegisterFunction = hippy::base::RegisterFunction;
using UriLoader = hippy::vfs::UriLoader;

static std::mutex log_mutex;
static bool is_initialized = false;

enum INIT_CB_STATE {
  DESTROY_ERROR = -2,
  RUN_SCRIPT_ERROR = -1,
  SUCCESS = 0,
};

constexpr char kHippyCurDirKey[] = "__HIPPYCURDIR__";
constexpr uint32_t kDefaultNumberOfThreads = 2;
constexpr char kDomRunnerName[] = "hippy_dom";
constexpr char kLogTag[] = "native";
constexpr char kAssetSchema[] = "asset";
constexpr char kFileSchema[] = "file";

static std::atomic<uint32_t> global_worker_manager_key{1};

footstone::utils::PersistentObjectMap<uint32_t, std::shared_ptr<footstone::WorkerManager>> worker_manager_map;

void DoBind(__unused JNIEnv* j_env,
            __unused jobject j_obj,
            jint j_dom_manager_id,
            jint j_render_id,
            jint j_framework_id) {
  std::shared_ptr<Runtime> runtime = Runtime::Find(static_cast<int32_t>(j_framework_id));
  auto dom_manager_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_dom_manager_id);
  std::shared_ptr<DomManager> dom_manager = DomManager::Find(dom_manager_id);

  auto scope = runtime->GetScope();
  // Temp Solution: DoBind should pass render type
  std::shared_ptr<RenderManager> render_manager = nullptr;

#ifdef ANDROID_NATIVE_RENDER
  auto& map = NativeRenderManager::PersistentMap();
  std::shared_ptr<NativeRenderManager> native_render_manager = nullptr;
  bool ret = map.Find(footstone::check::checked_numeric_cast<jint, uint32_t>(j_render_id), native_render_manager);
  if (ret) {
    render_manager = native_render_manager;
    native_render_manager->SetDomManager(dom_manager);
  }
#endif

#ifdef ENABLE_TDF_RENDER
  if (render_manager == nullptr) {
    auto& tdf_map = TDFRenderManager::PersistentMap();
    std::shared_ptr<TDFRenderManager> tdf_render_manager = nullptr;
    bool tdf_ret = tdf_map.Find(footstone::check::checked_numeric_cast<jint, uint32_t>(j_render_id), tdf_render_manager);
    if (tdf_ret) {
      render_manager = tdf_render_manager;
      tdf_render_manager->SetDomManager(dom_manager);
    }
  }
#endif
  scope->SetDomManager(dom_manager);
  scope->SetRenderManager(render_manager);
  dom_manager->SetRenderManager(render_manager);

#ifdef ENABLE_TDF_RENDER
  TDFRenderBridge::RegisterScopeForUriLoader(static_cast<uint32_t>(j_render_id), scope);
#endif

#ifdef ENABLE_INSPECTOR
  auto devtools_data_source = scope->GetDevtoolsDataSource();
  if (devtools_data_source) {
    devtools_data_source->Bind(j_framework_id, dom_manager_id, j_render_id);
  }
#endif
}

void AddRoot(__unused JNIEnv* j_env,
             __unused jobject j_obj,
             jint j_dom_manager_id,
             jint j_root_id) {
  auto dom_manager_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_dom_manager_id);
  std::shared_ptr<DomManager> dom_manager = DomManager::Find(dom_manager_id);
  uint32_t root_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_root_id);
  auto root_node = std::make_shared<hippy::RootNode>(root_id);
  root_node->SetDomManager(dom_manager);
  auto& persistent_map = RootNode::PersistentMap();
  persistent_map.Insert(root_id, root_node);
}

void RemoveRoot(__unused JNIEnv* j_env,
                __unused jobject j_obj,
                __unused jint j_dom_id,
                jint j_root_id) {
  uint32_t root_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_root_id);
  auto& persistent_map = RootNode::PersistentMap();
  persistent_map.Erase(root_id);
}

void DoConnect(__unused JNIEnv* j_env,
               __unused jobject j_obj,
               jint j_runtime_id,
               jint j_root_id) {
  std::shared_ptr<Runtime> runtime = Runtime::Find(static_cast<int32_t>(j_runtime_id));
  if (runtime == nullptr) {
    FOOTSTONE_DLOG(WARNING) << "DoConnect runtime is nullptr";
    return;
  }

  auto& root_map = RootNode::PersistentMap();
  std::shared_ptr<RootNode> root_node;
  uint32_t root_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_root_id);
  bool ret = root_map.Find(root_id, root_node);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "DoConnect root_node is nullptr";
    return;
  }

  auto scope = runtime->GetScope();
  scope->SetRootNode(root_node);
#ifdef ENABLE_INSPECTOR
  auto devtools_data_source = scope->GetDevtoolsDataSource();
  if (devtools_data_source) {
    devtools_data_source->SetRootNode(root_node);
  }
#endif

  auto render_manager = scope->GetRenderManager().lock();
  if (render_manager) {
    float density = render_manager->GetDensity();
    auto layout_node = root_node->GetLayoutNode();
    layout_node->SetScaleFactor(density);
  }
}

jint CreateWorkerManager(__unused JNIEnv* j_env, __unused jobject j_obj) {
  auto worker_manager = std::make_shared<footstone::WorkerManager>(kDefaultNumberOfThreads);
  auto id = global_worker_manager_key.fetch_add(1);
  worker_manager_map.Insert(id, worker_manager);
  return footstone::check::checked_numeric_cast<uint32_t, jint>(id);
}

void DestroyWorkerManager(__unused JNIEnv* j_env, __unused jobject j_obj, jint j_worker_manager_id) {
  std::shared_ptr<WorkerManager> worker_manager;
  auto id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_worker_manager_id);
  auto flag = worker_manager_map.Find(id, worker_manager);
  if (flag && worker_manager) {
    worker_manager->Terminate();
    worker_manager_map.Erase(id);
  }
}

jint CreateDomInstance(__unused JNIEnv* j_env, __unused jobject j_obj, jint j_worker_manager_id) {
  auto dom_manager = std::make_shared<DomManager>();
  DomManager::Insert(dom_manager);
  std::shared_ptr<WorkerManager> worker_manager;
  auto flag = worker_manager_map.Find(static_cast<uint32_t>(j_worker_manager_id), worker_manager);
  FOOTSTONE_DCHECK(flag);
  auto runner = worker_manager->CreateTaskRunner(kDomRunnerName);
  dom_manager->SetTaskRunner(runner);
  return footstone::checked_numeric_cast<uint32_t, jint>(dom_manager->GetId());
}

void DestroyDomInstance(__unused JNIEnv* j_env, __unused jobject j_obj, __unused jint j_worker_manager_id, jint j_dom_id) {
  auto id = footstone::checked_numeric_cast<jint, uint32_t>(j_dom_id);
  auto dom_manager = DomManager::Find(id);
  if (dom_manager) {
    DomManager::Erase(id);
  }
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
    if (!is_initialized) {
      footstone::log::LogMessage::InitializeDelegate([logger, j_method](
          const std::ostringstream& stream,
          footstone::log::LogSeverity severity) {
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
      is_initialized = true;
    }
  }
}

jboolean RunScriptFromUri(JNIEnv* j_env,
                          __unused jobject j_obj,
                          jstring j_uri,
                          jobject j_aasset_manager,
                          jboolean j_can_use_code_cache,
                          jstring j_code_cache_dir,
                          jlong j_runtime_id,
                          jint j_vfs_id,
                          jobject j_cb) {
  FOOTSTONE_DLOG(INFO) << "runScriptFromUri begin, j_runtime_id = "
                      << j_runtime_id;
  std::shared_ptr<Runtime> runtime = Runtime::Find(
      footstone::check::checked_numeric_cast<jlong, int32_t>(j_runtime_id));
  if (!runtime) {
    FOOTSTONE_DLOG(WARNING)
    << "HippyBridgeImpl runScriptFromUri, j_runtime_id invalid";
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
  std::shared_ptr<Ctx> ctx = runtime->GetScope()->GetContext();
  runner->PostTask([ctx, base_path] {
    ctx->SetGlobalStrVar(kHippyCurDirKey, base_path);
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
    asset_handler->SetAAssetManager(j_env, j_aasset_manager);
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

jlong InitInstance(JNIEnv* j_env,
                   jobject j_object,
                   jbyteArray j_global_config,
                   jboolean j_single_thread_mode,
                   jboolean j_enable_v8_serialization,
                   jboolean j_is_dev_module,
                   jobject j_callback,
                   jlong j_group_id,
                   jint j_worker_manager_id,
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
    hippy::bridge::CallJavaMethod(save_object_->GetObj(),INIT_CB_STATE::SUCCESS);
  };
  auto call_native_cb = [](void* p) {
    auto* data = reinterpret_cast<hippy::napi::CBDataTuple*>(p);
    hippy::bridge::CallNative(data);
  };
  V8BridgeUtils::SetOnThrowExceptionToJS([](const std::shared_ptr<Runtime>& runtime,
                                    const string_view& desc,
                                    const string_view& stack) {
    ExceptionHandler::ReportJsException(runtime, desc, stack);
  });
  std::shared_ptr<WorkerManager> worker_manager;
  auto flag = worker_manager_map.Find(static_cast<uint32_t>(j_worker_manager_id), worker_manager);
  FOOTSTONE_DCHECK(flag);
  auto dom_manager_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_dom_manager_id);
  auto dom_manager = DomManager::Find(dom_manager_id);
  FOOTSTONE_DCHECK(dom_manager);
  auto dom_task_runner = dom_manager->GetTaskRunner();
  auto runtime_id = V8BridgeUtils::InitInstance(
      static_cast<bool>(j_enable_v8_serialization),
      static_cast<bool>(j_is_dev_module),
      global_config,
      static_cast<int64_t>(j_group_id),
      worker_manager,
      dom_task_runner,
      param,
      std::make_shared<Bridge>(j_env, j_object),
      scope_cb,
      call_native_cb,
      static_cast<uint32_t>(j_devtools_id));
  return static_cast<jlong>(runtime_id);
}

void DestroyInstance(__unused JNIEnv* j_env,
                     __unused jobject j_object,
                     jlong j_runtime_id,
                     __unused jboolean j_single_thread_mode,
                     jboolean j_is_reload,
                     jobject j_callback) {
  auto cb = std::make_shared<JavaRef>(j_env, j_callback);
  V8BridgeUtils::DestroyInstance(footstone::check::checked_numeric_cast<jlong, int32_t>(j_runtime_id),
                                 [cb](bool ret) {
                                   if (ret) {
                                     hippy::bridge::CallJavaMethod(cb->GetObj(), INIT_CB_STATE::SUCCESS);
                                   } else {
                                     hippy::bridge::CallJavaMethod(cb->GetObj(), INIT_CB_STATE::DESTROY_ERROR);
                                   }
                                 }, static_cast<bool>(j_is_reload));
}

void LoadInstance(JNIEnv* j_env,
                  __unused jobject j_obj,
                  jlong j_runtime_id,
                  jbyteArray j_byte_array,
                  jint j_offset,
                  jint j_length) {
  auto buffer_data = JniUtils::AppendJavaByteArrayToBytes(j_env, j_byte_array, j_offset, j_length);
  V8BridgeUtils::LoadInstance(footstone::check::checked_numeric_cast<jlong, int32_t>(j_runtime_id),
      std::move(buffer_data));
}

void UnloadInstance(JNIEnv* j_env,
                     __unused jobject j_obj,
                     jlong j_runtime_id,
                     jbyteArray j_byte_array,
                     jint j_offset,
                     jint j_length) {
  auto buffer_data = JniUtils::AppendJavaByteArrayToBytes(j_env, j_byte_array, j_offset, j_length);
  V8BridgeUtils::UnloadInstance(footstone::check::checked_numeric_cast<jlong, int32_t>(j_runtime_id),
                              std::move(buffer_data));
}

jint OnCreateVfs(JNIEnv* j_env, __unused jobject j_object, jobject j_vfs_manager) {
  auto delegate = std::make_shared<JniDelegateHandler>(j_env, j_vfs_manager);
  auto id = hippy::global_data_holder_key.fetch_add(1);
  auto loader = std::make_shared<UriLoader>();
  auto file_delegate = std::make_shared<FileHandler>();
  loader->RegisterUriHandler(kFileSchema, file_delegate);
  loader->PushDefaultHandler(delegate);

  hippy::global_data_holder.Insert(id, loader);
  return footstone::checked_numeric_cast<uint32_t, jint>(id);
}

void OnDestroyVfs(__unused JNIEnv* j_env, __unused jobject j_object, jint j_id) {
  auto id = footstone::checked_numeric_cast<jint, uint32_t>(j_id);
  bool flag = hippy::global_data_holder.Erase(id);
  FOOTSTONE_DCHECK(flag);
}

jint OnCreateDevtools(JNIEnv *j_env,
                      __unused jobject j_object,
                      jint j_worker_manager_id,
                      jstring j_data_dir,
                      jstring j_ws_url) {
  uint32_t id = 0;
#ifdef ENABLE_INSPECTOR
  const string_view data_dir = JniUtils::ToStrView(j_env, j_data_dir);
  const string_view ws_url = JniUtils::ToStrView(j_env, j_ws_url);
  std::shared_ptr<WorkerManager> worker_manager;
  auto flag = worker_manager_map.Find(static_cast<uint32_t>(j_worker_manager_id), worker_manager);
  FOOTSTONE_DCHECK(flag);
  DEVTOOLS_INIT_VM_TRACING_CACHE(StringViewUtils::ToStdString(StringViewUtils::ConvertEncoding(
      data_dir, string_view::Encoding::Utf8).utf8_value()));
  auto devtools_data_source = std::make_shared<hippy::devtools::HippyDevtoolsSource>(
      StringViewUtils::ToStdString(StringViewUtils::ConvertEncoding(
          ws_url, string_view::Encoding::Utf8).utf8_value()),
      worker_manager);
  id = devtools::HippyDevtoolsSource::Insert(devtools_data_source);
  JNIEnvironment::ClearJEnvException(j_env);
  FOOTSTONE_DLOG(INFO) << "OnCreateDevtools id=" << id;
#endif
  return footstone::checked_numeric_cast<uint32_t, jint>(id);
}

void OnDestroyDevtools(JNIEnv *j_env,
                       __unused jobject j_object,
                       jint j_devtools_id,
                       jboolean j_is_reload) {
#ifdef ENABLE_INSPECTOR
  auto devtools_id = static_cast<uint32_t>(j_devtools_id);
  auto devtools_data_source = devtools::HippyDevtoolsSource::Find(devtools_id);
  devtools_data_source->Destroy(static_cast<bool>(j_is_reload));
  bool flag = devtools::HippyDevtoolsSource::Erase(devtools_id);
  FOOTSTONE_DLOG(INFO)<< "OnDestroyDevtools devtools_id=" << devtools_id << ",flag=" << flag;
  FOOTSTONE_DCHECK(flag);
  JNIEnvironment::ClearJEnvException(j_env);
#endif
}

} // namespace bridge
} // namespace framework
} // namespace hippy

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

  bool ret = hippy::JNIRegister::RegisterMethods(j_env);
  if (!ret) {
    return onLoad_err;
  }

  hippy::JNIEnvironment::GetInstance()->init(j_vm, j_env);

  hippy::ConvertUtils::Init();
  hippy::JavaTurboModule::Init();
  hippy::TurboModuleManager::Init();
  hippy::Uri::Init();
  hippy::JniDelegateHandler::Init(j_env);
  hippy::ResourceHolder::Init();

#ifdef ANDROID_NATIVE_RENDER
  hippy::NativeRenderJni::Init();
#endif

#ifdef ENABLE_TDF_RENDER
  TDFRenderBridge::Init(j_vm, reserved);
#endif

  return JNI_VERSION_1_4;
}

void JNI_OnUnload(__unused JavaVM* j_vm, __unused void* reserved) {
  hippy::napi::V8VM::PlatformDestroy();

#ifdef ANDROID_NATIVE_RENDER
  hippy::NativeRenderJni::Destroy();
#endif

#ifdef ENABLE_TDF_RENDER
  TDFRenderBridge::Destroy();
#endif

  hippy::JniDelegateHandler::Destroy();
  hippy::ResourceHolder::Destroy();
  hippy::Uri::Destroy();
  hippy::TurboModuleManager::Destroy();
  hippy::JavaTurboModule::Destroy();
  hippy::ConvertUtils::Destroy();

  hippy::JNIEnvironment::DestroyInstance();
}
