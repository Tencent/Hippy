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

#include "renderer/native_render_jni.h"

#include "footstone/deserializer.h"
#include "footstone/hippy_value.h"
#include "dom/render_manager.h"
#include "dom/root_node.h"
#include "dom/scene.h"
#include "jni/jni_register.h"
#include "jni/data_holder.h"
#include "jni/jni_invocation.h"
#include "jni/jni_env.h"
#include "renderer/native_render_manager.h"

#ifdef ENABLE_INSPECTOR
#include "devtools/devtools_utils.h"
#endif

using DomArgument = hippy::dom::DomArgument;
using DomEvent = hippy::dom::DomEvent;
using DomManager = hippy::dom::DomManager;
using HippyValue = footstone::value::HippyValue;
using NativeRenderManager = hippy::render::native::NativeRenderManager;
using RenderManager = hippy::dom::RenderManager;
using RootNode = hippy::dom::RootNode;
using Scene = hippy::dom::Scene;

namespace hippy {
inline namespace render {
inline namespace native {

static jclass j_render_manager_clazz;
static jmethodID j_render_manager_init_method_id;
static jmethodID j_render_manager_set_id_method_id;
static jmethodID j_render_manager_get_density_method_id;
static jmethodID j_render_manager_get_provider_method_id;
static jmethodID j_render_manager_get_style_for_render_id;

REGISTER_JNI("com/tencent/renderer/NativeRenderProvider",
             "updateNodeSize",
             "(IIIFFZ)V",
             UpdateNodeSize)

REGISTER_JNI("com/tencent/renderer/NativeRenderProvider",
             "onReceivedEvent",
             "(IIILjava/lang/String;[BIIZZ)V",
             OnReceivedEvent)

REGISTER_JNI("com/tencent/renderer/NativeRenderProvider",
             "doCallBack",
             "(IILjava/lang/String;IIJ[BII)V",
             DoCallBack)

REGISTER_JNI("com/tencent/renderer/NativeRenderProvider",
             "updateRootSize",
             "(IIFF)V",
             UpdateRootSize)

REGISTER_JNI("com/tencent/renderer/NativeRenderProvider",
             "freshWindow",
             "(II)V",
             FreshWindow)

REGISTER_JNI("com/tencent/renderer/NativeRenderProvider",
             "markTextNodeDirty",
             "(I)V",
             MarkTextNodeDirty)

static jint JNI_OnLoad(__unused JavaVM* j_vm, __unused void* reserved) {
  auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();

  j_render_manager_clazz = reinterpret_cast<jclass>(j_env->NewGlobalRef(
      j_env->FindClass("com/tencent/renderer/NativeRenderer")));
  j_render_manager_init_method_id = j_env->GetMethodID(j_render_manager_clazz, "<init>", "()V");
  j_render_manager_set_id_method_id = j_env->GetMethodID(j_render_manager_clazz, "setId", "(I)V");
  j_render_manager_get_density_method_id = j_env->GetMethodID(j_render_manager_clazz, "getDensity", "()F");
  j_render_manager_get_provider_method_id = j_env->GetMethodID(j_render_manager_clazz,
                                                               "getRenderProvider",
                                                               "()Lcom/tencent/renderer/NativeRenderProvider;");
  j_render_manager_get_style_for_render_id = j_env->GetMethodID(j_render_manager_clazz,
                                                               "getPropsRegisterForRender",
                                                               "()[Ljava/lang/Object;");
  return JNI_VERSION_1_4;;
}

static void JNI_OnUnload(__unused JavaVM* j_vm, __unused void* reserved) {
  auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  j_env->DeleteGlobalRef(j_render_manager_clazz);
}

REGISTER_JNI_ONLOAD(JNI_OnLoad)
REGISTER_JNI_ONUNLOAD(JNI_OnUnload)

bool CreateJavaRenderManager(uint32_t id, std::shared_ptr<JavaRef>&j_render_manager,
                             std::shared_ptr<JavaRef>&render_delegate) {
  auto instance = JNIEnvironment::GetInstance();
  auto j_env = instance->AttachCurrentThread();
  auto j_manager = j_env->NewObject(j_render_manager_clazz,
                                    j_render_manager_init_method_id);
  j_render_manager = std::make_shared<JavaRef>(j_env, j_manager);
  j_env->CallVoidMethod(j_manager,
                        j_render_manager_set_id_method_id,
                        footstone::checked_numeric_cast<uint32_t, jint>(id));
  render_delegate = std::make_shared<JavaRef>(j_env,
                                              j_env->CallObjectMethod(j_manager,
                                                                      j_render_manager_get_provider_method_id));
  instance->ClearJEnvException(j_env);
  return true;
}

float GetDensity(std::shared_ptr<JavaRef>&j_render_manager) {
  auto instance = JNIEnvironment::GetInstance();
  auto j_env = instance->AttachCurrentThread();
  auto j_float = j_env->CallFloatMethod(j_render_manager->GetObj(), j_render_manager_get_density_method_id);
  instance->ClearJEnvException(j_env);
  return static_cast<float>(j_float);
}

void GetPropsRegisterForRender(const std::shared_ptr<JavaRef>& j_render_manager,
                               std::unordered_set<std::string>& style_set) {
  auto instance = JNIEnvironment::GetInstance();
  auto j_env = instance->AttachCurrentThread();
  jobjectArray j_object_array =
      (jobjectArray)j_env->CallObjectMethod(j_render_manager->GetObj(), j_render_manager_get_style_for_render_id);
  jsize j_size = j_env->GetArrayLength(j_object_array);
  for (int i = 0; i < j_size; i++) {
    jstring j_style = reinterpret_cast<jstring>(j_env->GetObjectArrayElement(j_object_array, i));
    const char* utf_c = j_env->GetStringUTFChars(j_style, nullptr);
    if (utf_c != nullptr) {
      std::string style_name(utf_c);
      style_set.insert(style_name);
      j_env->ReleaseStringUTFChars(j_style, utf_c);
    }
  }
}

jobject GetNativeRendererInstance(JNIEnv* j_env, jobject j_object, jint j_render_manager_id) {
  return nullptr;
}

void MarkTextNodeDirtyRecursive(const std::shared_ptr<DomNode>& node) {
    if (!node) {
        return;
    }
    uint32_t child_count = node->GetChildCount();
    for (uint32_t i = 0; i < child_count; i++) {
        MarkTextNodeDirtyRecursive(node->GetChildAt(i));
    }
    if (node->GetViewName() == "TextInput" || node->GetViewName() == "Text") {
        auto layout_node = node->GetLayoutNode();
        layout_node->MarkDirty();
    }
}

void MarkTextNodeDirty(JNIEnv *j_env, jobject j_object, jint j_root_id) {
    auto& root_map = RootNode::PersistentMap();
    std::shared_ptr<RootNode> root_node;
    uint32_t root_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_root_id);
    bool ret = root_map.Find(root_id, root_node);
    if (!ret) {
        FOOTSTONE_DLOG(WARNING) << "root_node is nullptr";
        return;
    }
    MarkTextNodeDirtyRecursive(root_node);
}

void FreshWindow(JNIEnv *j_env, jobject j_object, jint j_render_manager_id, jint j_root_id) {
    auto& map = NativeRenderManager::PersistentMap();
    std::shared_ptr<NativeRenderManager> render_manager;
    bool ret = map.Find(static_cast<uint32_t>(j_render_manager_id), render_manager);
    if (!ret) {
        FOOTSTONE_DLOG(WARNING) << "FreshWindow j_render_manager_id invalid";
        return;
    }
    std::shared_ptr<DomManager> dom_manager = render_manager->GetDomManager();
    if (dom_manager == nullptr) {
        FOOTSTONE_DLOG(WARNING) << "FreshWindow dom_manager is nullptr";
        return;
    }
    auto& root_map = RootNode::PersistentMap();
    std::shared_ptr<RootNode> root_node;
    uint32_t root_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_root_id);
    ret = root_map.Find(root_id, root_node);
    if (!ret) {
        FOOTSTONE_DLOG(WARNING) << "FreshWindow root_node is nullptr";
        return;
    }

    std::vector<std::function<void()>> ops;
    ops.emplace_back([dom_manager, root_node]{
        dom_manager->DoLayout(root_node);
        dom_manager->EndBatch(root_node);
    });
    dom_manager->PostTask(Scene(std::move(ops)));
}

void UpdateRootSize(JNIEnv *j_env, jobject j_object, jint j_render_manager_id, jint j_root_id,
                    jfloat j_width, jfloat j_height) {
  auto& map = NativeRenderManager::PersistentMap();
  std::shared_ptr<NativeRenderManager> render_manager;
  bool ret = map.Find(static_cast<uint32_t>(j_render_manager_id), render_manager);

  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "UpdateRootSize j_render_manager_id invalid";
    return;
  }

