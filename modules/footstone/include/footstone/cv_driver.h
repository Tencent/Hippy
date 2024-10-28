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

#include "footstone/driver.h"

#include <mutex>

#include "footstone/time_delta.h"

namespace footstone {
inline namespace runner {

class CVDriver: public Driver {
 public:
  CVDriver() = default;
  virtual ~CVDriver() = default;

  virtual void Notify() override;
  virtual void WaitFor(const TimeDelta& delta) override;
  virtual std::mutex& Mutex() override;
  virtual void WaitFor(const TimeDelta& delta, std::unique_lock<std::mutex>& lock) override;
  virtual void Start() override;
  virtual void Terminate() override;

 private:
  std::condition_variable cv_;
  std::mutex mutex_;
};

}
}

