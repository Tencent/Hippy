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
#include "renderer/tdf/tdf_render_manager.h"

void TDFRenderBridge::Init(JavaVM *j_vm, __unused void *reserved) {
  // Init TDF Core: TDF Core was a static library for Hippy, so we need to do
  // initialization manually. Init Node Creator
  hippy::dom::InitNodeCreator();
  tdfcore::InitWithJavaVM(j_vm);
}

void TDFRenderBridge::RegisterScopeForUriLoader(
    uint32_t render_id, const std::shared_ptr<hippy::driver::Scope> &scope) {
  hippy::TDFRenderManager::SetUriDataGetter(
      render_id, [scope](tdfrender::RootViewNode::StringView uri,
                         tdfrender::RootViewNode::DataCb cb) {
        FOOTSTONE_DCHECK(scope->GetUriLoader());
        return scope->GetUriLoader()->RequestUntrustedContent(uri, cb);
      });
}

void TDFRenderBridge::Destroy() {}

jint OnCreateTDFRender(JNIEnv *j_env, jobject j_obj, jfloat j_density) {
  auto render = std::make_shared<hippy::TDFRenderManager>();
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
