//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#pragma once

#include <memory>
#include "api/devtools_data_provider.h"
#include "api/devtools_notification_center.h"

namespace tdf {
namespace devtools {
/**
 * 外部接入框架与devtools的数据交互通道
 * 1 提供外部接入框架的需要充的provider数据接口
 * 2 提供可供外部接入框架调用的Notification接口
 */
class DataChannel : public std::enable_shared_from_this<DataChannel> {
 public:
  DataChannel(std::shared_ptr<DataProvider> provider, std::shared_ptr<NotificationCenter> notification_center)
      : provider_(provider), notification_center_(notification_center) {}
  std::shared_ptr<DataProvider> GetProvider() { return provider_; }
  std::shared_ptr<NotificationCenter> GetNotificationCenter() { return notification_center_; }

 private:
  std::shared_ptr<DataProvider> provider_;
  std::shared_ptr<NotificationCenter> notification_center_;
};
}  // namespace devtools
}  // namespace tdf
