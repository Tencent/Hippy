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

#include <atomic>
#include <cstdint>
#include <functional>

namespace hippy::devtools {
inline namespace runner {
class Task {
 public:
  Task();
  explicit Task(std::function<void()> unit);
  ~Task() = default;

  inline uint32_t GetId() { return id_; }
  inline void SetExecUnit(std::function<void()> unit) { unit_ = unit; }
  inline void Run() {
    if (unit_) {
      unit_();
    }
  }

 private:
  std::atomic<uint32_t> id_;
  std::function<void()> unit_;  // A unit of work to be processed
};
}  // namespace runner
}  // namespace devtools::devtools
