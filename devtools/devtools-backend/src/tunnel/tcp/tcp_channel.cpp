//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#include "tunnel/tcp/tcp_channel.h"
#include <arpa/inet.h>
#include <sys/socket.h>
#include <unistd.h>
#include <thread>
#include "devtools_base/logging.h"
#include "socket.h"

namespace tdf::devtools {
constexpr const char *kListenHost = "127.0.0.1";
constexpr int32_t kListenPort = 2345;

TcpChannel::TcpChannel() {
  // fd=0、1、2是已经被系统的stdin、stdout和stderr，所以这里要初始化为-1，否则首次启动时，会close掉fd=0的socket资源，导致系统fd被占用。
  socket_fd_ = kNullSocket;
  client_fd_ = kNullSocket;
  stream_handler_ = tunnel::StreamHandler();
  stream_handler_.send_stream_callback_ = [this](void *data, int32_t len) { this->SendResponse_(data, len); };

  stream_handler_.receive_stream_callback_ = [this](void *data, int32_t len, int32_t task_flag) {
    if (this->data_handler_) {
      this->data_handler_(data, len, task_flag);
    }
  };
}

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

bool TcpChannel::StartServer(std::string host, int port) {
  port_ = port;
  socket_fd_ = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
  memset(&server_addr_, 0, sizeof(server_addr_));          //  每个字节都用0填充
  server_addr_.sin_family = AF_INET;                       //  使用IPv4地址
  server_addr_.sin_addr.s_addr = inet_addr(host.c_str());  //  具体的IP地址
  server_addr_.sin_port = htons(port);                     //  端口
  int ra = 1;
  if (setsockopt(socket_fd_, SOL_SOCKET, SO_REUSEADDR, reinterpret_cast<char *>(&ra), sizeof(ra)) < 0) {
    close(socket_fd_);
    return false;
  }
  //  绑定套接字
  if (bind(socket_fd_, (struct sockaddr *)&server_addr_, sizeof(server_addr_)) < 0) {
    BACKEND_LOGD(TDF_BACKEND, "TcpChannel, StartServer bind fail.");
    close(socket_fd_);
    return false;
  }

  //  监听
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

    if (server_status_change_callback_) {
      ConnectStatus status = is_starting_ ? kConnectStatusOpen : kConnectStatusClosed;
      server_status_change_callback_(status);
    }
    mutex_.unlock();
  }
}

void TcpChannel::AcceptClient() {
  while (socket_fd_ != kNullSocket) {
    int fd = accept(socket_fd_, NULL, NULL);
    BACKEND_LOGD(TDF_BACKEND, "TcpChannel, AcceptClient fd=%d.", fd);
    if (fd < 0) {
      if (errno != EWOULDBLOCK) {
        SetStarting(false);
        // 重启socket服务
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

void TcpChannel::SetConnecting(bool connected, std::string error) {
  BACKEND_LOGD(TDF_BACKEND, "TcpChannel, SetConnecting connected=%d.", connected);
  if (is_connecting == connected) {
    return;
  }

  if (connect_mutex_.try_lock()) {
    is_connecting = connected;
    if (is_connecting) {
      std::thread recv_thread(&TcpChannel::ListenerAndResponse, this, client_fd_);
      recv_thread.detach();
    } else {
      is_connecting = false;
      if (client_fd_ != kNullSocket) {
        close(client_fd_);
        client_fd_ = kNullSocket;
      }
    }

    if (connect_status_change_callback_) {
      ConnectStatus status = is_starting_ ? kConnectStatusOpen : kConnectStatusClosed;
      connect_status_change_callback_(status, std::move(error));
    }
    connect_mutex_.unlock();
  }
}

void TcpChannel::SendResponse(void *buf, int32_t len, int32_t flag) {
  if (client_fd_ < 0) {
    return;
  }
  this->stream_handler_.HandleSendStream(buf, len, flag);
}

void TcpChannel::SendResponse_(void *buf, int32_t len) {
  if (client_fd_ < 0) {
    BACKEND_LOGD(TDF_BACKEND, "TcpChannel, SendResponse_ fail.");
    return;
  }
  send(client_fd_, buf, len, 0);
}

void TcpChannel::Connect(ReceiveDataHandler handler) {
  StartListen();
  data_handler_ = handler;
}

void TcpChannel::Send(const std::string &rsp_data) {
  const char *buffer = rsp_data.c_str();
  SendResponse(const_cast<void *>(reinterpret_cast<const void *>(buffer)), rsp_data.length(), tdf::devtools::TASK_FLAG);
}

void TcpChannel::Close(uint32_t code, const std::string &reason) {}

void TcpChannel::ListenerAndResponse(int client_fd) {
  fd_set fds;
  FD_ZERO(&fds);
  FD_SET(client_fd, &fds);

  while (true && client_fd_ != kNullSocket) {
    fd_set read_fds = fds;
    // 阻塞式 是否就绪
    int ret_sel = select(client_fd + 1, &read_fds, NULL, NULL, NULL);
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
      if (read_len == -EINTR || read_len == -EWOULDBLOCK || read_len == -EAGAIN) {
#endif
        continue;
      }
      SetConnecting(false, "readFromDevice: recv failed");
      break;
    }
    this->stream_handler_.HandleReceiveStream(buffer, read_len);
  }
}

void TcpChannel::StopListenAndDisConnect() { SetStarting(false); }

}  // namespace tdf::devtools
