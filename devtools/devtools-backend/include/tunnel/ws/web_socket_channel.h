//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 22/3/10.

#pragma once

#include <string>
#include <vector>
#include "tunnel/net_channel.h"

#define ASIO_STANDALONE
#include "websocketpp/client.hpp"
#include "websocketpp/config/asio_client.hpp"

typedef websocketpp::client<websocketpp::config::asio_client> WSClient;
typedef websocketpp::config::asio_tls_client::message_type::ptr WSMessagePtr;
typedef websocketpp::lib::shared_ptr<websocketpp::lib::thread> WSThread;

namespace tdf::devtools {

/**
 * 连接通道的webSocket实现
 */
class WebSocketChannel : public tdf::devtools::NetChannel {
 public:
  explicit WebSocketChannel(const std::string& ws_uri);
  void Connect(ReceiveDataHandler handler) override;
  void Send(const std::string& rsp_data) override;
  void Close(uint32_t code, const std::string& reason) override;

 private:
  void StartConnect(const std::string& ws_uri);
  void HandleSocketInit(const websocketpp::connection_hdl& handle);
  void HandleSocketConnectFail(const websocketpp::connection_hdl& handle);
  void HandleSocketConnectOpen(const websocketpp::connection_hdl& handle);
  void HandleSocketConnectMessage(const websocketpp::connection_hdl& handle, const WSMessagePtr& message_ptr);
  void HandleSocketConnectClose(const websocketpp::connection_hdl& handle);

  WSClient ws_client_;
  websocketpp::connection_hdl connection_hdl_;
  std::string ws_uri_;
  ReceiveDataHandler data_handler_;
  WSThread ws_thread_;
  std::vector<std::string> unset_messages_;
};
}  // namespace tdf::devtools
