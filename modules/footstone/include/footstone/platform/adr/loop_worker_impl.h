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

#include "footstone/worker.h"

#include <android/looper.h>

namespace footstone {
inline namespace runner {

class LoopWorkerImpl: public Worker {
 public:
  LoopWorkerImpl(bool is_schedulable = true, std::string name = "");
  virtual ~LoopWorkerImpl();

  virtual void RunLoop() override;
  virtual void TerminateWorker() override;
  virtual void Notify() override;
  virtual void WaitFor(const TimeDelta& delta) override;
  virtual void Start() override;

 private:
  void OnEventFired();

  ALooper* looper_;
  int32_t fd_;
  bool has_task_pending_;
};

}
}
