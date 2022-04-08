
// Copyright (c) 2021. Tencent Corporation. All rights reserved.

// Created by sicilyliu on 2021/11/8.
//
#include <gtest/gtest.h>
#include "tunnel/tcp/tcp_channel.h"

namespace tdf {
namespace devtools {

class TcpServerTest : public ::testing::Test {
 protected:
  TcpServerTest() {}
  ~TcpServerTest() {}

  void SetUp() override {
    std::cout << "set up" << std::endl;
    tcp_server_ = std::make_shared<TcpChannel>();
    tcp_server_->server_status_change_callback_ = [](ConnectStatus status) {
      std::cout << "server status change function, status = " << status << std::endl;
    };
    tcp_server_->connect_status_change_callback_ = [](ConnectStatus status, std::string error) {
      std::cout << "connect status change function, status = " << status << ", error = " << error << std::endl;
    };
    tcp_server_->data_handler_ = [](void* buf, ssize_t length, int flag) {
      std::cout << "on receive function" << std::endl;
    };
  }
  void TearDown() override { std::cout << "set down" << std::endl; }
  std::shared_ptr<TcpChannel> tcp_server_;
};

TEST_F(TcpServerTest, TcpChannel) {
  tcp_server_->StartListen();
  EXPECT_EQ(tcp_server_->IsStarting(), false);  // 因为没有真正地建立起来socket
  EXPECT_NO_THROW(tcp_server_->StopListenAndDisConnect());
  EXPECT_NO_THROW(tcp_server_->SendResponse(nullptr, 0, 0));
}
}  // namespace devtools
}  // namespace tdf
