/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include "module/domain/tdf_performance_domain.h"
#include "api/devtools_backend_service.h"
#include "devtools_base/common/macros.h"
#include "devtools_base/logging.h"
#include "devtools_base/time.h"
#include "module/domain_register.h"

namespace hippy::devtools {

std::string TdfPerformanceDomain::GetDomainName() { return kFrontendKeyDomainNameTDFPerformance; }

void TdfPerformanceDomain::RegisterMethods() {
  REGISTER_DOMAIN(TdfPerformanceDomain, Start, BaseRequest);
  REGISTER_DOMAIN(TdfPerformanceDomain, End, BaseRequest);
  REGISTER_DOMAIN(TdfPerformanceDomain, V8Tracing, BaseRequest);
  REGISTER_DOMAIN(TdfPerformanceDomain, FrameTimings, BaseRequest);
  REGISTER_DOMAIN(TdfPerformanceDomain, Timeline, BaseRequest);
}

void TdfPerformanceDomain::RegisterCallback() {}

void TdfPerformanceDomain::Start(const BaseRequest& request) {
  BACKEND_LOGD(TDF_BACKEND, "TdfPerformanceDomain::Start");
  auto performance_adapter = GetDataProvider()->performance_adapter;
  if (performance_adapter) {
    performance_adapter->ResetFrameTimings();
    performance_adapter->ResetTimeline();
  } else {
    BACKEND_LOGE(TDF_BACKEND, "TdfPerformanceDomain::Start performance_adapter is null");
  }
  auto tracing_adapter = GetDataProvider()->tracing_adapter;
  if (tracing_adapter) {
    tracing_adapter->StartTracing();
  } else {
    BACKEND_LOGE(TDF_BACKEND, "TdfPerformanceDomain::Start tracing_adapter is null");
  }
  nlohmann::json start_time_json = nlohmann::json::object();
  start_time_json["startTime"] = SteadyClockTime::NowTimeSinceEpochStr();
  ResponseResultToFrontend(request.GetId(), start_time_json.dump());
}

void TdfPerformanceDomain::End(const BaseRequest& request) {
  // just end record end, and then get tracing and timeline respectively
  BACKEND_LOGD(TDF_BACKEND, "TdfPerformanceDomain::End");
  nlohmann::json end_time_json = nlohmann::json::object();
  end_time_json["endTime"] = SteadyClockTime::NowTimeSinceEpochStr();
  ResponseResultToFrontend(request.GetId(), end_time_json.dump());
}

void TdfPerformanceDomain::V8Tracing(const BaseRequest& request) {
  auto tracing_adapter = GetDataProvider()->tracing_adapter;
  if (tracing_adapter) {
    tracing_adapter->StopTracing([request, DEVTOOLS_WEAK_THIS](const std::string& result) {
      DEVTOOLS_DEFINE_AND_CHECK_SELF(TdfPerformanceDomain)
      self->ResponseResultToFrontend(request.GetId(), result);
    });
  } else {
    ResponseErrorToFrontend(request.GetId(), kErrorFailCode, "get v8 tracing failed, no data.");
  }
}

void TdfPerformanceDomain::FrameTimings(const BaseRequest& request) {
  auto performance_adapter = GetDataProvider()->performance_adapter;
  if (performance_adapter) {
    performance_adapter->CollectFrameTimings([DEVTOOLS_WEAK_THIS, request](const FrameTimingMetas& frame_metas) {
      DEVTOOLS_DEFINE_AND_CHECK_SELF(TdfPerformanceDomain)
      self->ResponseResultToFrontend(request.GetId(), frame_metas.Serialize());
    });
  } else {
    ResponseErrorToFrontend(request.GetId(), kErrorFailCode, "get frame timings failed, no data.");
  }
}

void TdfPerformanceDomain::Timeline(const BaseRequest& request) {
  auto performance_adapter = GetDataProvider()->performance_adapter;
  if (performance_adapter) {
    performance_adapter->CollectTimeline([DEVTOOLS_WEAK_THIS, request](const TraceEventMetas& time_line) {
      DEVTOOLS_DEFINE_AND_CHECK_SELF(TdfPerformanceDomain)
      self->ResponseResultToFrontend(request.GetId(), time_line.Serialize());
    });
  } else {
    ResponseErrorToFrontend(request.GetId(), kErrorFailCode, "get time line failed, no data.");
  }
}

}  // namespace hippy::devtools
