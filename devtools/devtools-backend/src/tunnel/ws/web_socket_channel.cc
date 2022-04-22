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

#include "devtools_base/logging.h"

typedef WSClient::connection_ptr WSConnectionPtr;

namespace tdf::devtools {

WebSocketChannel::WebSocketChannel(const std::string& ws_uri) {
  ws_uri_ = ws_uri;
  // 日志输出输出失败部分
  ws_client_.set_access_channels(websocketpp::log::alevel::fail);
  ws_client_.set_error_channels(websocketpp::log::elevel::all);
  // Initialize ASIO
  ws_client_.init_asio();
  ws_client_.start_perpetual();

  // Register our handlers
  ws_client_.set_socket_init_handler(
      [this](const websocketpp::connection_hdl& handle, websocketpp::lib::asio::ip::tcp::socket& socket) {
        HandleSocketInit(handle);
      });
  // ws_client_.set_tls_init_handler(bind(&type::on_tls_init,this,::_1));
  ws_client_.set_open_handler([this](const websocketpp::connection_hdl& handle) { HandleSocketConnectOpen(handle); });
  ws_client_.set_close_handler([this](const websocketpp::connection_hdl& handle) { HandleSocketConnectClose(handle); });
  ws_client_.set_fail_handler([this](const websocketpp::connection_hdl& handle) { HandleSocketConnectFail(handle); });
  ws_client_.set_message_handler([this](const websocketpp::connection_hdl& handle, const WSMessagePtr& message_ptr) {
    HandleSocketConnectMessage(handle, message_ptr);
  });

  ws_thread_ = websocketpp::lib::make_shared<websocketpp::lib::thread>(&WSClient::run, &ws_client_);
}

void WebSocketChannel::Connect(ReceiveDataHandler handler) {
  if (ws_uri_.empty()) {
    BACKEND_LOGE(TDF_BACKEND, "websocket uri is empty, connect error");
    return;
  }
  BACKEND_LOGI(TDF_BACKEND, "websocket connect url:%s", ws_uri_.c_str());
  data_handler_ = handler;
  StartConnect(ws_uri_);
}

void WebSocketChannel::Send(const std::string& rsp_data) {
  if (!connection_hdl_.lock()) {
    unset_messages_.emplace_back(rsp_data);
    return;
  }
  ws_client_.send(connection_hdl_, rsp_data, websocketpp::frame::opcode::text);
}

void WebSocketChannel::Close(uint32_t code, const std::string& reason) {
  if (!connection_hdl_.lock()) {
    BACKEND_LOGE(TDF_BACKEND, "send message error, handler is null");
    return;
  }
  BACKEND_LOGD(TDF_BACKEND, "close websocket, code: %d, reason: %s", code, reason.c_str());
  ws_client_.close(connection_hdl_, code, reason);
  ws_client_.stop_perpetual();
}

void WebSocketChannel::StartConnect(const std::string& ws_uri) {
  websocketpp::lib::error_code error_code;
  auto con = ws_client_.get_connection(ws_uri, error_code);

  if (error_code) {
    ws_client_.get_alog().write(websocketpp::log::alevel::app, error_code.message());
    return;
  }

  BACKEND_LOGI(TDF_BACKEND, "websocket start connect");
  ws_client_.connect(con);
}

void WebSocketChannel::HandleSocketInit(const websocketpp::connection_hdl& handle) {
  BACKEND_LOGI(TDF_BACKEND, "websocket init");
}

void WebSocketChannel::HandleSocketConnectFail(const websocketpp::connection_hdl& handle) {
  auto con = ws_client_.get_con_from_hdl(handle);
  // 链接不成功，handler置空
  data_handler_ = nullptr;
  unset_messages_.clear();
  BACKEND_LOGE(TDF_BACKEND,
               "websocket connect fail, state: %d, error message: %s, local close code: %d, local close reason: %s, "
               "remote close code: %d, remote close reason: %s",
               con->get_state(), con->get_ec().message().c_str(), con->get_local_close_code(),
               con->get_local_close_reason().c_str(), con->get_remote_close_code(),
               con->get_remote_close_reason().c_str());
}

void WebSocketChannel::HandleSocketConnectOpen(const websocketpp::connection_hdl& handle) {
  connection_hdl_ = handle.lock();
  BACKEND_LOGI(TDF_BACKEND, "websocket connect open");
  if (!connection_hdl_.lock() || unset_messages_.empty()) {
    return;
  }
  for (auto& message : unset_messages_) {
    ws_client_.send(connection_hdl_, message, websocketpp::frame::opcode::text);
  }
  unset_messages_.clear();
}

void WebSocketChannel::HandleSocketConnectMessage(const websocketpp::connection_hdl& handle,
                                                  const WSMessagePtr& message_ptr) {
  auto message = message_ptr->get_payload();
  if (data_handler_) {
    const char* data_message = message.c_str();
    data_handler_(const_cast<void*>(reinterpret_cast<const void*>(data_message)), message.length(),
                  tdf::devtools::TASK_FLAG);
  }
  BACKEND_LOGD(TDF_BACKEND, "websocket receive message");
}

void WebSocketChannel::HandleSocketConnectClose(const websocketpp::connection_hdl& handle) {
  auto con = ws_client_.get_con_from_hdl(handle);
  // 关闭链接，handler置空
  data_handler_ = nullptr;
  unset_messages_.clear();
  BACKEND_LOGI(TDF_BACKEND,
               "websocket connect close, state: %d, error message: %s, local close code: %d, local close reason: %s, "
               "remote close code: %d, remote close reason: %s",
               con->get_state(), con->get_ec().message().c_str(), con->get_local_close_code(),
               con->get_local_close_reason().c_str(), con->get_remote_close_code(),
               con->get_remote_close_reason().c_str());
}

}  // namespace tdf::devtools
