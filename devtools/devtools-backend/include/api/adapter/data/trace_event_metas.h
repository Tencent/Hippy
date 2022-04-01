//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/11/23.
//

#pragma once

#include <chrono>
#include <string>
#include <thread>
#include <vector>
#include "api/adapter/data/serializable.h"

namespace tdf {
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
}  // namespace tdf
