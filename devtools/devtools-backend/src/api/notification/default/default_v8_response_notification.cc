//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#include "api/notification/default/default_v8_response_notification.h"
#include <string>

namespace tdf {
namespace devtools {
DefaultV8ResponseAdapter::DefaultV8ResponseAdapter(ResponseHandler response_handler)
    : response_handler_(response_handler) {}
/**
 * 消息送v8返回
 * @param data
 */
void DefaultV8ResponseAdapter::SendResponseFromV8(std::string data) {
  if (response_handler_) {
    response_handler_(data);
  }
}

}  // namespace devtools
}  // namespace tdf
