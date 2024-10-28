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

#include "include/footstone/cv_driver.h"

namespace footstone {
inline namespace runner {

void CVDriver::Notify() {
  std::unique_lock<std::mutex> lock(mutex_);
  cv_.notify_one();
}

void CVDriver::WaitFor(const TimeDelta& delta) {
  std::unique_lock<std::mutex> lock(mutex_);

  if (delta != TimeDelta::Max() && delta >= TimeDelta::Zero()) {
    cv_.wait_for(lock, std::chrono::nanoseconds(delta.ToNanoseconds()));
  } else {
    cv_.wait(lock);
  }
}

std::mutex& CVDriver::Mutex() {
  return mutex_;
}

void CVDriver::WaitFor(const TimeDelta& delta, std::unique_lock<std::mutex>& lock) {
  if (delta != TimeDelta::Max() && delta >= TimeDelta::Zero()) {
    cv_.wait_for(lock, std::chrono::nanoseconds(delta.ToNanoseconds()));
  } else {
    cv_.wait(lock);
  }
}

void CVDriver::Start() {
  while (!is_terminated_) {
    unit_();
  }
}

void CVDriver::Terminate() {
  std::unique_lock<std::mutex> lock(mutex_);
  is_terminated_ = true;
  cv_.notify_one();
}

}
}
