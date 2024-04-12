/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

#define private public
#define protected public

#include "gtest/gtest.h"
#include "nlohmann/json.hpp"

#include <fstream>
#include <sstream>
#include <string>

#include "dom/dom_manager.h"
#include "dom/dom_node.h"
#include "dom/node_props.h"

namespace hippy {
inline namespace dom {
inline namespace testing {

using namespace tdf::base;
using namespace nlohmann;

const char kBasePath[] = "./dependency/";

std::shared_ptr<HippyValue> JsonToDomValue(const json& json) {
  if (json.is_number_integer() || json.is_number_unsigned()) {
    return std::make_shared<HippyValue>(json.get<int>());
  } else if (json.is_boolean()) {
    return std::make_shared<HippyValue>(json.get<bool>());
  } else if (json.is_number_float()) {
    return std::make_shared<HippyValue>(json.get<float>());
  } else if (json.is_string()) {
    return std::make_shared<HippyValue>(json.get<json::string_t>());
  } else if (json.is_null()) {
    return std::make_shared<HippyValue>(HippyValue::Null());
  } else if (json.is_array()) {
    HippyValue::HippyValueArrayType ret;
    auto array = json.get<json::array_t>();
    for (const auto& j : array) {
      auto v = JsonToDomValue(j);
      ret.push_back(*v);
    }
    return std::make_shared<HippyValue>(ret);
  } else if (json.is_object()) {
    HippyValue::HippyValueObjectType ret;
    auto object = json.get<json::object_t>();
    for (const auto& kv : object) {
      ret[kv.first] = *JsonToDomValue(kv.second);
    }
    return std::make_shared<HippyValue>(ret);
  }
  return nullptr;
}

std::vector<std::shared_ptr<hippy::DomInfo>> ParserJson(const std::string& json_string,
                                                        const std::shared_ptr<hippy::DomManager>& manager) {
  // parser json to dom nodes
  std::vector<std::shared_ptr<hippy::dom::DomInfo>> nodes;
  json infos = json::parse(json_string);
  for (const auto& info : infos) {
    if (info.size() != 2) continue;
    // parser dom_node
    auto node_info = info[0];
    auto id = node_info["id"].get<int>();
    auto pid = node_info["pId"].get<int>();
    auto view_name = node_info["name"].get<json::string_t>();
    std::unordered_map<std::string, std::shared_ptr<HippyValue>> style_map;
    std::unordered_map<std::string, std::shared_ptr<HippyValue>> dom_ext_map;
    if (!node_info["props"].empty()) {
      auto props = node_info["props"].get<json::object_t>();
      for (const auto& kv : props) {
        if (kv.first == hippy::kStyle) {
          auto styles = kv.second.get<json::object_t>();
          for (const auto& style : styles) {
            style_map[style.first] = JsonToDomValue(style.second);
          }
        } else {
          dom_ext_map[kv.first] = JsonToDomValue(kv.second);
        }
      }
    }
    std::shared_ptr<hippy::dom::DomNode> dom_node = std::make_shared<hippy::dom::DomNode>(
        id, pid, view_name, view_name, std::move(style_map), std::move(dom_ext_map), manager);

    // parser refinfo
    auto ref_info = info[1];
    std::shared_ptr<hippy::dom::RefInfo> ref = nullptr;
    if (!ref_info.empty()) {
      auto id = ref_info["refId"].get<uint32_t>();
      auto ref_id = ref_info["relativeToRef"].get<int32_t>();
      ref = std::make_shared<hippy::dom::RefInfo>(id, ref_id);
    }

    auto diff_info = std::make_shared<hippy::dom::DiffInfo>(false);
    std::shared_ptr<hippy::dom::DomInfo> dom_info = std::make_shared<hippy::dom::DomInfo>(dom_node, ref, diff_info);
    nodes.push_back(dom_info);
  }
  return nodes;
}

std::vector<std::shared_ptr<hippy::DomInfo>> ParserFile(const std::string& filename,
                                                        const std::shared_ptr<hippy::DomManager>& manager) {
  // read json file
  std::string fullname = kBasePath + filename;
  std::ifstream ifs(fullname);
  std::stringstream buffer;
  buffer << ifs.rdbuf();
  std::string json_str(buffer.str());

  return ParserJson(json_str, manager);
}

TEST(DomManagerTest, CreateDomNodes) {
  std::shared_ptr<hippy::DomManager> manager = std::make_shared<hippy::DomManager>(10);
  std::shared_ptr<hippy::DomNode> root_node = manager->GetNode(10);
  root_node->SetDomManager(manager);
  std::vector<std::shared_ptr<hippy::DomInfo>> infos = ParserFile("create_node.json", manager);
  manager->CreateDomNodes(std::move(infos), false);

  ASSERT_EQ(root_node->GetChildren().size(), 1);
  auto child = root_node->GetChildren();
  ASSERT_EQ(child.size(), 1);
  ASSERT_EQ(child[0]->GetId(), 63);
  auto childchild = child[0]->GetChildren();
  ASSERT_EQ(childchild.size(), 1);
  ASSERT_EQ(childchild[0]->GetId(), 62);
  auto childchildchild = childchild[0]->GetChildren();
  ASSERT_EQ(childchildchild.size(), 2);
  ASSERT_EQ(childchildchild[0]->GetId(), 55);
  ASSERT_EQ(childchildchild[1]->GetId(), 61);
  auto childlistview = childchildchild[0]->GetChildren()[0]->GetChildren()[1]->GetChildren();
  ASSERT_EQ(childlistview.size(), 10);
}

TEST(DomManagerTest, UpdateDomNodes) {
  std::shared_ptr<hippy::DomManager> manager = std::make_shared<hippy::DomManager>(10);
  std::shared_ptr<hippy::DomNode> root_node = manager->GetNode(10);
  root_node->SetDomManager(manager);
  std::vector<std::shared_ptr<hippy::DomInfo>> infos = ParserFile("create_node.json", manager);
  manager->CreateDomNodes(std::move(infos), false);
  std::string json =
      "[[{\"id\":59,\"pId\":61,\"name\":\"Text\",\"props\":{\"numberOfLines\":1,\"text\":\"本地调试\","
      "\"style\":{\"color\":4280558628,\"fontSize\":26}}},{}]]";
  std::vector<std::shared_ptr<hippy::DomInfo>> update_nodes = ParserJson(json, manager);
  auto id = update_nodes[0]->dom_node->GetId();
  manager->UpdateDomNodes(std::move(update_nodes));
  auto node = manager->GetNode(id);
  auto diff = node->GetDiffStyle();
  auto size = diff->find("fontSize")->second->ToInt32Checked();
  ASSERT_EQ(size, 26);
}

TEST(DomManagerTest, DeleteDomNodes) {
  std::shared_ptr<hippy::DomManager> manager = std::make_shared<hippy::DomManager>(10);
  std::shared_ptr<hippy::DomNode> root_node = manager->GetNode(10);
  root_node->SetDomManager(manager);
  std::vector<std::shared_ptr<hippy::DomInfo>> infos = ParserFile("create_node.json", manager);
  manager->CreateDomNodes(std::move(infos), false);

  std::string json = "[[{\"id\":63,\"pId\":10,\"name\":\"View\"},{}]]";
  std::vector<std::shared_ptr<hippy::DomInfo>> delete_nodes = ParserJson(json, manager);
  manager->DeleteDomNodes(std::move(delete_nodes));
  ASSERT_EQ(root_node->GetChildren().size(), 0);
}

}  // namespace testing
}  // namespace dom
}  // namespace hippy
