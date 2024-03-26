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
#include <string>
#include <functional>
#include "api/devtools_config.h"
#include "api/devtools_define.h"

namespace hippy::devtools {
constexpr uint8_t kTaskFlag = 210;  // message flag
/**
 * @brief abstract channel to send and receive from frontend
 */
class NetChannel {
 public:
  using ReceiveDataHandler = std::function<void(const std::string& msg, uint8_t flag)>;

  virtual ~NetChannel() {}

  /**
   * @brief connect to frontend
   * @param handler to receive msg from frontend
   */
  virtual void Connect(ReceiveDataHandler handler) = 0;

  /**
   * @brief send data to frontend
   * @param rsp_data
   */
  virtual void Send(const std::string &rsp_data) = 0;

  /**
   * close channel
   * @param code close code
   * @param reason close reason
   */
  virtual void Close(int32_t code, const std::string &reason) = 0;

  static std::shared_ptr<NetChannel> CreateChannel(const DevtoolsConfig& config);
};
}  // namespace hippy::devtools
