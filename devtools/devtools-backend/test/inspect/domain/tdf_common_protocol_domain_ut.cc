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
#include "api/devtools_data_provider.h"
#include "api/devtools_notification_center.h"
#include "module/domain/tdf_common_protocol_domain.h"
#include "module/domain_dispatch.h"
#include "nlohmann/json.hpp"

namespace hippy {
namespace devtools {

class TDFCommonProtocolDomainTest : public ::testing::Test {
 protected:
  TDFCommonProtocolDomainTest() {}
  ~TDFCommonProtocolDomainTest() {}
  void SetUp() override {
    std::cout << "TDFCommonProtocolDomainTest set up" << std::endl;
    auto data_provider = std::make_shared<DataProvider>();
    auto notification_center = std::make_shared<NotificationCenter>();
    auto data_channel = std::make_shared<DataChannel>(data_provider, notification_center);
    dispatch_ = std::make_shared<DomainDispatch>(data_channel);
    tdf_common_protocol_domain_ = std::make_shared<TDFCommonProtocolDomain>(dispatch_);
    dispatch_->RegisterDomainHandler(tdf_common_protocol_domain_);
  }

  void TearDown() override { std::cout << "TDFCommonProtocolDomainTest tear down" << std::endl; }
  std::shared_ptr<TDFCommonProtocolDomain> tdf_common_protocol_domain_;
  std::shared_ptr<DomainDispatch> dispatch_;
};

TEST_F(TDFCommonProtocolDomainTest, TDFCommonProtocolDomain) {
  auto tdf_common_protocol_domain_name = "TDF";
  EXPECT_EQ(tdf_common_protocol_domain_->GetDomainName(), tdf_common_protocol_domain_name);

  // empty method test
  nlohmann::json empty_request = {{"id", 152}, {"method", "TDF"}, {"params", nlohmann::json::object({})}};
  auto empty_result = dispatch_->ReceiveDataFromFrontend(empty_request.dump());
  EXPECT_EQ(empty_result, false);

  // demo empty method test
  nlohmann::json demo_request = {{"id", 152}, {"method", "TDF.demo"}, {"params", nlohmann::json::object({})}};
  auto demo_result = dispatch_->ReceiveDataFromFrontend(demo_request.dump());
  EXPECT_EQ(demo_result, true);
}

}  // namespace devtools
}  // namespace hippy
