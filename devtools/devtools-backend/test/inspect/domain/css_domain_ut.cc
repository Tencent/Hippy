//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#include <gmock/gmock.h>
#include <gtest/gtest.h>
#include <iostream>
#include <memory>
#include <string>
#include "api/devtools_config.h"
#include "api/devtools_data_provider.h"
#include "api/devtools_notification_center.h"
#include "module/domain/css_domain.h"
#include "module/domain_dispatch.h"
#include "module/domain_register.h"
#include "nlohmann/json.hpp"
#include "tunnel/tunnel_service.h"
#include "tunnel/channel_factory.h"

namespace tdf {
namespace devtools {

class CSSDomainTest : public ::testing::Test {
 protected:
  CSSDomainTest() {}
  ~CSSDomainTest() {}
  void SetUp() override {
    std::cout << "CSSDomainTest set up" << std::endl;

    auto data_provider = std::make_shared<DataProvider>();
    auto notification_center = std::make_shared<NotificationCenter>();
    auto data_channel = std::make_shared<DataChannel>(data_provider, notification_center);
    dispatch_ = std::make_shared<DomainDispatch>(data_channel);
    css_domain_ = std::make_shared<CSSDomain>(dispatch_);
    dispatch_->RegisterDomainHandler(css_domain_);
    DevtoolsConfig devtools_config;
    devtools_config.framework = Framework::kHippy;
    devtools_config.tunnel = Tunnel::kTcp;
    tunnel_service_ = std::make_shared<TunnelService>(dispatch_, devtools_config);
  }

  void TearDown() override { std::cout << "CSSDomainTest tear down" << std::endl; }
  std::shared_ptr<CSSDomain> css_domain_;
  std::shared_ptr<DomainDispatch> dispatch_;
  std::shared_ptr<TunnelService> tunnel_service_;
};

TEST_F(CSSDomainTest, CSSDomain) {
  auto css_domain_name = "CSS";
  EXPECT_EQ(css_domain_->GetDomainName(), css_domain_name);

  // empty method test
  nlohmann::json empty_request = {{"id", 152}, {"method", "CSS"}, {"params", nlohmann::json::object({})}};
  auto empty_result = dispatch_->ReceiveDataFromFrontend(empty_request.dump());
  EXPECT_EQ(empty_result, false);

  // CSS.getMatchedStylesForNode
  nlohmann::json matched_styles_request = {
      {"id", 152}, {"method", "CSS.getMatchedStylesForNode"}, {"params", {{"nodeId", 33}}}};
  nlohmann::json empty_matched_styles_request = {
      {"id", 152}, {"method", "CSS.getMatchedStylesForNode"}, {"params", "{}"}};
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(matched_styles_request.dump()));
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(empty_matched_styles_request.dump()));

  // CSS.getComputedStyleForNode
  nlohmann::json computed_styles_request = {
      {"id", 152}, {"method", "CSS.getComputedStyleForNode"}, {"params", {{"nodeId", 33}}}};
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(computed_styles_request.dump()));

  // CSS.getInlineStylesForNode
  nlohmann::json inline_styles_request = {
      {"id", 152}, {"method", "CSS.getInlineStylesForNode"}, {"params", {{"nodeId", 33}}}};
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(inline_styles_request.dump()));
}

TEST_F(CSSDomainTest, SetStyles) {
  // error params
  nlohmann::json error_request = {{"id", 152}, {"method", "CSS.setStyleTexts"}, {"params", ""}};
  EXPECT_THROW(dispatch_->ReceiveDataFromFrontend(error_request), nlohmann::json::exception);

  // empty object params
  nlohmann::json empty_params_request = {
      {"id", 152}, {"method", "CSS.setStyleTexts"}, {"params", nlohmann::json::object({})}};
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(empty_params_request.dump()));

  // empty edits params
  nlohmann::json empty_edit_request = {
      {"id", 152}, {"method", "CSS.setStyleTexts"}, {"params", {{"edits", nlohmann::json::array({})}}}};
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(empty_edit_request.dump()));

  // normal params
  auto normal_params = nlohmann::json::object();
  auto normal_edits_params = nlohmann::json::array();
  auto normal_edit = nlohmann::json::object();
  normal_edit["styleSheetId"] = 53;
  normal_edit["text"] = "fontSize:10.0";
  normal_edits_params.emplace_back(normal_edit);
  normal_params["edits"] = normal_edits_params;
  nlohmann::json normal_request = {{"id", 152}, {"method", "CSS.setStyleTexts"}, {"params", normal_params}};
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(normal_request.dump()));
}

}  // namespace devtools
}  // namespace tdf
