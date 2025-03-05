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

#include "include/footstone/platform/ios/looper_driver.h"

#include "include/footstone/logging.h"

namespace footstone {
inline namespace runner {

#ifdef IOS_WORKER_TIME_INTERVAL
static constexpr CFTimeInterval kInterval = IOS_WORKER_TIME_INTERVAL;
#else
static constexpr CFTimeInterval kInterval = 1.0e10;
#endif

extern "C" void * objc_autoreleasePoolPush(void);
extern "C" void objc_autoreleasePoolPop(void *);

static void OnTimerCb(CFRunLoopTimerRef timer, LooperDriver* driver) {
  FOOTSTONE_DCHECK(driver);
  driver->OnTimerFire(timer);
}

LooperDriver::LooperDriver(): loop_() {
  CFRunLoopTimerContext context = {
      .info = this,
  };
  delayed_wake_timer_ = CFRunLoopTimerCreate(kCFAllocatorDefault, kInterval, HUGE_VAL, 0, 0,
                                             reinterpret_cast<CFRunLoopTimerCallBack>(&OnTimerCb),
                                             &context);
}

LooperDriver::~LooperDriver() {
  CFRunLoopTimerInvalidate(delayed_wake_timer_);
  CFRelease(delayed_wake_timer_);
  CFRelease(loop_);
}

void LooperDriver::Notify() {
  CFRunLoopTimerSetNextFireDate(
      delayed_wake_timer_,
      CFAbsoluteTimeGetCurrent());
}

void LooperDriver::WaitFor(const TimeDelta& delta, std::unique_lock<std::mutex>& lock) {
  CFRunLoopTimerSetNextFireDate(
      delayed_wake_timer_,
      CFAbsoluteTimeGetCurrent() + delta.ToSecondsF());
}

void LooperDriver::Start() {
  // note that `loop_` created on dom thread but release on main thread
  loop_ = CFRunLoopGetCurrent();
  CFRetain(loop_);
  CFRunLoopAddTimer(loop_, delayed_wake_timer_, kCFRunLoopDefaultMode);
  while (true) {
    if (IsExitImmediately()) {
      return;
    }
    int result = CFRunLoopRunInMode(kCFRunLoopDefaultMode, kInterval, true);
    if (result == kCFRunLoopRunStopped || result == kCFRunLoopRunFinished) {
      is_terminated_ = true;
    }
    if (is_terminated_) {
      return;
    }
  }
}

void LooperDriver::Terminate() {
  is_terminated_ = true;
  CFRunLoopStop(loop_);
  CFRunLoopRemoveTimer(loop_, delayed_wake_timer_, kCFRunLoopDefaultMode);
}

void LooperDriver::OnTimerFire(CFRunLoopTimerRef timer) {
  if (IsExitImmediately()) {
    return;
  }
  auto obj = objc_autoreleasePoolPush();
  unit_();
  objc_autoreleasePoolPop(obj);
}

}
}

