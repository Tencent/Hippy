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

#include "loader/file_loader.h"

#include "jni/uri.h"

bool FileLoader::CheckValid(const std::string& path) {
  auto pos = path.find_first_of(base_, 0);
  if (pos == 0) {
    return true;
  }

  return false;
}

FileLoader::FileLoader(const std::string& base) : ADRLoader(base) {}

std::string FileLoader::Load(
    const std::string& uri) {
  std::string ret;
  if (CheckValid(uri)) {
    std::shared_ptr<Uri> uri_obj = std::make_shared<Uri>(uri);
    std::string path = uri_obj->GetPath();
    ret = hippy::base::HippyFile::ReadFile(path.c_str(), false);
  }
  return ret;
}
