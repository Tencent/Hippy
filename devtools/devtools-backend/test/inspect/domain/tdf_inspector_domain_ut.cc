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
#include "module/domain/tdf_inspector_domain.h"
#include "module/domain_dispatch.h"
#include "nlohmann/json.hpp"

namespace hippy::devtools {

class TDFInspectorDomainTest : public ::testing::Test {
 protected:
  TDFInspectorDomainTest() {}
  ~TDFInspectorDomainTest() {}
  void SetUp() override {
    std::cout << "TDFInspectorDomainTest set up" << std::endl;

    auto data_provider = std::make_shared<DataProvider>();
    auto notification_center = std::make_shared<NotificationCenter>();
    auto data_channel = std::make_shared<DataChannel>(data_provider, notification_center);
    dispatch_ = std::make_shared<DomainDispatch>(data_channel);
    tdf_inspector_domain_ = std::make_shared<TDFInspectorDomain>(dispatch_);
    dispatch_->RegisterDomainHandler(tdf_inspector_domain_);
  }

  void TearDown() override { std::cout << "TDFInspectorDomainTest tear down" << std::endl; }
  std::shared_ptr<TDFInspectorDomain> tdf_inspector_domain_;
  std::shared_ptr<DomainDispatch> dispatch_;
};

TEST_F(TDFInspectorDomainTest, TDFInspectorDomain) {
  auto tdf_inspector_domain_name = "TDFInspector";
  EXPECT_EQ(tdf_inspector_domain_->GetDomainName(), tdf_inspector_domain_name);

  // empty method test
  nlohmann::json empty_request = {{"id", 152}, {"method", "TDFInspector"}, {"params", nlohmann::json::object({})}};
  auto empty_result = dispatch_->ReceiveDataFromFrontend(empty_request.dump());
  EXPECT_EQ(empty_result, false);

  // TDFInspector.dumpDomTree
  nlohmann::json dump_dom_tree_request = {{"id", 152}, {"method", "TDFInspector.dumpDomTree"}};
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(dump_dom_tree_request.dump()));

  // TDFInspector.getDomTree
  nlohmann::json get_dom_tree_request = {{"id", 152}, {"method", "TDFInspector.getDomTree"}};
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(get_dom_tree_request.dump()));

  // TDFInspector.getRenderTree
  nlohmann::json get_render_tree_request = {{"id", 152}, {"method", "TDFInspector.getRenderTree"}};
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(get_render_tree_request.dump()));

  // TDFInspector.getScreenshot
  // not use request
  nlohmann::json get_screen_shot_request = {
      {"id", 152},
      {"method", "TDFInspector.getScreenshot"},
      {"params", {{"format", "jpeg"}, {"quality", 80}, {"maxWidth", 2048}, {"maxHeight", 1128}}}};
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(get_screen_shot_request.dump()));
  // use request
  ScreenShotRequest screen_shot_request;
  nlohmann::json screen_shot_params = {{"format", "jpeg"}, {"quality", 80}, {"maxWidth", 2048}, {"maxHeight", 1128}};
  screen_shot_request.RefreshParams(screen_shot_params.dump());
  nlohmann::json get_screen_shot_request_1 = {{"id", 152},
                                              {"method", "TDFInspector.getScreenshot"},
                                              {"params",
                                               {{"format", screen_shot_request.GetFormat()},
                                                {"quality", screen_shot_request.GetQuality()},
                                                {"maxWidth", screen_shot_request.GetMaxWidth()},
                                                {"maxHeight", screen_shot_request.GetMaxHeight()}}}};
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(get_screen_shot_request_1.dump()));

  // TDFInspector.getSelectedDomNode
  std::string get_selected_dom_node_request = "{\"id\", 152}, {\"method\", \"TDFInspector.getSelectedDomNode\"}";
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(get_selected_dom_node_request));

  // TDFInspector.getSelectedRenderObject
  // not use request
  nlohmann::json get_selected_render_object_request = {
      {"id", 152}, {"method", "TDFInspector.getSelectedRenderObject"}, {"params", {{"id", 1}}}};
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(get_selected_render_object_request.dump()));
  // use request
  SelectedRenderObjectRequest selected_render_object_request;
  selected_render_object_request.RefreshParams("{\"id\": 12}");
  nlohmann::json get_selected_render_object_request_1 = {
      {"id", 152},
      {"method", "TDFInspector.getSelectedRenderObject"},
      {"params", {{"id", selected_render_object_request.GetRenderId()}}}};
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(get_selected_render_object_request_1.dump()));

  // TDFInspector.enableUpdateNotification
  nlohmann::json enable_update_notification_request = {{"id", 152},
                                                       {"method", "TDFInspector.enableUpdateNotification"}};
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(enable_update_notification_request.dump()));

  // TDFInspector.disableUpdateNotification
  std::string disable_update_notification_request =
      "{\"id\", 152},{\"method\", \"TDFInspector.disableUpdateNotification\"}";
  EXPECT_NO_THROW(dispatch_->ReceiveDataFromFrontend(disable_update_notification_request));
}

}  // namespace hippy::devtools
