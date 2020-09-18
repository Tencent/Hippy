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

#ifndef JNI_UTILS_H_
#define JNI_UTILS_H_

#include <jni.h>

#include "third_party/v8/v8.h"

struct HippyBuffer;

class JniUtils {
 public:
  JniUtils() = default;
  ~JniUtils() = default;

 public:
  static void AppendJavaByteArrayToByteVector(
      JNIEnv* env,
      jbyteArray byte_array,
      std::shared_ptr<std::vector<uint8_t>> out);
  static std::string CovertJavaStringToString(JNIEnv* env, jstring str);
  static HippyBuffer* WriteToBuffer(v8::Isolate* isolate,
                                    v8::Local<v8::Object> value);

  static inline const char* ToCString(const v8::String::Utf8Value& value) {
    return *value ? *value : "<string conversion failed>";
  }

  static void printCurrentThreadID();
};

#endif  // JNI_UTILS_H_
