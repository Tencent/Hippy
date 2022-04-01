//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2022/2/24.
//

#include "api/notification/data/devtools_http_loading_finished.h"

constexpr const char* kLoadingFinishedRequestId = "requestId";
constexpr const char* kLoadingFinishedTimestamp = "timestamp";
constexpr const char* kLoadingFinishedEncodeDataLength = "encodedDataLength";
constexpr const char* kLoadingFinishedShouldReportCorbBlocking = "shouldReportCorbBlocking";

namespace tdf {
namespace devtools {
std::string DevtoolsLoadingFinished::Serialize() const {
  std::string result = "{\"";
  result += kLoadingFinishedRequestId;
  result += "\":\"";
  result += request_id_;
  result += "\",\"";
  result += kLoadingFinishedTimestamp;
  result += "\":";
  result += std::to_string(timestamp_);
  result += ",\"";
  result += kLoadingFinishedEncodeDataLength;
  result += "\":";
  result += std::to_string(encoded_data_length_);
  result += ",\"";
  result += kLoadingFinishedShouldReportCorbBlocking;
  result += "\":";
  result += should_report_corb_blocking_ ? "true" : "false";
  result += "}";
  return result;
}
}  // namespace devtools
}  // namespace tdf
