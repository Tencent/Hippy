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

#include <iostream>
#include <memory>
#include <string>

#include "api/devtools_config.h"
#include "api/devtools_data_channel.h"
#include "api/devtools_data_provider.h"
#include "api/devtools_notification_center.h"
#include "tunnel/tunnel_service.h"

namespace hippy::devtools {

/**
 * @brief Devtools backend service is a debugging back-end service, which is mainly responsible for the construction of
 * debugging channel, debugging protocol distribution and data collection of access framework of devtools. As an access
 * framework, we need to be concerned about the implementation of adapter capability by DataProvider
 */
class DevtoolsBackendService : public std::enable_shared_from_this<DevtoolsBackendService> {
 public:
  explicit DevtoolsBackendService(const DevtoolsConfig& devtools_config);

  /**
   * @brief backend service create, to init necessary environment
   */
  void Create();

  /**
   * @brief backend service destroy
   * @param is_reload differ close or reload, if reload then the frontend will reuse
   */
  void Destroy(bool is_reload);

  /**
   * @brief data provider interface provided by devtools, framework need to implement adapter for collecting debug data
   * @return data provider
   */
  std::shared_ptr<DataProvider> GetDataProvider() { return data_channel_->GetProvider(); }

  /**
   * @brief notification interface provided by devtools, framework can notify to frontend by notification
   * @return NotificationCenter
   */
  std::shared_ptr<NotificationCenter> GetNotificationCenter() { return data_channel_->GetNotificationCenter(); }
 private:

  std::shared_ptr<DataChannel> data_channel_;
  std::shared_ptr<TunnelService> tunnel_service_;
  std::shared_ptr<DomainDispatch> domain_dispatch_;
};
}  // namespace hippy::devtools
