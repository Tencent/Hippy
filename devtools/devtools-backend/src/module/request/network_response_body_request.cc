//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2022/3/24.

#include "module/request/network_response_body_request.h"
#include <string>
#include "nlohmann/json.hpp"

constexpr const char* kFrontendRequestId = "requestId";

namespace tdf {
namespace devtools {
void NetworkResponseBodyRequest::RefreshParams(const std::string& params) {
  auto params_json = nlohmann::json::parse(params);
  if (!params_json.is_object()) {
    return;
  }
  request_id_ = params_json[kFrontendRequestId];
}
std::string NetworkResponseBodyRequest::GetRequestId() const { return request_id_; }
}  // namespace devtools
}  // namespace tdf
