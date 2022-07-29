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

#include "include/footstone/base_timer.h"

namespace footstone {
inline namespace timer {

BaseTimer::BaseTimer(const std::shared_ptr<TaskRunner>& task_runner)
    : task_runner_(task_runner), user_task_(nullptr), is_running_(false), scheduled_run_time_(TimePoint::Now()) {}

BaseTimer::~BaseTimer() = default;

void BaseTimer::Stop() {
  is_running_ = false;
  OnStop();
}

void BaseTimer::ScheduleNewTask(TimeDelta delay) {
  std::shared_ptr<TaskRunner> task_runner = task_runner_.lock();
  if (!task_runner) {
    return;
  }

  is_running_ = true;
  std::weak_ptr<BaseTimer> weak_self = GetWeakSelf();
  if (delay > TimeDelta::Zero()) {
    task_runner->PostDelayedTask(std::make_unique<Task>([weak_self]{
      auto self = weak_self.lock();
      if (self) {
        self->OnScheduledTaskInvoked();
      }
    }), delay);
    scheduled_run_time_ = desired_run_time_ = TimePoint::Now() + delay;
  } else {
    task_runner->PostTask(std::make_unique<Task>([weak_self]{
      auto self = weak_self.lock();
      if (self) {
        self->OnScheduledTaskInvoked();
      }
    }));
    scheduled_run_time_ = desired_run_time_ = TimePoint::Now();
  }
}

void BaseTimer::OnScheduledTaskInvoked() {
  if (!is_running_) {
    return;
  }

  if (desired_run_time_ > scheduled_run_time_) {
    TimePoint now = TimePoint::Now();
    if (desired_run_time_ > now) {
      ScheduleNewTask(desired_run_time_ - now);
      return;
    }
  }

  RunUserTask();
}

void BaseTimer::StartInternal(TimeDelta delay) {
  delay_ = delay;

  Reset();
}

void BaseTimer::Reset() {
  if (scheduled_run_time_ < TimePoint::Now()) {
    ScheduleNewTask(delay_);
    return;
  }

  if (delay_ > TimeDelta::Zero()) {
    desired_run_time_ = TimePoint::Now() + delay_;
  } else {
    desired_run_time_ = TimePoint::Now();
  }

  if (desired_run_time_ >= scheduled_run_time_) {
    is_running_ = true;
    return;
  }

  ScheduleNewTask(delay_);
}

}  // namespace timer
}  // namespace footstone
