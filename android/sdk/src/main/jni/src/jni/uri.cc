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

#include "jni/jni_env.h"
#include "jni/jni_utils.h"

static jclass j_clazz;
static jmethodID j_create_method_id;
static jmethodID j_normalize_method_id;
static jmethodID j_to_string_method_id;
static jmethodID j_get_scheme_method_id;
static jmethodID j_get_path_method_id;

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

Uri::Uri(const std::string& uri) {
  JNIEnv* env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jstring j_str_uri = env->NewStringUTF(uri.c_str());
  j_obj_uri_ =
      env->CallStaticObjectMethod(j_clazz, j_create_method_id, j_str_uri);
  env->DeleteLocalRef(j_str_uri);
}

Uri::~Uri() {}

std::string Uri::Normalize() {
  JNIEnv* env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jobject j_normalize_uri =
      (jstring)env->CallObjectMethod(j_obj_uri_, j_normalize_method_id);
  jstring j_parsed_uri =
      (jstring)env->CallObjectMethod(j_normalize_uri, j_to_string_method_id);
  return JniUtils::CovertJavaStringToString(env, j_parsed_uri);
}

std::string Uri::GetScheme() {
  JNIEnv* env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jstring j_scheme =
      (jstring)env->CallObjectMethod(j_obj_uri_, j_get_scheme_method_id);

  return JniUtils::CovertJavaStringToString(env, j_scheme);
}

std::string Uri::GetPath() {
  JNIEnv* env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jstring j_path =
      (jstring)env->CallObjectMethod(j_obj_uri_, j_get_path_method_id);

  return JniUtils::CovertJavaStringToString(env, j_path);
}
