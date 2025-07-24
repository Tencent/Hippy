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

namespace hippy::devtools {

class WebSocketChannel;
using JSHDebugRecvMessageHandler = std::function<void(const std::string& msg)>;

class JSHDebugConnection : public std::enable_shared_from_this<JSHDebugConnection> {
 public:
  JSHDebugConnection() {}
  ~JSHDebugConnection();

  void Connect(const std::string &url, JSHDebugRecvMessageHandler handler);
  
  void Send(const std::string &data);
  
 private:
  std::shared_ptr<WebSocketChannel> ws_;
  JSHDebugRecvMessageHandler msg_handler_;
};
}  // namespace hippy::devtools
