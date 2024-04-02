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

#include <unordered_map>
#include <vector>

#include "footstone/string_view.h"
#include "driver/performance/performance_entry.h"
#include "driver/performance/performance_resource_timing.h"
#include "driver/performance/performance_navigation_timing.h"
#include "driver/performance/performance_paint_timing.h"

namespace hippy {
inline namespace driver {
inline namespace performance {

extern const char* kPerfNavigationHippyInit;

class Performance {
 public:
  using string_view = footstone::string_view;
  using TimePoint = footstone::TimePoint;

  struct PerformanceEntryFilterOptions {
    string_view name;
    PerformanceEntry::Type entry_type;
    PerformanceResourceTiming::InitiatorType initiator_type;
  };

  Performance();

  inline void SetResourceTimingBufferSize(uint32_t max_size) {
    resource_timing_max_buffer_size_ = max_size;
  }

  inline const TimePoint& GetTimeOrigin() {
    return time_origin_;
  }

  std::shared_ptr<PerformanceNavigationTiming> PerformanceNavigation(const string_view& name);
  std::shared_ptr<PerformancePaintTiming> PerformancePaint(const PerformancePaintTiming::Type& type);
  std::shared_ptr<PerformanceResourceTiming> PerformanceResource(const string_view& name);

  void Mark(const string_view& name);
  void ClearMarks(const string_view& name);
  void ClearMarks();
  bool Measure(const string_view& name);
  bool Measure(const string_view& name, const string_view& start_mark);
  bool Measure(const string_view& name, const string_view& start_mark, const string_view& end_mark);
  bool Measure(const string_view& name, const std::shared_ptr<PerformanceEntry>& start_mark, const std::shared_ptr<PerformanceEntry>& end_mark);

  void ClearMeasures(const string_view& name);
  void ClearMeasures();
  void ClearResourceTimings();
  std::vector<std::shared_ptr<PerformanceEntry>> GetEntries(const PerformanceEntryFilterOptions& options);
  std::vector<std::shared_ptr<PerformanceEntry>> GetEntries();
  std::vector<std::shared_ptr<PerformanceEntry>> GetEntriesByName(const string_view& name);
  std::vector<std::shared_ptr<PerformanceEntry>> GetEntriesByName(const string_view& name, PerformanceEntry::Type type);
  std::vector<std::shared_ptr<PerformanceEntry>> GetEntriesByType(PerformanceEntry::Type type);
  string_view ToJSON();

  static TimePoint Now();

 private:
  bool InsertEntry(const std::shared_ptr<PerformanceEntry>& entry);
  void RemoveEntry(const string_view& name);
  void RemoveEntry(PerformanceEntry::Type type);
  void RemoveEntry(const string_view& name, PerformanceEntry::Type type);

  std::unordered_map<string_view, std::vector<std::shared_ptr<PerformanceEntry>>> name_map_;
  std::unordered_map<PerformanceEntry::Type, std::vector<std::shared_ptr<PerformanceEntry>>> type_map_;
  uint32_t resource_timing_current_buffer_size_;
  uint32_t resource_timing_max_buffer_size_;
  TimePoint time_origin_;
};

}
}
}
