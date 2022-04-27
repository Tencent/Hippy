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
#include <map>
#include <memory>
#include <string>
#include "module/domain/tdf_inspector_domain.h"
#include "module/domain_dispatch.h"
#include "module/inspect_event.h"

namespace hippy {
namespace devtools {

using json = nlohmann::json;
class DomainDispatchTest : public ::testing::Test {
 protected:
  DomainDispatchTest() {}
  ~DomainDispatchTest() {}

  void SetUp() override { std::cout << "set up" << std::endl; }
  void TearDown() override { std::cout << "set down" << std::endl; }
};

TEST_F(DomainDispatchTest, DomainDispatch) {
  // RegisterDomainHandler Test
  auto data_provider = std::make_shared<DataProvider>();
  auto notification_center = std::make_shared<NotificationCenter>();
  auto data_channel = std::make_shared<DataChannel>(data_provider, notification_center);
  auto dispatch = std::make_shared<DomainDispatch>(data_channel);
  auto tdf_inspector_domain = std::make_shared<TDFInspectorDomain>(dispatch);
  EXPECT_NO_THROW(dispatch->RegisterDomainHandler(tdf_inspector_domain));

  // ReceiveDataFromFrontend Test
  std::string null_string = "";
  EXPECT_FALSE(dispatch->ReceiveDataFromFrontend(null_string));

  std::string illegal_string = "{\\\\{[sss: a],;";
  EXPECT_FALSE(dispatch->ReceiveDataFromFrontend(illegal_string));

  std::string undefined_domain_string = "{\"method\":\"Apple.isDebugMode\",\"params\":{},\"id\":100003}";
  EXPECT_FALSE(dispatch->ReceiveDataFromFrontend(undefined_domain_string));

  std::string legal_inspector_string = "{\"method\":\"TDFInspector.dumpDomTree\",\"id\":100007}";
  EXPECT_TRUE(dispatch->ReceiveDataFromFrontend(legal_inspector_string));

  // ClearDomainHandler Test
  EXPECT_NO_THROW(dispatch->ClearDomainHandler());
  EXPECT_FALSE(dispatch->ReceiveDataFromFrontend(legal_inspector_string));

  // SendDataToFrontend Test
  EXPECT_NO_THROW(dispatch->SendDataToFrontend(1, "", ""));
  EXPECT_THROW(dispatch->SendDataToFrontend(1, "", "error"), json::exception);
  EXPECT_NO_THROW(dispatch->SendDataToFrontend(1, "", "{\"errorCode\":0}"));
  EXPECT_NO_THROW(dispatch->SendDataToFrontend(1, "{\"isDebugMode\":1}", ""));

  // SendEventToFrontend Test
  EXPECT_NO_THROW(dispatch->SendEventToFrontend(InspectEvent("Page.screencastFrame", "{}")));

  // RegisterJSDebuggerDomainListener
  EXPECT_NO_THROW(dispatch->RegisterJSDebuggerDomainListener());
}

}  // namespace devtools
}  // namespace hippy
