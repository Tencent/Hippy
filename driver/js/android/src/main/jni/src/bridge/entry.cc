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
#include "core/runtime/v8/runtime.h"
#include "core/base/string_view_utils.h"
#include "core/core.h"
#include "dom/dom_manager.h"
#include "dom/node_props.h"
#include "dom/animation_manager.h"
#include "dom/deserializer.h"
#include "dom/dom_value.h"
#include "render/hippy_render_manager.h"
#include "core/runtime/v8/v8_bridge_utils.h"
#include "jni/turbo_module_manager.h"
#include "jni/exception_handler.h"
#include "jni/java_turbo_module.h"
#include "jni/jni_env.h"
#include "jni/jni_register.h"
#include "jni/uri.h"
#include "jni/jni_utils.h"
#include "loader/adr_loader.h"
#include "bridge/bridge.h"
#include "render/native_render_manager.h"
#ifdef ENABLE_TDF_RENDER
#include "render/tdf_render_bridge.h"
#endif

namespace hippy::bridge {

REGISTER_STATIC_JNI("com/tencent/mtt/hippy/HippyEngine", // NOLINT(cert-err58-cpp)
                    "initNativeLogHandler",
                    "(Lcom/tencent/mtt/hippy/IHippyNativeLogHandler;)V",
                    InitNativeLogHandler)

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

using unicode_string_view = tdf::base::unicode_string_view;
using u8string = unicode_string_view::u8string;
using StringViewUtils = hippy::base::StringViewUtils;
using V8BridgeUtils = hippy::runtime::V8BridgeUtils;
using Ctx = hippy::napi::Ctx;
using ADRBridge = hippy::ADRBridge;
using V8VMInitParam = hippy::napi::V8VMInitParam;
using RegisterFunction = hippy::base::RegisterFunction;

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
  auto render_manager = ExtendRenderManager::Find(static_cast<int32_t>(j_render_id));

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
}

jint CreateDomInstance(JNIEnv* j_env, __unused jobject j_obj, jint j_root_id) {
  TDF_BASE_DCHECK(j_root_id <= std::numeric_limits<std::int32_t>::max());
  std::shared_ptr<DomManager> dom_manager =
      std::make_shared<DomManager>(static_cast<uint32_t>(j_root_id));
  dom_manager->StartTaskRunner();
  DomManager::Insert(dom_manager);
  return dom_manager->GetId();
}

jint CreateAnimationManager(JNIEnv* j_env,
                            __unused jobject j_obj,
                            jint j_dom_id) {
  TDF_BASE_DCHECK(j_dom_id <= std::numeric_limits<std::int32_t>::max());
  std::shared_ptr<DomManager> dom_manager = DomManager::Find(j_dom_id);
  std::shared_ptr<AnimationManager> ani_manager =
      std::make_shared<AnimationManager>(dom_manager);
  AnimationManager::Insert(ani_manager);
  dom_manager->AddInterceptor(ani_manager);
  return ani_manager->GetId();
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
  auto ani_manager = AnimationManager::Find(j_ani_id);
  if (ani_manager) {
    AnimationManager::Erase(static_cast<int32_t>(j_ani_id));
  }
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
  tdf::base::LogMessage::SetDelegate([logger, j_method](
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
  TDF_BASE_LOG(INFO) << "UpdateAnimationNode begin, j_dom_manager_id = "
                     << static_cast<uint32_t>(j_ani_manager_id)
                     << ", j_offset = " << static_cast<uint32_t>(j_offset)
                     << ", j_length = " << static_cast<uint32_t>(j_length);
  std::shared_ptr<AnimationManager> ani_manager =
      AnimationManager::Find(static_cast<int32_t>(j_ani_manager_id));

  tdf::base::DomValue params;
  if (j_params != nullptr && j_length > 0) {
    jbyte params_buffer[j_length];
    j_env->GetByteArrayRegion(j_params, j_offset, j_length, params_buffer);
    tdf::base::Deserializer deserializer(
        (const uint8_t*)params_buffer,
        hippy::base::checked_numeric_cast<jlong, size_t>(j_length));
    deserializer.ReadHeader();
    deserializer.ReadValue(params);
  }

  TDF_BASE_DCHECK(params.IsArray());
  tdf::base::DomValue::DomValueArrayType array = params.ToArrayChecked();
  std::unordered_map<
      int32_t,
      std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>>>
      node_style_map;
  std::vector<std::pair<uint32_t, std::shared_ptr<tdf::base::DomValue>>>
      ani_data;
  for (size_t i = 0; i < array.size(); i++) {
    TDF_BASE_DCHECK(array[i].IsObject());
    tdf::base::DomValue::DomValueObjectType node;
    if (array[i].ToObject(node)) {
      if (node[kAnimationId].IsInt32()) {
        int32_t animation_id;
        node[kAnimationId].ToInt32(animation_id);
        tdf::base::DomValue animation_value = node[kAnimationValue];
        ani_data.push_back(std::make_pair(
            static_cast<uint32_t>(animation_id),
            std::make_shared<tdf::base::DomValue>(animation_value)));
      }
    }
  }
  ani_manager->OnAnimationUpdate(ani_data);
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
  auto runtime_id = V8BridgeUtils::InitInstance(
      static_cast<bool>(j_enable_v8_serialization),
      static_cast<bool>(j_is_dev_module),
      global_config,
      static_cast<int64_t>(j_group_id),
      param,
      bridge,
      scope_cb,
      call_native_cb);
  return static_cast<jlong>(runtime_id);
}

void DestroyInstance(__unused JNIEnv* j_env,
                     __unused jobject j_object,
                     jlong j_runtime_id,
                     __unused jboolean j_single_thread_mode,
                     jobject j_callback) {
  auto ret = V8BridgeUtils::DestroyInstance(
      hippy::base::checked_numeric_cast<jlong, int32_t>(j_runtime_id), nullptr);
  if (ret) {
    hippy::bridge::CallJavaMethod(j_callback, INIT_CB_STATE::SUCCESS);
  } else {
    hippy::bridge::CallJavaMethod(j_callback, INIT_CB_STATE::DESTROY_ERROR);
  }
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
  NativeRenderManager::Init();
#ifdef ENABLE_TDF_RENDER
  TDFRenderBridge::Init();
#endif

  return JNI_VERSION_1_4;
}

void JNI_OnUnload(__unused JavaVM* j_vm, __unused void* reserved) {
  hippy::napi::V8VM::PlatformDestroy();

  Uri::Destroy();
  JavaTurboModule::Destroy();
  ConvertUtils::Destroy();
  TurboModuleManager::Destroy();
  NativeRenderManager::Destroy();
#ifdef ENABLE_TDF_RENDER
  TDFRenderBridge::Destroy();
#endif

  JNIEnvironment::DestroyInstance();
}
