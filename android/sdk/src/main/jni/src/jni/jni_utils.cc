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
#include "jni/hippy_buffer.h"  // NOLINT(build/include_subdir)

size_t SafeGetArrayLength(JNIEnv* j_env, const jbyteArray& j_array) {
  HIPPY_DCHECK(j_array);
  jsize length = j_env->GetArrayLength(j_array);
  return static_cast<size_t>(std::max(0, length));
}

std::string JniUtils::AppendJavaByteArrayToString(JNIEnv* j_env,
                                                  jbyteArray j_byte_array) {
  if (!j_byte_array) {
    return "";
  }

  size_t len = SafeGetArrayLength(j_env, j_byte_array);
  if (!len) {
    return "";
  }
  std::string ret;
  ret.resize(len);
  j_env->GetByteArrayRegion(j_byte_array, 0, len,
                          reinterpret_cast<int8_t*>(&ret[0]));
  return ret;
}

// todo
// 暂时只有简单字符，没有中文等的场景，为效率和包大小考虑，不进行utf16到utf8的转换
std::string JniUtils::CovertJavaStringToString(JNIEnv* j_env, jstring j_str) {
  HIPPY_DCHECK(j_str);

  const char* c_str = j_env->GetStringUTFChars(j_str, NULL);
  const int len = j_env->GetStringLength(j_str);
  std::string ret(c_str, len);
  j_env->ReleaseStringUTFChars(j_str, c_str);
  return ret;
}

HippyBuffer* JniUtils::WriteToBuffer(v8::Isolate* isolate,
                                     v8::Local<v8::Object> value) {
  HippyBuffer* buffer = NewBuffer();
  BuildBuffer(isolate, value, buffer);
  return buffer;
}

void JniUtils::printCurrentThreadID() {
#define LOG_DEBUG(FORMAT, ...) \
  __android_log_print(ANDROID_LOG_DEBUG, "Debug", FORMAT, ##__VA_ARGS__);
}
