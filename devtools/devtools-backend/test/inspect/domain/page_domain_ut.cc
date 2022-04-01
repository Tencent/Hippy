//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#include <gtest/gtest.h>
#include <iostream>
#include <memory>
#include "api/devtools_data_provider.h"
#include "api/devtools_notification_center.h"
#include "module/domain/page_domain.h"
#include "module/domain_dispatch.h"

namespace tdf {
namespace devtools {

class PageDomainTest : public ::testing::Test {
 protected:
  PageDomainTest() {}
  ~PageDomainTest() {}
  void SetUp() override {
    std::cout << "PageDomainTest set up" << std::endl;
    auto data_provider = std::make_shared<DataProvider>();
    auto notification_center = std::make_shared<NotificationCenter>();
    auto data_channel = std::make_shared<DataChannel>(data_provider, notification_center);
    dispatch_ = std::make_shared<DomainDispatch>(data_channel);
    page_domain_ = std::make_shared<PageDomain>(dispatch_);
    dispatch_->RegisterDomainHandler(page_domain_);
  }

  void TearDown() override { std::cout << "PageDomainTest tear down" << std::endl; }
  std::shared_ptr<PageDomain> page_domain_;
  std::shared_ptr<DomainDispatch> dispatch_;
};

TEST_F(PageDomainTest, PageDomain) {
  auto page_domain_name = "Page";
  EXPECT_EQ(page_domain_->GetDomainName(), page_domain_name);

  // empty method test
  nlohmann::json empty_request = {{"id", 152}, {"method", "Page"}, {"params", nlohmann::json::object({})}};
  auto empty_result = dispatch_->ReceiveDataFromFrontend(empty_request.dump());
  EXPECT_EQ(empty_result, false);

  // Page.startScreencast
  nlohmann::json start_screencast_request = {
      {"id", 152},
      {"method", "Page.startScreencast"},
      {"params", {{"format", "jpeg"}, {"quality", 80}, {"maxWidth", 2048}, {"maxHeight", 1128}}}};
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(start_screencast_request.dump()));

  // Page.stopScreencast
  nlohmann::json stop_screencast_request = {{"id", 152}, {"method", "Page.stopScreencast"}};
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(stop_screencast_request.dump()));

  // Page.screencastFrameAck
  nlohmann::json screencast_frame_ack_request = {{"id", 152}, {"method", "Page.screencastFrameAck"}};
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(screencast_frame_ack_request.dump()));
}

}  // namespace devtools
}  // namespace tdf
