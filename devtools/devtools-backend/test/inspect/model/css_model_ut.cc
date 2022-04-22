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
#include <string>
#include "api/devtools_data_provider.h"
#include "module/model/css_model.h"
#include "nlohmann/json.hpp"

namespace tdf {
namespace devtools {

class CSSModelTest : public ::testing::Test {
 protected:
  CSSModelTest() {}
  ~CSSModelTest() {}

  void SetUp() override {
    std::cout << "CSSModelTest set up" << std::endl;
    auto node_json = CreateNodeJSON(53);
    css_model_ = CSSModel::CreateModelByJSON(node_json);
    data_provider_ = std::make_shared<DataProvider>();
    css_model_.SetDataProvider(data_provider_);
  }

  void TearDown() override { std::cout << "CSSModelTest tear down" << std::endl; }

  nlohmann::json CreateNodeJSON(int32_t node_id) {
    auto node_json = nlohmann::json::object();
    node_json["nodeId"] = node_id;
    node_json["width"] = 100;
    node_json["height"] = 100;
    auto style = nlohmann::json::object();
    style["fontSize"] = 10;
    style["marginLeft"] = 10;
    style["paddingTop"] = 10;
    style["display"] = "flex";
    node_json["style"] = style;
    return node_json;
  }

  std::shared_ptr<DataProvider> data_provider_;
  CSSModel css_model_;
};

TEST_F(CSSModelTest, Creator) {
  // 快捷构造方法测试
  // empty object json
  auto creator_json = nlohmann::json::object();
  EXPECT_NO_THROW(CSSModel::CreateModelByJSON(creator_json));

  // normal json
  creator_json["nodeId"] = 52;
  creator_json["width"] = 100;
  creator_json["height"] = 100;
  auto style = nlohmann::json::object();
  style["fontSize"] = 10;
  creator_json["style"] = style;
  EXPECT_NO_THROW(CSSModel::CreateModelByJSON(creator_json));
}

TEST_F(CSSModelTest, CSSModelFunction) {
  // GetMatchedStylesJSON
  EXPECT_NO_THROW(css_model_.GetMatchedStylesJSON());

  // GetComputedStyleJSON
  EXPECT_NO_THROW(css_model_.GetComputedStyleJSON());

  // GetInlineStylesJSON
  EXPECT_NO_THROW(css_model_.GetInlineStylesJSON());

  // GetStyleTextJSON
  auto text = nlohmann::json::object();
  text["text"] = "fontWeight:100";
  EXPECT_NO_THROW(css_model_.GetStyleTextJSON(text));

  // Getter
  EXPECT_NO_THROW(css_model_.GetNodeId());
  EXPECT_NO_THROW(css_model_.GetStyle());
  EXPECT_NO_THROW(css_model_.GetWidth());
  EXPECT_NO_THROW(css_model_.GetHeight());
}

TEST_F(CSSModelTest, CreatorDeathTest) {
  // 快捷构造方法Death测试
  // not object json
  auto array_json = nlohmann::json::array();
  EXPECT_DEATH(CSSModel::CreateModelByJSON(array_json), "");
}

}  // namespace devtools
}  // namespace tdf
