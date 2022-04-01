//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2022/2/24.
//

#pragma once

#include <string>
#include "api/notification/data/devtools_http_loading_finished.h"
#include "api/notification/data/devtools_http_request.h"
#include "api/notification/data/devtools_http_response.h"

namespace tdf {
namespace devtools {
/**
 * 网络模块调试数据收集
 * 触发场景：由接入框架的网络监听发起
 */
class NetworkNotification {
 public:
  virtual void RequestWillBeSent(std::string request_id, const DevtoolsHttpRequest& request) = 0;

  virtual void ResponseReceived(std::string request_id, const DevtoolsHttpResponse& response) = 0;

  virtual void LoadingFinished(std::string request_id, const DevtoolsLoadingFinished& loading) = 0;
};
}  // namespace devtools
}  // namespace tdf
