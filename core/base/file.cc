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
#include <vector>

#include "core/base/logging.h"

namespace hippy {
namespace base {

bool HippyFile::SaveFile(const char* file_path,
                         std::shared_ptr<std::vector<char>> content,
                         std::ios::openmode mode) {
  HIPPY_LOG(hippy::Debug, "SaveFile file_path = %s", file_path);
  std::ofstream file(file_path, mode);
  if (file.is_open()) {
    file.write(content->data(), content->size());
    file.close();
    return true;
  } else {
    return false;
  }
}

std::unique_ptr<std::vector<char>> HippyFile::ReadFile(const char* file_path,
                                                       bool is_auto_fill) {
  HIPPY_LOG(hippy::Debug, "ReadFile file_path = %s", file_path);
  std::ifstream file(file_path);
  std::vector<char> file_data;

  if (!file.fail()) {
    file.seekg(0, std::ios::end);
    int size = file.tellg();
    if (is_auto_fill) {  // Hippy场景
                         // JSC需要末尾补结束符，此处多分配一个字节，避免之后的操作拷贝
      size += 1;
    }
    file_data.resize(size);
    file.seekg(0, std::ios::beg);
    file.read(file_data.data(), file_data.size());
    if (is_auto_fill) {
      file_data.back() = 0;
    }
    file.close();
    HIPPY_LOG(hippy::Debug, "ReadFile succ");
  } else {
    HIPPY_LOG(hippy::Debug, "ReadFile fail");
  }
  return std::make_unique<std::vector<char>>(std::move(file_data));
}

int HippyFile::RmFullPath(std::string dir_full_path) {
  HIPPY_LOG(hippy::Debug, "RmFullPath dir_full_path = %s",
            dir_full_path.c_str());
  DIR* dir_parent = opendir(dir_full_path.c_str());
  if (!dir_parent) {
    HIPPY_LOG(hippy::Debug, "RmFullPath dir_parent null");
    return -1;
  }
  struct dirent* dir;
  struct stat st;
  while ((dir = readdir(dir_parent)) != nullptr) {
    HIPPY_LOG(hippy::Debug, "RmFullPath dir %d", dir);
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
  HIPPY_LOG(hippy::Debug, "RmFullPath succ");
  return 0;
}

int HippyFile::CreateDir(const char* path, mode_t mode) {
  HIPPY_LOG(hippy::Debug, "CreateDir path = %s", path);
  return mkdir(path, mode);
}

int HippyFile::CheckDir(const char* path, int mode) {
  HIPPY_LOG(hippy::Debug, "CheckDir path = %s", path);
  return access(path, mode);
};

#ifdef OS_ANDROID

std::unique_ptr<std::vector<char>> HippyFile::ReadAssetFile(
    AAssetManager* asset_manager,
    const char* file_path,
    bool is_auto_fill) {
  HIPPY_LOG(hippy::Debug, "ReadAssetFile file_path = %s", file_path);
  auto asset =
      AAssetManager_open(asset_manager, file_path, AASSET_MODE_STREAMING);
  std::vector<char> file_data;
  if (asset) {
    int size = AAsset_getLength(asset);
    if (is_auto_fill) {
      size += 1;
    }
    file_data.resize(size);
    int offset = 0;
    int readbytes;
    while ((readbytes = AAsset_read(asset, file_data.data() + offset,
                                    file_data.size() - offset)) > 0) {
      offset += readbytes;
    }
    if (is_auto_fill) {
      file_data.back();
    }
    AAsset_close(asset);
  }
  return std::make_unique<std::vector<char>>(std::move(file_data));
}

#endif  // OS_ANDROID

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