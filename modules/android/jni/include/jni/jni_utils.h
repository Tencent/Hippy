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
#include <string>

#include "footstone/string_view.h"

namespace hippy {
inline namespace framework {
inline namespace jni {

class JniUtils {
  using string_view = footstone::stringview::string_view;
  using byte_string = std::string;

 public:
  JniUtils() = default;
  ~JniUtils() = default;

 public:
  static string_view JByteArrayToStrView(JNIEnv* j_env,
                                         jbyteArray j_byte_array,
                                         jsize j_offset = 0,
                                         jsize j_length = -1);

  static jstring StrViewToJString(JNIEnv* j_env,
                                  const string_view& str_view);
  static byte_string AppendJavaByteArrayToBytes(JNIEnv* j_env,
                                                 jbyteArray byte_array,
                                                 jsize j_offset = 0,
                                                 jsize j_length = -1);

  static string_view::u8string ToU8String(JNIEnv* j_env, jstring j_str);

  static string_view ToStrView(JNIEnv* j_env, jstring j_str);
};

}
}
}
