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

namespace tdf {
namespace devtools {

/**
 * @brief 通道逻辑处理服务，包括通道建立和协议收发等
 */
class TunnelService {
 public:
  explicit TunnelService(std::shared_ptr<DomainDispatch> dispatch, const DevtoolsConfig &devtools_config);

  /**
   * @brief 发送数据给Frontend
   */
  void SendDataToFrontend(const std::string &rsp_data);

  /**
   * @brief 关闭连接通道
   * @param is_reload 是否重新加载
   */
  void Close(bool is_reload);

 private:
  /**
   * @brief Tunnel 通道连接
   */
  void Connect(const DevtoolsConfig &devtools_config);
  /**
   * @brief 收到Frontend传过来的数据
   */
  void HandleReceiveData(const char *buffer, int32_t buffer_length);

  std::shared_ptr<NetChannel> channel_;
  std::shared_ptr<DomainDispatch> dispatch_;
};
}  // namespace devtools
}  // namespace tdf
