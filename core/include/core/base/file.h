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

#include <sys/types.h>
#include <unistd.h>

#include <fstream>
#include <memory>
#include <string>
#include <vector>

#include "base/logging.h"
#include "base/unicode_string_view.h"
#include "core/base/common.h"
#include "core/base/string_view_utils.h"

namespace hippy {
namespace base {

class HippyFile {
 public:
  using unicode_string_view = tdf::base::unicode_string_view;
  static int RmFile(const unicode_string_view& file_path);
  static int RmFullPath(const unicode_string_view& dir_full_path);
  static int CreateDir(const unicode_string_view& path, mode_t mode);
  static int CheckDir(const unicode_string_view& path, int mode);
  static uint64_t GetFileModifytime(const unicode_string_view& file_path);

  static bool ReadFile(const unicode_string_view& file_path,
                       const std::function<void*(size_t)>& realloc,
                       bool is_auto_fill);

  template <typename CharType>
  static bool ReadFile(const unicode_string_view& file_path,
                       std::basic_string<CharType>& buffer,
                       bool is_auto_fill) {
    return ReadFile(file_path, [&buffer](size_t length) {
      buffer.resize(length);
      return &buffer[0];
    }, is_auto_fill);
  }

  template <typename CharType>
  static bool ReadFile(const unicode_string_view& file_path,
                       std::vector<CharType>& buffer,
                       bool is_auto_fill) {
    return ReadFile(file_path, [&buffer](size_t length) {
      buffer.resize(length);
      return &buffer[0];
    }, is_auto_fill);
  }

  template <typename CharType>
  static bool SaveFile(const unicode_string_view& file_path,
                       const CharType* pointer,
                       size_t length,
                       std::ios::openmode mode = std::ios::out |
                           std::ios::binary |
                           std::ios::trunc) {
    TDF_BASE_DLOG(INFO) << "SaveFile file_path = " << file_path;
    auto path_str = StringViewUtils::Convert(
        file_path, unicode_string_view::Encoding::Utf8).utf8_value();
    std::ofstream file(reinterpret_cast<const char*>(path_str.c_str()), mode);
    if (file.is_open()) {
      std::streamsize len;
      bool is_success = numeric_cast<size_t, std::streamsize>(length, len);
      if (is_success) {
        file.write(reinterpret_cast<const char*>(pointer), len);
      }
      file.close();
      return is_success;
    } else {
      return false;
    }
  }

  template<typename CharType>
  static bool SaveFile(const unicode_string_view& file_name,
                       const std::basic_string<CharType>& content,
                       std::ios::openmode mode = std::ios::out |
                           std::ios::binary |
                           std::ios::trunc) {
    return SaveFile(file_name, content.c_str(), content.length(), mode);
  }

  template<typename CharType>
  static bool SaveFile(const unicode_string_view& file_name,
                       const std::vector<CharType>& content,
                       std::ios::openmode mode = std::ios::out |
                           std::ios::binary |
                           std::ios::trunc) {
    return SaveFile(file_name, content.data(), content.size(), mode);
  }
};
}  // namespace base
}  // namespace hippy
