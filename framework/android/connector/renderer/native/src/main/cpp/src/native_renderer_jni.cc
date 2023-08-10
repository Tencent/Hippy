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

#include "connector/native_renderer_jni.h"

#include "renderer/native_render_manager.h"
#include "dom/render_manager.h"
#include "dom/root_node.h"
#include "dom/scene.h"
#include "jni/jni_register.h"
#include "jni/data_holder.h"

using DomArgument = hippy::dom::DomArgument;
using DomEvent = hippy::dom::DomEvent;
using DomManager = hippy::dom::DomManager;
using HippyValue = footstone::value::HippyValue;
using NativeRenderManager = hippy::NativeRenderManager;
using RenderManager = hippy::dom::RenderManager;
using RootNode = hippy::dom::RootNode;
using Scene = hippy::dom::Scene;

namespace hippy {
inline namespace framework {
inline namespace connector {
inline namespace renderer {
inline namespace native {

REGISTER_JNI("com/openhippy/connector/NativeRenderer",
             "createNativeRenderManager",
             "()I",
             CreateNativeRenderManager)

REGISTER_JNI("com/openhippy/connector/NativeRenderer",
             "destroyNativeRenderManager",
             "(I)V",
             DestroyNativeRenderManager)

REGISTER_JNI("com/openhippy/connector/NativeRenderer",
             "getNativeRendererInstance",
             "(I)Ljava/lang/Object;",
             GetNativeRendererInstance)

REGISTER_JNI("com/openhippy/connector/NativeRenderer", // NOLINT(cert-err58-cpp)
             "attachToDom",
             "(II)V",
             SetDomManager)

jint CreateNativeRenderManager(JNIEnv* j_env, jobject j_object) {
  auto render_manager = std::make_shared<NativeRenderManager>();
  render_manager->CreateRenderDelegate();
  render_manager->InitDensity();
  auto render_id = hippy::global_data_holder_key.fetch_add(1);
  auto flag = hippy::global_data_holder.Insert(render_id,
                                               std::static_pointer_cast<RenderManager>(render_manager));
  FOOTSTONE_CHECK(flag);
  return footstone::check::checked_numeric_cast<uint32_t, jint>(render_id);
}

void DestroyNativeRenderManager(JNIEnv* j_env, jobject j_object, jint j_render_manager_id) {
  auto render_manager_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_render_manager_id);
  std::any render_manager;
  auto flag = hippy::global_data_holder.Find(render_manager_id, render_manager);
  if (flag) {
    std::static_pointer_cast<NativeRenderManager>(std::any_cast<std::shared_ptr<RenderManager>>(render_manager))->DestroyRenderDelegate(j_env);
  }
  flag = hippy::global_data_holder.Erase(render_manager_id);
  FOOTSTONE_DCHECK(flag);
}

jobject GetNativeRendererInstance(JNIEnv* j_env, jobject j_object, jint j_render_manager_id) {
  auto render_manager_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_render_manager_id);
  std::any render_manager;
  auto flag = hippy::global_data_holder.Find(render_manager_id, render_manager);
  FOOTSTONE_DCHECK(flag);
  auto render_manager_object = std::static_pointer_cast<NativeRenderManager>(
      std::any_cast<std::shared_ptr<RenderManager>>(render_manager));
  return render_manager_object->GetRenderProxy()->GetObj();
}

void SetDomManager(JNIEnv* j_env,
                   __unused jobject j_obj,
                   jint j_render_id,
                   jint j_dom_manager_id) {
  auto render_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_render_id);
  std::any render_manager;
  auto flag = hippy::global_data_holder.Find(render_id, render_manager);
  FOOTSTONE_CHECK(flag);
  auto render_manager_object = std::any_cast<std::shared_ptr<RenderManager>>(render_manager);
  auto native_render_manager = std::static_pointer_cast<NativeRenderManager>(render_manager_object);

  auto dom_manager_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_dom_manager_id);
  std::any dom_manager;
  flag = hippy::global_data_holder.Find(dom_manager_id, dom_manager);
  FOOTSTONE_CHECK(flag);
  auto dom_manager_object = std::any_cast<std::shared_ptr<DomManager>>(dom_manager);
  native_render_manager->SetDomManager(dom_manager_object);
}

}
}
}
}
} // namespace hippy
