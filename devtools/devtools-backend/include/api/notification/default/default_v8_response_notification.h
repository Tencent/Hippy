//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#pragma once

#include <string>
#include "api/notification/devtools_v8_response_notification.h"

namespace tdf {
namespace devtools {
class DefaultV8ResponseAdapter : public V8ResponseNotification {
 public:
  using ResponseHandler = std::function<void(std::string)>;
  explicit DefaultV8ResponseAdapter(ResponseHandler response_handler);
  /**
   * 消息送v8返回
   * @param data
   */
  void SendResponseFromV8(std::string data) override;

 private:
  ResponseHandler response_handler_;
};
}  // namespace devtools
}  // namespace tdf
