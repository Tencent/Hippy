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

#include "render/native_render_jni.h"

#include "bridge/root_node_repo.h"
#include "footstone/deserializer.h"
#include "footstone/hippy_value.h"
#include "dom/render_manager.h"
#include "dom/root_node.h"
#include "dom/scene.h"
#include "jni/jni_register.h"
#include "render/native_render_manager.h"

using DomArgument = hippy::dom::DomArgument;
using DomEvent = hippy::dom::DomEvent;
using DomManager = hippy::dom::DomManager;
using HippyValue = footstone::value::HippyValue;
using NativeRenderManager = hippy::dom::NativeRenderManager;
using RenderManager = hippy::dom::RenderManager;
using RootNode = hippy::dom::RootNode;
using Scene = hippy::dom::Scene;
using RootNodeRepo = hippy::bridge::RootNodeRepo;

REGISTER_JNI("com/tencent/renderer/NativeRenderProvider",
             "onCreateNativeRenderProvider",
             "(F)I",
             OnCreateNativeRenderProvider)

REGISTER_JNI("com/tencent/renderer/NativeRenderProvider",
             "onDestroyNativeRenderProvider",
             "(I)V",
             OnDestroyNativeRenderProvider)

REGISTER_JNI("com/tencent/renderer/NativeRenderProvider",
             "updateRootSize",
             "(IIFF)V",
             UpdateRootSize)

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

void NativeRenderJni::Init() {
}

void NativeRenderJni::Destroy() {
}

jint OnCreateNativeRenderProvider(JNIEnv* j_env, jobject j_object, jfloat j_density) {
  std::shared_ptr<RenderManager> render_manager = std::make_shared<NativeRenderManager>(std::make_shared<JavaRef>(j_env, j_object));
  auto native_render_manager = std::static_pointer_cast<NativeRenderManager>(render_manager);
  auto density = static_cast<float>(j_density);
  native_render_manager->SetDensity(density);
  auto& map = NativeRenderManager::PersistentMap();
  bool ret = map.Insert(native_render_manager->GetId(), native_render_manager);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "OnCreateNativeRenderProvider insert render manager invalid";
  }
  return footstone::check::checked_numeric_cast<uint32_t, jint>(native_render_manager->GetId());
}

void OnDestroyNativeRenderProvider(JNIEnv* j_env, jobject j_object, jint j_instance_id) {
  auto& map = NativeRenderManager::PersistentMap();
  bool ret = map.Erase(static_cast<uint32_t>(j_instance_id));
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "OnDestroyNativeRenderProvider delete render manager invalid";
  }
}

void UpdateRootSize(JNIEnv *j_env, jobject j_object, jint j_instance_id, jint j_root_id,
                    jfloat j_width, jfloat j_height) {
  auto& map = NativeRenderManager::PersistentMap();
  std::shared_ptr<NativeRenderManager> render_manager;
  bool ret = map.Find(static_cast<uint32_t>(j_instance_id), render_manager);

  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "UpdateRootSize j_instance_id invalid";
    return;
  }

  std::shared_ptr<DomManager> dom_manager = render_manager->GetDomManager();
  if (dom_manager == nullptr) {
    FOOTSTONE_DLOG(WARNING) << "UpdateRootSize dom_manager is nullptr";
    return;
  }

  std::shared_ptr<RootNode> root_node = RootNodeRepo::Find(static_cast<uint32_t>(j_root_id));
  if (root_node == nullptr) {
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

void UpdateNodeSize(JNIEnv *j_env, jobject j_object, jint j_instance_id,  jint j_root_id, jint j_node_id,
                    jfloat j_width, jfloat j_height, jboolean j_is_sync) {
  auto& map = NativeRenderManager::PersistentMap();
  std::shared_ptr<NativeRenderManager> render_manager;
  bool ret = map.Find(static_cast<uint32_t>(j_instance_id), render_manager);

  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "UpdateNodeSize j_instance_id invalid";
    return;
  }

  std::shared_ptr<DomManager> dom_manager = render_manager->GetDomManager();
  if (dom_manager == nullptr) {
    FOOTSTONE_DLOG(WARNING) << "UpdateNodeSize dom_manager is nullptr";
    return;
  }

  std::shared_ptr<RootNode> root_node = RootNodeRepo::Find(static_cast<uint32_t>(j_root_id));
  if (root_node == nullptr) {
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
                jint j_instance_id, jint j_result, jstring j_func_name, jint j_root_id, jint j_node_id,
                jlong j_cb_id, jbyteArray j_buffer, jint j_offset, jint j_length) {
  auto& map = NativeRenderManager::PersistentMap();
  std::shared_ptr<NativeRenderManager> render_manager;
  bool ret = map.Find(static_cast<uint32_t>(j_instance_id), render_manager);

  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "DoCallBack j_instance_id invalid";
    return;
  }

  std::shared_ptr<DomManager> dom_manager = render_manager->GetDomManager();
  if (dom_manager == nullptr) {
    FOOTSTONE_DLOG(WARNING) << "DoCallBack dom_manager is nullptr";
    return;
  }

  std::shared_ptr<RootNode> root_node = RootNodeRepo::Find(static_cast<uint32_t>(j_root_id));
  if (root_node == nullptr) {
    FOOTSTONE_DLOG(WARNING) << "DoCallBack root_node is nullptr";
    return;
  }

  auto node = dom_manager->GetNode(root_node,
                                   footstone::check::checked_numeric_cast<jlong, uint32_t>(j_node_id));
  if (node == nullptr) {
    FOOTSTONE_DLOG(WARNING) << "DoCallBack DomNode not found for id: " << j_node_id;
    return;
  }

  jboolean is_copy = JNI_TRUE;
  const char* func_name = j_env->GetStringUTFChars(j_func_name, &is_copy);
  auto callback = node->GetCallback(func_name,
                                    footstone::check::checked_numeric_cast<jlong, uint32_t>(j_cb_id));
  if (callback == nullptr) {
    FOOTSTONE_DLOG(WARNING) << "DoCallBack Callback not found for func_name: " << func_name;
    return;
  }

  std::shared_ptr<HippyValue> params = std::make_shared<HippyValue>();
  if (j_buffer != nullptr && j_length > 0) {
    jbyte params_buffer[j_length];
    j_env->GetByteArrayRegion(j_buffer, j_offset, j_length, params_buffer);
    footstone::value::Deserializer deserializer((const uint8_t*) params_buffer,
                                         footstone::check::checked_numeric_cast<jlong, size_t>(j_length));
    deserializer.ReadHeader();
    deserializer.ReadValue(*params);
  }
  callback(std::make_shared<DomArgument>(*params));
}

