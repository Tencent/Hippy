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

#include "core/base/logging.h"

namespace hippy {
namespace base {

bool HippyFile::SaveFile(const char* file_path,
                         const std::string& content,
                         std::ios::openmode mode) {
  HIPPY_LOG(hippy::Debug, "SaveFile file_path = %s", file_path);
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
      HIPPY_LOG(hippy::Warning,
                "ReadFile file_path = %s, size = %d, read_size = %d", file_path,
                size, read_size);
    }
    if (is_auto_fill) {
      ret.back() = '\0';
    }
    file.close();
    HIPPY_DLOG(hippy::Debug,
               "ReadFile succ, file_path = %s, size = %d, read_size = %d",
               file_path, size, read_size);
  } else {
    HIPPY_DLOG(hippy::Debug, "ReadFile fail, file_path = %s", file_path);
  }

  return ret;
}

int HippyFile::RmFullPath(std::string dir_full_path) {
  HIPPY_DLOG(hippy::Debug, "RmFullPath dir_full_path = %s",
             dir_full_path.c_str());
  DIR* dir_parent = opendir(dir_full_path.c_str());
  if (!dir_parent) {
    HIPPY_DLOG(hippy::Debug, "RmFullPath dir_parent null");
    return -1;
  }
  struct dirent* dir;
  struct stat st;
  while ((dir = readdir(dir_parent)) != nullptr) {
    HIPPY_DLOG(hippy::Debug, "RmFullPath dir %d", dir);
    if (strcmp(dir->d_name, ".") == 0 || strcmp(dir->d_name, "..") == 0) {
      continue;
    }
    std::string sub_path = dir_full_path + '/' + dir->d_name;
    HIPPY_LOG(hippy::Debug, "RmFullPath sub_path %s", sub_path.c_str());
    if (lstat(sub_path.c_str(), &st) == -1) {
      continue;
    }
    if (S_ISDIR(st.st_mode)) {
      if (RmFullPath(sub_path) == -1)  // 如果是目录文件，递归删除
      {
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
    HIPPY_LOG(hippy::Debug, "RmFullPath delete dir_full_path fail %s",
              dir_full_path.c_str());
    closedir(dir_parent);
    return -1;
  }
  closedir(dir_parent);
  HIPPY_DLOG(hippy::Debug, "RmFullPath succ");
  return 0;
}

int HippyFile::CreateDir(const char* path, mode_t mode) {
  HIPPY_DLOG(hippy::Debug, "CreateDir path = %s", path);
  return mkdir(path, mode);
}

int HippyFile::CheckDir(const char* path, int mode) {
  HIPPY_DLOG(hippy::Debug, "CheckDir path = %s", path);
  return access(path, mode);
};

uint64_t HippyFile::GetFileModifytime(const std::string& file_path) {
  HIPPY_LOG(hippy::Debug, "GetFileModifytime file_path = %s",
            file_path.c_str());
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
  HIPPY_LOG(hippy::Debug, "modify_time = %d", modify_time);
  fclose(fp);
  return modify_time;
}
}  // namespace base
}  // namespace hippy
