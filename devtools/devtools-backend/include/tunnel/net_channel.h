//
// Copyright (c) 2022 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 22/3/10.
//

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
