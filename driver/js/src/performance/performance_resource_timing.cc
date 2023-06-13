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

#include "driver/performance/performance_resource_timing.h"

#include "footstone/logging.h"
#include "footstone/string_view.h"
#include "footstone/time_point.h"

using string_view = footstone::string_view;
using TimePoint = footstone::TimePoint;

namespace hippy {
inline namespace driver {
inline namespace performance {

PerformanceResourceTiming::PerformanceResourceTiming(const string_view& name)
: PerformanceEntry(name, SubType::kPerformanceResourceTiming, Type::kResource) {}

string_view PerformanceResourceTiming::ToJSON() {
  return "";
}

string_view PerformanceResourceTiming::GetInitiatorString(InitiatorType type) {
  switch (type) {
    case InitiatorType::OTHER: {
      return "other";
    }
    case InitiatorType::AUDIO: {
      return "audio";
    }
    case InitiatorType::BEACON: {
      return "beacon";
    };
    case InitiatorType::BODY: {
      return "body";
    };
    case InitiatorType::CSS: {
      return "css";
    };
    case InitiatorType::EARLY_HINT: {
      return "early_hint";
    };
    case InitiatorType::EMBED: {
      return "embed";
    };
    case InitiatorType::FETCH: {
      return "fetch";
    };
    case InitiatorType::FRAME: {
      return "frame";
    };
    case InitiatorType::IFRAME: {
      return "iframe";
    };
    case InitiatorType::ICON: {
      return "icon";
    };
    case InitiatorType::IMAGE: {
      return "image";
    };
    case InitiatorType::IMG: {
      return "img";
    };
    case InitiatorType::INPUT: {
      return "input";
    };
    case InitiatorType::LINK: {
      return "link";
    };
    case InitiatorType::NAVIGATION: {
      return "navigation";
    };
    case InitiatorType::OBJECT: {
      return "object";
    };
    case InitiatorType::PING: {
      return "ping";
    };
    case InitiatorType::SCRIPT: {
      return "script";
    };
    case InitiatorType::TRACK: {
      return "track";
    };
    case InitiatorType::VIDEO: {
      return "video";
    };
    case InitiatorType::XMLHTTPREQUEST: {
      return "xmlhttprequest";
    };
    default: {
      FOOTSTONE_UNREACHABLE();
    }
  }
}

}
}
}
