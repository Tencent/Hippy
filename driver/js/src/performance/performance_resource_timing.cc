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

PerformanceResourceTiming::PerformanceResourceTiming(
    const string_view& name,
    TimePoint start_time,
    TimeDelta duration,
    const InitiatorType& initiator_type,
    const string_view& next_hop_protocol,
    TimePoint worker_start,
    TimePoint redirect_start,
    TimePoint redirect_end,
    TimePoint fetch_start,
    TimePoint domain_lookup_start,
    TimePoint domain_lookup_end,
    TimePoint connect_start,
    TimePoint connect_end,
    TimePoint secure_connection_start,
    TimePoint request_start,
    TimePoint response_start,
    TimePoint response_end,
    uint64_t transfer_size,
    uint64_t encoded_body_size,
    uint64_t decoded_body_size) :
    PerformanceEntry(name, SubType::kPerformanceResourceTiming, Type::kResource, start_time, duration),
    initiator_type_(initiator_type),
    next_hop_protocol_(next_hop_protocol),
    worker_start_(worker_start),
    redirect_start_(redirect_start),
    redirect_end_(redirect_end),
    fetch_start_(fetch_start),
    domain_lookup_start_(domain_lookup_start),
    domain_lookup_end_(domain_lookup_end),
    connect_start_(connect_start),
    connect_end_(connect_end),
    secure_connection_start_(secure_connection_start),
    request_start_(request_start),
    response_start_(response_start),
    response_end_(response_end),
    transfer_size_(transfer_size),
    encoded_body_size_(encoded_body_size),
    decoded_body_size_(decoded_body_size) {}

string_view PerformanceResourceTiming::ToJSON() {
  return "";
}

string_view PerformanceResourceTiming::GetInitiatorString(InitiatorType type) {
  switch (type) {
    case InitiatorType::AUDIO:{
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
