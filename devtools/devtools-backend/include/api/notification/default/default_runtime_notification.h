//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by  nolantang on 2022/3/31.
//

#pragma once
#include <memory>
#include <string>
#include "api/notification/devtools_runtime_notification.h"
#include "tunnel/tunnel_service.h"

namespace tdf {
namespace devtools {
/**
 * Runtime相关Notification
 */
class DefaultRuntimeNotification : public RuntimeNotification {
 public:
  explicit DefaultRuntimeNotification(std::shared_ptr<TunnelService> tunnel_service)
      : tunnel_service_(tunnel_service) {}
  /**
   * @brief 更新 context_name
   * @param context_name
   */
  void UpdateContextName(const std::string& context_name) override;

 private:
  std::shared_ptr<TunnelService> tunnel_service_;
};

}  // namespace devtools
}  // namespace tdf
