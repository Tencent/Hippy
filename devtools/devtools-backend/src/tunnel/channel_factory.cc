//
// Copyright (c) 2022 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 22/3/11.
//

#include "tunnel/channel_factory.h"
#include "tunnel/tcp/tcp_channel.h"
#include "tunnel/ws/web_socket_channel.h"

namespace tdf {
namespace devtools {

std::shared_ptr<NetChannel> ChannelFactory::CreateChannel(const DevtoolsConfig& config) {
  auto tunnel_type = config.tunnel;
  if (Tunnel::kTcp == tunnel_type) {
    return std::make_shared<TcpChannel>();
  } else if (Tunnel::kWebSocket == tunnel_type) {
    return std::make_shared<WebSocketChannel>(config.ws_url);
  }
  return nullptr;
}

}  // namespace devtools
}  // namespace tdf
