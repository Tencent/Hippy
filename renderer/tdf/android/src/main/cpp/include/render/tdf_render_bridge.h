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

#pragma once

#include <memory>

#include "jni/jni_register.h"
#include "jni/data_holder.h"
#include "jni/jni_invocation.h"
#include "jni/jni_env.h"
#include "jni/scoped_java_ref.h"

namespace hippy {
inline namespace render {
inline namespace tdf {

void RegisterTDFEngine(JNIEnv *j_env, jobject j_obj, jint j_render_id,
                       jlong j_engine_id, jint j_root_view_id);

void SetUriLoader(JNIEnv *j_env, jobject j_obj, jint j_render_id, jint j_vfs_id);

}  // namespace tdf
}  // namespace render
}  // namespace hippy
