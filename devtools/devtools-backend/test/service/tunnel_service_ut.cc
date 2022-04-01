
// Copyright (c) 2021. Tencent Corporation. All rights reserved.

// Created by sicilyliu on 2021/11/3.
//
#include <gmock/gmock.h>
#include <gtest/gtest.h>
#include <sstream>
#include "api/devtools_backend_service.h"
#include "api/devtools_config.h"
#include "devtools_base/logging.h"
#include "module/domain/css_domain.h"
#include "module/domain/dom_domain.h"
#include "module/domain/page_domain.h"
#include "module/domain/tdf_inspector_domain.h"
#include "module/domain/tdf_memory_domain.h"
#include "module/domain/tdf_performance_domain.h"
#include "module/domain/tdf_runtime_domain.h"
#include "nlohmann/json.hpp"
#include "tunnel/channel_factory.h"
#include "tunnel/tunnel_service.h"

namespace tdf {
namespace devtools {

using json = nlohmann::json;

class TunnelServiceTest : public ::testing::Test {
 protected:
  TunnelServiceTest() {}
  ~TunnelServiceTest() {}

  void SetUp() override { std::cout << "set up" << std::endl; }
  void TearDown() override { std::cout << "set down" << std::endl; }
};

TEST_F(TunnelServiceTest, TunnelService) {
  auto data_provider = std::make_shared<DataProvider>();
  auto notification_center = std::make_shared<NotificationCenter>();
  auto data_channel = std::make_shared<DataChannel>(data_provider, notification_center);
  auto domain_dispatch = std::make_shared<DomainDispatch>(data_channel);
  DevtoolsConfig devtools_config;
  devtools_config.framework = Framework::kHippy;
  devtools_config.tunnel = Tunnel::kTcp;
  auto tunnel_service = std::make_shared<TunnelService>(domain_dispatch, devtools_config);

  json rsp_json = json::object();
  rsp_json["id"] = 0;
  std::string result = "{\"errorCode\":0}";
  rsp_json["result"] = json::parse(result.data());
  EXPECT_NO_THROW(tunnel_service->SendDataToFrontend(rsp_json.dump()));
  EXPECT_NO_THROW(tunnel_service->SendDataToFrontend(""));
  EXPECT_NO_THROW(tunnel_service->SendDataToFrontend("error"));
}

}  // namespace devtools
}  // namespace tdf
