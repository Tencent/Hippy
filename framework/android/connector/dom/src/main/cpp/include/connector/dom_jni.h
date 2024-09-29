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

namespace hippy {
inline namespace framework {
inline namespace connector {
inline namespace dom {

jint CreateDomManager(JNIEnv* j_env, __unused jobject j_obj, jint j_group_id, jint j_share_dom_id);

void DestroyDomManager(JNIEnv* j_env,
                       __unused jobject j_obj,
                       jint j_dom_id);

void CreateRoot(JNIEnv* j_env,
                __unused jobject j_obj,
                jint j_root_id,
                jfloat j_density);

void DestroyRoot(JNIEnv* j_env,
                 __unused jobject j_obj,
                 jint j_root_id);

void ReleaseRootResources(JNIEnv* j_env,
                          __unused jobject j_obj,
                          jint j_root_id);

void SetDomManager(JNIEnv* j_env,
                  __unused jobject j_obj,
                  jint j_root_id,
                  jint j_dom_id);

void SetRenderManager(JNIEnv* j_env,
                      __unused jobject j_obj,
                      jint j_dom_manager_id,
                      jint j_render_id);

}
}
}
}
