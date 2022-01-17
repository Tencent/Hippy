//
// Copyright (c) 2021 Tencent. All rights reserved.
// Created by omegaxiao on 2021/11/15.
//

#include <fstream>
#include <sstream>
#include <string>
#include "dom/dom_manager.h"
#include "dom/dom_node.h"
#include "dom/node_props.h"
#include "gtest.h"
#include "rapidjson/document.h"
using namespace tdf::base;
using namespace rapidjson;
std::shared_ptr<DomValue> ConverJsonObjectToDomValue(Value& json) {
  std::shared_ptr<DomValue> domValue;
  if (json.IsInt()) {
    return std::make_shared<DomValue>(json.GetInt());
  } else if (json.IsInt64()) {
    return std::make_shared<DomValue>(json.GetInt64());
  } else if (json.IsBool()) {
    return std::make_shared<DomValue>(json.GetBool());
  } else if (json.IsFloat()) {
    return std::make_shared<DomValue>(json.GetFloat());
  } else if (json.IsDouble()) {
    return std::make_shared<DomValue>(json.GetDouble());
  } else if (json.IsString()) {
    return std::make_shared<DomValue>(json.GetString());
  } else if (json.IsNull()) {
    return std::make_shared<DomValue>(DomValue::Null());
  } else if (json.IsArray()) {
    DomValue::DomValueArrayType ret;
    auto array = json.GetArray();
    for (auto it = array.Begin(); it != array.End(); it++) {
      auto v = ConverJsonObjectToDomValue(it->Move());
      ret.push_back(*v);
    }
    return std::make_shared<DomValue>(ret);
  } else if (json.IsObject()) {
    DomValue::DomValueObjectType ret;
    auto object = json.GetObject();
    for (auto it = object.MemberBegin(); it != object.MemberEnd(); it++) {
      ret[it->name.GetString()] = *ConverJsonObjectToDomValue(it->value);
    }
    return std::make_shared<DomValue>(ret);
  }
  return nullptr;
}

std::vector<std::shared_ptr<hippy::DomNode>> CreateTestDomNodes(std::shared_ptr<hippy::DomManager> manager, std::string str) {
  std::vector<std::shared_ptr<hippy::DomNode>> nodes;
  Document d;
  d.Parse(str.c_str());
  if (d.IsArray()) {
    std::cout << "current is array:" << d.Size() << std::endl;
    auto array = d.GetArray();
    for (auto it = array.Begin(); it != array.End(); it++) {
      auto object = it->GetObject();
      auto id = object.FindMember("id")->value.GetInt();
      auto pId = object.FindMember("pId")->value.GetInt();
      auto index = object.FindMember("index")->value.GetInt();
      auto view_name = object.FindMember("name")->value.GetString();
      std::unordered_map<std::string, std::shared_ptr<DomValue>> style_map;
      std::unordered_map<std::string, std::shared_ptr<DomValue>> dom_ext_map;
      auto props = object.FindMember("props");
      if (props != object.MemberEnd() && props->value.IsObject()) {
        auto pObjcct = props->value.GetObject();
        for (auto pIt = pObjcct.MemberBegin(); pIt != pObjcct.MemberEnd(); pIt++) {
          if (strcmp(hippy::kStyle, pIt->name.GetString()) == 0) {
            if (pIt->value.IsObject()) {
              auto style = pIt->value.GetObject();
              for (auto sIt = style.MemberBegin(); sIt != style.MemberEnd(); sIt++) {
                style_map[sIt->name.GetString()] = ConverJsonObjectToDomValue(sIt->value);
              }
            }
          } else {
            dom_ext_map[pIt->name.GetString()] = ConverJsonObjectToDomValue(pIt->value);
          }
        }
      }
      std::shared_ptr<hippy::dom::DomNode> node = std::make_shared<hippy::dom::DomNode>(
          id, pId, index, view_name, view_name, std::move(style_map), std::move(dom_ext_map), manager);
      nodes.push_back(node);
    }
  }
  return nodes;
}

