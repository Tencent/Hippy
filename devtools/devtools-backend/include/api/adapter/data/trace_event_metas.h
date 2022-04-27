/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
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

#include <chrono>
#include <string>
#include <thread>
#include <vector>
#include "api/adapter/data/serializable.h"

namespace hippy {
namespace devtools {
using ThreadId = uint32_t;
using TimeInterval = std::chrono::time_point<std::chrono::steady_clock>;

struct TraceMeta {
  std::string name_;
  TimeInterval timestamp_;
  ThreadId thread_id_;
  std::string event_;
  int64_t group_id_ = 0;
  TraceMeta(std::string name, TimeInterval timestamp, ThreadId thread_id, std::string event)
      : name_(name), timestamp_(timestamp), thread_id_(thread_id), event_(event) {}
};

struct ThreadMeta {
  std::string thread_name_;
  ThreadId thread_id_;
  ThreadMeta(std::string thread_name, ThreadId thread_id) : thread_name_(thread_name), thread_id_(thread_id) {}
};

class TraceEventMetas : public Serializable {
 public:
  void AddTraceMeta(const TraceMeta &meta);
  void AddThreadMeta(const ThreadMeta &meta);
  std::string Serialize() const override;

 private:
  std::string SerializeTrace() const;
  std::string SerializeThread() const;
  std::vector<TraceMeta> trace_metas_;
  std::vector<ThreadMeta> thread_metas_;
};
}  // namespace devtools
}  // namespace hippy
