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
#include "module/domain/tdf_performance_domain.h"
#include "module/domain_dispatch.h"
#include "module/domain_register.h"

namespace hippy {
namespace devtools {

class TDFPerformanceDomainTest : public ::testing::Test {
 protected:
  TDFPerformanceDomainTest() {}
  ~TDFPerformanceDomainTest() {}
  void SetUp() override {
    std::cout << "TDFPerformanceDomainTest set up" << std::endl;

    auto data_provider = std::make_shared<DataProvider>();
    auto notification_center = std::make_shared<NotificationCenter>();
    auto data_channel = std::make_shared<DataChannel>(data_provider, notification_center);
    dispatch_ = std::make_shared<DomainDispatch>(data_channel);
    tdf_performance_domain_ = std::make_shared<TDFPerformanceDomain>(dispatch_);
    dispatch_->RegisterDomainHandler(tdf_performance_domain_);
  }

  void TearDown() override { std::cout << "TDFPerformanceDomainTest tear down" << std::endl; }
  std::shared_ptr<TDFPerformanceDomain> tdf_performance_domain_;
  std::shared_ptr<DomainDispatch> dispatch_;
};

TEST_F(TDFPerformanceDomainTest, TDFPerformanceDomain) {
  auto tdf_performance_domain_name = "TDFPerformance";
  EXPECT_EQ(tdf_performance_domain_->GetDomainName(), tdf_performance_domain_name);

  // empty method test
  nlohmann::json empty_request = {{"id", 152}, {"method", "TDFPerformance"}, {"params", nlohmann::json::object({})}};
  auto empty_result = dispatch_->ReceiveDataFromFrontend(empty_request.dump());
  EXPECT_EQ(empty_result, false);

  // TDFPerformance.start
  nlohmann::json start_request = {{"id", 152}, {"method", "TDFPerformance.start"}};
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(start_request.dump()));

  // TDFPerformance.end
  nlohmann::json end_request = {{"id", 152}, {"method", "TDFPerformance.end"}};
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(end_request.dump()));

  // TDFPerformance.v8Tracing
  nlohmann::json v8_tracing_request = {{"id", 152}, {"method", "TDFPerformance.v8Tracing"}};
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(v8_tracing_request.dump()));

  // TDFPerformance.frameTimings
  nlohmann::json frame_timings_request = {{"id", 152}, {"method", "TDFPerformance.frameTimings"}};
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(frame_timings_request.dump()));

  // TDFPerformance.timeline
  nlohmann::json timeline_request = {{"id", 152}, {"method", "TDFPerformance.timeline"}};
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(timeline_request.dump()));
}

}  // namespace devtools
}  // namespace hippy
