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

#pragma once

#include <jni.h>
#include <unordered_set>
#include <memory>

#include "jni/scoped_java_ref.h"

namespace hippy {
inline namespace render {
inline namespace native {

void OnCreateNativeRenderProvider(JNIEnv* j_env,
                                  jobject j_obj,
                                  jint j_render_manager_id,
                                  jfloat j_density);

jobject GetNativeRendererInstance(JNIEnv* j_env,
                                  jobject j_object,
                                  jint j_render_manager_id);

void MarkTextNodeDirty(JNIEnv *j_env, jobject j_object, jint j_root_id);

void FreshWindow(JNIEnv *j_env, jobject j_object, jint j_render_manager_id, jint j_root_id);

void UpdateRootSize(JNIEnv* j_env, jobject j_obj, jint j_render_manager_id, jint j_root_id,
                    jfloat width, jfloat height);

void UpdateNodeSize(JNIEnv* j_env, jobject j_obj, jint j_render_manager_id, jint j_root_id, jint j_node_id,
                    jfloat width, jfloat height, jboolean j_is_sync);

void OnReceivedEvent(JNIEnv *j_env, jobject j_object,
                     jint j_render_manager_id, jint j_root_id, jint j_dom_id, jstring j_event_name,
                     jbyteArray j_buffer, jint j_offset, jint j_length,
                     jboolean j_use_capture, jboolean j_use_bubble);

void DoCallBack(JNIEnv *j_env, jobject j_object,
                jint j_render_manager_id, jint j_result, jstring j_func_name, jint j_root_id, jint j_node_id,
                jlong j_cb_id, jbyteArray j_buffer, jint j_offset, jint j_length);

bool CreateJavaRenderManager(uint32_t id, std::shared_ptr<JavaRef>&j_render_manager,
                             std::shared_ptr<JavaRef>&render_delegate);

float GetDensity(std::shared_ptr<JavaRef>&j_render_manager);

void GetPropsRegisterForRender(const std::shared_ptr<JavaRef>& j_render_manager,
                               std::unordered_set<std::string>& style_set);

} // namespace native
} // namespace render
} // namespace hippy
