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

#include <stdint.h>

#include <condition_variable>  // NOLINT(build/c++11)
#include <map>
#include <memory>
#include <queue>
#include <vector>

#include "core/base/base_time.h"
#include "core/base/macros.h"
#include "core/base/thread.h"
#include "core/task/common_task.h"

class WorkerTaskRunner {
 public:
  explicit WorkerTaskRunner(uint32_t pool_size);
  ~WorkerTaskRunner() = default;

  void PostTask(std::unique_ptr<CommonTask> task,
                uint32_t priority = WorkerTaskRunner::kDefaultTaskPriority);
  std::unique_ptr<CommonTask> GetNext();
  void Terminate();

 private:
  class WorkerThread : public hippy::base::Thread {
   public:
    explicit WorkerThread(WorkerTaskRunner*);
    ~WorkerThread();
    void Run();

   private:
    WorkerTaskRunner* runner_;

    DISALLOW_COPY_AND_ASSIGN(WorkerThread);
  };

  static const uint32_t kDefaultTaskPriority;
  static const uint32_t kHighPriorityTaskPriority;
  static const uint32_t kLowPriorityTaskPriority;
  using Entry = std::pair<uint32_t, std::unique_ptr<CommonTask>>;
  struct EntryCompare {
    bool operator()(const Entry& left, const Entry& right) const {
      return left.first > right.first;
    }
  };
  std::priority_queue<Entry, std::vector<Entry>, EntryCompare> task_queue_;
  std::condition_variable cv_;
  std::mutex mutex_;
  uint32_t pool_size_;
  bool terminated_ = false;
  std::vector<std::unique_ptr<WorkerThread>> thread_pool_;
};
