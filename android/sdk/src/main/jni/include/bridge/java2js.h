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
namespace bridge {

void CallJavaCallback(jobject j_obj,
                      jstring j_action,
                      jlong j_ret_code,
                      jstring j_ret_content = nullptr);

void CallJavaReportLoadedTime(jobject j_obj,
                              jstring j_uri,
                              jlong j_start_millis,
                              jlong j_end_millis);

void CallFunctionByHeapBuffer(JNIEnv *j_env,
                              jobject j_obj,
                              jstring j_action,
                              jlong j_runtime_id,
                              jobject j_callback,
                              jbyteArray j_byte_array,
                              jint j_offset,
                              jint j_length);

void CallFunctionByDirectBuffer(JNIEnv *j_env,
                                jobject j_obj,
                                jstring j_action,
                                jlong j_runtime_id,
                                jobject j_callback,
                                jobject j_buffer,
                                jint j_offset,
                                jint j_length);

}  // namespace bridge
}  // namespace hippy
