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
#include <iostream>
#include <memory>
#include "api/devtools_config.h"
#include "api/devtools_data_channel.h"
#include "api/devtools_data_provider.h"
#include "api/devtools_notification_center.h"
#include "module/domain/base_domain.h"
#include "module/domain_dispatch.h"
#include "nlohmann/json.hpp"
#include "tunnel/channel_factory.h"
#include "tunnel/tunnel_service.h"

namespace hippy::devtools {

class SubBaseDomain : public BaseDomain {
 public:
  explicit SubBaseDomain(std::weak_ptr<DomainDispatch> dispatch) : BaseDomain(dispatch) {}
  std::string_view GetDomainName() override {}
  void RegisterMethods() override {}
};

class BaseDomainTest : public ::testing::Test {
 protected:
  BaseDomainTest() {}
  ~BaseDomainTest() {}
  void SetUp() override {
    std::cout << "BaseDomainTest set up" << std::endl;
    auto data_provider = std::make_shared<DataProvider>();
    auto notification_center = std::make_shared<NotificationCenter>();
    auto data_channel = std::make_shared<DataChannel>(data_provider, notification_center);
    auto domain_dispatch = std::make_shared<DomainDispatch>(data_channel);
    domain_dispatch->RegisterDefaultDomainListener();
    DevtoolsConfig devtools_config;
    devtools_config.framework = Framework::kHippy;
    devtools_config.tunnel = Tunnel::kTcp;
    tunnel_service_ = std::make_shared<TunnelService>(domain_dispatch, devtools_config);
    sub_base_domain_ = std::make_shared<SubBaseDomain>(domain_dispatch);
  }

  void TearDown() override { std::cout << "BaseDomainTest tear down" << std::endl; }
  std::shared_ptr<SubBaseDomain> sub_base_domain_;
  std::shared_ptr<TunnelService> tunnel_service_;
};

TEST_F(BaseDomainTest, BaseDomain) {
  // HandleDomainSwitchEvent
  std::string enable_method = "Enable";
  std::string disable_method = "Disable";
  std::string not_switch_method = "GetHeapMeta";
  EXPECT_TRUE(sub_base_domain_->HandleDomainSwitchEvent(12, enable_method));
  EXPECT_TRUE(sub_base_domain_->HandleDomainSwitchEvent(12, disable_method));
  EXPECT_FALSE(sub_base_domain_->HandleDomainSwitchEvent(12, not_switch_method));

  // ResponseResultToFrontend
  EXPECT_THROW(sub_base_domain_->ResponseResultToFrontend(122, "result"), nlohmann::json::exception);
  EXPECT_NO_THROW(sub_base_domain_->ResponseResultToFrontend(122, ""));
  EXPECT_NO_THROW(sub_base_domain_->ResponseResultToFrontend(122, "{}"));

  // ResponseErrorToFrontend
  EXPECT_NO_THROW(sub_base_domain_->ResponseErrorToFrontend(13, 1, "error"));

  // SendEventToFrontend
  EXPECT_NO_THROW(sub_base_domain_->SendEventToFrontend(InspectEvent("method", "params")));
}

}  // namespace devtools::devtools
