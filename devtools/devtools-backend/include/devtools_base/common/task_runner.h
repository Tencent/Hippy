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

#include <condition_variable>
#include <memory>
#include <mutex>
#include <queue>
#include <string>
#include <utility>
#include <vector>

#include "devtools_base/common/macros.h"
#include "devtools_base/common/task.h"
#include "devtools_base/common/time_delta.h"
#include "devtools_base/common/time_point.h"
#include "devtools_base/common/worker.h"

namespace hippy::devtools {
inline namespace runner {
class TaskRunner {
 public:
  using TimePoint = time::TimePoint;
  using TimeDelta = time::TimeDelta;

  explicit TaskRunner(bool is_excl = false, int priority = 1, const std::string& name = "");
  ~TaskRunner();

  void Clear();
  void Terminate();
  void AddSubTaskRunner(std::shared_ptr<TaskRunner> sub_runner, bool is_task_running = false);
  void RemoveSubTaskRunner(std::shared_ptr<TaskRunner> sub_runner);
  void PostTask(std::unique_ptr<Task> task);
  template <typename F, typename... Args>
  void PostTask(F&& f, Args... args) {
    using T = typename std::result_of<F(Args...)>::type;
    auto packaged_task =
        std::make_shared<std::packaged_task<T()>>(std::bind(std::forward<F>(f), std::forward<Args>(args)...));
    auto task = std::make_unique<Task>([packaged_task]() { (*packaged_task)(); });
    PostTask(std::move(task));
  }

  void PostDelayedTask(std::unique_ptr<Task> task, TimeDelta delay);

  template <typename F, typename... Args>
  void PostDelayedTask(F&& f, TimeDelta delay, Args... args) {
    using T = typename std::result_of<F(Args...)>::type;
    auto packaged_task =
        std::make_shared<std::packaged_task<T()>>(std::bind(std::forward<F>(f), std::forward<Args>(args)...));
    auto task = std::make_unique<Task>([packaged_task]() { (*packaged_task)(); });
    PostDelayedTask(std::move(task), delay);
  }
  TimeDelta GetNextTimeDelta(TimePoint now);

  int32_t RunnerKeyCreate(std::function<void(void*)> destruct);
  bool RunnerKeyDelete(int32_t key);
  bool RunnerSetSpecific(int32_t key, void* p);
  void* RunnerGetSpecific(int32_t key);
  void RunnerDestroySpecifics();

  inline bool GetExclusive() { return is_excl_; }
  inline int32_t GetPriority() { return priority_; }
  inline int32_t GetId() { return id_; }
  inline std::string GetName() { return name_; }
  inline TimeDelta GetTime() { return time_; }
  inline TimeDelta AddTime(TimeDelta time) {
    time_ = time_ + time;
    return time_;
  }

  inline void SetTime(TimeDelta time) { time_ = time; }

  // 必须要在 task 运行时调用 GetCurrentTaskRunner 才能得到正确的 Runner，task 运行之外调用都将返回 nullptr
  static std::shared_ptr<TaskRunner> GetCurrentTaskRunner();

 private:
  friend class Worker;
  friend class Scheduler;
  friend class WorkerPool;

  std::unique_ptr<Task> popTaskFromDelayedQueueNoLock(TimePoint now);

  std::unique_ptr<Task> PopTask();
  std::unique_ptr<Task> GetTopDelayTask();
  std::unique_ptr<Task> GetNext();

  void SetCv(std::shared_ptr<std::condition_variable> cv);

  std::queue<std::unique_ptr<Task>> task_queue_;
  using DelayedEntry = std::pair<TimePoint, std::unique_ptr<Task>>;
  struct DelayedEntryCompare {
    bool operator()(const DelayedEntry& left, const DelayedEntry& right) const { return left.first > right.first; }
  };
  std::priority_queue<DelayedEntry, std::vector<DelayedEntry>, DelayedEntryCompare> delayed_task_queue_;
  std::mutex mutex_;
  std::shared_ptr<std::condition_variable> cv_;
  std::weak_ptr<Worker> worker_;
  bool is_terminated_;
  bool is_excl_;
  std::string name_;
  bool has_sub_runner_;
  int32_t priority_;
  int32_t id_;
  TimeDelta time_;

  TDF_BASE_DISALLOW_COPY_AND_ASSIGN(TaskRunner);
};
}  // namespace runner
}  // namespace hippy::devtools
