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
