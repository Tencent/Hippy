/**
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#pragma once

#include "core/common/time.h"
#include "core/engine/schedule/task_runner.h"
#include "core/engine/schedule/thread_task_driver.h"
#include "core/support/image/image_load_manager.h"

namespace tdfrender {

constexpr const char kBase64Scheme[] = "data:image/png;base64";

class Base64ImageLoader : public tdfcore::ImageLoader, public std::enable_shared_from_this<Base64ImageLoader> {
 public:
  ~Base64ImageLoader() override = default;
  Base64ImageLoader() = default;

  std::shared_ptr<tdfcore::Task> Load(const std::string &url, const LoadCallback &loader_callback) override;

  static std::string GetScheme() { return kBase64Scheme; }

 private:
  std::string scheme_tag_ = "base64,";
};

}  // namespace tdfrender
