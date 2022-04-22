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
#include "tunnel/tunnel_service.h"

namespace tdf {
namespace devtools {
/**
 * 网络模块调试数据收集
 * 触发场景：由接入框架的网络监听发起
 */
class DefaultNetworkNotification : public NetworkNotification {
 public:
  explicit DefaultNetworkNotification(std::shared_ptr<TunnelService> tunnel_service)
      : tunnel_service_(tunnel_service) {}
  void RequestWillBeSent(std::string request_id, const DevtoolsHttpRequest& request) override;

  void ResponseReceived(std::string request_id, const DevtoolsHttpResponse& response) override;

  void LoadingFinished(std::string request_id, const DevtoolsLoadingFinished& loading) override;

 private:
  std::shared_ptr<TunnelService> tunnel_service_;
};
}  // namespace devtools
}  // namespace tdf
