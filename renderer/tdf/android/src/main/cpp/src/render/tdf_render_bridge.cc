/**
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
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include "render/tdf_render_bridge.h"
#include "core/platform/android/jni/jni_platform_android.h"
#include "jni/jni_register.h"
#include "jni/jni_load.h"
#include "renderer/tdf/tdf_render_manager.h"
#include "vfs/uri_loader.h"

using string_view = footstone::stringview::string_view;
using UriLoader = hippy::vfs::UriLoader;

void Init(JavaVM* j_vm, void* reserved, JNIEnv* j_env) {
  // Init TDF Core: TDF Core was a static library for Hippy, so we need to do
  // initialization manually. Init Node Creator
  hippy::dom::InitNodeCreator();
  tdfcore::InitWithJavaVM(j_vm);
}
void Destroy(JavaVM* j_vm, void* reserved, JNIEnv* j_env) {}

REGISTER_JNI_ONLOAD(Init)
REGISTER_JNI_ONUNLOAD(Destroy)

void TDFRenderBridge::RegisterScopeForUriLoader(
    uint32_t render_id, const std::shared_ptr<hippy::driver::Scope> &scope) {
    hippy::TDFRenderManager::SetUriDataGetter(
        render_id, [scope](string_view uri, hippy::render::tdf::RootViewNode::DataCb cb) {
          FOOTSTONE_DCHECK(scope->GetUriLoader().lock());
          UriLoader::RetCode code;
          std::unordered_map<std::string, std::string> meta;
          UriLoader::bytes content;
          scope->GetUriLoader().lock()->RequestUntrustedContent(uri, {}, code, meta, content);
          string_view string_view{};
          if (code == hippy::UriLoader::RetCode::Success) {
            string_view = string_view::new_from_utf8(content.c_str(), content.length());
          }
          cb(string_view.utf8_value());
        });
}

jint OnCreateTDFRender(JNIEnv *j_env, jobject j_obj, jfloat j_density) {
  auto render = std::make_shared<hippy::TDFRenderManager>();
  auto density = static_cast<float>(j_density);
  render->SetDensity(density);
  auto &map = hippy::TDFRenderManager::PersistentMap();
  bool ret = map.Insert(static_cast<uint32_t>(render->GetId()), render);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING)
        << "OnCreateTDFRender insert render manager invalid";
  }
  return render->GetId();
}

void RegisterTDFEngine(JNIEnv *j_env, jobject j_obj, jint render_id,
                       jlong engine_id, jint root_view_id) {
  auto &map = hippy::TDFRenderManager::PersistentMap();
  std::shared_ptr<hippy::TDFRenderManager> render_manager;
  bool ret = map.Find(static_cast<uint32_t>(render_id), render_manager);
  if (!ret) {
    FOOTSTONE_DLOG(FATAL) << "BindTDFEngine engine_id invalid";
    return;
  }
  auto engine = reinterpret_cast<tdfcore::TDFEngineAndroid *>(engine_id);
  render_manager->RegisterShell(static_cast<uint32_t>(root_view_id),
                                engine->GetShell());
}

REGISTER_JNI("com/tencent/renderer/TDFRenderer", "onCreateTDFRender", "(F)I",
             OnCreateTDFRender)
REGISTER_JNI("com/tencent/renderer/TDFRenderer", "registerTDFEngine", "(IJI)V",
             RegisterTDFEngine)
