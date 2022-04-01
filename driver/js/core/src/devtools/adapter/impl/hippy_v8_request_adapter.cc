//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#include "devtools/adapter/hippy_v8_request_adapter.h"
#include <string>

namespace hippy {
namespace devtools {
HippyV8RequestAdapter::HippyV8RequestAdapter(V8RequestHandler request_handler) : request_handler_(request_handler) {}

void HippyV8RequestAdapter::SendMsgToV8(std::string msg, SendFinishCallback sendFinishCallback) {
  if (request_handler_) {
    request_handler_(msg);
  }
  if (sendFinishCallback) {
    sendFinishCallback();
  }
}

}  // namespace devtools
}  // namespace hippy
