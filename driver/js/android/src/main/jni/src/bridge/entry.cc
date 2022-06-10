#include <__bit_reference>
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

#include <android/asset_manager.h>
#include <android/asset_manager_jni.h>
#include <sys/stat.h>

#include <future>
#include <memory>
#include <mutex>
#include <string>
#include <unordered_map>

#include "bridge/bridge.h"
#include "bridge/entry.h"
#include "bridge/java2js.h"
#include "bridge/js2java.h"
#include "core/base/string_view_utils.h"
#include "core/runtime/v8/runtime.h"
#include "core/runtime/v8/v8_bridge_utils.h"
#include "dom/animation/animation_manager.h"
#include "dom/dom_manager.h"
#include "dom/node_props.h"
#include "dom/deserializer.h"
#include "dom/dom_manager.h"
#include "dom/dom_value.h"
#include "jni/exception_handler.h"
#include "jni/java_turbo_module.h"
#include "jni/jni_env.h"
#include "jni/jni_register.h"
#include "jni/turbo_module_manager.h"
#include "jni/uri.h"
#include "jni/jni_utils.h"
#include "loader/adr_loader.h"
#include "render/native_render_manager.h"
#include "render/native_render_jni.h"

namespace hippy::bridge {

REGISTER_STATIC_JNI("com/tencent/mtt/hippy/HippyEngine", // NOLINT(cert-err58-cpp)
                    "initNativeLogHandler",
                    "(Lcom/tencent/mtt/hippy/IHippyNativeLogHandler;)V",
                    InitNativeLogHandler)

REGISTER_JNI("com/tencent/mtt/hippy/bridge/HippyBridgeImpl", // NOLINT(cert-err58-cpp)
             "initJSFramework",
             "([BZZZLcom/tencent/mtt/hippy/bridge/NativeCallback;"
             "JLcom/tencent/mtt/hippy/HippyEngine$V8InitParams;Ljava/lang/String;Ljava/lang/String;)J",
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

REGISTER_JNI("com/tencent/link_supplier/Linker", // NOLINT(cert-err58-cpp)
             "doBind",
             "(III)V",
             DoBind)

REGISTER_JNI("com/tencent/link_supplier/Linker", // NOLINT(cert-err58-cpp)
             "updateAnimationNode",
             "(I[BII)V",
             UpdateAnimationNode)

REGISTER_JNI("com/tencent/link_supplier/Linker", // NOLINT(cert-err58-cpp)
             "createDomInstance",
             "(I)I",
             CreateDomInstance)

REGISTER_JNI("com/tencent/link_supplier/Linker", // NOLINT(cert-err58-cpp)
             "destroyDomInstance",
             "(I)V",
             DestroyDomInstance)

REGISTER_JNI("com/tencent/link_supplier/Linker", // NOLINT(cert-err58-cpp)
             "createAnimationManager",
             "(I)I",
             CreateAnimationManager)

REGISTER_JNI("com/tencent/link_supplier/Linker", // NOLINT(cert-err58-cpp)
             "destroyAnimationManager",
             "(I)V",
             DestroyAnimationManager)

REGISTER_JNI( // NOLINT(cert-err58-cpp)
    "com/tencent/mtt/hippy/bridge/HippyBridgeImpl",
    "loadInstance",
    "(J[BII)V",
    LoadInstance)

using unicode_string_view = tdf::base::unicode_string_view;
using u8string = unicode_string_view::u8string;
using StringViewUtils = hippy::base::StringViewUtils;
using V8BridgeUtils = hippy::runtime::V8BridgeUtils;
using Ctx = hippy::napi::Ctx;
using ADRBridge = hippy::ADRBridge;
using V8VMInitParam = hippy::napi::V8VMInitParam;
using RegisterFunction = hippy::base::RegisterFunction;

static std::mutex log_mutex;
static bool is_initialized = false;

enum INIT_CB_STATE {
  DESTROY_ERROR = -2,
  RUN_SCRIPT_ERROR = -1,
  SUCCESS = 0,
};

constexpr char kHippyCurDirKey[] = "__HIPPYCURDIR__";

void DoBind(JNIEnv* j_env,
            __unused jobject j_obj,
            jint j_dom_id,
            jint j_render_id,
            jint j_framework_id) {
  std::shared_ptr<Runtime> runtime = Runtime::Find(static_cast<int32_t>(j_framework_id));
  std::shared_ptr<DomManager> dom_manager = DomManager::Find(static_cast<int32_t>(j_dom_id));
  std::shared_ptr<NativeRenderManager>
      render_manager = NativeRenderManager::Find(static_cast<int32_t>(j_render_id));

  float density = render_manager->GetDensity();
  uint32_t root_id = dom_manager->GetRootId();
  auto node = dom_manager->GetNode(root_id);
  auto layout_node = node->GetLayoutNode();
  layout_node->SetScaleFactor(density);

  auto scope = runtime->GetScope();
  scope->SetDomManager(dom_manager);
  scope->SetRenderManager(render_manager);
  dom_manager->SetRenderManager(render_manager);
  dom_manager->SetDelegateTaskRunner(scope->GetTaskRunner());
  render_manager->SetDomManager(dom_manager);

#ifdef ENABLE_INSPECTOR
  scope->GetDevtoolsDataSource()->Bind(j_framework_id, j_dom_id, j_render_id);
#endif
}

jint CreateDomInstance(JNIEnv* j_env, __unused jobject j_obj, jint j_root_id) {
  TDF_BASE_DCHECK(j_root_id <= std::numeric_limits<std::int32_t>::max());
  auto dom_manager = std::make_shared<DomManager>();
  dom_manager->Init(static_cast<uint32_t>(j_root_id));
  std::weak_ptr<DomManager> weak_dom_manager = dom_manager;
  dom_manager->PostTask(hippy::Scene({[weak_dom_manager]{
    auto dom_manager = weak_dom_manager.lock();
    if (!dom_manager) {
      return;
    }
    dom_manager->GetAnimationManager()->SetDomManager(weak_dom_manager);
  }}));
  DomManager::Insert(dom_manager);
  return dom_manager->GetId();
}

jint CreateAnimationManager(JNIEnv* j_env,
                            __unused jobject j_obj,
                            jint j_dom_id) {
  return 0;
}

void DestroyDomInstance(JNIEnv* j_env, __unused jobject j_obj, jint j_dom_id) {
  auto dom_manager = DomManager::Find(j_dom_id);
  if (dom_manager) {
    dom_manager->TerminateTaskRunner();
    DomManager::Erase(static_cast<int32_t>(j_dom_id));
  }
}

void DestroyAnimationManager(JNIEnv* j_env,
                             __unused jobject j_obj,
                             jint j_ani_id) {
}

void InitNativeLogHandler(JNIEnv* j_env, __unused jobject j_object, jobject j_logger) {
  if (!j_logger) {
    return;
  }

  jclass j_cls = j_env->GetObjectClass(j_logger);
  if (!j_cls) {
    return;
  }

  jmethodID j_method =
      j_env->GetMethodID(j_cls, "onReceiveNativeLogMessage", "(Ljava/lang/String;)V");
  if (!j_method) {
    return;
  }
  std::shared_ptr<JavaRef> logger = std::make_shared<JavaRef>(j_env, j_logger);
  {
    std::lock_guard<std::mutex> lock(log_mutex);
    if (!is_initialized) {
      tdf::base::LogMessage::InitializeDelegate([logger, j_method](
          const std::ostringstream& stream,
          tdf::base::LogSeverity severity) {
        std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
        JNIEnv* j_env = instance->AttachCurrentThread();

        std::string str = stream.str();
        jstring j_logger_str = j_env->NewStringUTF((str.c_str()));
        j_env->CallVoidMethod(logger->GetObj(), j_method, j_logger_str);
        JNIEnvironment::ClearJEnvException(j_env);
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
                          jobject j_cb) {
  TDF_BASE_DLOG(INFO) << "runScriptFromUri begin, j_runtime_id = "
                      << j_runtime_id;
  std::shared_ptr<Runtime> runtime = Runtime::Find(
      hippy::base::checked_numeric_cast<jlong, int32_t>(j_runtime_id));
  if (!runtime) {
    TDF_BASE_DLOG(WARNING)
    << "HippyBridgeImpl runScriptFromUri, j_runtime_id invalid";
    return false;
  }

  auto time_begin = std::chrono::time_point_cast<std::chrono::microseconds>(
      std::chrono::system_clock::now())
      .time_since_epoch()
      .count();
  if (!j_uri) {
    TDF_BASE_DLOG(WARNING) << "HippyBridgeImpl runScriptFromUri, j_uri invalid";
    return false;
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
    ctx->SetGlobalStrVar(kHippyCurDirKey, base_path);
  };
  runner->PostTask(task);

  std::shared_ptr<ADRLoader> loader = std::make_shared<ADRLoader>();
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
    bool flag = V8BridgeUtils::RunScript(runtime, script_name, j_can_use_code_cache,
                                         code_cache_dir, uri, aasset_manager != nullptr);
    auto time_end = std::chrono::time_point_cast<std::chrono::microseconds>(
        std::chrono::system_clock::now())
        .time_since_epoch()
        .count();

    TDF_BASE_DLOG(INFO) << "runScriptFromUri = " << (time_end - time_begin) << ", uri = " << uri;
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

  runner->PostTask(task);

  return true;
}

void UpdateAnimationNode(JNIEnv* j_env,
                         __unused jobject j_obj,
                         jint j_ani_manager_id,
                         jbyteArray j_params,
                         jint j_offset,
                         jint j_length) {
}

jlong InitInstance(JNIEnv* j_env,
                   jobject j_object,
                   jbyteArray j_global_config,
                   jboolean j_single_thread_mode,
                   jboolean j_enable_v8_serialization,
                   jboolean j_is_dev_module,
                   jobject j_callback,
                   jlong j_group_id,
                   jobject j_vm_init_param,
                   jstring j_data_dir,
                   jstring j_ws_url) {
  TDF_BASE_LOG(INFO) << "InitInstance begin, j_single_thread_mode = "
                     << static_cast<uint32_t>(j_single_thread_mode)
                     << ", j_bridge_param_json = "
                     << static_cast<uint32_t>(j_enable_v8_serialization)
                     << ", j_is_dev_module = "
                     << static_cast<uint32_t>(j_is_dev_module)
                     << ", j_group_id = " << j_group_id;
  unicode_string_view global_config = JniUtils::JByteArrayToStrView(j_env, j_global_config);
  std::shared_ptr<JavaRef> save_object = std::make_shared<JavaRef>(j_env, j_callback);

  std::shared_ptr<V8VMInitParam> param = std::make_shared<V8VMInitParam>();
  if (j_vm_init_param) {
    jclass cls = j_env->GetObjectClass(j_vm_init_param);
    jfieldID init_field = j_env->GetFieldID(cls, "initialHeapSize", "J");
    jlong initial_heap_size_in_bytes = j_env->GetLongField(j_vm_init_param, init_field);
    param->initial_heap_size_in_bytes = hippy::base::checked_numeric_cast<jlong, size_t>(
        initial_heap_size_in_bytes);
    jfieldID max_field = j_env->GetFieldID(cls, "maximumHeapSize", "J");
    jlong maximum_heap_size_in_bytes = j_env->GetLongField(j_vm_init_param, max_field);
    param->maximum_heap_size_in_bytes = hippy::base::checked_numeric_cast<jlong, size_t>(
        maximum_heap_size_in_bytes);
    TDF_BASE_CHECK(initial_heap_size_in_bytes <= maximum_heap_size_in_bytes);
  }
  RegisterFunction scope_cb = [save_object_ = std::move(save_object)](void*) {
    TDF_BASE_LOG(INFO) << "run scope cb";
    hippy::bridge::CallJavaMethod(save_object_->GetObj(),INIT_CB_STATE::SUCCESS);
  };
  auto call_native_cb = [](void* p) {
    auto* data = reinterpret_cast<hippy::napi::CBDataTuple*>(p);
    hippy::bridge::CallNative(data);
  };
  V8BridgeUtils::SetOnThrowExceptionToJS([](const std::shared_ptr<Runtime>& runtime,
                                    const unicode_string_view& desc,
                                    const unicode_string_view& stack) {
    ExceptionHandler::ReportJsException(runtime, desc, stack);
  });
  std::shared_ptr<ADRBridge> bridge = std::make_shared<ADRBridge>(j_env, j_object);
  const unicode_string_view data_dir = JniUtils::ToStrView(j_env, j_data_dir);
  const unicode_string_view ws_url = JniUtils::ToStrView(j_env, j_ws_url);
  auto runtime_id = V8BridgeUtils::InitInstance(
      static_cast<bool>(j_enable_v8_serialization),
      static_cast<bool>(j_is_dev_module),
      global_config,
      static_cast<int64_t>(j_group_id),
      param,
      bridge,
      scope_cb,
      call_native_cb,
      data_dir,
      ws_url);
  return static_cast<jlong>(runtime_id);
}

void DestroyInstance(__unused JNIEnv* j_env,
                     __unused jobject j_object,
                     jlong j_runtime_id,
                     __unused jboolean j_single_thread_mode,
                     jboolean j_is_reload,
                     jobject j_callback) {
  auto ret = V8BridgeUtils::DestroyInstance(
      hippy::base::checked_numeric_cast<jlong, int32_t>(j_runtime_id), nullptr, static_cast<bool>(j_is_reload));
  if (ret) {
    hippy::bridge::CallJavaMethod(j_callback, INIT_CB_STATE::SUCCESS);
  } else {
    hippy::bridge::CallJavaMethod(j_callback, INIT_CB_STATE::DESTROY_ERROR);
  }
}

void LoadInstance(JNIEnv* j_env,
                  jobject j_obj,
                  jlong j_runtime_id,
                  jbyteArray j_byte_array,
                  jint j_offset,
                  jint j_length) {
  auto buffer_data = JniUtils::AppendJavaByteArrayToBytes(j_env, j_byte_array, j_offset, j_length);
  V8BridgeUtils::LoadInstance(hippy::base::checked_numeric_cast<jlong, int32_t>(j_runtime_id),
      std::move(buffer_data));
}

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
  NativeRenderJni::Init();

  return JNI_VERSION_1_4;
}

void JNI_OnUnload(__unused JavaVM* j_vm, __unused void* reserved) {
  hippy::napi::V8VM::PlatformDestroy();

  Uri::Destroy();
  JavaTurboModule::Destroy();
  ConvertUtils::Destroy();
  TurboModuleManager::Destroy();
  NativeRenderJni::Destroy();

  JNIEnvironment::DestroyInstance();
}
