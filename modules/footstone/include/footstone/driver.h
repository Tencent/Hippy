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

#include <functional>
#include <mutex>
#include "footstone/time_delta.h"

namespace footstone {
inline namespace runner {

class Driver {
 public:
  Driver(): is_terminated_(false), is_exit_immediately_(false) {}
  virtual ~Driver() = default;

  virtual void Notify() = 0;
  virtual void WaitFor(const TimeDelta& delta) = 0;
  virtual std::mutex& Mutex() = 0;
  virtual void WaitFor(const TimeDelta& delta, std::unique_lock<std::mutex>& lock) = 0;
  virtual void Start() = 0;
  virtual void Terminate() = 0;

  inline void SetUnit(std::function<void()> unit) {
    unit_ = std::move(unit);
  }

  inline bool IsTerminated() {
    return is_terminated_;
  }

  inline bool IsExitImmediately() {
    return is_terminated_ && is_exit_immediately_;
  }

 protected:
  std::function<void()> unit_;
  bool is_terminated_;
  /*
   * 是否立刻退出
   * 如果该标志位为true，则队列中任务不再执行，直接退出；反之，则必须等待立刻执行队列（不包括延迟和空闲队列）执行完才会退出
   *
   */
  bool is_exit_immediately_;
};

}
}
