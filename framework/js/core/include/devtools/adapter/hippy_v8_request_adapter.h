//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#pragma once

#include <string>
#include "devtools_backend/provider/devtools_v8_request_adapter.h"

namespace hippy {
namespace devtools {
class HippyV8RequestAdapter : public tdf::devtools::V8RequestAdapter {
 public:
  using V8RequestHandler = std::function<void(std::string)>;
  explicit HippyV8RequestAdapter(V8RequestHandler request_handler);
  void SendMsgToV8(std::string msg, SendFinishCallback sendFinishCallback) override;

 private:
  V8RequestHandler request_handler_;
};
}  // namespace devtools
}  // namespace hippy
