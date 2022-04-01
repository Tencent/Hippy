//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2022/3/1.
//

#pragma once

#include <chrono>
#include <string>
#include <vector>
#include "api/adapter/data/serializable.h"

namespace tdf {
namespace devtools {

class DomainMetas : public Serializable {
 public:
  DomainMetas() = default;
  explicit DomainMetas(uint32_t node_id) : node_id_(node_id) {}
  void SetParentId(float parent_id) { parent_id_ = parent_id; }
  void SetRootId(float root_id) { root_id_ = root_id; }
  void SetWidth(float width) { width_ = width; }
  void SetHeight(float height) { height_ = height; }
  void SetLayoutX(float layout_x) { layout_x_ = layout_x; }
  void SetLayoutY(float layout_y) { layout_y_ = layout_y; }
  void SetTotalProps(std::string total_props) { total_props_ = total_props; }
  void SetStyleProps(std::string style_props) { style_props_ = style_props; }
  void SetNodeName(std::string node_name) { node_name_ = node_name; }
  void SetLocalName(std::string local_name) { local_name_ = local_name; }
  void SetClassName(std::string class_name) { class_name_ = class_name; }
  void SetNodeValue(std::string node_value) { node_value_ = node_value; }
  void SetChildrenCount(uint32_t children_count) { children_count_ = children_count;}
  void AddChild(const DomainMetas& meta);
  std::string Serialize() const override;

 private:
  uint32_t node_id_;
  uint32_t parent_id_;
  uint32_t root_id_;
  std::string node_name_;
  std::string class_name_;
  std::string local_name_;
  std::string node_value_;
  std::string total_props_;
  std::string style_props_;
  float width_;
  float height_;
  float layout_x_;
  float layout_y_;
  std::vector<DomainMetas> children_;
  uint32_t children_count_;  // 用于展开逻辑，必须赋值，不可从children_读取
};
}  // namespace devtools
}  // namespace tdf
