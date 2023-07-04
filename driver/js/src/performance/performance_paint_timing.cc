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

#include "driver/performance/performance_paint_timing.h"

namespace hippy {
inline namespace driver {
inline namespace performance {

PerformancePaintTiming::PerformancePaintTiming(PerformancePaintTiming::Type type,
                                               const TimePoint& start_time)
    : PerformanceEntry(
    type == Type::kFirstPaint ? "first-paint" : "first-contentful-paint",
    SubType::kPerformancePaintTiming,
    PerformanceEntry::Type::kPaint,
    start_time,
    TimeDelta::Zero()) {

}

PerformancePaintTiming::PerformancePaintTiming(Type type)
: PerformanceEntry(
    type == Type::kFirstPaint ? "first-paint" : "first-contentful-paint",
    SubType::kPerformancePaintTiming,
    PerformanceEntry::Type::kPaint) {}

PerformanceEntry::string_view PerformancePaintTiming::ToJSON() {
  return PerformanceEntry::ToJSON();
}

}
}
}
