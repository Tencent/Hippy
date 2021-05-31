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

#include <fstream>
#include <iostream>
#include <string>
#include <vector>

#include "base/logging.h"
#include "base/unicode_string_view.h"
#include "core/base/string_view_utils.h"

namespace hippy {
namespace base {

using unicode_string_view = tdf::base::unicode_string_view;
using StringViewUtils = hippy::base::StringViewUtils;

bool HippyFile::SaveFile(const char* file_path,
                         const std::string& content,
                         std::ios::openmode mode) {
  TDF_BASE_DLOG(INFO) << "SaveFile file_path = " << file_path;
  std::ofstream file(file_path, mode);
  if (file.is_open()) {
    file.write(content.c_str(), content.length());
    file.close();
    return true;
  } else {
    return false;
  }
}

int HippyFile::RmFullPath(std::string dir_full_path) {
  TDF_BASE_DLOG(INFO) << "RmFullPath dir_full_path = " << dir_full_path;
  DIR* dir_parent = opendir(dir_full_path.c_str());
  if (!dir_parent) {
    TDF_BASE_DLOG(INFO) << "RmFullPath dir_parent null";
    return -1;
  }
  struct dirent* dir;
  struct stat st;
  while ((dir = readdir(dir_parent)) != nullptr) {
    if (strcmp(dir->d_name, ".") == 0 || strcmp(dir->d_name, "..") == 0) {
      continue;
    }
    std::string sub_path = dir_full_path + '/' + dir->d_name;
    TDF_BASE_DLOG(INFO) << "RmFullPath sub_path = " << sub_path;
    if (lstat(sub_path.c_str(), &st) == -1) {
      continue;
    }
    if (S_ISDIR(st.st_mode)) {
      if (RmFullPath(sub_path) == -1) {  // 如果是目录文件，递归删除
        return -1;
      }
      rmdir(sub_path.c_str());
    } else if (S_ISREG(st.st_mode)) {
      unlink(sub_path.c_str());  // 如果是普通文件，则unlink
    } else {
      continue;
    }
  }
  if (rmdir(dir_full_path.c_str()) == -1) {
    TDF_BASE_DLOG(INFO) << "RmFullPath delete dir_full_path fail, path = "
                        << dir_full_path;
    closedir(dir_parent);
    return -1;
  }
  closedir(dir_parent);
  TDF_BASE_DLOG(INFO) << "RmFullPath succ";
  return 0;
}

int HippyFile::CreateDir(const char* path, mode_t mode) {
  TDF_BASE_DLOG(INFO) << "CreateDir path = " << path;
  return mkdir(path, mode);
}

int HippyFile::CheckDir(const char* path, int mode) {
  TDF_BASE_DLOG(INFO) << "CheckDir path = " << path;
  return access(path, mode);
}

uint64_t HippyFile::GetFileModifytime(const char* file_path) {
  TDF_BASE_DLOG(INFO) << "GetFileModifytime file_path = " << file_path;
  struct stat statInfo;

  FILE* fp = fopen(file_path, "r");
  if (fp == nullptr) {
    return 0;
  }
  int fd = fileno(fp);
  if (fstat(fd, &statInfo)) {
    return 0;
  }
  uint64_t modify_time = statInfo.st_mtime;
  TDF_BASE_DLOG(INFO) << "modify_time = " << modify_time;
  fclose(fp);
  return modify_time;
}
}  // namespace base
}  // namespace hippy
