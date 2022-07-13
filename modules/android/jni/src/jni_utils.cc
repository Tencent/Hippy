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

#include "jni_utils.h"  // NOLINT(build/include_subdir)

#include <cstdlib>

#include "footstone/check.h"
#include "footstone/logging.h"
#include "footstone/string_view_utils.h"

using unicode_string_view = footstone::stringview::unicode_string_view;
using StringViewUtils = hippy::base::StringViewUtils;

jsize SafeGetArrayLength(JNIEnv* j_env, const jbyteArray& j_byte_array) {
  FOOTSTONE_DCHECK(j_byte_array);
  jsize j_size = j_env->GetArrayLength(j_byte_array);
  return std::max(0, j_size);
}

JniUtils::bytes JniUtils::AppendJavaByteArrayToBytes(JNIEnv* j_env,
                                                     jbyteArray j_byte_array,
                                                     jsize j_offset,
                                                     jsize j_length) {
  if (!j_byte_array) {
    return "";
  }

  jsize j_len;
  if (j_length == -1) {
    j_len = SafeGetArrayLength(j_env, j_byte_array);
  } else {
    j_len = j_length;
  }
  if (!j_len) {
    return "";
  }

  bytes ret;
  ret.resize(footstone::check::checked_numeric_cast<jsize, size_t>(j_length));
  j_env->GetByteArrayRegion(j_byte_array, j_offset, j_len,
                            reinterpret_cast<int8_t*>(&ret[0]));
  return ret;
}

unicode_string_view JniUtils::JByteArrayToStrView(JNIEnv* j_env,
                                                  jbyteArray j_byte_array,
                                                  jsize j_offset,
                                                  jsize j_length) {
  if (!j_byte_array) {
    return "";
  }

  jsize j_len;
  if (j_length == -1) {
    j_len = SafeGetArrayLength(j_env, j_byte_array);
  } else {
    j_len = j_length;
  }
  if (!j_len) {
    return "";
  }

  std::string ret;
  ret.resize(footstone::check::checked_numeric_cast<jsize, size_t>(j_len));
  j_env->GetByteArrayRegion(j_byte_array, j_offset, j_len,
                            reinterpret_cast<int8_t*>(&ret[0]));

  const auto* ptr = reinterpret_cast<const char16_t*>(ret.c_str());
  return unicode_string_view(ptr, ret.length() / sizeof(char16_t));
}

jstring JniUtils::StrViewToJString(JNIEnv* j_env,
                                   const unicode_string_view& str_view) {
  std::u16string str =
      StringViewUtils::Convert(str_view, unicode_string_view::Encoding::Utf16)
          .utf16_value();
  return j_env->NewString(reinterpret_cast<const jchar*>(str.c_str()),
                          footstone::check::checked_numeric_cast<size_t, jsize>(str.length()));
}

unicode_string_view::u8string JniUtils::ToU8String(JNIEnv* j_env,
                                                   jstring j_str) {
  FOOTSTONE_DCHECK(j_str);

  const char* c_str = j_env->GetStringUTFChars(j_str, nullptr);
  const int32_t len = j_env->GetStringLength(j_str);
  unicode_string_view::u8string ret(
      reinterpret_cast<const unicode_string_view::char8_t_*>(c_str),
      footstone::check::checked_numeric_cast<jsize, size_t>(len));
  j_env->ReleaseStringUTFChars(j_str, c_str);
  return ret;
}

unicode_string_view JniUtils::ToStrView(JNIEnv* j_env, jstring j_str) {
  FOOTSTONE_DCHECK(j_str);

  const jchar* j_char = j_env->GetStringChars(j_str, nullptr);
  auto len = j_env->GetStringLength(j_str);
  unicode_string_view ret(reinterpret_cast<const char16_t*>(j_char),
                          footstone::check::checked_numeric_cast<jsize, size_t>(len));
  j_env->ReleaseStringChars(j_str, j_char);
  return ret;
}
