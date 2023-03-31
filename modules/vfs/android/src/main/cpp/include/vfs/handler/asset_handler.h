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
#include <android/asset_manager_jni.h>

#include "footstone/string_view.h"
#include "footstone/task_runner.h"
#include "vfs/handler/uri_handler.h"
#include "jni/scoped_java_ref.h"

namespace hippy {
inline namespace vfs {

class AssetHandler : public UriHandler {
 public:
  using string_view = footstone::string_view;
  using TaskRunner = footstone::TaskRunner;

  AssetHandler() = default;
  virtual ~AssetHandler() = default;

  static void Init(JNIEnv* j_env);
  static void Destroy(JNIEnv* j_env);

  virtual void RequestUntrustedContent(
      std::shared_ptr<RequestJob> request,
      std::shared_ptr<JobResponse> response,
      std::function<std::shared_ptr<UriHandler>()> next) override;
  virtual void RequestUntrustedContent(
      std::shared_ptr<RequestJob> request,
      std::function<void(std::shared_ptr<JobResponse>)> cb,
      std::function<std::shared_ptr<UriHandler>()> next) override;
 private:
  void LoadByAsset(const string_view& path,
                   std::shared_ptr<RequestJob> request,
                   std::function<void(std::shared_ptr<JobResponse>)> cb,
                   std::function<std::shared_ptr<UriHandler>()> next,
                   bool is_auto_fill = false);

  std::shared_ptr<TaskRunner> runner_;
  std::mutex mutex_;
};

}
}
