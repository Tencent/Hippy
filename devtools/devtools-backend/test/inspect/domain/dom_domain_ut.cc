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

#include <gmock/gmock.h>
#include <gtest/gtest.h>
#include <iostream>
#include <memory>
#include "api/devtools_config.h"
#include "api/devtools_data_provider.h"
#include "api/devtools_notification_center.h"
#include "module/domain/dom_domain.h"
#include "module/domain_dispatch.h"
#include "module/domain_register.h"
#include "nlohmann/json.hpp"
#include "tunnel/channel_factory.h"
#include "tunnel/tunnel_service.h"

namespace hippy::devtools {

class DOMDomainTest : public ::testing::Test {
 protected:
  DOMDomainTest() {}
  ~DOMDomainTest() {}

  void SetUp() override {
    std::cout << "DomDomainTest set up" << std::endl;

    auto data_provider = std::make_shared<DataProvider>();
    auto notification_center = std::make_shared<NotificationCenter>();
    auto data_channel = std::make_shared<DataChannel>(data_provider, notification_center);
    dispatch_ = std::make_shared<DomainDispatch>(data_channel);
    dom_domain_ = std::make_shared<DOMDomain>(dispatch_);
    dispatch_->RegisterDomainHandler(dom_domain_);
    DevtoolsConfig devtools_config;
    devtools_config.framework = Framework::kHippy;
    devtools_config.tunnel = Tunnel::kTcp;
    tunnel_service_ = std::make_shared<TunnelService>(dispatch_, devtools_config);
  }

  void TearDown() override { std::cout << "DomDomainTest tear down" << std::endl; }

  std::shared_ptr<DOMDomain> dom_domain_;
  std::shared_ptr<DomainDispatch> dispatch_;
  std::shared_ptr<TunnelService> tunnel_service_;
};

TEST_F(DOMDomainTest, DOMDomain) {
  auto dom_domain_name = "DOM";
  EXPECT_EQ(dom_domain_->GetDomainName(), dom_domain_name);

  // empty method test
  auto empty_request = "{\"id\":44,\"method\":\"DOM\",\"params\":{}}";
  auto empty_result = dispatch_->ReceiveDataFromFrontend(empty_request);
  EXPECT_EQ(empty_result, false);

  // error params
  nlohmann::json error_request = {{"id", 152}, {"method", "DOM.getDocument"}, {"params", ""}};
  EXPECT_THROW(dispatch_->ReceiveDataFromFrontend(error_request), nlohmann::json::exception);

  // DOM.getDocument test
  auto get_document_request = "{\"id\":44,\"method\":\"DOM.getDocument\",\"params\":{}}";
  // throw test
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(get_document_request));
  // result test
  auto get_document_result = dispatch_->ReceiveDataFromFrontend(get_document_request);
  EXPECT_EQ(get_document_result, true);

  // DOM.getBoxModel
  auto box_model_request = "{\"id\":63,\"method\":\"DOM.getBoxModel\",\"params\":{\"nodeId\":4}}";
  // result test
  auto box_model_result = dispatch_->ReceiveDataFromFrontend(box_model_request);
  EXPECT_EQ(box_model_result, true);

  // DOM.getNodeForLocation
  auto location_request =
      "{\"id\":159,\"method\":\"DOM.getNodeForLocation\",\"params\":{\"x\":55,\"y\":11,\"includeUserAgentShadowDOM\":"
      "false}}";
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(location_request));
  auto error_location_request = "{\"id\":159,\"method\":\"DOM.getNodeForLocation\",\"params\":{}}";
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(error_location_request));

  // DOM.setInspectedNode
  auto inspected_request = "{\"id\":64,\"method\":\"DOM.setInspectedNode\",\"params\":{\"nodeId\":4}}";
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(inspected_request));

  // DOM.requestChildNodes
  auto child_nodes_request = "{\"id\":72,\"method\":\"DOM.requestChildNodes\",\"params\":{\"nodeId\":14}}";
  auto empty_child_nodes_request = "{\"id\":72,\"method\":\"DOM.requestChildNodes\",\"params\":{}}";
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(child_nodes_request));
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(empty_child_nodes_request));
}

}  // namespace hippy::devtools
