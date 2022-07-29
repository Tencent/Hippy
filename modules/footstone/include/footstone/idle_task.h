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

#include <atomic>
#include <cstdint>
#include <functional>

#include "footstone/time_delta.h"

namespace footstone {
inline namespace runner {

class IdleTask {
 public:
  struct IdleCbParam {
    bool did_time_out;
    TimeDelta res_time;
  };
  IdleTask();
  IdleTask(std::function<void(const IdleCbParam &)> unit);
  ~IdleTask() = default;

  inline uint32_t GetId() { return id_; }
  inline auto GetUnit() { return unit_; }
  inline void SetUnit(std::function<void(const IdleCbParam &)> unit) { unit_ = unit; }
  inline void Run(const IdleCbParam &param) {
    if (unit_) {
      unit_(param);
    }
  }

 private:
  uint32_t id_;
  std::function<void(const IdleCbParam &)> unit_;  // A unit of work to be processed
};

}
}
