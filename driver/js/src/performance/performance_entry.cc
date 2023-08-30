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

#include "driver/performance/performance_entry.h"

#include "footstone/string_view.h"
#include "footstone/string_view_utils.h"
#include "footstone/logging.h"

using string_view = footstone::string_view;

namespace hippy {
inline namespace driver {
inline namespace performance {

string_view PerformanceEntry::GetEntryTypeString(Type type) {
  switch (type) {
    case Type::kFrame: {
      return "frame";
    }
    case Type::kNavigation: {
      return "navigation";
    };
    case Type::kResource: {
      return "resource";
    };
    case Type::kMark: {
      return "mark";
    };
    case Type::kMeasure: {
      return "measure";
    };
    case Type::kPaint: {
      return "paint";
    };
    default: {
      FOOTSTONE_UNREACHABLE();
    }
  }
}

PerformanceEntry::Type PerformanceEntry::GetEntryType(const string_view& string_type) {
  auto u16n = footstone::StringViewUtils::ConvertEncoding(string_type, string_view::Encoding::Utf16);
  if (u16n == u"frame") {
    return Type::kFrame;
  } else if (u16n == u"navigation") {
    return Type::kNavigation;
  } else if (u16n == u"resource") {
    return Type::kResource;
  } else if (u16n == u"mark") {
    return Type::kMark;
  } else if (u16n == u"measure") {
    return Type::kMeasure;
  } else if (u16n == u"paint") {
    return Type::kPaint;
  } else {
    return Type::kError;
  }
}

string_view PerformanceEntry::GetSubTypeString(PerformanceEntry::SubType type) {
  switch (type) {
    case SubType::kPerformanceFrameTiming: {
      return "PerformanceFrameTiming";
    }
    case SubType::kPerformanceNavigationTiming: {
      return "PerformanceNavigationTiming";
    }
    case SubType::kPerformanceResourceTiming: {
      return "PerformanceResourceTiming";
    }
    case SubType::kPerformanceMark: {
      return "PerformanceMark";
    }
    case SubType::kPerformanceMeasure: {
      return "PerformanceMeasure";
    }
    case SubType::kPerformancePaintTiming: {
      return "PerformancePaintTiming";
    }
    default: {
      FOOTSTONE_UNREACHABLE();
    }
  }
}

PerformanceEntry::string_view PerformanceEntry::ToJSON() {
  return "";
}

}
}
}
