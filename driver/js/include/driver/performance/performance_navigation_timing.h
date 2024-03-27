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

#include <vector>

#include "driver/performance/performance_entry.h"

namespace hippy {
inline namespace driver {
inline namespace performance {

class PerformanceNavigationTiming : public PerformanceEntry {
 public:
  struct BundleInfo {
    string_view url_;
    TimePoint execute_source_start_;
    TimePoint execute_source_end_;
  };

  PerformanceNavigationTiming(const string_view& name);

#define DEFINE_SET_AND_GET_METHOD(method_name, member_type, member) \
  void Set##method_name(member_type t) { \
    member = t; \
    if (start_time_.ToEpochDelta() == TimeDelta::Zero()) { \
      start_time_ = t; \
    } else if (t.ToEpochDelta() < start_time_.ToEpochDelta()) { \
      start_time_ = t; \
    } else if (t - start_time_ > duration_) { \
      duration_ = t - start_time_; \
    } \
  } \
  inline auto Get##method_name() const { \
    return member; \
  }
  DEFINE_SET_AND_GET_METHOD(HippyNativeInitStart, TimePoint, hippy_native_init_start_)
  DEFINE_SET_AND_GET_METHOD(HippyNativeInitEnd, TimePoint, hippy_native_init_end_)
  DEFINE_SET_AND_GET_METHOD(HippyJsEngineInitStart, TimePoint, hippy_js_engine_init_start_)
  DEFINE_SET_AND_GET_METHOD(HippyJsEngineInitEnd, TimePoint, hippy_js_engine_init_end_)
  DEFINE_SET_AND_GET_METHOD(HippyRunApplicationStart, TimePoint, hippy_run_application_start_)
  DEFINE_SET_AND_GET_METHOD(HippyRunApplicationEnd, TimePoint, hippy_run_application_end_)
  DEFINE_SET_AND_GET_METHOD(HippyDomStart, TimePoint, hippy_dom_start_)
  DEFINE_SET_AND_GET_METHOD(HippyDomEnd, TimePoint, hippy_dom_end_)
  DEFINE_SET_AND_GET_METHOD(HippyFirstFrameStart, TimePoint, hippy_first_frame_start_)
  DEFINE_SET_AND_GET_METHOD(HippyFirstFrameEnd, TimePoint, hippy_first_frame_end_)
  DEFINE_SET_AND_GET_METHOD(HippyFirstContentfulPaintEnd, TimePoint, hippy_first_contentful_paint_end_)

#undef DEFINE_SET_AND_GET_METHOD

  inline const std::vector<BundleInfo>& GetBundleInfoArray() const {
    return bundle_info_array_;
  }

  BundleInfo& BundleInfoOfUrl(const string_view& url);

  virtual string_view ToJSON() override;

 private:
  TimePoint hippy_native_init_start_;
  TimePoint hippy_native_init_end_;
  TimePoint hippy_js_engine_init_start_;
  TimePoint hippy_js_engine_init_end_;
  std::vector<BundleInfo> bundle_info_array_;
  TimePoint hippy_run_application_start_;
  TimePoint hippy_run_application_end_;
  TimePoint hippy_dom_start_;
  TimePoint hippy_dom_end_;
  TimePoint hippy_first_frame_start_;
  TimePoint hippy_first_frame_end_;
  TimePoint hippy_first_contentful_paint_end_;
};

}
}
}
