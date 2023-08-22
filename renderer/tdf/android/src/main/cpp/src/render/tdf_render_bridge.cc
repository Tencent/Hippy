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
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wsign-conversion"
#pragma clang diagnostic ignored "-Wsign-compare"
#pragma clang diagnostic ignored "-Wextra-semi"
#pragma clang diagnostic ignored "-Wc++98-compat-extra-semi"
#pragma clang diagnostic ignored "-Wignored-qualifiers"
#pragma clang diagnostic ignored "-Wimplicit-float-conversion"
#pragma clang diagnostic ignored "-Wimplicit-int-conversion"
#pragma clang diagnostic ignored "-Wfloat-conversion"
#pragma clang diagnostic ignored "-Wshadow"
#pragma clang diagnostic ignored "-Wdeprecated-copy"
#include "tdfcodec/platform/android/jni_helper.h"
#pragma clang diagnostic pop
#include "jni/jni_register.h"
#include "jni/jni_invocation.h"
#include "jni/data_holder.h"
#include "renderer/tdf/tdf_render_manager.h"
#include "vfs/uri_loader.h"
#include "dom/root_node.h"

namespace hippy {
inline namespace render {
inline namespace tdf {

static jclass j_tdf_render_clazz;

using string_view = footstone::stringview::string_view;
using UriLoader = hippy::vfs::UriLoader;

REGISTER_JNI("com/tencent/renderer/TDFRenderer",
             "registerTDFEngine",
             "(IJI)V",
             RegisterTDFEngine)

REGISTER_JNI("com/tencent/renderer/TDFRenderer",
             "registerUriLoader",
             "(II)V",
             SetUriLoader)

static jint JNI_OnLoad(__unused JavaVM *j_vm, __unused void *reserved) {
  auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();

  j_tdf_render_clazz = reinterpret_cast<jclass>(j_env->NewGlobalRef(
      j_env->FindClass("com/tencent/renderer/TDFRenderer")));

  InitNodeCreator();
  tdfcore::InitWithJavaVM(j_vm);
  tdfcore::InitJNIForCodec(j_env);
  return JNI_VERSION_1_4;
}

static void JNI_OnUnload(__unused JavaVM *j_vm, __unused void *reserved) {
  auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  j_env->DeleteGlobalRef(j_tdf_render_clazz);
}

REGISTER_JNI_ONLOAD(JNI_OnLoad)
REGISTER_JNI_ONUNLOAD(JNI_OnUnload)

void RegisterTDFEngine(JNIEnv *j_env, jobject j_obj, jint j_render_id,
                       jlong j_engine_id, jint j_root_view_id) {
  auto render_manager_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_render_id);
  std::any render_manager;
  auto flag = hippy::global_data_holder.Find(render_manager_id, render_manager);
  FOOTSTONE_DCHECK(flag);
  auto render_manager_object = std::static_pointer_cast<TDFRenderManager>(
      std::any_cast<std::shared_ptr<RenderManager>>(render_manager));
  auto engine = reinterpret_cast<tdfcore::TDFEngineAndroid *>(j_engine_id);
  render_manager_object->RegisterShell(static_cast<uint32_t>(j_root_view_id), engine->GetShell(),
                                       engine->GetPipeline()->GetRenderContext());
}

void SetUriLoader(JNIEnv *j_env, jobject j_obj,
                  jint j_render_id, jint j_vfs_id) {
  std::any vfs_instance;
  auto vfs_id = footstone::checked_numeric_cast<jint, uint32_t>(j_vfs_id);
  auto flag = hippy::global_data_holder.Find(vfs_id, vfs_instance);
  FOOTSTONE_CHECK(flag);
  auto loader = std::any_cast<std::shared_ptr<UriLoader>>(vfs_instance);
  auto render_manager_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_render_id);
  std::any render_manager;
  flag = hippy::global_data_holder.Find(render_manager_id, render_manager);
  FOOTSTONE_DCHECK(flag);
  auto render_manager_object = std::static_pointer_cast<TDFRenderManager>(
      std::any_cast<std::shared_ptr<RenderManager>>(render_manager));
  render_manager_object->SetUriLoader(loader);
}

}  // namespace tdf
}  // namespace render
}  // namespace hippy
