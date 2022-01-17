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

#include "jni/native_render_provider.h"

#include "core/runtime/v8/runtime.h"
#include "dom/deserializer.h"
#include "dom/dom_value.h"
#include "dom/render_manager.h"
#include "jni/jni_register.h"
#include "render/hippy_render_manager.h"

using DomArgument = hippy::dom::DomArgument;
using DomEvent = hippy::dom::DomEvent;
using DomManager = hippy::dom::DomManager;
using DomValue = tdf::base::DomValue;
using HippyRenderManager = hippy::dom::HippyRenderManager;
using RenderManager = hippy::dom::RenderManager;

REGISTER_JNI("com/tencent/renderer/NativeRenderProvider",
             "onCreateNativeRenderProvider",
             "(F)I",
             OnCreateNativeRenderProvider)

REGISTER_JNI("com/tencent/renderer/NativeRenderProvider",
             "onDestroyNativeRenderProvider",
             "(I)V",
             OnDestroyNativeRenderProvider)

REGISTER_JNI("com/tencent/renderer/NativeRenderProvider",
             "onRootSizeChanged",
             "(IFF)V",
             UpdateRootSize)

REGISTER_JNI("com/tencent/renderer/NativeRenderProvider",
             "onReceivedEvent",
             "(IILjava/lang/String;[BIIZZ)V",
             OnReceivedEvent)

REGISTER_JNI("com/tencent/renderer/NativeRenderProvider",
             "doCallBack",
             "(IILjava/lang/String;I[BII)V",
             DoCallBack)

void NativeRenderProvider::Init() {
}

void NativeRenderProvider::Destroy() {
}

jint OnCreateNativeRenderProvider(JNIEnv* j_env, jobject j_object, jfloat j_density) {
  std::shared_ptr<RenderManager> render_manager = std::make_shared<HippyRenderManager>(std::make_shared<JavaRef>(j_env, j_object));
  auto hippy_render_manager = std::static_pointer_cast<HippyRenderManager>(render_manager);
  hippy_render_manager->SetDensity(j_density);
  HippyRenderManager::Insert(hippy_render_manager);
  return hippy_render_manager->GetId();
}

void OnDestroyNativeRenderProvider(JNIEnv* j_env, jobject j_object, jint j_instance_id) {
  HippyRenderManager::Erase(static_cast<int32_t>(j_instance_id));
}

void UpdateRootSize(JNIEnv *j_env, jobject j_object, jint j_instance_id,
                    jfloat j_width, jfloat j_height) {
  std::shared_ptr<HippyRenderManager> render_manager = HippyRenderManager::Find(
          static_cast<int32_t>(j_instance_id));
  if (!render_manager) {
    TDF_BASE_DLOG(WARNING) << "UpdateRootSize j_instance_id invalid";
    return;
  }

  std::shared_ptr<DomManager> dom_manager = render_manager->GetDomManager();
  if (dom_manager == nullptr) {
    TDF_BASE_DLOG(WARNING) << "UpdateRootSize dom_manager is nullptr";
    return;
  }
  dom_manager->SetRootSize(j_width, j_height);
  dom_manager->DoLayout();
}

void DoCallBack(JNIEnv *j_env, jobject j_object,
                jint j_instance_id, jint j_result, jstring j_func_name, jint j_node_id,
                jbyteArray j_buffer, jint j_offset, jint j_length) {
  std::shared_ptr<HippyRenderManager> render_manager = HippyRenderManager::Find(
          static_cast<int32_t>(j_instance_id));
  if (!render_manager) {
    TDF_BASE_DLOG(WARNING) << "DoCallBack j_instance_id invalid";
    return;
  }

  std::shared_ptr<DomManager> dom_manager = render_manager->GetDomManager();
  if (dom_manager == nullptr) {
    TDF_BASE_DLOG(WARNING) << "DoCallBack dom_manager is nullptr";
    return;
  }
  auto node = dom_manager->GetNode(j_node_id);
  if (node == nullptr) {
    TDF_BASE_DLOG(WARNING) << "DoCallBack DomNode not found for id: " << j_node_id;
    return;
  }

  jboolean is_copy = JNI_TRUE;
  const char* func_name = j_env->GetStringUTFChars(j_func_name, &is_copy);
  //TODO
  uint32_t cb_id = 1;
  auto callback = node->GetCallback(func_name, cb_id);
  if (callback == nullptr) {
    TDF_BASE_DLOG(WARNING) << "DoCallBack Callback not found for func_name: " << func_name;
    return;
  }

  std::shared_ptr<DomValue> params = std::make_shared<DomValue>();
  if (j_buffer != nullptr && j_length > 0) {
    jbyte params_buffer[j_length];
    j_env->GetByteArrayRegion(j_buffer, j_offset, j_length, params_buffer);
    tdf::base::Deserializer deserializer((const uint8_t*) params_buffer, j_length);
    deserializer.ReadHeader();
    deserializer.ReadObject(*params);
  }
  callback(std::make_shared<DomArgument>(*params));
}

void OnReceivedEvent(JNIEnv *j_env, jobject j_object,
                     jint j_instance_id, jint j_dom_id, jstring j_event_name,
                     jbyteArray j_buffer, jint j_offset, jint j_length,
                     jboolean j_use_capture, jboolean j_use_bubble) {
  std::shared_ptr<HippyRenderManager> render_manager = HippyRenderManager::Find(
          static_cast<int32_t>(j_instance_id));
  if (!render_manager) {
    TDF_BASE_DLOG(WARNING) << "OnReceivedEvent j_instance_id invalid";
    return;
  }

  std::shared_ptr<DomManager> dom_manager = render_manager->GetDomManager();
  if (dom_manager == nullptr) {
    TDF_BASE_DLOG(WARNING) << "OnReceivedEvent dom_manager is nullptr";
    return;
  }
  auto node = dom_manager->GetNode(j_dom_id);
  if (node == nullptr) {
    TDF_BASE_DLOG(WARNING) << "OnReceivedEvent DomNode not found for id: " << j_dom_id;
    return;
  }

  std::shared_ptr<DomValue> params = nullptr;
  if (j_buffer != nullptr && j_length > 0) {
    jbyte params_buffer[j_length];
    j_env->GetByteArrayRegion(j_buffer, j_offset, j_length, params_buffer);
    params = std::make_shared<DomValue>();
    tdf::base::Deserializer deserializer((const uint8_t*) params_buffer, j_length);
    deserializer.ReadHeader();
    deserializer.ReadObject(*params);
  }

  jboolean is_copy = JNI_TRUE;
  const char* event_name = j_env->GetStringUTFChars(j_event_name, &is_copy);
  node->HandleEvent(std::make_shared<DomEvent>(event_name, node,
                                               (bool) j_use_capture, (bool) j_use_bubble, params));
}