  std::shared_ptr<DomManager> dom_manager = render_manager->GetDomManager();
  if (dom_manager == nullptr) {
    FOOTSTONE_DLOG(WARNING) << "UpdateRootSize dom_manager is nullptr";
    return;
  }

  auto& root_map = RootNode::PersistentMap();
  std::shared_ptr<RootNode> root_node;
  uint32_t root_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_root_id);
  ret = root_map.Find(root_id, root_node);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "UpdateRootSize root_node is nullptr";
    return;
  }

  auto width = static_cast<float>(j_width);
  auto height = static_cast<float>(j_height);

  std::vector<std::function<void()>> ops;
  ops.emplace_back([dom_manager, root_node, width, height]{
    FOOTSTONE_LOG(INFO) << "update root size width = " << width << ", height = " << height << std::endl;
    dom_manager->SetRootSize(root_node, width, height);
    dom_manager->DoLayout(root_node);
    dom_manager->EndBatch(root_node);
  });
  dom_manager->PostTask(Scene(std::move(ops)));
}

void UpdateNodeSize(JNIEnv *j_env, jobject j_object, jint j_render_manager_id,  jint j_root_id, jint j_node_id,
                    jfloat j_width, jfloat j_height, jboolean j_is_sync) {
  auto& map = NativeRenderManager::PersistentMap();
  std::shared_ptr<NativeRenderManager> render_manager;
  bool ret = map.Find(static_cast<uint32_t>(j_render_manager_id), render_manager);

  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "UpdateNodeSize j_render_manager_id invalid";
    return;
  }

  std::shared_ptr<DomManager> dom_manager = render_manager->GetDomManager();
  if (dom_manager == nullptr) {
    FOOTSTONE_DLOG(WARNING) << "UpdateNodeSize dom_manager is nullptr";
    return;
  }

  auto& root_map = RootNode::PersistentMap();
  std::shared_ptr<RootNode> root_node;
  uint32_t root_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_root_id);
  ret = root_map.Find(root_id, root_node);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "UpdateNodeSize root_node is nullptr";
    return;
  }

  auto node = dom_manager->GetNode(root_node,
                                   footstone::check::checked_numeric_cast<jlong, uint32_t>(j_node_id));
  if (node == nullptr) {
    FOOTSTONE_DLOG(WARNING) << "UpdateNodeSize DomNode not found for id: " << j_node_id;
    return;
  }

  std::unordered_map<std::string, std::shared_ptr<HippyValue>> update_style;
  std::shared_ptr<HippyValue> width =
    std::make_shared<HippyValue>(footstone::check::checked_numeric_cast<jfloat, double>(j_width));
  std::shared_ptr<HippyValue> height =
    std::make_shared<HippyValue>(footstone::check::checked_numeric_cast<jfloat, double>(j_height));
  update_style.insert({"width", width});
  update_style.insert({"height", height});

  std::vector<std::function<void()>> ops = {[dom_manager, root_node, node, update_style]{
    node->UpdateDomNodeStyleAndParseLayoutInfo(update_style);
    dom_manager->EndBatch(root_node);
  }};
  dom_manager->PostTask(Scene(std::move(ops)));
}

