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

#include "render/ffi/string_convert.h"

namespace voltron {

char16_t *CopyChar16(const char16_t *source_char, int length) {
  if (source_char == nullptr) {
    return nullptr;
  }
  int byteLength = (length + 1) * sizeof(char16_t);
  auto *temp_char = (char16_t *)malloc(byteLength);
  std::copy(source_char, source_char + length, temp_char);
  temp_char[length] = 0;
  return temp_char;
}

char16_t *CopyCharToChar16(const char *source_char, int length) {
  if (source_char == nullptr) {
    return nullptr;
  }
  int byteLength = (length + 1) * sizeof(char16_t);
  auto *temp_char = (char16_t *)malloc(byteLength);
  std::copy(source_char, source_char + length, temp_char);
  temp_char[length] = 0;
  return temp_char;
}

char *CopyCharToChar(const char *source_char, int length) {
  if (source_char == nullptr) {
    return nullptr;
  }
  char *temp_char = (char *)malloc(length + 1);
  memcpy(temp_char, source_char, length);
  temp_char[length] = 0;

  return temp_char;
}

uint8_t *CopyBytes(const uint8_t *source_bytes, int length) {
  if (source_bytes == nullptr) {
    return nullptr;
  }
  auto *temp_bytes = (uint8_t *)malloc(length);
  memcpy(temp_bytes, source_bytes, length);

  return temp_bytes;
}

void ReleaseCopy(void *copy_pointer) {
  if (copy_pointer == nullptr) {
    return;
  }
  free(copy_pointer);
}

std::string C16CharToString(const char16_t *source_char) {
  if (source_char == nullptr) {
    return "";
  }
  size_t length = std::char_traits<char16_t>::length(source_char);
  return std::wstring_convert<std::codecvt_utf8<char16_t>, char16_t>{}.to_bytes(
      source_char, source_char + length);
}
} // namespace voltron
