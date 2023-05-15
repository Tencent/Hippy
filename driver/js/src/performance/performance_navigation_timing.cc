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

#include "driver/performance/performance_navigation_timing.h"

#include <utility>

namespace hippy {
inline namespace driver {
inline namespace performance {

PerformanceNavigationTiming::PerformanceNavigationTiming(
    const string_view& name, const TimePoint& start,
    const TimePoint& engine_initialization_start, const TimePoint& engine_initialization_end,
    std::vector<BundleInfo> bundle_info,
    const TimePoint& load_instance_start, const TimePoint& load_instance_end,
    const TimePoint& first_frame): PerformanceEntry(
        name, SubType::kPerformanceNavigationTiming, Type::kNavigation, start, TimePoint::Now() - start),
        engine_initialization_start_(engine_initialization_start), engine_initialization_end_(engine_initialization_end),
        bundle_info_(std::move(bundle_info)), load_instance_start_(load_instance_start), load_instance_end_(load_instance_end) {}

PerformanceEntry::string_view PerformanceNavigationTiming::ToJSON() {
  return PerformanceEntry::ToJSON();
}

}
}
}
