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
#include "api/notification/devtools_elements_response_notification.h"
#include "api/notification/devtools_log_notification.h"
#include "api/notification/devtools_network_notification.h"
#include "api/notification/devtools_runtime_notification.h"
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

  void SetRuntimeNotification(std::shared_ptr<RuntimeNotification> runtime_notification) {
    runtime_notification_ = runtime_notification;
  }
  std::shared_ptr<RuntimeNotification> GetRuntimeNotification() { return runtime_notification_; }

 private:
  std::shared_ptr<LogNotification> log_notification_;
  std::shared_ptr<V8ResponseNotification> v8_response_notification_;
  std::shared_ptr<ElementsResponseNotification> elements_response_notification_;
  std::shared_ptr<NetworkNotification> network_notification_;
  std::shared_ptr<RuntimeNotification> runtime_notification_;
};
}  // namespace devtools
}  // namespace tdf
