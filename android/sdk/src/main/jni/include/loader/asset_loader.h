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

#include <android/asset_manager.h>

#include "loader/adr_loader.h"

class AssetLoader : public ADRLoader {
 public:
  AssetLoader(AAssetManager* asset_manager, const std::string& base);
  virtual ~AssetLoader(){}

  static std::string ReadAssetFile(AAssetManager* asset_manager,
                                   const std::string& file_path,
                                   bool is_auto_fill = false);

  virtual std::string Load(const std::string& uri);

 private:
  bool CheckValid(const std::string& path);
  AAssetManager* asset_manager_;
};
