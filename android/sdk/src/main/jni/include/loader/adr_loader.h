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

#include "core/core.h"
#include "jni/scoped_java_ref.h"

class ADRLoader : public hippy::base::UriLoader {
 public:
  ADRLoader();
  virtual ~ADRLoader() {}

  static std::string LoadByFile(const std::string& path);
  static std::string LoadByAsset(const std::string& file_path,
                                 AAssetManager* asset_manager,
                                 bool is_auto_fill = false);
  static std::string LoadByHttp(const std::string& uri,
                                std::shared_ptr<JavaRef> bridge);

  inline void SetBridge(std::shared_ptr<JavaRef> bridge) { bridge_ = bridge; }
  inline void SetAAssetManager(AAssetManager* aasset_manager) {
    aasset_manager_ = aasset_manager;
  }

  virtual std::string LoadUntrustedContent(const std::string& uri);

 protected:
  std::string base_;
  std::shared_ptr<JavaRef> bridge_;
  AAssetManager* aasset_manager_;
};
