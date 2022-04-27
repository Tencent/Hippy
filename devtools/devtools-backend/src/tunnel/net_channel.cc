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

#include "tunnel/net_channel.h"
#include "tunnel/tcp/tcp_channel.h"
#include "tunnel/ws/web_socket_channel.h"

namespace hippy {
namespace devtools {
std::shared_ptr<NetChannel> NetChannel::CreateChannel(const DevtoolsConfig& config) {
  auto tunnel_type = config.tunnel;
  if (Tunnel::kWebSocket == tunnel_type) {
    return std::make_shared<WebSocketChannel>(config.ws_url);
  }
  // default channel use tcp
  return std::make_shared<TcpChannel>();
}
}  // namespace devtools
}  // namespace hippy
