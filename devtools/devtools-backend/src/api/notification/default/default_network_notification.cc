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

#pragma once

#include "api/notification/default/default_network_notification.h"
#include <string>

constexpr const char* kDomainNetworkLoadingFinished = "Network.loadingFinished";
constexpr const char* kDomainNetworkRequestWillBeSent = "Network.requestWillBeSent";
constexpr const char* kDomainNetworkResponseReceived = "Network.responseReceived";

namespace tdf {
namespace devtools {
void DefaultNetworkNotification::RequestWillBeSent(std::string request_id, const DevtoolsHttpRequest& request) {
  tunnel_service_->SendDataToFrontend(
      InspectEvent(kDomainNetworkRequestWillBeSent, request.Serialize()).ToJsonString());
}

void DefaultNetworkNotification::ResponseReceived(std::string request_id, const DevtoolsHttpResponse& response) {
  tunnel_service_->SendDataToFrontend(
      InspectEvent(kDomainNetworkResponseReceived, response.Serialize()).ToJsonString());
}

void DefaultNetworkNotification::LoadingFinished(std::string request_id, const DevtoolsLoadingFinished& loading) {
  tunnel_service_->SendDataToFrontend(InspectEvent(kDomainNetworkLoadingFinished, loading.Serialize()).ToJsonString());
}
}  // namespace devtools
}  // namespace tdf
