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

void InitNativeLogHandler(JNIEnv* j_env, __unused jobject j_object, jobject j_logger);

jint CreateWorkerManager(JNIEnv* j_env, __unused jobject j_obj);

void DestroyWorkerManager(JNIEnv* j_env, __unused jobject j_obj, jint j_worker_manager_id);

jlong InitInstance(JNIEnv* j_env,
                   jobject j_object,
                   jbyteArray j_global_config,
                   jboolean j_single_thread_mode,
                   jboolean j_bridge_param_json,
                   jboolean j_is_dev_module,
                   jobject j_callback,
                   jlong j_group_id,
                   jint j_worker_manager_id,
                   jint j_dom_manager_id,
                   jobject j_vm_init_param,
                   jstring j_data_dir,
                   jstring j_ws_url);

void DestroyBridge(JNIEnv* j_env,
                     jobject j_object,
                     jlong j_runtime_id,
                     jboolean j_single_thread_mode,
                     jboolean j_is_reload,
                     jobject j_callback);

jboolean RunScriptFromUri(JNIEnv* j_env,
                          __unused jobject j_obj,
                          jstring j_uri,
                          jobject j_aasset_manager,
                          jboolean j_can_use_code_cache,
                          jstring j_code_cache_dir,
                          jlong j_runtime_id,
                          jobject j_cb);

void DoBind(JNIEnv* j_env,
            __unused jobject j_obj,
            jint j_dom_id,
            jint j_render_id,
            jint j_framework_id);

void AddRoot(JNIEnv* j_env,
            __unused jobject j_obj,
            jint j_dom_id,
            jint j_root_id);

void RemoveRoot(JNIEnv* j_env,
             __unused jobject j_obj,
             jint j_dom_id,
             jint j_root_id);

void DoConnect(JNIEnv* j_env,
                __unused jobject j_obj,
                jint j_runtime_id,
                jint j_root_id);

void UpdateAnimationNode(JNIEnv* j_env,
                         __unused jobject j_obj,
                         jint j_ani_manager_id,
                         jbyteArray j_params,
                         jint j_offset,
                         jint j_length);

jint CreateDomInstance(JNIEnv* j_env, __unused jobject j_obj, jint j_worker_manager_id);

jint CreateAnimationManager(JNIEnv* j_env, __unused jobject j_obj, jint j_dom_id);

void DestroyDomInstance(JNIEnv* j_env, __unused jobject j_obj, jint j_worker_manager_id, jint j_dom_id);

void DestroyAnimationManager(JNIEnv* j_env, __unused jobject j_obj, jint j_ani_id);

void LoadInstance(JNIEnv* j_env,
                  __unused jobject j_obj,
                  jlong j_runtime_id,
                  jbyteArray j_byte_array,
                  jint j_offset,
                  jint j_length);

void DestroyInstance(JNIEnv* j_env,
                     __unused jobject j_obj,
                     jlong j_runtime_id,
                     jbyteArray j_byte_array,
                     jint j_offset,
                     jint j_length);

}  // namespace bridge
}  // namespace hippy
