//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#include <gtest/gtest.h>
#include <iostream>
#include <memory>
#include "api/devtools_data_provider.h"
#include "api/devtools_notification_center.h"
#include "module/domain/css_domain.h"
#include "module/domain/tdf_memory_domain.h"
#include "module/domain_dispatch.h"

namespace tdf {
namespace devtools {

class TDFMemoryDomainTest : public ::testing::Test {
 protected:
  TDFMemoryDomainTest() {}
  ~TDFMemoryDomainTest() {}
  void SetUp() override {
    std::cout << "TDFMemoryDomainTest set up" << std::endl;
    auto data_provider = std::make_shared<DataProvider>();
    auto notification_center = std::make_shared<NotificationCenter>();
    auto data_channel = std::make_shared<DataChannel>(data_provider, notification_center);
    dispatch_ = std::make_shared<DomainDispatch>(data_channel);
    tdf_memory_domain_ = std::make_shared<TDFMemoryDomain>(dispatch_);
    dispatch_->RegisterDomainHandler(tdf_memory_domain_);
  }

  void TearDown() override { std::cout << "TDFMemoryDomainTest tear down" << std::endl; }
  std::shared_ptr<TDFMemoryDomain> tdf_memory_domain_;
  std::shared_ptr<DomainDispatch> dispatch_;
};

TEST_F(TDFMemoryDomainTest, TDFMemoryDomain) {
  auto tdf_memory_domain_name = "TDFMemory";
  EXPECT_EQ(tdf_memory_domain_->GetDomainName(), tdf_memory_domain_name);

  // empty method test
  nlohmann::json empty_request = {{"id", 152}, {"method", "TDFMemory"}, {"params", nlohmann::json::object({})}};
  auto empty_result = dispatch_->ReceiveDataFromFrontend(empty_request.dump());
  EXPECT_EQ(empty_result, false);

  // TDFMemory.getHeapMeta
  nlohmann::json get_heap_meta_request = {{"id", 152}, {"method", "TDFMemory.getHeapMeta"}};
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(get_heap_meta_request.dump()));
}

}  // namespace devtools
}  // namespace tdf
