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

#include "loader/asset_loader.h"

#include "jni/uri.h"

std::string AssetLoader::ReadAssetFile(AAssetManager* asset_manager,
                                       const std::string& file_path,
                                       bool is_auto_fill) {
  HIPPY_LOG(hippy::Debug, "ReadAssetFile file_path = %s", file_path.c_str());

  std::shared_ptr<Uri> uri_obj = std::make_shared<Uri>(file_path);
  std::string path = uri_obj->GetPath();
  if (path.length() > 0 && path[0] == '/') {
    path = path.substr(1);
  }
  HIPPY_LOG(hippy::Debug, "path = %s", path.c_str());
  auto asset =
      AAssetManager_open(asset_manager, path.c_str(), AASSET_MODE_STREAMING);
  std::string file_data;
  if (asset) {
    int size = AAsset_getLength(asset);
    if (is_auto_fill) {
      size += 1;
    }
    file_data.resize(size);
    int offset = 0;
    int readbytes;
    while ((readbytes = AAsset_read(asset, &file_data[0] + offset,
                                    file_data.size() - offset)) > 0) {
      offset += readbytes;
    }
    if (is_auto_fill) {
      file_data.back() = '\0';
    }
    AAsset_close(asset);
  }
  HIPPY_DLOG(hippy::Debug, "file_path = %s, len = %d,  file_data = %s",
             file_path.c_str(), file_data.length(), file_data.c_str());
  return file_data;
}

bool AssetLoader::CheckValid(const std::string& path) {
  auto pos = path.find_first_of(base_, 0);
  if (pos == 0) {
    return true;
  }

  return false;
}

AssetLoader::AssetLoader(AAssetManager* asset_manager,
                         const std::string& base)
    : ADRLoader(base), asset_manager_(asset_manager) {}

std::string AssetLoader::Load(const std::string& uri) {
  return ReadAssetFile(asset_manager_, uri, false);
}
