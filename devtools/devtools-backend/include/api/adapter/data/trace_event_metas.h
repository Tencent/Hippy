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

namespace hippy::devtools {
using ThreadId = uint32_t;
using TimeInterval = std::chrono::time_point<std::chrono::steady_clock>;

struct TraceMeta {
  std::string name;
  TimeInterval timestamp;
  ThreadId thread_id;
  std::string event;
  int64_t group_id = 0;
  TraceMeta(std::string name, TimeInterval timestamp, ThreadId thread_id, std::string event)
      : name(name), timestamp(timestamp), thread_id(thread_id), event(event) {}
};

struct ThreadMeta {
  std::string thread_name;
  ThreadId thread_id;
  ThreadMeta(std::string thread_name, ThreadId thread_id) : thread_name(thread_name), thread_id(thread_id) {}
};

class TraceEventMetas : public Serializable {
 public:
  inline void AddTraceMeta(const TraceMeta &meta) { trace_metas_.emplace_back(meta); }
  inline void AddThreadMeta(const ThreadMeta &meta) { thread_metas_.emplace_back(meta); }
  std::string Serialize() const override;

 private:
  std::string SerializeTrace() const;
  std::string SerializeThread() const;
  std::vector<TraceMeta> trace_metas_;
  std::vector<ThreadMeta> thread_metas_;
};
}  // namespace hippy::devtools
