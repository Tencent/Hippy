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
#include "module/domain/tdf_runtime_domain.h"
#include "module/domain_dispatch.h"
#include "module/domain_register.h"

namespace hippy::devtools {

class TDFRuntimeDomainTest : public ::testing::Test {
 protected:
  TDFRuntimeDomainTest() {}
  ~TDFRuntimeDomainTest() {}
  void SetUp() override {
    std::cout << "TDFRuntimeDomainTest set up" << std::endl;

    auto data_provider = std::make_shared<DataProvider>();
    auto notification_center = std::make_shared<NotificationCenter>();
    auto data_channel = std::make_shared<DataChannel>(data_provider, notification_center);
    dispatch_ = std::make_shared<DomainDispatch>(data_channel);
    tdf_runtime_domain_ = std::make_shared<TDFRuntimeDomain>(dispatch_);
    dispatch_->RegisterDomainHandler(tdf_runtime_domain_);
  }

  void TearDown() override { std::cout << "TDFRuntimeDomainTest tear down" << std::endl; }
  std::shared_ptr<TDFRuntimeDomain> tdf_runtime_domain_;
  std::shared_ptr<DomainDispatch> dispatch_;
};

TEST_F(TDFRuntimeDomainTest, TDFRuntimeDomain) {
  auto tdf_runtime_domain_name = "TDFRuntime";
  EXPECT_EQ(tdf_runtime_domain_->GetDomainName(), tdf_runtime_domain_name);

  // empty method test
  nlohmann::json empty_request = {{"id", 152}, {"method", "TDFRuntime"}, {"params", nlohmann::json::object({})}};
  auto empty_result = dispatch_->ReceiveDataFromFrontend(empty_request.dump());
  EXPECT_EQ(empty_result, false);

  // TDFRuntime.resume
  nlohmann::json resume_request = {{"id", 152}, {"method", "TDFRuntime.resume"}};
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(resume_request.dump()));

  // TDFRuntime.isDebugMode
  std::string is_debug_mode_request = "{\"id\", 152}, {\"method\", \"TDFRuntime.isDebugMode\"}";
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(is_debug_mode_request));
}

}  // namespace devtools::devtools
