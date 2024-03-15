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
#include <vector>
#include "tunnel/net_channel.h"
#include "footstone/logging.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated"
#pragma clang diagnostic ignored "-Wshadow"
#pragma clang diagnostic ignored "-Wimplicit-fallthrough"
#pragma clang diagnostic ignored "-Wconversion"
#pragma clang diagnostic ignored "-Wunknown-warning-option"
#pragma clang diagnostic ignored "-Wextra"
#define ASIO_STANDALONE
#include "asio.hpp"
#include "websocketpp/client.hpp"
#include "websocketpp/config/asio_no_tls_client.hpp"
#pragma clang diagnostic pop

using WSClient = websocketpp::client<websocketpp::config::asio_client>;
using WSMessagePtr = websocketpp::config::asio_client::message_type::ptr;
using WSThread = websocketpp::lib::shared_ptr<websocketpp::lib::thread>;

namespace hippy::devtools {
/**
 * @brief web socket channel to implement net
 */
class WebSocketChannel : public hippy::devtools::NetChannel, public std::enable_shared_from_this<WebSocketChannel> {
 public:
  explicit WebSocketChannel(const std::string& ws_uri);
  void Connect(ReceiveDataHandler handler) override;
  void Send(const std::string& rsp_data) override;
  void Close(int32_t code, const std::string& reason) override;

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
  std::vector<std::string> unset_messages_{};
};
}  // namespace hippy::devtools

namespace asio {
namespace detail {
/**
 * implement asio no-exception function
 */
template<typename Exception>
inline void throw_exception(const Exception &e) {
  FOOTSTONE_DLOG(ERROR) << " asio exception:" << e.what();
}
} // namespace detail
} // namespace asio
