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

#include "footstone/string_view.h"
#include "footstone/task_runner.h"
#include "vfs/uri_handler.h"
#include "jni/scoped_java_ref.h"

namespace hippy {
inline namespace vfs {

class AssetHandler : public UriHandler {
 public:
  using string_view = footstone::string_view;
  using TaskRunner = footstone::TaskRunner;

  AssetHandler() = default;
  virtual ~AssetHandler() = default;

  inline void SetAAssetManager(AAssetManager* aasset_manager) {
    aasset_manager_ = aasset_manager;
  }

  inline void SetWorkerTaskRunner(std::weak_ptr<TaskRunner> runner) {
    runner_ = runner;
  }

  virtual void RequestUntrustedContent(
      std::shared_ptr<SyncContext> ctx,
      std::function<std::shared_ptr<UriHandler>()> next) override;
  virtual void RequestUntrustedContent(
      std::shared_ptr<ASyncContext> ctx,
      std::function<std::shared_ptr<UriHandler>()> next) override;
 private:
  bool LoadByAsset(const string_view& file_path,
                   std::function<void(UriHandler::RetCode, std::unordered_map<std::string, std::string>, UriHandler::bytes)> cb,
                   bool is_auto_fill = false);

  AAssetManager* aasset_manager_;
  std::weak_ptr<TaskRunner> runner_;
};

}
}
