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

#include "jni/jni_utils.h"  // NOLINT(build/include_subdir)

#include <android/log.h>
#include <stdlib.h>
#include <string.h>

#include "core/core.h"

jsize SafeGetArrayLength(JNIEnv* env, const jbyteArray& jarray) {
  HIPPY_DCHECK(jarray);
  jsize length = env->GetArrayLength(jarray);
  return std::max(0, length);
}

std::string JniUtils::AppendJavaByteArrayToString(JNIEnv* env,
                                                  jbyteArray byte_array,
                                                  jsize j_offset) {
  if (!byte_array) {
    return "";
  }

  auto j_length = SafeGetArrayLength(env, byte_array);
  if (!j_length) {
    return "";
  }

  return AppendJavaByteArrayToString(env, byte_array, j_offset, j_length);
}

std::string JniUtils::AppendJavaByteArrayToString(JNIEnv* env,
                                                  jbyteArray byte_array,
                                                  jsize j_offset,
                                                  jsize j_length) {
  if (!byte_array) {
    return "";
  }

  std::string ret;
  ret.resize(j_length);
  env->GetByteArrayRegion(byte_array, j_offset, j_length,
                          reinterpret_cast<int8_t*>(&ret[0]));
  return ret;
}

// todo
// 暂时只有简单字符，没有中文等的场景，为效率和包大小考虑，不进行utf16到utf8的转换
std::string JniUtils::CovertJavaStringToString(JNIEnv* env, jstring str) {
  HIPPY_DCHECK(str);

  const char* c_str = env->GetStringUTFChars(str, NULL);
  const int len = env->GetStringLength(str);
  std::string ret(c_str, len);
  env->ReleaseStringUTFChars(str, c_str);
  return ret;
}

void JniUtils::printCurrentThreadID() {
#define LOG_DEBUG(FORMAT, ...) \
  __android_log_print(ANDROID_LOG_DEBUG, "Debug", FORMAT, ##__VA_ARGS__);
}
