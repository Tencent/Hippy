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

#include <functional>
#include <memory>

#include "footstone/task_runner.h"
#include "footstone/time_delta.h"
#include "footstone/time_point.h"

namespace footstone {
inline namespace timer {

class BaseTimer {
 public:
  using TaskRunner = runner::TaskRunner;
  using TimePoint = time::TimePoint;
  using TimeDelta = time::TimeDelta;

  BaseTimer() = default;
  explicit BaseTimer(const std::shared_ptr<TaskRunner>& task_runner);
  virtual ~BaseTimer();

  BaseTimer(BaseTimer&) = delete;
  BaseTimer& operator=(BaseTimer&) = delete;

  void Stop();
  void Reset();
  inline void BindTaskRunner(std::shared_ptr<TaskRunner> task_runner) {
    task_runner_ = task_runner;
  }
  inline bool IsRunning() { return is_running_; }

 protected:
  virtual void RunUserTask() = 0;
  virtual void OnStop() = 0;
  virtual std::shared_ptr<BaseTimer> GetWeakSelf() = 0;

  void ScheduleNewTask(TimeDelta delay);
  void StartInternal(TimeDelta delay);

  std::weak_ptr<TaskRunner> task_runner_;
  std::unique_ptr<Task> user_task_;
  TimeDelta delay_;

 private:
  void OnScheduledTaskInvoked();

  bool is_running_;
  TimePoint desired_run_time_;
  TimePoint scheduled_run_time_;
};

}  // namespace timer
}  // namespace footstone