TEST(DomManagerTest, createNode) {
  std::shared_ptr<hippy::DomManager> manager = std::make_shared<hippy::DomManager>(10);
  std::string base_path = "/Users/omegaxiao/tencent/newHippy/dom/gTest/create_node.json";
  std::ifstream t(base_path);
  std::stringstream buffer;
  buffer << t.rdbuf();
  std::string contents(buffer.str());
  std::vector<std::shared_ptr<hippy::DomNode>> nodes = CreateTestDomNodes(manager, contents);
  std::cout << "=====create size====" << nodes.size() << std::endl;
  manager->CreateDomNodes(std::move(nodes));
  manager->SetRootSize(300, 600);
  manager->EndBatch();
  std::shared_ptr<hippy::DomNode> root_node = manager->GetNode(10);
  ASSERT_EQ(root_node->GetChildren().size(), 1);
  ASSERT_EQ(root_node->GetChildren()[0]->GetChildren().size(), 2);
  ASSERT_EQ(root_node->GetChildren()[0]->GetId(), 64);
  ASSERT_EQ(root_node->GetChildren()[0]->GetChildren()[0]->GetId(), 3);
}

TEST(DomManagerTest, updateNode) {
  std::shared_ptr<hippy::DomManager> manager = std::make_shared<hippy::DomManager>(10);
  std::string base_path = "/Users/omegaxiao/tencent/newHippy/dom/gTest/create_node.json";
  std::ifstream t(base_path);
  std::stringstream buffer;
  buffer << t.rdbuf();
  std::string contents(buffer.str());
  std::vector<std::shared_ptr<hippy::DomNode>> nodes = CreateTestDomNodes(manager, contents);
  std::cout << "=====create size====" << nodes.size() << std::endl;
  manager->CreateDomNodes(std::move(nodes));
  manager->SetRootSize(300, 600);
  manager->EndBatch();
  std::string update_str = "[{\"id\":59,\"pId\":61,\"index\":0,\"name\":\"Text\",\"props\":{\"numberOfLines\":1,\"text\":\"本地调试\",\"style\":{\"color\":4280558628,\"fontSize\":26}}}]";
  std::vector<std::shared_ptr<hippy::DomNode>> update_nodes = CreateTestDomNodes(manager, update_str.c_str());
  std::cout << "=====udpate size====" << update_nodes.size() << std::endl;
  auto id = update_nodes[0]->GetId();
  manager->UpdateDomNodes(std::move(update_nodes));
  auto node = manager->GetNode(id);
  auto diff = node->GetDiffStyle();
  auto size = (*diff.find("fontSize")).second->ToInt32();
  ASSERT_EQ(size, 26);
}


TEST(DomManagerTest, deleteNode) {
    std::shared_ptr<hippy::DomManager> manager = std::make_shared<hippy::DomManager>(10);
    std::string base_path = "/Users/omegaxiao/tencent/newHippy/dom/gTest/create_node.json";
    std::ifstream t(base_path);
    std::stringstream buffer;
    buffer << t.rdbuf();
    std::string contents(buffer.str());
    std::vector<std::shared_ptr<hippy::DomNode>> nodes = CreateTestDomNodes(manager, contents);
    std::cout << "=====deleteNode size====" << nodes.size() << std::endl;
    manager->CreateDomNodes(std::move(nodes));
    manager->SetRootSize(300, 600);
    manager->EndBatch();
    std::shared_ptr<hippy::DomNode> root_node = manager->GetNode(10);
    std::cout << "id: " << root_node->GetChildren()[0]->GetId() << std::endl;
    std::string update_str = "[{\"id\":63,\"pId\":64,\"index\":1,\"name\":\"Text\"}]";
    std::cout << update_str << std::endl;
    std::vector<std::shared_ptr<hippy::DomNode>> delete_nodes = CreateTestDomNodes(manager, update_str.c_str());
    manager->DeleteDomNodes(std::move(delete_nodes));
    ASSERT_EQ(root_node->GetChildren()[0]->GetChildren().size(), 1);
}
