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
#include "footstone/string_view_utils.h"
#include <utility>

namespace hippy {
inline namespace driver {
inline namespace performance {

PerformanceNavigationTiming::PerformanceNavigationTiming(const string_view& name)
: PerformanceEntry(name, SubType::kPerformanceNavigationTiming, Type::kNavigation) {}

PerformanceEntry::string_view PerformanceNavigationTiming::ToJSON() {
  return PerformanceEntry::ToJSON();
}

PerformanceNavigationTiming::BundleInfo& PerformanceNavigationTiming::BundleInfoOfUrl(const string_view& url) {
  auto u16n = footstone::StringViewUtils::ConvertEncoding(url, string_view::Encoding::Utf16);
  for (auto& info : bundle_info_array_) {
    auto u16n2 = footstone::StringViewUtils::ConvertEncoding(info.url_, string_view::Encoding::Utf16);
    if (u16n2 == u16n) {
      return info;
    }
  }

  PerformanceNavigationTiming::BundleInfo info;
  info.url_ = url;
  bundle_info_array_.emplace_back(info);
  return bundle_info_array_.back();
}

}
}
}
