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

#include "looper_driver.h"

#include <android/looper.h>
#include <sys/timerfd.h>
#include <ctime>

namespace footstone {
inline namespace runner {

static ALooper *AcquireLooperForThread() {
  ALooper *looper = ALooper_forThread();
  if (looper == nullptr) {
    looper = ALooper_prepare(0);
  }
  ALooper_acquire(looper);
  return looper;
}

itimerspec SetItimerspec(uint64_t nano_secs) {
  struct itimerspec spec{};
  spec.it_value.tv_sec = static_cast<time_t>(nano_secs / 1000000000);
  spec.it_value.tv_nsec = static_cast<long>(nano_secs % 1000000000);
  spec.it_interval = spec.it_value;
  return spec;
}

LooperDriver::LooperDriver(): looper_(nullptr), fd_(-1) {
  if (!is_exit_immediately_) {
    has_task_pending_ = true;
  }
}

LooperDriver::~LooperDriver() {
  ALooper_removeFd(looper_, fd_);
  ALooper_wake(looper_);
}

void LooperDriver::Notify() {
  itimerspec spec = SetItimerspec(1);
  timerfd_settime(fd_, TFD_TIMER_ABSTIME, &spec, nullptr);
}

void LooperDriver::WaitFor(const TimeDelta& delta) {
  auto nano_secs = delta.ToNanoseconds();
  if (nano_secs < 1) {
    nano_secs = 1;
  }
  itimerspec spec = SetItimerspec(static_cast<uint64_t>(nano_secs));
  timerfd_settime(fd_, TFD_TIMER_ABSTIME, &spec, nullptr);
}

void LooperDriver::Start() {
  looper_ = AcquireLooperForThread();
  fd_ = timerfd_create(CLOCK_MONOTONIC,TFD_NONBLOCK | TFD_CLOEXEC);

  static const int kWakeEvents = ALOOPER_EVENT_INPUT;

  ALooper_callbackFunc cb = [](int, int events, void *data) -> int {
    if (events & kWakeEvents) {
      reinterpret_cast<LooperDriver *>(data)->OnEventFired();
    }
    return 1;
  };

  ::ALooper_addFd(looper_,
                  fd_,
                  ALOOPER_POLL_CALLBACK,
                  kWakeEvents,
                  cb,
                  this);

  while (true) {
    if (is_terminated_ && is_exit_immediately_) {
      return;
    }
    if (is_terminated_ && !has_task_pending_) {
      return;
    }
    int result = ::ALooper_pollOnce(-1, nullptr, nullptr, nullptr);
    if (result == ALOOPER_POLL_TIMEOUT || result == ALOOPER_POLL_ERROR) {
      is_terminated_ = true;
      has_task_pending_ = false;
    }
  }
}

void LooperDriver::Terminate() {
  is_terminated_ = true;
}

void LooperDriver::OnEventFired() {
  while(true) {
    if (is_terminated_ && is_exit_immediately_) {
      return;
    }
    has_task_pending_ = unit_();
    if (!has_task_pending_) {
      return;
    }
  }
}

}
}

