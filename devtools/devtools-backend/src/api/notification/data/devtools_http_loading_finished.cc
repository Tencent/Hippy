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

#include "api/notification/data/devtools_http_loading_finished.h"

constexpr char kLoadingFinishedRequestId[] = "requestId";
constexpr char kLoadingFinishedTimestamp[] = "timestamp";
constexpr char kLoadingFinishedEncodeDataLength[] = "encodedDataLength";
constexpr char kLoadingFinishedShouldReportCorbBlocking[] = "shouldReportCorbBlocking";

namespace hippy {
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
}  // namespace hippy
