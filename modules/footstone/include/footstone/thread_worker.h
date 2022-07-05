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

#include <thread>

#include "footstone/worker.h"

namespace footstone {
inline namespace runner {

class ThreadWorker: public Worker {
 public:
  ThreadWorker(bool is_schedulable, std::string name = "");
  virtual ~ThreadWorker();

  virtual void Start() override;
 protected:
  virtual void RunLoop() override;
  virtual void TerminateWorker() override;
  virtual void Notify() override;
  virtual void WaitFor(const TimeDelta& delta) override;
  virtual void Join();
  virtual void SetName(const std::string& name) = 0;

 private:
  std::thread thread_;
  std::condition_variable cv_;
  std::mutex mutex_; // 任意PV操作和终止判断一体，不可打断，否则会出现先Notify再Wait，线程永远无法退出
};

}
}
