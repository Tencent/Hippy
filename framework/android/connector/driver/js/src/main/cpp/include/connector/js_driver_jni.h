/*
 *
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
inline namespace driver {

jint CreateJsDriver(JNIEnv* j_env,
                    jobject j_object,
                    jbyteArray j_global_config,
                    jboolean j_single_thread_mode,
                    jboolean j_enable_v8_serialization,
                    jboolean j_is_dev_module,
                    jobject j_callback,
                    jlong j_group_id,
                    jint j_dom_manager_id,
                    jobject j_vm_init_param,
                    jint j_vfs_id,
                    jint j_devtools_id);

void DestroyJsDriver(JNIEnv* j_env,
                     jobject j_object,
                     jint j_runtime_id,
                     jboolean j_single_thread_mode,
                     jboolean j_is_reload,
                     jobject j_callback);

void LoadInstance(JNIEnv* j_env,
                  __unused jobject j_obj,
                  jint j_runtime_id,
                  jbyteArray j_byte_array,
                  jint j_offset,
                  jint j_length,
                  jobject j_callback);

void UnloadInstance(JNIEnv* j_env,
                    __unused jobject j_obj,
                    jint j_runtime_id,
                    jbyteArray j_byte_array,
                    jint j_offset,
                    jint j_length);

jboolean RunScriptFromUri(JNIEnv* j_env,
                          __unused jobject j_obj,
                          jint j_runtime_id,
                          jstring j_uri,
                          jobject j_aasset_manager,
                          jboolean j_can_use_code_cache,
                          jstring j_code_cache_dir,
                          jint j_vfs_id,
                          jobject j_cb);

void SetRootNode(JNIEnv* j_env,
                 __unused jobject j_obj,
                 jint j_runtime_id,
                 jint j_root_id);

void SetDomManager(JNIEnv* j_env,
                   __unused jobject j_obj,
                   jint j_runtime_id,
                   jint j_dom_manager_id);

void OnNativeInitEnd(JNIEnv* j_env, jobject j_object, jint j_scope_id, jlong startTime, jlong endTime);

void OnFirstPaintEnd(JNIEnv* j_env, jobject j_object, jint j_scope_id, jlong time);

void OnFirstContentfulPaintEnd(JNIEnv* j_env, jobject j_object, jint j_scope_id, jlong time);

void OnResourceLoadEnd(JNIEnv* j_env, jobject j_object, jint j_scope_id, jstring j_uri, jlong j_start_time, jlong j_end_time, jlong j_ret_code, jstring j_error_msg);

}
}
}
}
