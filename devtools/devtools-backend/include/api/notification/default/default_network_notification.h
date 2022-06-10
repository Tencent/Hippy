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

#include <memory>
#include <string>
#include "api/notification/devtools_network_notification.h"
#include "module/domain/network_domain.h"

namespace hippy::devtools {
class DefaultNetworkNotification : public NetworkNotification {
 public:
  explicit DefaultNetworkNotification(std::shared_ptr<NetworkDomain> network_domain)
      : network_domain_(network_domain) {}
  void RequestWillBeSent(std::string request_id, const DevtoolsHttpRequest& request) override;

  void ResponseReceived(std::string request_id, const DevtoolsHttpResponse& response) override;

  void LoadingFinished(std::string request_id, const DevtoolsLoadingFinished& loading) override;

 private:
  std::shared_ptr<NetworkDomain> network_domain_;
};
}  // namespace hippy::devtools