void OnReceivedEvent(JNIEnv* j_env, jobject j_object, jint j_instance_id, jint j_root_id, jint j_dom_id, jstring j_event_name,
                     jbyteArray j_buffer, jint j_offset, jint j_length, jboolean j_use_capture, jboolean j_use_bubble) {
  auto& map = NativeRenderManager::PersistentMap();
  std::shared_ptr<NativeRenderManager> render_manager;
  bool ret = map.Find(static_cast<uint32_t>(j_instance_id), render_manager);

  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "OnReceivedEvent j_instance_id invalid";
    return;
  }

  std::shared_ptr<DomManager> dom_manager = render_manager->GetDomManager();
  if (dom_manager == nullptr) {
    FOOTSTONE_DLOG(WARNING) << "OnReceivedEvent dom_manager is nullptr";
    return;
  }

  std::shared_ptr<RootNode> root_node = RootNodeRepo::Find(static_cast<uint32_t>(j_root_id));
  if (root_node == nullptr) {
    FOOTSTONE_DLOG(WARNING) << "OnReceivedEvent root_node is nullptr";
    return;
  }

  auto node = dom_manager->GetNode(root_node,
                                   footstone::check::checked_numeric_cast<jlong, uint32_t>(j_dom_id));
  if (node == nullptr) {
    FOOTSTONE_DLOG(WARNING) << "OnReceivedEvent DomNode not found for id: " << j_dom_id;
    return;
  }

  std::shared_ptr<HippyValue> params = nullptr;
  if (j_buffer != nullptr && j_length > 0) {
    jbyte params_buffer[j_length];
    j_env->GetByteArrayRegion(j_buffer, j_offset, j_length, params_buffer);
    params = std::make_shared<HippyValue>();
    footstone::value::Deserializer deserializer((const uint8_t*) params_buffer,
                                         footstone::check::checked_numeric_cast<jlong, size_t>(j_length));
    deserializer.ReadHeader();
    deserializer.ReadValue(*params);
  }

  jboolean is_copy = JNI_TRUE;
  const char* c = j_env->GetStringUTFChars(j_event_name, &is_copy);
  std::string event_name(c);

  std::vector<std::function<void()>> ops = {[node = std::move(node), params = std::move(params),
                                             use_capture = static_cast<bool>(j_use_capture),
                                             use_bubble = static_cast<bool>(j_use_bubble),
                                             event_name = std::move(event_name)] {
    auto event = std::make_shared<DomEvent>(event_name, node, use_capture, use_bubble, params);
    node->HandleEvent(event);
  }};
  dom_manager->PostTask(Scene(std::move(ops)));
}
