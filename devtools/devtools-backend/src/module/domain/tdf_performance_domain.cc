//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by Jianguoxie on 29/7/2021.
//

#include "module/domain/tdf_performance_domain.h"
#include "api/devtools_backend_service.h"
#include "devtools_base/logging.h"
#include "devtools_base/time.h"
#include "module/domain_register.h"

namespace tdf {
namespace devtools {

constexpr const char* kPerformanceDomainMethodStart = "start";
constexpr const char* kPerformanceDomainMethodEnd = "end";
constexpr const char* kPerformanceDomainMethodv8Tracing = "v8Tracing";
constexpr const char* kPerformanceDomainMethodFrameTimings = "frameTimings";
constexpr const char* kPerformanceDomainMethodTimeline = "timeline";

std::string_view TDFPerformanceDomain::GetDomainName() { return kFrontendKeyDomainNameTDFPerformance; }

void TDFPerformanceDomain::RegisterMethods() {
  REGISTER_DOMAIN(TDFPerformanceDomain, Start, DomainBaseRequest);
  REGISTER_DOMAIN(TDFPerformanceDomain, End, DomainBaseRequest);
  REGISTER_DOMAIN(TDFPerformanceDomain, V8Tracing, DomainBaseRequest);
  REGISTER_DOMAIN(TDFPerformanceDomain, FrameTimings, DomainBaseRequest);
  REGISTER_DOMAIN(TDFPerformanceDomain, Timeline, DomainBaseRequest);
}

void TDFPerformanceDomain::Start(const DomainBaseRequest& request) {
  BACKEND_LOGD(TDF_BACKEND, "PerformanceStart.");
  auto performance_adapter = GetDataProvider()->GetPerformanceAdapter();
  if (performance_adapter) {
    // 置空frameTimings
    performance_adapter->ResetFrameTimings();
    // 置空timeline
    performance_adapter->ResetTimeline();
  } else {
    BACKEND_LOGE(TDF_BACKEND, "PerformanceStart performance_adapter is null");
  }

  // 开始获取v8-tracing
  auto tracing_adapter = GetDataProvider()->GetTracingAdapter();
  if (tracing_adapter) {
    tracing_adapter->StartTracing();
  }

  // 组装数据
  nlohmann::json start_time_json = nlohmann::json::object();
  start_time_json["startTime"] = SteadyClockTime::NowTimeSinceEpochStr();
  ResponseResultToFrontend(request.GetId(), start_time_json.dump());
  return;
}

void TDFPerformanceDomain::End(const DomainBaseRequest& request) {
  BACKEND_LOGD(TDF_BACKEND, "PerformanceEnd.");
  auto performance_adapter = GetDataProvider()->GetPerformanceAdapter();
  if (!performance_adapter) {
    BACKEND_LOGE(TDF_BACKEND, "PerformanceEnd performance_adapter is null");
  }
  nlohmann::json end_time_json = nlohmann::json::object();
  end_time_json["endTime"] = SteadyClockTime::NowTimeSinceEpochStr();
  ResponseResultToFrontend(request.GetId(), end_time_json.dump());
}

void TDFPerformanceDomain::V8Tracing(const DomainBaseRequest& request) {
  BACKEND_LOGD(TDF_BACKEND, "HandlePerformanceV8Tracing.");
  auto tracing_adapter = GetDataProvider()->GetTracingAdapter();
  if (!tracing_adapter) {
    ResponseError(request.GetId(), kPerformanceDomainMethodv8Tracing);
    return;
  }
  tracing_adapter->StopTracing(
      [request, this](const std::string& result) { ResponseResultToFrontend(request.GetId(), result); });
}

void TDFPerformanceDomain::FrameTimings(const DomainBaseRequest& request) {
  BACKEND_LOGD(TDF_BACKEND, "PerformanceFrameTimings.");
  auto performance_adapter = GetDataProvider()->GetPerformanceAdapter();
  if (!performance_adapter) {
    ResponseError(request.GetId(), kPerformanceDomainMethodFrameTimings);
    return;
  }
  performance_adapter->CollectFrameTimings([this, request](const FrameTimingMetas& frame_metas) {
    ResponseResultToFrontend(request.GetId(), frame_metas.Serialize());
  });
}

void TDFPerformanceDomain::Timeline(const DomainBaseRequest& request) {
  BACKEND_LOGD(TDF_BACKEND, "PerformanceTimeline.");
  auto performance_adapter = GetDataProvider()->GetPerformanceAdapter();
  if (!performance_adapter) {
    ResponseError(request.GetId(), kPerformanceDomainMethodTimeline);
    return;
  }
  performance_adapter->CollectTimeline([this, request](const TraceEventMetas& time_line) {
    ResponseResultToFrontend(request.GetId(), time_line.Serialize());
  });
}

void TDFPerformanceDomain::ResponseError(int32_t id, const std::string& method) {
  std::string error_msg = "";
  if (kPerformanceDomainMethodStart == method) {
    error_msg = "start failed, no data.";
  } else if (kPerformanceDomainMethodEnd == method) {
    error_msg = "end failed, no data.";
  } else if (kPerformanceDomainMethodv8Tracing == method) {
    error_msg = "get v8 tracing failed, no data.";
  } else if (kPerformanceDomainMethodFrameTimings == method) {
    error_msg = "get frame timings failed, no data.";
  } else if (kPerformanceDomainMethodTimeline == method) {
    error_msg = "get time line failed, no data.";
  }

  ResponseErrorToFrontend(id, kErrorFailCode, error_msg);
}

}  // namespace devtools
}  // namespace tdf