void DoCallBack(JNIEnv *j_env, jobject j_object,
                jint j_render_manager_id, jint j_result, jstring j_func_name, jint j_root_id, jint j_node_id,
                jlong j_cb_id, jbyteArray j_buffer, jint j_offset, jint j_length) {
  auto& map = NativeRenderManager::PersistentMap();
  std::shared_ptr<NativeRenderManager> render_manager;
  bool ret = map.Find(static_cast<uint32_t>(j_render_manager_id), render_manager);

  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "DoCallBack j_render_manager_id invalid";
    return;
  }

  std::shared_ptr<DomManager> dom_manager = render_manager->GetDomManager();
  if (dom_manager == nullptr) {
    FOOTSTONE_DLOG(WARNING) << "DoCallBack dom_manager is nullptr";
    return;
  }

  uint32_t root_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_root_id);
  uint32_t node_id = footstone::check::checked_numeric_cast<jlong, uint32_t>(j_node_id);
  uint32_t cb_id = footstone::check::checked_numeric_cast<jlong, uint32_t>(j_cb_id);
  jboolean is_copy = JNI_TRUE;
  const char* c = j_env->GetStringUTFChars(j_func_name, &is_copy);
  std::string func_name(c);

  std::shared_ptr<HippyValue> params = std::make_shared<HippyValue>();
  if (j_buffer != nullptr && j_length > 0) {
    jbyte params_buffer[j_length];
    j_env->GetByteArrayRegion(j_buffer, j_offset, j_length, params_buffer);
    footstone::value::Deserializer deserializer((const uint8_t*)params_buffer,
                                                footstone::check::checked_numeric_cast<jlong, size_t>(j_length));
    ret = deserializer.ReadHeader();
    FOOTSTONE_CHECK(ret) << "Deserializer read header failed. function name " << func_name << ", root id " << root_id
                        << ", node id " << node_id << "callback id " << cb_id << ", offset " << j_offset << ", length "
                        << j_length;
    deserializer.ReadValue(*params);
  }

  std::vector<std::function<void()>> ops = {[root_id, node_id, cb_id, func_name, dom_manager, params]{
    auto& root_map = RootNode::PersistentMap();
    std::shared_ptr<RootNode> root_node;
    bool ret = root_map.Find(root_id, root_node);
    if (!ret) {
      FOOTSTONE_DLOG(WARNING) << "DoCallBack root_node is nullptr";
      return;
    }

    auto node = dom_manager->GetNode(root_node, node_id);
    if (node == nullptr) {
      FOOTSTONE_DLOG(WARNING) << "DoCallBack DomNode not found for id: " << node_id;
      return;
    }

    auto callback = node->GetCallback(func_name, cb_id);
    if (callback == nullptr) {
      FOOTSTONE_DLOG(WARNING) << "DoCallBack Callback not found for func_name: " << func_name;
      return;
    }

    callback(std::make_shared<DomArgument>(*params));
  }};
