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

#include <chrono>
#include <sstream>
#include <string>
namespace hippy::devtools {
using Clock = std::chrono::steady_clock;
using TimePoint = std::chrono::time_point<Clock>;
using Duration = std::chrono::nanoseconds;
constexpr Duration kDefaultFrameBudget = Duration(std::chrono::nanoseconds(1000000000LL / 60LL));
/**
 * @brief easy time stamp acquisition utility class
 *        simple encapsulation of the system's steady_clock, easy to use
 */
class SteadyClockTime {
 public:
  enum class TimeUnit : uint32_t { kNanoSeconds, kMicroSeconds, kMilliSeconds, kSeconds, kMinutes, kHours };

  /**
   * @brief fetch interval
   *        the start time is the system startup time and does not change with the system time
   * @param time_unit
   * @return
   */
  static uint64_t NowTimeSinceEpoch(TimeUnit time_unit = TimeUnit::kNanoSeconds) {
    auto now = std::chrono::steady_clock::now();
    auto duration = std::chrono::time_point_cast<std::chrono::nanoseconds>(now).time_since_epoch().count();
    switch (time_unit) {
      case TimeUnit::kMicroSeconds:
        duration = std::chrono::time_point_cast<std::chrono::microseconds>(now).time_since_epoch().count();
        break;
      case TimeUnit::kMilliSeconds:
        duration = std::chrono::time_point_cast<std::chrono::milliseconds>(now).time_since_epoch().count();
        break;
      case TimeUnit::kSeconds:
        duration = std::chrono::time_point_cast<std::chrono::seconds>(now).time_since_epoch().count();
        break;
      case TimeUnit::kMinutes:
        duration = std::chrono::time_point_cast<std::chrono::minutes>(now).time_since_epoch().count();
        break;
      case TimeUnit::kHours:
        duration = std::chrono::time_point_cast<std::chrono::hours>(now).time_since_epoch().count();
        break;
      default:
        break;
    }
    return duration;
  }

  /**
   * @brief gets the interval string
   * @param time_unit
   * @return
   */
  static const std::string NowTimeSinceEpochStr(TimeUnit time_unit = TimeUnit::kNanoSeconds) {
    auto duration = NowTimeSinceEpoch(time_unit);
    std::stringstream time_string_stream;
    time_string_stream << duration;
    return time_string_stream.str();
  }
};

}  // namespace hippy::devtools
