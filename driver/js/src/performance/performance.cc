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

namespace hippy {
inline namespace driver {
inline namespace performance {

constexpr uint32_t kMaxSize = 250;

Performance::Performance(): resource_timing_current_buffer_size_(0),
    resource_timing_max_buffer_size_(kMaxSize),
    time_origin_(TimePoint::Now()) {}

void Performance::Mark(const Performance::string_view& name) {
  auto entry = std::make_shared<PerformanceMark>(
      name, TimePoint::Now(), nullptr);
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
  auto start_mark_entry = GetEntriesByName(start_mark, PerformanceEntry::Type::kMark);
  if (!start_mark_entry) {
    return false;
  }
  auto entry = std::make_shared<PerformanceEntry>(
      name, PerformanceEntry::SubType::kPerformanceMeasure, PerformanceEntry::Type::kMeasure, start_mark_entry->GetStartTime(),
      Now() - start_mark_entry->GetStartTime());
  return InsertEntry(entry);
}

bool Performance::Measure(const Performance::string_view& name,
                          const Performance::string_view& start_mark,
                          const Performance::string_view& end_mark) {
  auto start_mark_entry = GetEntriesByName(start_mark, PerformanceEntry::Type::kMark);
  if (!start_mark_entry) {
    return false;
  }
  auto end_mark_entry = GetEntriesByName(end_mark, PerformanceEntry::Type::kMark);
  if (!end_mark_entry) {
    return false;
  }
  Measure(name, start_mark_entry, end_mark_entry);
  return true;
}

bool Performance::InsertEntry(const std::shared_ptr<PerformanceEntry>& entry) {
  if (entry->GetType() == PerformanceEntry::Type::kResource && resource_timing_current_buffer_size_ >= resource_timing_max_buffer_size_) {
    return false;
  }
  auto name = entry->GetName();
  auto name_iterator = name_map_.find(name);
  if (name_iterator == name_map_.end()) {
    name_map_[name] = { entry };
  } else {
    name_map_[name].push_back(entry);
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
  auto entry = std::make_shared<PerformanceEntry>(
      name, PerformanceEntry::SubType::kPerformanceMeasure, PerformanceEntry::Type::kMeasure, start_mark->GetStartTime(),
      end_mark->GetStartTime() - end_mark->GetStartTime());
  return InsertEntry(entry);
}

std::shared_ptr<PerformanceEntry> Performance::GetEntriesByName(const Performance::string_view& name) {
  auto iterator = name_map_.find(name);
  if (iterator == name_map_.end()) {
    return nullptr;
  }
  return iterator->second.back();
}

std::shared_ptr<PerformanceEntry> Performance::GetEntriesByName(const Performance::string_view& name,
                                                                PerformanceEntry::Type type) {
  auto iterator = name_map_.find(name);
  if (iterator == name_map_.end()) {
    return nullptr;
  }
  auto array = iterator->second;
  auto array_iterator = std::find_if(array.rbegin(), array.rend(),
                                  [type](const std::shared_ptr<PerformanceEntry>& entry) {
    return entry->GetType() == type;
  });
  if (array_iterator == array.rend()) {
    return nullptr;
  }
  return *array_iterator;
}

std::vector<std::shared_ptr<PerformanceEntry>> Performance::GetEntriesByType(PerformanceEntry::Type type) {
  auto iterator = type_map_.find(type);
  if (iterator == type_map_.end()) {
    return {};
  }
  return iterator->second;
}

void Performance::RemoveEntry(const Performance::string_view& name) {
  auto name_iterator = name_map_.find(name);
  if (name_iterator == name_map_.end()) {
    return;
  }
  for (const auto& entry: name_iterator->second) {
    auto type_iterator = type_map_.find(entry->GetType());
    FOOTSTONE_CHECK(type_iterator != type_map_.end());
    auto array = type_iterator->second;
    auto erase_iterator = std::remove_if(array.begin(), array.end(),
                                      [name](const std::shared_ptr<PerformanceEntry>& item) {
      return item->GetName() == name;
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
    auto name_iterator = name_map_.find(entry->GetName());
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
  auto name_iterator = name_map_.find(name);
  if (name_iterator == name_map_.end()) {
    return;
  }

  auto name_array = name_iterator->second;
  name_array.erase(std::remove_if(name_array.begin(), name_array.end(),
                               [&type_map = type_map_, &size = resource_timing_current_buffer_size_, type](
                                   const std::shared_ptr<PerformanceEntry>& entry) {
    if (entry->GetType() != type) {
      return false;
    }
    auto type_iterator = type_map.find(type);
    FOOTSTONE_CHECK(type_iterator != type_map.end());
    auto type_array = type_iterator->second;
    auto erase_iterator = std::remove_if(type_array.begin(), type_array.end(),
                                      [name = entry->GetName()](const std::shared_ptr<PerformanceEntry>& item) {
      return item->GetName() == name;
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
  return TimePoint::Now();
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
      auto size = ret.size() + value.size();
      ret.resize(size);
      std::merge(ret.begin(), ret.end(), value.begin(), value.end(), ret.begin(),
                 [](const std::shared_ptr<PerformanceEntry>& lhs, const std::shared_ptr<PerformanceEntry>& rhs) {
                   if (lhs && rhs) {
                     return lhs->GetStartTime() < rhs->GetStartTime();
                   }
                   return true;
                 });
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
