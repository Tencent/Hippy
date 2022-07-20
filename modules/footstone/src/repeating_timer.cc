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

#include "repeating_timer.h"

#include "logging.h"

namespace footstone {
inline namespace timer {

RepeatingTimer::~RepeatingTimer() = default;

RepeatingTimer::RepeatingTimer(const std::shared_ptr<TaskRunner>& task_runner) : BaseTimer(task_runner) {}

void RepeatingTimer::Start(std::unique_ptr<Task> user_task, TimeDelta delay) {
  user_task_ = std::move(user_task);
  StartInternal(delay);
}

std::shared_ptr<BaseTimer> RepeatingTimer::GetWeakSelf() {
  return std::static_pointer_cast<BaseTimer>(shared_from_this());
}

void RepeatingTimer::OnStop() {}
void RepeatingTimer::RunUserTask() {
  std::unique_ptr<Task>& task = user_task_;
  ScheduleNewTask(delay_);
  task->Run();
}

} // namespace timer
} // namespace footstone
