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

#include "vfs/request_job.h"

#include <utility>

namespace hippy {
inline namespace vfs {

RequestJob::RequestJob(const RequestJob::string_view& uri,
                       std::unordered_map<std::string, std::string> meta,
                       std::unique_ptr<WorkerManager>& worker_manager):
                       RequestJob(uri, std::move(meta), worker_manager, nullptr) {}

RequestJob::RequestJob(const RequestJob::string_view& uri,
                       std::unordered_map<std::string, std::string> meta,
                       std::unique_ptr<WorkerManager>& worker_manager,
                       std::function<void(int64_t current, int64_t total)> progress_cb):
                       RequestJob(uri, std::move(meta), worker_manager,
                                                   std::move(progress_cb), "") {}

RequestJob::RequestJob(const string_view& uri, std::unordered_map<std::string, std::string> meta,
                       std::unique_ptr<WorkerManager>& worker_manager,
                       std::function<void(int64_t current, int64_t total)> progress_cb, bytes&& buffer):
           uri_(uri), meta_(std::move(meta)), worker_manager_(worker_manager),
           progress_cb_(std::move(progress_cb)), buffer_(std::move(buffer)) {}

}
}
