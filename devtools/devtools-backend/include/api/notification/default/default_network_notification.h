//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2022/2/24.
//

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
