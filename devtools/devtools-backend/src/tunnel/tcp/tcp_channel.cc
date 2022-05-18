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

#include "tunnel/tcp/tcp_channel.h"
#include <arpa/inet.h>
#include <sys/socket.h>
#include <unistd.h>
#include <thread>
#include "devtools_base/common/macros.h"
#include "devtools_base/logging.h"
#include "socket.h"

namespace hippy::devtools {
constexpr char kListenHost[] = "127.0.0.1";
constexpr int32_t kListenPort = 2345;

TcpChannel::TcpChannel() {
  // fd=0、1、2 is system stdin、stdout and stderr, so init it as -1, otherwise when first start, it will close socket
  // fd=0 and cause fd be used
  socket_fd_ = kNullSocket;
  client_fd_ = kNullSocket;
  frame_codec_ = FrameCodec();
}

void TcpChannel::Connect(ReceiveDataHandler handler) {
  frame_codec_.SetEncodeCallback([DEVTOOLS_WEAK_THIS](void *data, int32_t len) {
    DEVTOOLS_DEFINE_AND_CHECK_SELF(TcpChannel)
    if (self->client_fd_ < 0) {
      BACKEND_LOGD(TDF_BACKEND, "TcpChannel, client_fd_ < 0.");
      return;
    }
    send(self->client_fd_, data, len, 0);
  });
  frame_codec_.SetDecodeCallback([DEVTOOLS_WEAK_THIS](void *buffer, int32_t len, int32_t task_flag) {
    DEVTOOLS_DEFINE_AND_CHECK_SELF(TcpChannel)
    if (self->data_handler_) {
      std::string data(reinterpret_cast<char *>(buffer), reinterpret_cast<char *>(buffer) + len);
      self->data_handler_(data, task_flag);
    }
  });
  StartListen();
  data_handler_ = handler;
}

void TcpChannel::Send(const std::string &rsp_data) {
  if (client_fd_ < 0) {
    return;
  }
  frame_codec_.Encode(const_cast<void *>(reinterpret_cast<const void *>(rsp_data.c_str())), rsp_data.length(),
                      hippy::devtools::kTaskFlag);
}

void TcpChannel::Close(int32_t code, const std::string &reason) { SetStarting(false); }

bool TcpChannel::StartListen() {
  if (is_starting_) {
    SetConnecting(true, "");
    return true;
  }
  SetStarting(false);
  if (StartServer(kListenHost, kListenPort)) {
    SetStarting(true);
    return true;
  }
  return false;
}

bool TcpChannel::StartServer(const std::string &host, int port) {
  socket_fd_ = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
  memset(&server_address_, 0, sizeof(server_address_));
  server_address_.sin_family = AF_INET;
  server_address_.sin_addr.s_addr = inet_addr(host.c_str());
  server_address_.sin_port = htons(port);
  int ra = 1;
  if (setsockopt(socket_fd_, SOL_SOCKET, SO_REUSEADDR, reinterpret_cast<char *>(&ra), sizeof(ra)) < 0) {
    close(socket_fd_);
    return false;
  }
  if (bind(socket_fd_, (struct sockaddr *)&server_address_, sizeof(server_address_)) < 0) {
    BACKEND_LOGD(TDF_BACKEND, "TcpChannel, StartServer bind fail.");
    close(socket_fd_);
    return false;
  }

  if (listen(socket_fd_, 5) < 0) {
    BACKEND_LOGD(TDF_BACKEND, "TcpChannel, StartServer listen fail.");
    close(socket_fd_);
    return false;
  }
  return true;
}

void TcpChannel::SetStarting(bool starting) {
  BACKEND_LOGD(TDF_BACKEND, "TcpChannel, SetStarting starting=%d.", starting);
  if (is_starting_ == starting) {
    return;
  }
  if (mutex_.try_lock()) {
    is_starting_ = starting;
    if (is_starting_) {
      std::thread accept_and_recv_thread(&TcpChannel::AcceptClient, this);
      accept_and_recv_thread.detach();
    } else {
      SetConnecting(false, "");
      is_starting_ = false;
      if (socket_fd_ != kNullSocket) {
        close(socket_fd_);
        socket_fd_ = kNullSocket;
      }
    }
    mutex_.unlock();
  }
}

void TcpChannel::AcceptClient() {
  while (socket_fd_ != kNullSocket) {
    int fd = accept(socket_fd_, nullptr, nullptr);
    BACKEND_LOGD(TDF_BACKEND, "TcpChannel, AcceptClient fd=%d.", fd);
    if (fd < 0) {
      if (errno != EWOULDBLOCK) {
        SetStarting(false);
        // restart socket server
        StartListen();
        break;
      }
      continue;
    }

    if (client_fd_ != kNullSocket) {
      close(client_fd_);
    }
    client_fd_ = fd;
    BACKEND_LOGD(TDF_BACKEND, "TcpChannel, AcceptClient success, client_fd_=%d.", client_fd_);
    SetConnecting(true, "");
  }
}

void TcpChannel::SetConnecting(bool connected, const std::string &error) {
  BACKEND_LOGD(TDF_BACKEND, "TcpChannel, SetConnecting connected=%d.", connected);
  if (is_connecting == connected) {
    return;
  }
  if (connect_mutex_.try_lock()) {
    is_connecting = connected;
    if (is_connecting) {
      std::thread receive_thread(&TcpChannel::ListenerAndResponse, this, client_fd_);
      receive_thread.detach();
    } else {
      is_connecting = false;
      if (client_fd_ != kNullSocket) {
        close(client_fd_);
        client_fd_ = kNullSocket;
      }
    }
    connect_mutex_.unlock();
  }
}

void TcpChannel::ListenerAndResponse(int32_t client_fd) {
  fd_set fds;
  FD_ZERO(&fds);
  FD_SET(client_fd, &fds);

  while (client_fd_ != kNullSocket) {
    fd_set read_fds = fds;
    int ret_sel = select(client_fd + 1, &read_fds, nullptr, nullptr, nullptr);
    BACKEND_LOGD(TDF_BACKEND, "TcpChannel, ListenerAndResponse ret_sel=%d.", ret_sel);
    if (ret_sel < 0) {
      SetConnecting(false, "");
      break;
    }
    if (ret_sel == 0) {
      continue;
    }
    if (!FD_ISSET(client_fd, &read_fds)) {
      continue;
    }

    // read data
    char buffer[kBufferSize];
    int read_len = socket_receive_timeout(client_fd, buffer, kBufferSize, 0, 100);
    BACKEND_LOGD(TDF_BACKEND, "TcpChannel, ListenerAndResponse read_len=%d.", read_len);
    if (read_len <= 0) {
      BACKEND_LOGD(TDF_BACKEND, "TcpChannel, ListenerAndResponse read fail error=%s.", strerror(errno));
#ifdef WIN32
      if (read_len == -WSAEINTR || read_len == -WSAEWOULDBLOCK) {
#else
      if (read_len == -EINTR || read_len == -EWOULDBLOCK) {
#endif
        continue;
      }
      SetConnecting(false, "readFromDevice: recv failed");
      break;
    }
    frame_codec_.Decode(buffer, read_len);
  }
}

}  // namespace hippy::devtools
