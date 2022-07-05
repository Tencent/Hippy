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

#include "base_timer.h"

namespace footstone {
inline namespace timer {

 class OneShotTimer : public BaseTimer, public std::enable_shared_from_this<OneShotTimer> {
 public:
  using Task = runner::Task;
  using TaskRunner = runner::TaskRunner;
  using TimeDelta = time::TimeDelta;

  OneShotTimer() = default;
  explicit OneShotTimer(const std::shared_ptr<TaskRunner>& task_runner);
  virtual ~OneShotTimer();

  OneShotTimer(OneShotTimer&) = delete;
  OneShotTimer& operator=(OneShotTimer&) = delete;

  void Start(std::unique_ptr<Task> user_task, TimeDelta delay);
  void FireNow();

  virtual std::shared_ptr<BaseTimer> GetWeakSelf() override;

 private:
  void OnStop() final;
  void RunUserTask() final;

  std::unique_ptr<Task> user_task_;
};

}  // namespace base
}  // namespace footstone
