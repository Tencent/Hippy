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
    string_view bundle_url;
    TimePoint start;
    TimePoint end;
  };

  PerformanceNavigationTiming(const string_view& name, const TimePoint& start,
                              const TimePoint& engine_initialization_start, const TimePoint& engine_initialization_end,
                              std::vector<BundleInfo> bundle_info,
                              const TimePoint& load_instance_start, const TimePoint& load_instance_end,
                              const TimePoint& first_frame);

  PerformanceNavigationTiming(const string_view& name);

  inline auto GetEngineInitializationStart() const {
    return engine_initialization_start_;
  }

  inline auto GetEngineInitializationEnd() const {
    return engine_initialization_end_;
  }

  inline auto GetBundleInfo() const {
    return bundle_info_;
  }

  inline auto GetLoadInstanceStart() const {
    return load_instance_start_;
  }

  inline auto GetLoadInstanceEnd() const {
    return load_instance_end_;
  }

  inline auto GetFirstFrame() const {
    return first_frame_;
  }

#define DEFINE_SET_AND_GET_METHOD(method_name, member_type, member) \
  void Set##method_name(member_type t) { \
    member = t; \
  } \
  inline auto Get##method_name() const { \
    return member; \
  }
  DEFINE_SET_AND_GET_METHOD(HippyInitEngineStart, TimePoint, hippy_init_engine_start_)
  DEFINE_SET_AND_GET_METHOD(HippyInitEngineEnd, TimePoint, hippy_init_engine_end_)
  DEFINE_SET_AND_GET_METHOD(HippyJsFrameworkStart, TimePoint, hippy_init_js_framework_start_)
  DEFINE_SET_AND_GET_METHOD(HippyJsFrameworkEnd, TimePoint, hippy_init_js_framework_end_)
  DEFINE_SET_AND_GET_METHOD(HippyBridgeStartupStart, TimePoint, hippy_bridge_startup_start_)
  DEFINE_SET_AND_GET_METHOD(HippyBridgeStartupEnd, TimePoint, hippy_bridge_startup_end_)
  DEFINE_SET_AND_GET_METHOD(HippyRunApplicationStart, TimePoint, hippy_run_application_start_)
  DEFINE_SET_AND_GET_METHOD(HippyRunApplicationEnd, TimePoint, hippy_run_application_end_)
  DEFINE_SET_AND_GET_METHOD(HippyFirstFrameStart, TimePoint, hippy_first_frame_start_)
  DEFINE_SET_AND_GET_METHOD(HippyFirstFrameEnd, TimePoint, hippy_first_frame_end_)
#undef DEFINE_SET_AND_GET_METHOD

  virtual string_view ToJSON() override;

 private:
//  TimePoint dom_complete_;
//  TimePoint dom_content_loaded_event_end_;
//  TimePoint dom_content_loaded_event_start_;
//  TimePoint dom_interactive_;
//  TimePoint load_event_end_;
//  TimePoint load_event_start_;
//  uint32_t redirect_count_;
//  TimePoint request_start_;
//  TimePoint response_start_;
//  string_view type_; // navigate, reload, back_forward or prerender
//  TimePoint unload_event_end_;
//  TimePoint unload_event_start_;

    TimePoint engine_initialization_start_;
    TimePoint engine_initialization_end_;
    std::vector<BundleInfo> bundle_info_;
    TimePoint load_instance_start_;
    TimePoint load_instance_end_;
    TimePoint first_frame_;

  TimePoint hippy_init_engine_start_;
  TimePoint hippy_init_engine_end_;
  TimePoint hippy_init_js_framework_start_; // supported by Android only
  TimePoint hippy_init_js_framework_end_;   // supported by Android only
  TimePoint hippy_bridge_startup_start_;
  TimePoint hippy_bridge_startup_end_;
  TimePoint hippy_run_application_start_;
  TimePoint hippy_run_application_end_;
  TimePoint hippy_first_frame_start_;
  TimePoint hippy_first_frame_end_;
};

}
}
}
