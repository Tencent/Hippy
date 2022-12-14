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

#include "tunnel/ws/web_socket_channel.h"

#include <chrono>
#include <iostream>
#include <thread>
#include <utility>

#include "footstone/logging.h"
#include "footstone/macros.h"

typedef WSClient::connection_ptr WSConnectionPtr;

namespace hippy::devtools {

WebSocketChannel::WebSocketChannel(const std::string& ws_uri) {
  ws_uri_ = ws_uri;
  ws_client_.clear_access_channels(websocketpp::log::alevel::all);
  ws_client_.set_access_channels(websocketpp::log::alevel::fail);
  ws_client_.set_error_channels(websocketpp::log::elevel::all);
  // Initialize ASIO
  websocketpp::lib::error_code error_code;
  ws_client_.init_asio(error_code);
  ws_client_.start_perpetual();
}

void WebSocketChannel::Connect(ReceiveDataHandler handler) {
  if (ws_uri_.empty()) {
    FOOTSTONE_DLOG(ERROR) << kDevToolsTag << "websocket uri is empty, connect error";
    return;
  }
  FOOTSTONE_DLOG(INFO) << kDevToolsTag << "websocket connect url:" << ws_uri_.c_str();
  data_handler_ = handler;
  ws_client_.set_socket_init_handler(
      [WEAK_THIS](const websocketpp::connection_hdl& handle, websocketpp::lib::asio::ip::tcp::socket& socket) {
        DEFINE_AND_CHECK_SELF(WebSocketChannel)
        self->HandleSocketInit(handle);
      });
  ws_client_.set_open_handler([WEAK_THIS](const websocketpp::connection_hdl& handle) {
    DEFINE_AND_CHECK_SELF(WebSocketChannel)
    self->HandleSocketConnectOpen(handle);
  });
  ws_client_.set_close_handler([WEAK_THIS](const websocketpp::connection_hdl& handle) {
    DEFINE_AND_CHECK_SELF(WebSocketChannel)
    self->HandleSocketConnectClose(handle);
  });
  ws_client_.set_fail_handler([WEAK_THIS](const websocketpp::connection_hdl& handle) {
    DEFINE_AND_CHECK_SELF(WebSocketChannel)
    self->HandleSocketConnectFail(handle);
  });
  ws_client_.set_message_handler(
      [WEAK_THIS](const websocketpp::connection_hdl& handle, const WSMessagePtr& message_ptr) {
        DEFINE_AND_CHECK_SELF(WebSocketChannel)
        self->HandleSocketConnectMessage(handle, message_ptr);
      });

  ws_thread_ = websocketpp::lib::make_shared<websocketpp::lib::thread>(&WSClient::run, &ws_client_);
  StartConnect(ws_uri_);
}

void WebSocketChannel::Send(const std::string& rsp_data) {
  if (!connection_hdl_.lock()) {
    unset_messages_.emplace_back(rsp_data);
    return;
  }
  websocketpp::lib::error_code error_code;
  ws_client_.send(connection_hdl_, rsp_data, websocketpp::frame::opcode::text, error_code);
}

void WebSocketChannel::Close(int32_t code, const std::string& reason) {
  if (!connection_hdl_.lock()) {
    FOOTSTONE_DLOG(ERROR) << kDevToolsTag << "send message error, handler is null";
    return;
  }
  FOOTSTONE_DLOG(INFO) << kDevToolsTag << "close websocket, code: %d, reason: " << code << reason.c_str();
  websocketpp::lib::error_code error_code;
  ws_client_.close(connection_hdl_, static_cast<websocketpp::close::status::value>(code), reason, error_code);
  ws_client_.stop_perpetual();
}

void WebSocketChannel::StartConnect(const std::string& ws_uri) {
  websocketpp::lib::error_code error_code;
  auto con = ws_client_.get_connection(ws_uri, error_code);

  if (error_code) {
    ws_client_.get_alog().write(websocketpp::log::alevel::app, error_code.message());
    return;
  }

  FOOTSTONE_DLOG(INFO) << kDevToolsTag << "websocket start connect";
  ws_client_.connect(con);
}

void WebSocketChannel::HandleSocketInit(const websocketpp::connection_hdl& handle) {
  FOOTSTONE_DLOG(INFO) << kDevToolsTag << "websocket init";
}

void WebSocketChannel::HandleSocketConnectFail(const websocketpp::connection_hdl& handle) {
  websocketpp::lib::error_code error_code;
  auto con = ws_client_.get_con_from_hdl(handle, error_code);
  // set handle nullptr when connect fail
  data_handler_ = nullptr;
  unset_messages_.clear();
  FOOTSTONE_DLOG(INFO) << kDevToolsTag << "websocket connect fail, state: " << con->get_state()
                       << ", error message:" << con->get_ec().message().c_str()
                       << ", local close code:" << con->get_local_close_code()
                       << ", local close reason: " << con->get_local_close_reason().c_str()
                       << ", remote close code:" << con->get_remote_close_code()
                       << ", remote close reason:" << con->get_remote_close_reason().c_str();
}

void WebSocketChannel::HandleSocketConnectOpen(const websocketpp::connection_hdl& handle) {
  connection_hdl_ = handle.lock();
  FOOTSTONE_DLOG(INFO) << kDevToolsTag << "websocket connect open";
  if (!connection_hdl_.lock() || unset_messages_.empty()) {
    return;
  }
  for (auto& message : unset_messages_) {
    websocketpp::lib::error_code error_code;
    ws_client_.send(connection_hdl_, message, websocketpp::frame::opcode::text, error_code);
  }
  unset_messages_.clear();
}

void WebSocketChannel::HandleSocketConnectMessage(const websocketpp::connection_hdl& handle,
                                                  const WSMessagePtr& message_ptr) {
  auto message = message_ptr->get_payload();
  if (data_handler_) {
    std::string data(message.c_str(), message.length());
    data_handler_(data, hippy::devtools::kTaskFlag);
  }
}

void WebSocketChannel::HandleSocketConnectClose(const websocketpp::connection_hdl& handle) {
  websocketpp::lib::error_code error_code;
  auto con = ws_client_.get_con_from_hdl(handle, error_code);
  // set handle nullptr when connect fail
  data_handler_ = nullptr;
  unset_messages_.clear();
  FOOTSTONE_DLOG(INFO) << kDevToolsTag << "websocket connect close, state: " << con->get_state()
                       << ", error message:" << con->get_ec().message().c_str()
                       << ", local close code:" << con->get_local_close_code()
                       << ", local close reason: " << con->get_local_close_reason().c_str()
                       << ", remote close code:" << con->get_remote_close_code()
                       << ", remote close reason:" << con->get_remote_close_reason().c_str();
}
}  // namespace hippy::devtools
