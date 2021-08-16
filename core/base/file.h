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

#ifndef HIPPY_BASE_FILE_H
#define HIPPY_BASE_FILE_H

#include <sys/types.h>
#include <unistd.h>

#include <iostream>
#include <memory>
#include <string>
#include <vector>

#ifdef OS_ANDROID
#include <android/asset_manager.h>
#endif  // OS_ANDROID

namespace hippy {
namespace base {

class HippyFile {
 public:
  static bool SaveFile(const char* file_name,
                       std::shared_ptr<std::vector<char>> content,
                       std::ios::openmode mode = std::ios::out |
                                                 std::ios::binary |
                                                 std::ios::trunc);
  static std::unique_ptr<std::vector<char>> ReadFile(const char* file_path,
                                                     bool is_auto_fill = false);
#ifdef OS_ANDROID
  static std::unique_ptr<std::vector<char>> ReadAssetFile(
      AAssetManager* asset_manager,
      const char* file_path,
      bool is_auto_fill = false);
#endif

  static int RmFullPath(std::string dir_full_path);
  static int CreateDir(const char* path, mode_t mode);
  static int CheckDir(const char* path, int mode);
  static uint64_t GetFileModifytime(const std::string& file_path);
};
}  // namespace base
}  // namespace hippy
#endif  // HIPPY_BASE_FILE_H