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

class NativeRenderManager {
 public:
  static void Init();

  static void Destroy();
};

jint OnCreateNativeRenderProvider(JNIEnv* j_env,
                                  jobject j_obj,
                                  jfloat j_density);

void OnDestroyNativeRenderProvider(JNIEnv* j_env,
                                   jobject j_object,
                                   jint j_instance_id);

void UpdateRootSize(JNIEnv* j_env, jobject j_obj, jint j_instance_id,
                    jfloat width, jfloat height);

void UpdateNodeSize(JNIEnv* j_env, jobject j_obj, jint j_instance_id, jint j_node_id,
                    jfloat width, jfloat height, jboolean j_is_sync);

void OnReceivedEvent(JNIEnv *j_env, jobject j_object,
                     jint j_instance_id, jint j_root_id, jint j_dom_id, jstring j_event_name,
                     jbyteArray j_buffer, jint j_offset, jint j_length,
                     jboolean j_use_capture, jboolean j_use_bubble);

void DoCallBack(JNIEnv *j_env, jobject j_object,
                jint j_instance_id, jint j_result, jstring j_func_name, jint j_node_id,
                jlong j_cb_id, jbyteArray j_buffer, jint j_offset, jint j_length);
