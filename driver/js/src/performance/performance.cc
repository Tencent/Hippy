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

#include "driver/performance/performance.h"

#include <algorithm>

#include "driver/performance/performance_mark.h"
#include "driver/performance/performance_measure.h"
#include "footstone/check.h"
#include "footstone/logging.h"
#include "footstone/string_view_utils.h"

namespace hippy {
inline namespace driver {
inline namespace performance {

const char* kPerfNavigationHippyInit = "hippyInit";
constexpr uint32_t kMaxSize = 250;

Performance::Performance(): resource_timing_current_buffer_size_(0),
    resource_timing_max_buffer_size_(kMaxSize),
    time_origin_(TimePoint::SystemNow()) {}

std::shared_ptr<PerformanceNavigationTiming> Performance::PerformanceNavigation(const string_view& name) {
  auto u16n = footstone::StringViewUtils::ConvertEncoding(name, string_view::Encoding::Utf16);
  auto name_iterator = name_map_.find(u16n);
  if (name_iterator != name_map_.end()) {
    for (auto& entry : name_iterator->second) {
      if (entry->GetType() == PerformanceEntry::Type::kNavigation) {
        return std::static_pointer_cast<PerformanceNavigationTiming>(entry);
      }
    }
  }

  auto entry = std::make_shared<PerformanceNavigationTiming>(name);
  if (InsertEntry(entry)) {
    return entry;
  }
  return nullptr;
}

std::shared_ptr<PerformancePaintTiming> Performance::PerformancePaint(const PerformancePaintTiming::Type& type) {
  auto name = (type == PerformancePaintTiming::Type::kFirstPaint ? "first-paint" : "first-contentful-paint");
  auto u16n = footstone::StringViewUtils::ConvertEncoding(name, string_view::Encoding::Utf16);
  auto name_iterator = name_map_.find(u16n);
  if (name_iterator != name_map_.end()) {
    for (auto& entry : name_iterator->second) {
      if (entry->GetType() == PerformanceEntry::Type::kPaint) {
        return std::static_pointer_cast<PerformancePaintTiming>(entry);
      }
    }
  }

  auto entry = std::make_shared<PerformancePaintTiming>(type);
  if (InsertEntry(entry)) {
    return entry;
  }
  return nullptr;
}

std::shared_ptr<PerformanceResourceTiming> Performance::PerformanceResource(const string_view& name) {
  auto u16n = footstone::StringViewUtils::ConvertEncoding(name, string_view::Encoding::Utf16);
  auto name_iterator = name_map_.find(u16n);
  if (name_iterator != name_map_.end()) {
    for (auto& entry : name_iterator->second) {
      if (entry->GetType() == PerformanceEntry::Type::kResource) {
        return std::static_pointer_cast<PerformanceResourceTiming>(entry);
      }
    }
  }

  auto entry = std::make_shared<PerformanceResourceTiming>(name);
  if (InsertEntry(entry)) {
    return entry;
  }
  return nullptr;
}

void Performance::Mark(const Performance::string_view& name) {
  auto entry = std::make_shared<PerformanceMark>(
      name, TimePoint::SystemNow(), nullptr);
  InsertEntry(entry);
}

void Performance::ClearMarks(const Performance::string_view& name) {
  RemoveEntry(name, PerformanceEntry::Type::kMark);
}

void Performance::ClearMarks() {
  RemoveEntry(PerformanceEntry::Type::kMark);
}

bool Performance::Measure(const Performance::string_view &name) {
  auto entry = std::make_shared<PerformanceMeasure>(
      name, time_origin_, nullptr);
  return InsertEntry(entry);
}

bool Performance::Measure(const Performance::string_view &name,
                          const Performance::string_view &start_mark) {
  auto entries = GetEntriesByName(start_mark, PerformanceEntry::Type::kMark);
  if (entries.empty()) {
    return false;
  }
  auto start_mark_entry = entries.back();
  if (!start_mark_entry) {
    return false;
  }
  auto entry = std::make_shared<PerformanceMeasure>(
      name, start_mark_entry->GetStartTime(),
      Now() - start_mark_entry->GetStartTime(), nullptr);
  return InsertEntry(entry);
}

bool Performance::Measure(const Performance::string_view& name,
                          const Performance::string_view& start_mark,
                          const Performance::string_view& end_mark) {
  auto start_entries = GetEntriesByName(start_mark, PerformanceEntry::Type::kMark);
  if (start_entries.empty()) {
    return false;
  }
  auto start_mark_entry = start_entries.back();
  if (!start_mark_entry) {
    return false;
  }
  auto end_entries = GetEntriesByName(end_mark, PerformanceEntry::Type::kMark);
  if (end_entries.empty()) {
    return false;
  }
  auto end_mark_entry = end_entries.back();
  if (!end_mark_entry) {
    return false;
  }
  Measure(name, start_mark_entry, end_mark_entry);
  return true;
}

bool Performance::InsertEntry(const std::shared_ptr<PerformanceEntry>& entry) {
  if (entry->GetType() == PerformanceEntry::Type::kResource) {
    if (resource_timing_current_buffer_size_ >= resource_timing_max_buffer_size_) {
      return false;
    }
    ++resource_timing_current_buffer_size_;
  }
  auto name = entry->GetName();
  auto u16n = footstone::StringViewUtils::ConvertEncoding(name, string_view::Encoding::Utf16);
  auto name_iterator = name_map_.find(u16n);
  if (name_iterator == name_map_.end()) {
    name_map_[u16n] = { entry };
  } else {
    name_map_[u16n].push_back(entry);
  }
  auto type = entry->GetType();
  auto type_iterator = type_map_.find(type);
  if (type_iterator == type_map_.end()) {
    type_map_[type] = { entry };
  } else {
    type_map_[type].push_back(entry);
  }
  return true;
}

bool Performance::Measure(const Performance::string_view& name,
                          const std::shared_ptr<PerformanceEntry>& start_mark,
                          const std::shared_ptr<PerformanceEntry>& end_mark) {
  FOOTSTONE_CHECK(start_mark && end_mark);
  auto entry = std::make_shared<PerformanceMeasure>(
      name, start_mark->GetStartTime(),
      end_mark->GetStartTime() - start_mark->GetStartTime(), nullptr);
  return InsertEntry(entry);
}

std::vector<std::shared_ptr<PerformanceEntry>> Performance::GetEntriesByName(const Performance::string_view& name) {
  auto u16n = footstone::StringViewUtils::ConvertEncoding(name, string_view::Encoding::Utf16);
  auto iterator = name_map_.find(u16n);
  if (iterator == name_map_.end()) {
    return {};
  }
  return iterator->second;
}

std::vector<std::shared_ptr<PerformanceEntry>> Performance::GetEntriesByName(const Performance::string_view& name,
                                                                             PerformanceEntry::Type type) {
  auto u16n = footstone::StringViewUtils::ConvertEncoding(name, string_view::Encoding::Utf16);
  auto iterator = name_map_.find(u16n);
  if (iterator == name_map_.end()) {
    return {};
  }
  auto array = iterator->second;
  auto array_iterator = std::find_if(array.begin(), array.end(),
                                  [type](const std::shared_ptr<PerformanceEntry>& entry) {
    return entry->GetType() == type;
  });
  if (array_iterator == array.end()) {
    return {};
  }
  return std::vector<std::shared_ptr<PerformanceEntry>>(array_iterator, array.end());
}

std::vector<std::shared_ptr<PerformanceEntry>> Performance::GetEntriesByType(PerformanceEntry::Type type) {
  auto iterator = type_map_.find(type);
  if (iterator == type_map_.end()) {
    return {};
  }
  return iterator->second;
}

void Performance::RemoveEntry(const Performance::string_view& name) {
  auto u16n = footstone::StringViewUtils::ConvertEncoding(name, string_view::Encoding::Utf16);
  auto name_iterator = name_map_.find(u16n);
  if (name_iterator == name_map_.end()) {
    return;
  }
  for (const auto& entry: name_iterator->second) {
    auto type_iterator = type_map_.find(entry->GetType());
    FOOTSTONE_CHECK(type_iterator != type_map_.end());
    auto array = type_iterator->second;
    auto erase_iterator = std::remove_if(array.begin(), array.end(),
                                      [u16n](const std::shared_ptr<PerformanceEntry>& item) {
      auto u16n2 = footstone::StringViewUtils::ConvertEncoding(item->GetName(), string_view::Encoding::Utf16);
      return u16n2 == u16n;
    });
    if (entry->GetType() == PerformanceEntry::Type::kResource) {
      auto count = std::distance(erase_iterator, array.end());
      resource_timing_current_buffer_size_ -= static_cast<uint32_t>(count);
      FOOTSTONE_CHECK(resource_timing_current_buffer_size_ >= 0);
    }
    array.erase(erase_iterator, array.end());
  }
  name_map_.erase(name_iterator);
}

void Performance::RemoveEntry(PerformanceEntry::Type type) {
  auto type_iterator = type_map_.find(type);
  if (type_iterator == type_map_.end()) {
    return;
  }
  for (const auto& entry: type_iterator->second) {
    auto u16n = footstone::StringViewUtils::ConvertEncoding(entry->GetName(), string_view::Encoding::Utf16);
    auto name_iterator = name_map_.find(u16n);
    FOOTSTONE_CHECK(name_iterator != name_map_.end());
    auto array = name_iterator->second;
    array.erase(std::remove_if(array.begin(), array.end(),
                            [type](const std::shared_ptr<PerformanceEntry>& item) {
      return item->GetType() == type;
    }), array.end());
  }
  if (type == PerformanceEntry::Type::kResource) {
    resource_timing_current_buffer_size_ = 0;
  }
  type_map_.erase(type_iterator);
}

void Performance::RemoveEntry(const Performance::string_view& name, PerformanceEntry::Type type) {
  auto u16n = footstone::StringViewUtils::ConvertEncoding(name, string_view::Encoding::Utf16);
  auto name_iterator = name_map_.find(u16n);
  if (name_iterator == name_map_.end()) {
    return;
  }

  auto name_array = name_iterator->second;
  name_array.erase(std::remove_if(name_array.begin(), name_array.end(),
                               [&type_map = type_map_, &size = resource_timing_current_buffer_size_, u16n, type](
                                   const std::shared_ptr<PerformanceEntry>& entry) {
    if (entry->GetType() != type) {
      return false;
    }
    auto type_iterator = type_map.find(type);
    FOOTSTONE_CHECK(type_iterator != type_map.end());
    auto type_array = type_iterator->second;
    auto erase_iterator = std::remove_if(type_array.begin(), type_array.end(),
                                      [u16n](const std::shared_ptr<PerformanceEntry>& item) {
      auto u16n2 = footstone::StringViewUtils::ConvertEncoding(item->GetName(), string_view::Encoding::Utf16);
      return u16n2 == u16n;
    });
    if (type == PerformanceEntry::Type::kResource) {
      auto count = std::distance(erase_iterator, type_array.end());
      size -= static_cast<uint32_t>(count);
      FOOTSTONE_CHECK(size >= 0);
    }
    type_array.erase(erase_iterator, type_array.end());
    return true;
  }), name_array.end());
}

Performance::TimePoint Performance::Now() {
  return TimePoint::SystemNow();
}

void Performance::ClearMeasures(const Performance::string_view& name) {
  RemoveEntry(name, PerformanceEntry::Type::kMeasure);
}

void Performance::ClearMeasures() {
  RemoveEntry(PerformanceEntry::Type::kMeasure);
}

void Performance::ClearResourceTimings() {
  RemoveEntry(PerformanceEntry::Type::kResource);
}

std::vector<std::shared_ptr<PerformanceEntry>> Performance::GetEntries() {
  std::vector<std::shared_ptr<PerformanceEntry>> ret;
  for (auto [ key, value ]: type_map_) {
    if (!ret.empty()) {
      std::vector<std::shared_ptr<PerformanceEntry>> merged_ret;
      std::merge(ret.begin(), ret.end(), value.begin(), value.end(), std::back_inserter(merged_ret),
                 [](const std::shared_ptr<PerformanceEntry>& lhs, const std::shared_ptr<PerformanceEntry>& rhs) {
                   if (lhs && rhs) {
                     return lhs->GetStartTime() < rhs->GetStartTime();
                   }
                   return true;
                 });
      ret = merged_ret;
    } else {
      ret = value;
    }
  }
  return ret;
}

std::vector<std::shared_ptr<PerformanceEntry>> Performance::GetEntries(const Performance::PerformanceEntryFilterOptions& options) {
  return GetEntries(); // Consistent with chrome results
}

Performance::string_view Performance::ToJSON() {
  return hippy::Performance::string_view();
}

}
}
}
