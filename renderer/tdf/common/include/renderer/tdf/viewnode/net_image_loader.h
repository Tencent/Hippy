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
#include "footstone//unicode_string_view.h"

namespace tdfrender {

using StringView = footstone::unicode_string_view;
using DataCb = std::function<void(StringView::u8string)>;
using UriDataGetter = std::function<bool(const StringView &uri, DataCb cb)>;

/// TODO(kloudwang) 到时跟Base64ImageLoader统一走VFS
class NetImageLoader : public tdfcore::ImageLoader, public std::enable_shared_from_this<NetImageLoader> {
 public:
  ~NetImageLoader() override = default;
  NetImageLoader(std::string_view scheme, UriDataGetter uri_data_getter);

  std::shared_ptr<tdfcore::Task> Load(const std::string &url, const LoadCallback &loader_callback) override;

 private:
  std::string scheme_;
  UriDataGetter uri_data_getter_;
};

}  // namespace tdfrender
