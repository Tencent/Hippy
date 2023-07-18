/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2023 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#pragma once

#include "footstone/string_view.h"
#include "footstone/time_point.h"
#include "footstone/time_delta.h"

namespace hippy {
inline namespace driver {
inline namespace performance {

class PerformanceEntry {
 public:
  using string_view = footstone::string_view;
  using TimePoint = footstone::TimePoint;
  using TimeDelta = footstone::TimeDelta;

  enum class Type {
    kError, kFrame, kNavigation, kResource, kMark, kMeasure, kPaint
  };

  enum class SubType {
    kPerformanceFrameTiming, kPerformanceNavigationTiming, kPerformanceResourceTiming, kPerformanceMark,
    kPerformanceMeasure, kPerformancePaintTiming
  };

  PerformanceEntry(const string_view& name,
                   SubType sub_type,
                   Type type,
                   TimePoint start_time,
                   TimeDelta duration) : name_(name),
                                         sub_type_(sub_type),
                                         type_(type),
                                         start_time_(start_time),
                                         duration_(duration) {}

  PerformanceEntry(const string_view& name,
                   SubType sub_type,
                   Type type) : name_(name),
                                sub_type_(sub_type),
                                type_(type) {}

  virtual ~PerformanceEntry() = default;

  inline auto GetName() const {
    return name_;
  }

  inline auto GetSubType() const {
    return sub_type_;
  }

  inline auto GetType() const {
    return type_;
  }

  inline auto GetStartTime() const {
    return start_time_;
  }

  inline auto GetDuration() const {
    return duration_;
  }

  static string_view GetEntryTypeString(Type type);
  static string_view GetSubTypeString(SubType type);
  static Type GetEntryType(const string_view&);

  virtual string_view ToJSON();

 protected:
  string_view name_;
  SubType sub_type_;
  Type type_;
  TimePoint start_time_;
  TimeDelta duration_;
};

}
}
}
