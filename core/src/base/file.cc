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
#include <vector>

#include "base/logging.h"

namespace hippy {
namespace base {

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

std::string HippyFile::ReadFile(const char* file_path, bool is_auto_fill) {
  std::ifstream file(file_path);
  std::string ret;
  if (!file.fail()) {
    file.ignore(std::numeric_limits<std::streamsize>::max());
    std::streamsize size = file.gcount();
    file.clear();
    file.seekg(0, std::ios_base::beg);
    long data_size = size;
    if (is_auto_fill) {
      data_size += 1;
    }
    ret.resize(data_size);
    long read_size = file.read(&ret[0], size).gcount();
    if (size != read_size) {
      TDF_BASE_DLOG(WARNING)
          << "ReadFile file_path = " << file_path << ", size = " << size
          << ", read_size = " << read_size;
    }
    if (is_auto_fill) {
      ret.back() = '\0';
    }
    file.close();
    TDF_BASE_DLOG(INFO) << "ReadFile succ, file_path = " << file_path
                        << ", size = " << size << ", read_size = " << read_size;
  } else {
    TDF_BASE_DLOG(INFO) << "ReadFile fail, file_path = " << file_path;
  }

  return ret;
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
    TDF_BASE_DLOG(INFO) << "RmFullPath dir = " << dir;
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

uint64_t HippyFile::GetFileModifytime(const std::string& file_path) {
  TDF_BASE_DLOG(INFO) << "GetFileModifytime file_path = " << file_path;
  struct stat statInfo;

  FILE* fp = fopen(file_path.c_str(), "r");
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
