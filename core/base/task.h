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

#ifndef CORE_BASE_TASK_H_
#define CORE_BASE_TASK_H_

#include <stdint.h>

namespace hippy {
namespace base {

class Task {
 public:
  using TaskId = uint32_t;

  Task();
  virtual ~Task() = default;
  virtual bool isPriorityTask() = 0;
  virtual void Run() = 0;

  TaskId id_;
  bool canceled_ = false;
};

}  // namespace base
}  // namespace hippy

#endif  // CORE_BASE_TASK_H_
