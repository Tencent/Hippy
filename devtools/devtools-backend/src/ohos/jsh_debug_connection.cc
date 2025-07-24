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

#include "ohos/jsh_debug_connection.h"
#include "tunnel/ws/web_socket_channel.h"

namespace hippy::devtools {

using WebSocketChannel = hippy::devtools::WebSocketChannel;

JSHDebugConnection::~JSHDebugConnection() {
  if (ws_) {
    ws_->Close(0, "");
  }
}

void JSHDebugConnection::Connect(const std::string &url, JSHDebugRecvMessageHandler handler) {
  msg_handler_ = handler;
  ws_ = std::make_shared<WebSocketChannel>(url);
  ws_->Connect([WEAK_THIS](const std::string& msg, int flag) {
    if (flag == hippy::devtools::kTaskFlag) {
      DEFINE_AND_CHECK_SELF(JSHDebugConnection)
      self->msg_handler_(msg);
    }
  }, nullptr);
  
  std::string cmdMsgArray[] = {
    "{\"id\":-101,\"method\":\"Runtime.runIfWaitingForDebugger\",\"params\":{}}",
  };
  int len = sizeof(cmdMsgArray) / sizeof(cmdMsgArray[0]);
  for (int i = 0; i < len; i++) {
    ws_->Send(cmdMsgArray[i]);
  }
}

void JSHDebugConnection::Send(const std::string &data) {
  if (ws_) {
    ws_->Send(data);
  }
}

} // namespace hippy::devtools
