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
#include <utility>
#include "module/domain_dispatch.h"
#include "tunnel/net_channel.h"
#include "api/devtools_config.h"

namespace hippy::devtools {

/**
 * @brief tunnel service to handle interact with frontend, including manage channel and dispatch msg
 */
class TunnelService {
 public:
  explicit TunnelService(std::shared_ptr<DomainDispatch>  dispatch, const DevtoolsConfig &devtools_config);

  /**
   * @brief send data to frontend
   */
  void SendDataToFrontend(const std::string &rsp_data);

  /**
   * @brief close connect
   * @param is_reload differ close or reconnect
   */
  void Close(bool is_reload);

 private:
  /**
   * @brief connect to frontend
   */
  void Connect(const DevtoolsConfig &devtools_config);
  /**
   * @brief receive msg from frontend
   */
  void HandleReceiveData(const char *buffer, int32_t buffer_length);

  std::unique_ptr<NetChannel> channel_;
  std::shared_ptr<DomainDispatch> dispatch_;
};
}  // namespace hippy::devtools
