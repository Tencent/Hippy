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

#include "driver/performance/performance_measure.h"

namespace hippy {
inline namespace driver {
inline namespace performance {

PerformanceMeasure::PerformanceMeasure(const PerformanceEntry::string_view& name,
                                       const PerformanceEntry::TimePoint& start,
                                       const PerformanceEntry::TimeDelta duration,
                                       const std::any& detail) : PerformanceEntry(
    name,
    SubType::kPerformanceMeasure,
    Type::kMeasure,
    start,
    duration) {}

PerformanceMeasure::PerformanceMeasure(const PerformanceEntry::string_view& name,
                                       const TimePoint& start,
                                       const std::any& detail) : PerformanceMeasure(
    name,
    start,
    TimePoint::SystemNow() - start,
    detail) {}

PerformanceEntry::string_view PerformanceMeasure::ToJSON() {
  return PerformanceEntry::ToJSON();
}


}
}
}
