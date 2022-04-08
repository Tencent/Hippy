//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#pragma once

#include <netinet/in.h>
#include <list>
#include <mutex>
#include <string>

#include "tunnel/net_channel.h"
#include "tunnel/tcp/stream_handler.h"
#include "tunnel/tcp/tcp_defines.h"

namespace tdf::devtools {
constexpr int32_t kNullSocket = -1;
constexpr int32_t kBufferSize = 32768;

class TcpChannel : public tdf::devtools::NetChannel {
 public:
  TcpChannel();
  bool StartListen();
  void StopListenAndDisConnect();
  bool IsStarting() { return is_starting_; }
  void SendResponse(void *buf, int32_t len, int32_t flag);
  void Connect(ReceiveDataHandler handler) override;
  void Send(const std::string &rsp_data) override;
  void Close(uint32_t code, const std::string &reason) override;
  std::function<void(ConnectStatus)> server_status_change_callback_;
  std::function<void(ConnectStatus, std::string error)> connect_status_change_callback_;

 private:
  bool StartServer(std::string host, int32_t port);
  void SetStarting(bool starting);
  void AcceptClient();
  void SetConnecting(bool connected, std::string error);
  void ListenerAndResponse(int client_fd);
  void SendResponse_(void *buf, int32_t len);
  std::mutex mutex_;
  std::mutex connect_mutex_;
  struct sockaddr_in server_addr_ {};
  bool is_connecting = false;
  bool is_starting_ = false;
  int32_t socket_fd_;
  int32_t client_fd_;
  int32_t port_;
  tunnel::StreamHandler stream_handler_;
  ReceiveDataHandler data_handler_;
};
}  // namespace tdf::devtools
