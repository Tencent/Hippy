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

#ifndef HIPPY_CORE_BASE_TASK_RUNNER_H_
#define HIPPY_CORE_BASE_TASK_RUNNER_H_

#include <stdint.h>

#include <condition_variable>  // NOLINT(build/c++11)
#include <memory>
#include <mutex>  // NOLINT(build/c++11)
#include <queue>
#include <utility>
#include <vector>

#include "core/base/thread.h"

namespace hippy {
namespace base {

class Task;
class TaskRunner : public Thread {
 public:
  using DelayedTimeInMs = uint64_t;

  TaskRunner();
  virtual ~TaskRunner();

  void Run() override;
  void Terminate();
  void PostTask(std::shared_ptr<Task> task);
  void PostDelayedTask(std::shared_ptr<Task> task,
                       DelayedTimeInMs delay_in_mseconds);
  void CancelTask(std::shared_ptr<Task> task);

 protected:
  void PostTaskNoLock(std::shared_ptr<Task> task);
  std::shared_ptr<Task> popTaskFromDelayedQueueNoLock(DelayedTimeInMs now);
  std::shared_ptr<Task> GetNext();

 protected:
  bool is_terminated_;
  std::queue<std::shared_ptr<Task>> task_queue_;

  using DelayedEntry = std::pair<DelayedTimeInMs, std::shared_ptr<Task>>;
  struct DelayedEntryCompare {
    bool operator()(const DelayedEntry& left, const DelayedEntry& right) const {
      return left.first > right.first;
    }
  };
  std::priority_queue<DelayedEntry,
                      std::vector<DelayedEntry>,
                      DelayedEntryCompare>
      delayed_task_queue_;

  std::mutex mutex_;
  std::condition_variable cv_;
};

}  // namespace base
}  // namespace hippy

#endif  // HIPPY_CORE_BASE_TASK_RUNNER_H_