#ifdef ENABLE_INSPECTOR
  if (hippy::devtools::DevToolsUtil::ShouldAvoidPostDomManagerTask(func_name)) {
    ops[0]();
    return;
  }
#endif
  dom_manager->PostTask(Scene(std::move(ops)));
}

void OnReceivedEvent(JNIEnv* j_env, jobject j_object, jint j_render_manager_id, jint j_root_id, jint j_dom_id, jstring j_event_name,
                     jbyteArray j_buffer, jint j_offset, jint j_length, jboolean j_use_capture, jboolean j_use_bubble) {
  auto& map = NativeRenderManager::PersistentMap();
  std::shared_ptr<NativeRenderManager> render_manager;
  bool ret = map.Find(static_cast<uint32_t>(j_render_manager_id), render_manager);

  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "OnReceivedEvent j_render_manager_id invalid";
    return;
  }

  auto& root_map = RootNode::PersistentMap();
  std::shared_ptr<RootNode> root_node;
  uint32_t root_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_root_id);
  ret = root_map.Find(root_id, root_node);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "OnReceivedEvent root_node is nullptr";
    return;
  }

  uint32_t dom_id = footstone::check::checked_numeric_cast<jlong, uint32_t>(j_dom_id);

  jboolean is_copy = JNI_TRUE;
  const char* c = j_env->GetStringUTFChars(j_event_name, &is_copy);
  std::string event_name(c);

  std::shared_ptr<HippyValue> params = nullptr;
  if (j_buffer != nullptr && j_length > 0) {
    jbyte params_buffer[j_length];
    j_env->GetByteArrayRegion(j_buffer, j_offset, j_length, params_buffer);
    params = std::make_shared<HippyValue>();
    footstone::value::Deserializer deserializer((const uint8_t*)params_buffer,
                                                footstone::check::checked_numeric_cast<jlong, size_t>(j_length));
    ret = deserializer.ReadHeader();
    FOOTSTONE_CHECK(ret) << "Deserializer read header failed. event name " << event_name << ", root id " << root_id
                        << ", node id " << dom_id << ", offset " << j_offset << ", length "
                        << j_length;
    deserializer.ReadValue(*params);
  }

  bool capture = static_cast<bool>(j_use_capture);
  bool bubble = static_cast<bool>(j_use_bubble);

  render_manager->ReceivedEvent(root_node, dom_id, event_name, params, capture, bubble);
}

} // namespace native
} // namespace render
} // namespace hippy
