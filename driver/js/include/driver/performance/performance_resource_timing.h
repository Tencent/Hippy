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

#include "driver/performance/performance_entry.h"

namespace hippy {
inline namespace driver {
inline namespace performance {

class PerformanceResourceTiming: public PerformanceEntry {
 public:
  enum class InitiatorType {
    OTHER, AUDIO, BEACON, BODY, CSS, EARLY_HINT, EMBED, FETCH, FRAME, IFRAME, ICON, IMAGE, IMG, INPUT, LINK, NAVIGATION, OBJECT,
    PING, SCRIPT, TRACK, VIDEO, XMLHTTPREQUEST
  };

  PerformanceResourceTiming(const string_view& name);

  void SetInitiatorType(InitiatorType t) {
    initiator_type_ = t;
  }
  inline auto GetInitiatorType() const {
    return initiator_type_;
  }
#define DEFINE_SET_AND_GET_METHOD(method_name, member_type, member) \
  void Set##method_name(member_type t) { \
    member = t; \
    if (start_time_.ToEpochDelta() == TimeDelta::Zero()) { \
      start_time_ = t; \
    } else if (t - start_time_ > duration_) { \
      duration_ = t - start_time_; \
    } \
  } \
  inline auto Get##method_name() const { \
    return member; \
  }
  DEFINE_SET_AND_GET_METHOD(LoadSourceStart, TimePoint, load_source_start_)
  DEFINE_SET_AND_GET_METHOD(LoadSourceEnd, TimePoint, load_source_end_)
#undef DEFINE_SET_AND_GET_METHOD

  virtual string_view ToJSON() override;

  static string_view GetInitiatorString(InitiatorType type);

 private:
  InitiatorType initiator_type_ = InitiatorType::OTHER;
  TimePoint load_source_start_;
  TimePoint load_source_end_;
};

}
}
}
