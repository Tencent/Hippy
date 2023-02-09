/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2023 THL A29 Limited, a Tencent company.
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

#include "connector/tdf_renderer_jni.h"
#include "jni/jni_register.h"
#include "jni/data_holder.h"
#include "renderer/tdf/tdf_render_manager.h"
#include "vfs/uri_loader.h"
#include "dom/root_node.h"

namespace hippy {
inline namespace framework {
inline namespace connector {
inline namespace renderer {
inline namespace tdf {

using string_view = footstone::stringview::string_view;
using UriLoader = hippy::vfs::UriLoader;

REGISTER_JNI("com/openhippy/connector/TDFRenderer",
             "createTDFRenderManager",
             "(F)I",
             CreateTDFRenderManager)

REGISTER_JNI("com/openhippy/connector/TDFRenderer",
             "destroyTDFRenderManager",
             "(I)V",
             DestroyTDFRenderManager)

REGISTER_JNI("com/openhippy/connector/TDFRenderer",
             "attachToDom",
             "(II)V",
             SetDomManager)

jint CreateTDFRenderManager(JNIEnv *j_env, jobject j_obj, jfloat j_density) {
  auto render_manager = std::make_shared<hippy::TDFRenderManager>();
  render_manager->SetDensity(static_cast<float>(j_density));
  auto global_render_id = hippy::global_data_holder_key.fetch_add(1);
  auto flag = hippy::global_data_holder.Insert(global_render_id,
                                               std::static_pointer_cast<RenderManager>(render_manager));
  FOOTSTONE_CHECK(flag);
  return footstone::check::checked_numeric_cast<uint32_t, jint>(global_render_id);
}

void DestroyTDFRenderManager(JNIEnv* j_env, jobject j_object, jint j_render_manager_id) {
  auto render_manager_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_render_manager_id);
  auto flag = hippy::global_data_holder.Erase(render_manager_id);
  FOOTSTONE_DCHECK(flag);
}

void SetDomManager(JNIEnv* j_env, jobject j_obj, jint j_render_id, jint j_dom_manager_id) {

  auto render_manager_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_render_id);
  std::any render_manager;
  auto flag = hippy::global_data_holder.Find(render_manager_id, render_manager);
  FOOTSTONE_DCHECK(flag);
  auto render_manager_object = std::static_pointer_cast<TDFRenderManager>(
      std::any_cast<std::shared_ptr<RenderManager>>(render_manager));

  auto dom_manager_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_dom_manager_id);
  std::any dom_manager;
  flag = hippy::global_data_holder.Find(dom_manager_id, dom_manager);
  FOOTSTONE_CHECK(flag);
  auto dom_manager_object = std::any_cast<std::shared_ptr<DomManager>>(dom_manager);
  render_manager_object->SetDomManager(dom_manager_object);
}

}  // namespace tdf
}  // namespace renderer
}  // namespace connector
}  // namespace framework
}  // namespace hippy
