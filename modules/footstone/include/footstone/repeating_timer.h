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

 class RepeatingTimer : public BaseTimer, public std::enable_shared_from_this<RepeatingTimer> {
 public:
  using TaskRunner = runner::TaskRunner;

  RepeatingTimer() = default;
  explicit RepeatingTimer(const std::shared_ptr<TaskRunner>& task_runner);
  virtual ~RepeatingTimer();

  void Start(std::unique_ptr<Task> user_task, TimeDelta delay);

  virtual std::shared_ptr<BaseTimer> GetWeakSelf() override;
 private:
  void OnStop() final;
  void RunUserTask() override;

  FOOTSTONE_DISALLOW_COPY_AND_ASSIGN(RepeatingTimer);
};

}  // namespace base
}  // namespace footstone
