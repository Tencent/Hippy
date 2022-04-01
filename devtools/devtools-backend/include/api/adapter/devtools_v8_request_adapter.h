//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#pragma once

#include <string>

namespace tdf {
namespace devtools {
class V8RequestAdapter {
 public:
  using SendFinishCallback = std::function<void()>;

  /**
   * 发送 js debugger 协议到 v8
   * @param msg 数据对象
   * @param callback 发送完成回调
   */
  virtual void SendMsgToV8(std::string msg, SendFinishCallback sendFinishCallback) = 0;
  virtual ~V8RequestAdapter(){}
};
}  // namespace devtools
}  // namespace tdf
