/*
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

#include <unordered_map>

#include "footstone/string_view.h"
#include "footstone/worker_manager.h"

namespace hippy {
inline namespace vfs {

class RequestJob {
 public:
  using string_view = footstone::string_view;
  using WorkerManager = footstone::WorkerManager;
  using bytes = std::string;

  RequestJob(const string_view& uri, std::unordered_map<std::string, std::string> meta,
             std::unique_ptr<WorkerManager>& worker_manager);
  RequestJob(const string_view& uri, std::unordered_map<std::string, std::string> meta,
             std::unique_ptr<WorkerManager>& worker_manager,
             std::function<void(int64_t current, int64_t total)> progress_cb);
  RequestJob(const string_view& uri, std::unordered_map<std::string, std::string> meta,
             std::unique_ptr<WorkerManager>& worker_manager,
             std::function<void(int64_t current, int64_t total)> progress_cb, bytes&& buffer);
  virtual ~RequestJob() = default;
  RequestJob(const RequestJob&) = delete;
  RequestJob& operator=(const RequestJob&) = delete;

  inline auto GetUri() const {
    return uri_;
  }

  inline auto& GetMeta() const {
    return meta_;
  }

  inline std::unique_ptr<WorkerManager>& GetWorkerManager() {
    return worker_manager_;
  }

  inline auto GetProgressCallback() {
    return progress_cb_;
  }

  inline auto& GetBuffer() {
    return buffer_;
  }

 private:
  string_view uri_;
  std::unordered_map<std::string, std::string> meta_;
  std::unique_ptr<WorkerManager>& worker_manager_;
  std::function<void(int64_t current, int64_t total)> progress_cb_;
  bytes buffer_; // request body buffer
};

}
}
