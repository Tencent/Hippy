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
#include "module/model/dom_model.h"
#include "nlohmann/json.hpp"

namespace tdf {
namespace devtools {

class DOMModelTest : public ::testing::Test {
 protected:
  DOMModelTest() {}
  ~DOMModelTest() {}

  void SetUp() override {
    std::cout << "DOMModelTest set up" << std::endl;
    auto root_node_json = CreateNodeJSON(10, 10, 0);
    auto child_node_json = CreateNodeJSON(52, 10, 10);
    auto root_children = nlohmann::json::array();
    root_children.emplace_back(child_node_json);
    root_node_json["children"] = root_children;
    root_node_json["childNodeCount"] = 1;
    dom_model_ = DOMModel::CreateModelByJSON(root_node_json);
    data_provider_ = std::make_shared<DataProvider>();
    dom_model_.SetDataProvider(data_provider_);
  }

  void TearDown() override { std::cout << "DOMModelTest tear down" << std::endl; }

  nlohmann::json CreateNodeJSON(int32_t node_id, int32_t root_id, int32_t parent_id) {
    auto dom_json = nlohmann::json::object();
    dom_json["nodeId"] = node_id;
    dom_json["rootId"] = root_id;
    dom_json["parentId"] = parent_id;
    dom_json["backendNodeId"] = node_id;
    dom_json["nodeName"] = "div";
    dom_json["localName"] = "div";
    dom_json["nodeValue"] = "test node value";
    dom_json["x"] = 105.5;
    dom_json["y"] = 205.5;
    dom_json["width"] = 100;
    dom_json["height"] = 100;
    auto attribute_json = nlohmann::json::object();
    attribute_json["class"] = "div";
    dom_json["attributes"] = attribute_json;
    auto style = nlohmann::json::object();
    style["fontSize"] = 10;
    style["marginLeft"] = 10;
    style["paddingTop"] = 10;
    dom_json["style"] = style;
    return dom_json;
  }

  std::shared_ptr<DataProvider> data_provider_;
  DOMModel dom_model_;
};

TEST_F(DOMModelTest, Creator) {
  // 快捷构造方法测试
  // empty object json
  auto creator_json = nlohmann::json::object();
  EXPECT_NO_THROW(DOMModel::CreateModelByJSON(creator_json));

  // normal json
  creator_json["nodeId"] = 52;
  creator_json["rootId"] = 10;
  creator_json["parentId"] = 50;
  creator_json["backendNodeId"] = 52;
  creator_json["nodeName"] = "div";
  EXPECT_NO_THROW(DOMModel::CreateModelByJSON(creator_json));
}

TEST_F(DOMModelTest, DOMModelFunction) {
  // GetDocumentJSON
  EXPECT_NO_THROW(dom_model_.GetDocumentJSON());

  // GetBoxModelJSON
  EXPECT_NO_THROW(dom_model_.GetBoxModelJSON());

  // GetChildNodesJSON
  EXPECT_NO_THROW(dom_model_.GetChildNodesJSON());

  // GetNodeForLocation
  EXPECT_NO_THROW(dom_model_.GetNodeForLocation(dom_model_.GetNodeId()));

  // Setter
  auto node_id = 154;
  EXPECT_NO_THROW(dom_model_.SetNodeId(node_id));

  auto style = nlohmann::json::object();
  style["fontSize"] = 10;
  EXPECT_NO_THROW(dom_model_.SetStyle(style));

  auto relation_tree = nlohmann::json::object();
  EXPECT_NO_THROW(dom_model_.SetRelationTree(relation_tree));
}

TEST_F(DOMModelTest, CreatorDeathTest) {
  // 快捷构造方法Death测试
  // not object json
  auto array_json = nlohmann::json::array();
  EXPECT_DEATH(DOMModel::CreateModelByJSON(array_json), "");
}

}  // namespace devtools
}  // namespace tdf
