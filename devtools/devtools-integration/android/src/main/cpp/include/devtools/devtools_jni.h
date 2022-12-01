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

namespace hippy::devtools {

class DevtoolsJni {
 public:
  static void Init(JavaVM* j_vm, void* reserved, JNIEnv* j_env);

  static void Destroy(JavaVM* j_vm, void* reserved, JNIEnv* j_env);
};

jint OnCreateDevtools(JNIEnv* j_env,
                      __unused jobject j_object,
                      jint j_worker_manager_id,
                      jstring j_data_dir,
                      jstring j_ws_url);

void OnDestroyDevtools(JNIEnv* j_env,
                       __unused jobject j_object,
                       jint j_id,
                       jboolean j_is_reload);

void OnNetworkRequestInvoke(JNIEnv* j_env,
                            __unused jobject j_object,
                            jint j_devtools_id,
                            jstring j_request_id,
                            jobject j_holder);

void OnNetworkResponseInvoke(JNIEnv* j_env,
                             __unused jobject j_object,
                             jint j_devtools_id,
                             jstring j_request_id,
                             jobject j_holder);
}  // namespace hippy::devtools
