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

namespace tdf {
namespace devtools {
const int32_t TASK_FLAG = 210;  // 任务消息
/**
 * @brief 与前端调试器的数据连接通道
 */
class NetChannel {
 public:
  using ReceiveDataHandler = std::function<void(void *buf, ssize_t length, int flag)>;

  /**
   * 向调试器前端发起连接请求
   * @param handler 连接后回包处理函数
   */
  virtual void Connect(ReceiveDataHandler handler) = 0;

  /**
   * 向调试器前端发送回包
   * @param rsp_data 回包数据
   */
  virtual void Send(const std::string &rsp_data) = 0;

  /**
   * 关闭连接
   * @param code close code
   * @param reason close reason
   */
  virtual void Close(uint32_t code, const std::string &reason) = 0;
};

}  // namespace devtools
}  // namespace tdf
