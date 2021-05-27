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

#include "jni/uri.h"

#include "base/unicode_string_view.h"
#include "core/base/string_view_utils.h"
#include "jni/jni_env.h"
#include "jni/jni_utils.h"

static jclass j_clazz;
static jmethodID j_create_method_id;
static jmethodID j_normalize_method_id;
static jmethodID j_to_string_method_id;
static jmethodID j_get_scheme_method_id;
static jmethodID j_get_path_method_id;

using StringViewUtils = hippy::base::StringViewUtils;

bool Uri::Init() {
  JNIEnv* env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jclass j_local_clazz = env->FindClass("java/net/URI");
  j_clazz = (jclass)env->NewGlobalRef(j_local_clazz);
  j_create_method_id = env->GetStaticMethodID(
      j_clazz, "create", "(Ljava/lang/String;)Ljava/net/URI;");
  j_normalize_method_id =
      env->GetMethodID(j_clazz, "normalize", "()Ljava/net/URI;");
  j_to_string_method_id =
      env->GetMethodID(j_clazz, "toString", "()Ljava/lang/String;");
  j_get_scheme_method_id =
      env->GetMethodID(j_clazz, "getScheme", "()Ljava/lang/String;");
  j_get_path_method_id =
      env->GetMethodID(j_clazz, "getPath", "()Ljava/lang/String;");
  return true;
}

bool Uri::Destory() {
  JNIEnv* env = JNIEnvironment::GetInstance()->AttachCurrentThread();

  j_get_path_method_id = nullptr;
  j_get_scheme_method_id = nullptr;
  j_to_string_method_id = nullptr;
  j_normalize_method_id = nullptr;
  j_create_method_id = nullptr;

  env->DeleteGlobalRef(j_clazz);

  return true;
}

Uri::Uri(const unicode_string_view& uri) {
  JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jstring j_str_uri = JniUtils::StrViewToJString(j_env, uri);
  j_obj_uri_ =
      j_env->CallStaticObjectMethod(j_clazz, j_create_method_id, j_str_uri);
  j_env->DeleteLocalRef(j_str_uri);
}

Uri::~Uri() {
  JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  j_env->DeleteLocalRef(j_obj_uri_);
}

unicode_string_view Uri::Normalize() {
  JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jobject j_normalize_uri =
      (jstring)j_env->CallObjectMethod(j_obj_uri_, j_normalize_method_id);
  jstring j_parsed_uri =
      (jstring)j_env->CallObjectMethod(j_normalize_uri, j_to_string_method_id);
  unicode_string_view ret = JniUtils::ToStrView(j_env, j_parsed_uri);
  j_env->DeleteLocalRef(j_parsed_uri);
  j_env->DeleteLocalRef(j_normalize_uri);
  return ret;
}

unicode_string_view Uri::GetScheme() {
  JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jstring j_scheme =
      (jstring)j_env->CallObjectMethod(j_obj_uri_, j_get_scheme_method_id);
  unicode_string_view ret = JniUtils::ToStrView(j_env, j_scheme);
  j_env->DeleteLocalRef(j_scheme);
  return ret;
}

unicode_string_view Uri::GetPath() {
  JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jstring j_path =
      (jstring)j_env->CallObjectMethod(j_obj_uri_, j_get_path_method_id);
  unicode_string_view ret = JniUtils::ToStrView(j_env, j_path);
  j_env->DeleteLocalRef(j_path);
  return ret;
}
