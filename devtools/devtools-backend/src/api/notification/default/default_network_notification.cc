//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2022/2/24.
//

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
