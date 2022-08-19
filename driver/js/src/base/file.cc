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

#include "driver/base/file.h"

#include <dirent.h>
#include <sys/stat.h>
#include <iostream>

namespace hippy {
inline namespace driver {
inline namespace base {

using StringViewUtils = footstone::stringview::StringViewUtils;

bool HippyFile::SaveFile(const unicode_string_view& file_path,
                         const std::string& content,
                         std::ios::openmode mode) {
  FOOTSTONE_DLOG(INFO) << "SaveFile file_path = " << file_path;
  auto path_str = StringViewUtils::ConvertEncoding(file_path,
                                                   unicode_string_view::Encoding::Utf8).utf8_value();
  std::ofstream file(reinterpret_cast<const char*>(path_str.c_str()), mode);
  if (file.is_open()) {
    std::streamsize len;
    bool is_success = footstone::numeric_cast<size_t, std::streamsize>(content.length(), len);
    if (is_success) {
      file.write(content.c_str(), len);
    }
    file.close();
    return is_success;
  } else {
    return false;
  }
}

int HippyFile::RmFullPath(const unicode_string_view& dir_full_path) {
  FOOTSTONE_DLOG(INFO) << "RmFullPath dir_full_path = " << dir_full_path;
  auto path_str = StringViewUtils::ConvertEncoding(dir_full_path,
                                                   unicode_string_view::Encoding::Utf8).utf8_value();
  auto path = reinterpret_cast<const char*>(path_str.c_str());
  DIR* dir_parent = opendir(path);
  if (!dir_parent) {
    FOOTSTONE_DLOG(INFO) << "RmFullPath dir_parent null";
    return -1;
  }
  struct dirent* dir;
  struct stat st{};
  while ((dir = readdir(dir_parent)) != nullptr) {
    if (strcmp(dir->d_name, ".") == 0 || strcmp(dir->d_name, "..") == 0) {
      continue;
    }
    std::string sub_path = std::string(path) + '/' + std::string(dir->d_name);
    unicode_string_view view_sub_path(reinterpret_cast<const unicode_string_view::char8_t_*>(
        sub_path.c_str()), sub_path.length());
    FOOTSTONE_DLOG(INFO) << "RmFullPath sub_path = " << sub_path;
    if (lstat(sub_path.c_str(), &st) == -1) {
      continue;
    }
    if (S_ISDIR(st.st_mode)) {
      if (RmFullPath(view_sub_path) == -1) {  // 如果是目录文件，递归删除
        return -1;
      }
      rmdir(sub_path.c_str());
    } else if (S_ISREG(st.st_mode)) {
      unlink(sub_path.c_str());  // 如果是普通文件，则unlink
    } else {
      continue;
    }
  }
  if (rmdir(path) == -1) {
    FOOTSTONE_DLOG(INFO) << "RmFullPath delete dir_full_path fail, path = "
                         << dir_full_path;
    closedir(dir_parent);
    return -1;
  }
  closedir(dir_parent);
  FOOTSTONE_DLOG(INFO) << "RmFullPath succ";
  return 0;
}

int HippyFile::CreateDir(const unicode_string_view& dir_path, mode_t mode) {
  FOOTSTONE_DLOG(INFO) << "CreateDir path = " << dir_path;
  auto path_str = StringViewUtils::ConvertEncoding(dir_path,
                                                   unicode_string_view::Encoding::Utf8).utf8_value();
  return mkdir(reinterpret_cast<const char*>(path_str.c_str()), mode);
}

int HippyFile::CheckDir(const unicode_string_view& dir_path, int mode) {
  FOOTSTONE_DLOG(INFO) << "CheckDir path = " << dir_path;
  auto path_str = StringViewUtils::ConvertEncoding(dir_path,
                                                   unicode_string_view::Encoding::Utf8).utf8_value();
  return access(reinterpret_cast<const char*>(path_str.c_str()), mode);
}

uint64_t HippyFile::GetFileModifyTime(const unicode_string_view& file_path) {
  FOOTSTONE_DLOG(INFO) << "GetFileModifyTime file_path = " << file_path;
  auto path_str = StringViewUtils::ConvertEncoding(file_path,
                                                   unicode_string_view::Encoding::Utf8).utf8_value();
  auto path =  reinterpret_cast<const char*>(path_str.c_str());
  struct stat statInfo{};
  FILE* fp = fopen(path, "r");
  if (fp == nullptr) {
    return 0;
  }
  int fd = fileno(fp);
  if (fstat(fd, &statInfo)) {
    return 0;
  }
  uint64_t modify_time = footstone::checked_numeric_cast<time_t, uint64_t>(statInfo.st_mtime);
  FOOTSTONE_DLOG(INFO) << "modify_time = " << modify_time;
  fclose(fp);
  return modify_time;
}

} // namespace base
} // namespace driver
} // namespace hippy
