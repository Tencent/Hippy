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

#include "loader/http_loader.h"

#include "core/core.h"
#include "jni/jni_env.h"
#include "jni/jni_utils.h"

HttpLoader::HttpLoader() {}
HttpLoader::HttpLoader(const std::string& base) : ADRLoader(base) {}

std::string HttpLoader::Load(const std::string& uri) {
  JNIEnv* env = JNIEnvironment::AttachCurrentThread();
  JNIEnvironment* instance = JNIEnvironment::GetInstance();
  if (instance->wrapper_.get_uri_content_method_id) {
    jstring j_relative_path = env->NewStringUTF(uri.c_str());
    jbyteArray j_rst = (jbyteArray)env->CallObjectMethod(
        bridge_->GetObj(), instance->wrapper_.get_uri_content_method_id,
        j_relative_path);
    env->DeleteLocalRef(j_relative_path);
    return JniUtils::AppendJavaByteArrayToString(env, j_rst);
  }

  HIPPY_LOG(hippy::Error, "jni get_uri_content_method_id error");
  return "";
}
