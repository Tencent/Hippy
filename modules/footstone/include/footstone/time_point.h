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



#include <chrono>
#include <cstdint>
#include <iosfwd>

#include "footstone/time_delta.h"

namespace footstone {
inline namespace time {

class TimePoint {
 public:
  // Default TimePoint with internal value 0 (epoch).
  constexpr TimePoint() = default;

  static TimePoint Now() {
    return TimePoint(std::chrono::duration_cast<std::chrono::nanoseconds>(
                         std::chrono::steady_clock::now().time_since_epoch())
                         .count());
  }

  static TimePoint SystemNow() {
    return TimePoint(std::chrono::duration_cast<std::chrono::nanoseconds>(
        std::chrono::system_clock::now().time_since_epoch())
                         .count());
  }

  static constexpr TimePoint Min() { return TimePoint(std::numeric_limits<int64_t>::min()); }

  static constexpr TimePoint Max() { return TimePoint(std::numeric_limits<int64_t>::max()); }

  static constexpr TimePoint FromEpochDelta(TimeDelta ticks) {
    return TimePoint(ticks.ToNanoseconds());
  }

  TimeDelta ToEpochDelta() const { return TimeDelta::FromNanoseconds(ticks_); }

  // Compute the difference between two time points.
  TimeDelta operator-(TimePoint other) const {
    return TimeDelta::FromNanoseconds(ticks_ - other.ticks_);
  }

  TimePoint operator+(TimeDelta duration) {
    return TimePoint(ticks_ + duration.ToNanoseconds());
  }

  const TimePoint operator+(TimeDelta duration) const {
    return TimePoint(ticks_ + duration.ToNanoseconds());
  }

  TimePoint operator-(TimeDelta duration) const {
    return TimePoint(ticks_ - duration.ToNanoseconds());
  }

  bool operator==(TimePoint other) const { return ticks_ == other.ticks_; }
  bool operator!=(TimePoint other) const { return ticks_ != other.ticks_; }
  bool operator<(TimePoint other) const { return ticks_ < other.ticks_; }
  bool operator<=(TimePoint other) const { return ticks_ <= other.ticks_; }
  bool operator>(TimePoint other) const { return ticks_ > other.ticks_; }
  bool operator>=(TimePoint other) const { return ticks_ >= other.ticks_; }

 private:
  explicit constexpr TimePoint(int64_t ticks) : ticks_(ticks) {}

  int64_t ticks_ = 0;
};

}  // namespace time
}  // namespace footstone
