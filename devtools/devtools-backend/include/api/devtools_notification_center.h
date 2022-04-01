//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#pragma once

#include <memory>
#include "api/notification/devtools_elements_response_notification.h"
#include "api/notification/devtools_log_notification.h"
#include "api/notification/devtools_network_notification.h"
#include "api/notification/devtools_v8_response_notification.h"

namespace tdf {
namespace devtools {

/**
 * devtools提供给外部接入框架可使用的功能接口集合，
 * 包含log桥接，v8调试响应，elements调试通知等
 */
class NotificationCenter {
 public:
  std::shared_ptr<LogNotification> GetLogNotification() { return log_notification_; }
  std::shared_ptr<V8ResponseNotification> GetV8ResponseNotification() { return v8_response_notification_; }
  std::shared_ptr<ElementsResponseNotification> GetElementsResponseNotification() {
    return elements_response_notification_;
  }
  void SetLogNotification(std::shared_ptr<LogNotification> log_notification) { log_notification_ = log_notification; }
  void SetV8ResponseNotification(std::shared_ptr<V8ResponseNotification> v8_response_notification) {
    v8_response_notification_ = v8_response_notification;
  }
  void SetElementsResponseNotification(std::shared_ptr<ElementsResponseNotification> elements_response_notification) {
    elements_response_notification_ = elements_response_notification;
  }
  void SetNetworkNotification(std::shared_ptr<NetworkNotification> network_notification) {
    network_notification_ = network_notification;
  }
  std::shared_ptr<NetworkNotification> GetNetworkNotification() { return network_notification_; }

 private:
  std::shared_ptr<LogNotification> log_notification_;
  std::shared_ptr<V8ResponseNotification> v8_response_notification_;
  std::shared_ptr<ElementsResponseNotification> elements_response_notification_;
  std::shared_ptr<NetworkNotification> network_notification_;
};
}  // namespace devtools
}  // namespace tdf
