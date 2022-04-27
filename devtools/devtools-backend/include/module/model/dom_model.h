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

#pragma once

#include <string>
#include <vector>
#include "module/model/base_model.h"
#include "nlohmann/json.hpp"

namespace hippy {
namespace devtools {

/**
 * @brief dom node类型
 *        参考文档：https://dom.spec.whatwg.org/#dom-node-nodetype
 */
enum class DomNodeType {
  kElementNode = 1,
  kAttributeNode = 2,
  kTextNode = 3,
  kCDataSectionNode = 4,
  kProcessingInstructionNode = 5,
  kCommentNode = 6,
  kDocumentNode = 7,
  kDocumentTypeNode = 8,
  kDocumentFragmentNode = 9
};

/**
 * @brief chrome devtools DOM 相关协议的数据类
 *        负责记录 Node DOM 相关数据及转成 chrome 协议需要的 JSON 格式
 *        chrome 协议参考 https://chromedevtools.github.io/devtools-protocol/tot/DOM/
 */
class DOMModel : public BaseModel {
 public:
  DOMModel() = default;

  /**
   * @brief 快捷构造方法
   * @param json 上层给过来的 DOM 树结构
   * @return CSSModel
   */
  static DOMModel CreateModelByJSON(const nlohmann::json& json);

  /**
   * @brief 获取chrome DOM getDocument所需的JSON数据
   * @return JSON数据
   */
  nlohmann::json GetDocumentJSON();

  /**
   * @brief 获取chrome DOM GetBoxModel所需的JSON数据
   * @return JSON数据
   */
  nlohmann::json GetBoxModelJSON();

  /**
   * 获取chrome DOM setChildNodes所需JSON数据
   * @return JSON数据
   */
  nlohmann::json GetChildNodesJSON();

  /**
   * @brief 根据节点坐标获取节点id
   * @param point 节点坐标
   * @return 节点id相关信息JSON
   */
  nlohmann::json GetNodeForLocation(int32_t node_id);

  constexpr void SetNodeId(int32_t node_id) { node_id_ = node_id; }
  constexpr int32_t GetNodeId() const { return node_id_; }

  constexpr void SetBackendNodeId(int32_t backend_node_id) { backend_node_id_ = backend_node_id; }
  constexpr int32_t GetBackendNodeId() { return backend_node_id_; }

  constexpr void SetParentId(int32_t parent_id) { parent_id_ = parent_id; }
  constexpr int32_t GetParentId() { return parent_id_; }

  constexpr void SetRootId(int32_t root_id) { root_id_ = root_id; }
  constexpr int32_t GetRootId() { return root_id_; }

  constexpr void SetX(double x) { x_ = x; }
  constexpr double GetX() const { return x_; }

  constexpr void SetY(double y) { y_ = y; }
  constexpr double GetY() const { return y_; }

  constexpr void SetWidth(double width) { width_ = width; }
  constexpr double GetWidth() const { return width_; }

  constexpr void SetHeight(double height) { height_ = height; }
  constexpr double GetHeight() const { return height_; }

  void SetChildNodeCount(uint32_t child_node_count) { child_node_count_ = child_node_count; }
  constexpr uint32_t GetChildNodeCount() { return child_node_count_; }

  void SetLocalName(const std::string& local_name) { local_name_ = local_name; }
  std::string GetLocalName() const { return local_name_; }

  void SetNodeName(const std::string& node_name) { node_name_ = node_name; }
  std::string GetNodeName() const { return node_name_; }

  void SetNodeValue(const std::string& node_value) { node_value_ = node_value; }
  std::string GetNodeValue() const { return node_value_; }

  void SetAttributes(const nlohmann::json& attributes) { attributes_ = attributes; }
  nlohmann::json GetAttributes() const { return attributes_; }

  void SetStyle(const nlohmann::json& style) { style_ = style; }
  nlohmann::json GetStyle() const { return style_; }

  void SetRelationTree(const nlohmann::json& relation_tree) { relation_tree_ = relation_tree; }
  nlohmann::json GetRelationTree() const { return relation_tree_; }

  std::vector<DOMModel>& GetChildren() { return children_; }

 private:
  nlohmann::json GetNodeJSON(DomNodeType node_type);
  nlohmann::json GetTextNodeJSON();
  nlohmann::json GetBoxModelBorder();
  nlohmann::json GetBoxModelPadding(const nlohmann::json& border);
  nlohmann::json GetBoxModelContent(const nlohmann::json& padding);
  nlohmann::json GetBoxModelMargin(const nlohmann::json& border);
  nlohmann::json ParseNodeBasicJSON(DomNodeType node_type);
  nlohmann::json ParseAttributesObjectToArray();

  std::vector<DOMModel> children_;
  std::string local_name_;
  std::string node_name_;
  std::string node_value_;
  nlohmann::json attributes_;
  nlohmann::json style_;

  /**
   * @brief getNodeForLocation的时候用于查找最近缓存节点使用，node对应的关系链，
   *        nlohmann::json::array格式
   */
  nlohmann::json relation_tree_;
  double x_ = 0.0;
  double y_ = 0.0;
  double width_ = 0.0;
  double height_ = 0.0;
  int32_t node_id_ = 0;
  int32_t backend_node_id_ = 0;
  int32_t parent_id_ = 0;
  int32_t root_id_ = 0;
  uint32_t child_node_count_ = 0;
};

}  // namespace devtools
}  // namespace hippy
