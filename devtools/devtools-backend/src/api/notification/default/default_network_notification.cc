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

#include "api/notification/default/default_network_notification.h"

constexpr char kDomainNetworkLoadingFinished[] = "Network.loadingFinished";
constexpr char kDomainNetworkRequestWillBeSent[] = "Network.requestWillBeSent";
constexpr char kDomainNetworkResponseReceived[] = "Network.responseReceived";

namespace hippy::devtools {
void DefaultNetworkNotification::RequestWillBeSent(std::string request_id, const DevtoolsHttpRequest& request) {
  network_domain_->SendEventToFrontend(InspectEvent(kDomainNetworkRequestWillBeSent, request.Serialize()));
}

void DefaultNetworkNotification::ResponseReceived(std::string request_id, const DevtoolsHttpResponse& response) {
  network_domain_->OnResponseReceived(request_id, response.GetBodyData());
  network_domain_->SendEventToFrontend(InspectEvent(kDomainNetworkResponseReceived, response.Serialize()));
}

void DefaultNetworkNotification::LoadingFinished(std::string request_id, const DevtoolsLoadingFinished& loading) {
  network_domain_->SendEventToFrontend((InspectEvent(kDomainNetworkLoadingFinished, loading.Serialize())));
}
}  // namespace hippy::devtools
