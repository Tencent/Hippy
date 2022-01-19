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
#include <codecvt>
#include <fstream>
#include <string>

#include "bridge/string_util.h"

char16_t* copyChar16(const char16_t* source_char, int length) {
  if (source_char == nullptr) {
    return nullptr;
  }
  int byteLength = (length + 1) * sizeof(char16_t);
  auto* temp_char = (char16_t*)malloc(byteLength);
  memcpy(temp_char, source_char, byteLength);
  temp_char[length] = 0;
  return temp_char;
}

char* copyCharToChar(const char* source_char, int length) {
  if (source_char == nullptr) {
    return nullptr;
  }
  char* temp_char = (char*)malloc(length + 1);
  memcpy(temp_char, source_char, length);
  temp_char[length] = 0;

  return temp_char;
}

#if defined(__ANDROID__) || defined(_WIN32)
const char* v8Utf8ValueToCString(const v8::String::Utf8Value& value) {
  return *value ? *value : "<string conversion failed>";
}

unicode_string_view CU16StringToStrView(const char16_t* source_char) {
  if (source_char == nullptr) {
    return "";
  }

  return unicode_string_view(source_char, std::char_traits<char16_t>::length(source_char));
}

const char16_t* StrViewToCU16String(const unicode_string_view& str_view) {
  std::u16string str = StringViewUtils::Convert(str_view, unicode_string_view::Encoding::Utf16).utf16_value();
  auto result = reinterpret_cast<const char16_t*>(str.c_str());

  return copyChar16(result, str.length());
}
#endif

std::string C16CharToString(const char16_t* source_char) {
  if (source_char == nullptr) {
    return "";
  }
  size_t length = std::char_traits<char16_t>::length(source_char);
  return std::wstring_convert<std::codecvt_utf8<char16_t>, char16_t>{}.to_bytes(source_char, source_char + length);
}
