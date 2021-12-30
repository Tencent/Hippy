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

#include "bridge/runtime.h"
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
             "(JF)V",
             CreateNativeRenderDelegate)

REGISTER_JNI("com/tencent/renderer/NativeRenderProvider",
             "onRootSizeChanged",
             "(JFF)V",
             UpdateRootSize)

REGISTER_JNI("com/tencent/renderer/NativeRenderProvider",
             "onReceivedEvent",
             "(JILjava/lang/String;[BIIZZ)V",
             onReceivedEvent)

void NativeRenderProvider::Init() {
}

void NativeRenderProvider::Destroy() {
}

void CreateNativeRenderDelegate(JNIEnv* j_env, jobject j_object,
                                jlong j_runtime_id, jfloat j_density) {
  std::shared_ptr<Runtime> runtime = Runtime::Find(j_runtime_id);
  if (!runtime) {
    TDF_BASE_DLOG(WARNING) << "CreateNativeRenderDelegate j_runtime_id invalid";
    return;
  }

  std::shared_ptr<RenderManager> render_manager = std::make_shared<HippyRenderManager>(std::make_shared<JavaRef>(j_env, j_object));
  std::static_pointer_cast<HippyRenderManager>(render_manager)->SetDensity(j_density);
  runtime->GetScope()->SetRenderManager(render_manager);
  std::shared_ptr<DomManager> dom_manager = runtime->GetScope()->GetDomManager();
  uint32_t root_id = dom_manager->GetRootId();
  auto node = dom_manager->GetNode(root_id);
  auto layout_node = node->GetLayoutNode();
  layout_node->SetScaleFactor(j_density);
  dom_manager->SetRenderManager(render_manager);
}

void UpdateRootSize(JNIEnv *j_env, jobject j_object, jlong j_runtime_id,
                    jfloat j_width, jfloat j_height) {
  std::shared_ptr<Runtime> runtime = Runtime::Find(j_runtime_id);
  if (!runtime) {
    TDF_BASE_DLOG(WARNING) << "UpdateRootSize j_runtime_id invalid";
    return;
  }

  std::shared_ptr<DomManager> dom_manager = runtime->GetScope()->GetDomManager();
  if (dom_manager == nullptr) {
    TDF_BASE_DLOG(WARNING) << "UpdateRootSize dom_manager is nullptr";
    return;
  }
  dom_manager->SetRootSize(j_width, j_height);
  dom_manager->DoLayout();
}

void onReceivedEvent(JNIEnv *j_env, jobject j_object,
                                jlong j_runtime_id, jint j_dom_id, jstring j_event_name,
                                jbyteArray j_buffer, jint j_offset, jint j_length,
                                jboolean j_use_capture, jboolean j_use_bubble) {
  std::shared_ptr<Runtime> runtime = Runtime::Find(j_runtime_id);
  if (!runtime) {
    TDF_BASE_DLOG(WARNING) << "onReceivedEvent j_runtime_id invalid";
    return;
  }

  std::shared_ptr<DomManager> dom_manager = runtime->GetScope()->GetDomManager();
  if (dom_manager == nullptr) {
    TDF_BASE_DLOG(WARNING) << "onReceivedEvent dom_manager is nullptr";
    return;
  }
  auto node = dom_manager->GetNode(j_dom_id);
  if (node == nullptr) {
    TDF_BASE_DLOG(WARNING) << "onReceivedEvent DomNode not found for id: " << j_dom_id;
    return;
  }
/*
  jboolean is_copy = JNI_TRUE;
  jbyte* params_buffer = j_env->GetByteArrayElements(j_buffer, &is_copy);
  const char* event_name = j_env->GetStringUTFChars(j_event_name, &is_copy);
  node->HandleListener(event_name, std::make_shared<DomArgument>(
          std::pair<uint8_t *, size_t>((uint8_t *) params_buffer, j_length)));
  j_env->ReleaseByteArrayElements(j_buffer, params_buffer, 0);
*/
}

/*
void OnReceivedNativeGestureEvent(JNIEnv *j_env, jobject j_object,
                                  jlong j_runtime_id, jint j_dom_id, jstring j_event_name,
                                  jbyteArray j_buffer, jint j_length) {
  std::shared_ptr<Runtime> runtime = Runtime::Find(j_runtime_id);
  if (!runtime) {
    TDF_BASE_DLOG(WARNING) << "onReceivedNativeGestureEvent j_runtime_id invalid";
    return;
  }

  std::shared_ptr<DomManager> dom_manager = runtime->GetScope()->GetDomManager();
  if (dom_manager == nullptr) {
    TDF_BASE_DLOG(WARNING) << "onReceivedNativeGestureEvent dom_manager is nullptr";
    return;
  }
  auto node = dom_manager->GetNode(j_dom_id);
  if (node == nullptr) {
    TDF_BASE_DLOG(WARNING) << "onReceivedNativeGestureEvent DomNode not found for id: " << j_dom_id;
    return;
  }
  jboolean is_copy = JNI_TRUE;
  jbyte* params_buffer = j_env->GetByteArrayElements(j_buffer, &is_copy);
  const char* event_name = j_env->GetStringUTFChars(j_event_name, &is_copy);

  tdf::base::Deserializer deserializer((const uint8_t*) params_buffer, j_length);
  deserializer.ReadHeader();
  std::shared_ptr<DomValue> params = std::make_shared<DomValue>();
  deserializer.ReadObject(*params);

  node->HandleEvent(std::make_shared<DomEvent>(event_name, node, params));
  j_env->ReleaseByteArrayElements(j_buffer, params_buffer, 0);
}
*/
