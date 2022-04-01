//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#pragma once

#include <string>

namespace tdf {
namespace devtools {
class V8ResponseNotification {
 public:
  /**
   * 消息送v8返回
   * @param data
   */
  virtual void SendResponseFromV8(std::string data) = 0;
};
}  // namespace devtools
}  // namespace tdf
