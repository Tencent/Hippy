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

#include "core/base/file.h"

#include <dirent.h>
#include <sys/stat.h>

#include <iostream>

namespace hippy {
namespace base {

using unicode_string_view = tdf::base::unicode_string_view;

bool HippyFile::ReadFile(const unicode_string_view& file_path,
                         const std::function<void*(size_t)>& realloc,
                         bool is_auto_fill) {
  auto path_str = StringViewUtils::Convert(
      file_path, unicode_string_view::Encoding::Utf8).utf8_value();
  std::ifstream file(reinterpret_cast<const char*>(path_str.c_str()));
  if (!file.fail()) {
    file.ignore(std::numeric_limits<std::streamsize>::max());
    std::streamsize size = file.gcount();
    file.clear();
    file.seekg(0, std::ios_base::beg);
    size_t data_size;
    if (!numeric_cast<std::streamsize, size_t>(size + (is_auto_fill ? 1 : 0), data_size)) {
      file.close();
      return false;
    }
    auto pointer = realloc(data_size);
    auto read_size = file.read(reinterpret_cast<char*>(pointer), size).gcount();
    if (size != read_size) {
      TDF_BASE_DLOG(WARNING)
      << "ReadFile file_path = " << file_path << ", size = " << size
      << ", read_size = " << read_size;
    }
    if (is_auto_fill) {
      *(reinterpret_cast<char*>(pointer) + data_size) = '\0';
    }
    file.close();
    TDF_BASE_DLOG(INFO) << "ReadFile succ, file_path = " << file_path
                        << ", size = " << size
                        << ", read_size = " << read_size;
    return true;
  }
  TDF_BASE_DLOG(INFO) << "ReadFile fail, file_path = " << file_path;
  return false;
}

int HippyFile::RmFile(const unicode_string_view& file_path) {
  TDF_BASE_DLOG(INFO) << "RmFile file_path = " << file_path;
  unicode_string_view owner(u8""_u8s);
  const char* path = StringViewUtils::ToConstCharPointer(file_path, owner);
  unlink(path);
  return 0;
}

int HippyFile::RmFullPath(const unicode_string_view& dir_full_path) {
  TDF_BASE_DLOG(INFO) << "RmFullPath dir_full_path = " << dir_full_path;
  unicode_string_view owner(u8""_u8s);
  const char* path = StringViewUtils::ToConstCharPointer(dir_full_path, owner);
  DIR* dir_parent = opendir(path);
  if (!dir_parent) {
    TDF_BASE_DLOG(INFO) << "RmFullPath dir_parent null";
    return -1;
  }
  struct dirent* dir;
  struct stat st{};
  while ((dir = readdir(dir_parent)) != nullptr) {
    if (strcmp(dir->d_name, ".") == 0 || strcmp(dir->d_name, "..") == 0) {
      continue;
    }
    std::string sub_path = std::string(path) + '/' + std::string(dir->d_name);
    unicode_string_view view_sub_path =
        StringViewUtils::ConstCharPointerToStrView(sub_path.c_str(),
                                                   sub_path.length());
    TDF_BASE_DLOG(INFO) << "RmFullPath sub_path = " << sub_path;
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
    TDF_BASE_DLOG(INFO) << "RmFullPath delete dir_full_path fail, path = "
                        << dir_full_path;
    closedir(dir_parent);
    return -1;
  }
  closedir(dir_parent);
  TDF_BASE_DLOG(INFO) << "RmFullPath succ";
  return 0;
}

int HippyFile::CreateDir(const unicode_string_view& path, mode_t mode) {
  TDF_BASE_DLOG(INFO) << "CreateDir path = " << path;
  unicode_string_view owner(u8""_u8s);
  const char* dir_path = StringViewUtils::ToConstCharPointer(path, owner);
  return mkdir(dir_path, mode);
}

int HippyFile::CheckDir(const unicode_string_view& path, int mode) {
  TDF_BASE_DLOG(INFO) << "CheckDir path = " << path;
  unicode_string_view owner(u8""_u8s);
  const char* dir_path = StringViewUtils::ToConstCharPointer(path, owner);
  return access(dir_path, mode);
}

uint64_t HippyFile::GetFileModifytime(const unicode_string_view& file_path) {
  TDF_BASE_DLOG(INFO) << "GetFileModifytime file_path = " << file_path;
  unicode_string_view view_owner(u8""_u8s);
  const char* path = StringViewUtils::ToConstCharPointer(file_path, view_owner);
  struct stat statInfo{};
  FILE* fp = fopen(path, "r");
  if (fp == nullptr) {
    return 0;
  }
  int fd = fileno(fp);
  if (fstat(fd, &statInfo)) {
    return 0;
  }
  uint64_t modify_time = checked_numeric_cast<time_t, uint64_t>(statInfo.st_mtime);
  TDF_BASE_DLOG(INFO) << "modify_time = " << modify_time;
  fclose(fp);
  return modify_time;
}
}  // namespace base
}  // namespace hippy
