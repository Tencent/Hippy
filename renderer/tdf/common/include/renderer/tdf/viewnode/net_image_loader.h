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
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wextra-semi"
#pragma clang diagnostic ignored "-Wsign-conversion"
#pragma clang diagnostic ignored "-Wimplicit-int-conversion"
#pragma clang diagnostic ignored "-Wimplicit-int-float-conversion"
#pragma clang diagnostic ignored "-Wimplicit-float-conversion"
#pragma clang diagnostic ignored "-Wfloat-conversion"
#pragma clang diagnostic ignored "-Wignored-qualifiers"
#include "core/common/time.h"
#include "core/engine/schedule/task_runner.h"
#include "core/engine/schedule/thread_task_driver.h"
#include "tdfui/image/image_load_manager.h"
#include "renderer/tdf/viewnode/root_view_node.h"
#pragma clang diagnostic pop
#include "footstone//string_view_utils.h"

namespace hippy {
inline namespace render {
inline namespace tdf {

class NetImageLoader : public tdfcore::ImageLoader, public std::enable_shared_from_this<NetImageLoader> {
 public:
  ~NetImageLoader() override = default;
  NetImageLoader(std::string_view scheme, UriDataGetter uri_data_getter);

  std::shared_ptr<tdfcore::Task> Load(const std::string &url,
                                      const ProgressCallback &progress_callback,
                                      const FinishCallback &finish_callback) override;

 private:
  std::string scheme_;
  UriDataGetter uri_data_getter_;
};

}  // namespace tdf
}  // namespace render
}  // namespace hippy
