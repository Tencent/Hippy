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

#include "../../driver.h"

#include <CoreFoundation/CoreFoundation.h>

#include "../../time_delta.h"

namespace footstone {
inline namespace runner {

class LooperDriver: public Driver {
 public:
  LooperDriver();
  virtual ~LooperDriver();

  virtual void Notify() override;
  virtual void WaitFor(const TimeDelta& delta) override;
  virtual void Start() override;
  virtual void Terminate() override;

  void OnTimerFire(CFRunLoopTimerRef timer);

 private:
  CFRunLoopTimerRef delayed_wake_timer_;
  CFRunLoopRef loop_;
  bool has_task_pending_;
};

}
}
