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

#include "module/domain/network_domain.h"

#include "footstone/logging.h"
#include "module/domain_register.h"
#include "nlohmann/json.hpp"
#include "websocketpp/base64/base64.hpp"

namespace hippy::devtools {
constexpr char kResponseBody[] = "body";
constexpr char kResponseBase64Encoded[] = "base64Encoded";

std::string NetworkDomain::GetDomainName() { return kFrontendKeyDomainNameNetwork; }

void NetworkDomain::RegisterMethods() {
  REGISTER_DOMAIN(NetworkDomain, GetResponseBody, NetworkResponseBodyRequest)
}

void NetworkDomain::OnResponseReceived(const std::string& request_id, DevtoolsHttpResponse&& response) {
  response_map_[request_id] = std::move(response);
}

void NetworkDomain::RegisterCallback() {}

void NetworkDomain::GetResponseBody(const NetworkResponseBodyRequest& request) {
  FOOTSTONE_DLOG(INFO) << kDevToolsTag << "NetworkDomain::GetResponseBody";
  std::string request_id = request.GetRequestId();
  auto find_response = response_map_.find(request_id);
  if (find_response != response_map_.end()) {
    auto response = find_response->second;
    if (!response.GetBodyData().empty()) {
      nlohmann::json response_json = nlohmann::json::object();
      auto is_encode_base64 = response.IsBodyBase64();
      auto body_data = response.GetBodyData();
      response_json[kResponseBase64Encoded] = is_encode_base64;
      if (is_encode_base64) {
        std::string encode_body = websocketpp::base64_encode(body_data);
        response_json[kResponseBody] = encode_body;
      } else {
        response_json[kResponseBody] = body_data;
      }
      ResponseResultToFrontend(request.GetId(), response_json.dump());
      response_map_.erase(find_response);
    }
  } else {
    ResponseErrorToFrontend(request.GetId(), kErrorNotSupport, "not support get network body");
    FOOTSTONE_DLOG(ERROR) << kDevToolsTag << "NetworkDomain::GetResponseBody not support get network body";
  }
}
}  // namespace hippy::devtools
