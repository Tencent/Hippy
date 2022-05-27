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
#include "api/adapter/data/serializable.h"

namespace hippy::devtools {

class DomainMetas : public Serializable {
 public:
  DomainMetas() = default;
  explicit DomainMetas(uint32_t node_id) : node_id_(node_id) {}
  inline void SetParentId(uint32_t parent_id) { parent_id_ = parent_id; }
  inline void SetRootId(uint32_t root_id) { root_id_ = root_id; }
  inline void SetWidth(float width) { width_ = width; }
  inline void SetHeight(float height) { height_ = height; }
  inline void SetLayoutX(float layout_x) { layout_x_ = layout_x; }
  inline void SetLayoutY(float layout_y) { layout_y_ = layout_y; }
  inline void SetTotalProps(std::string total_props) { total_props_ = total_props; }
  inline void SetStyleProps(std::string style_props) { style_props_ = style_props; }
  inline void SetNodeName(std::string node_name) { node_name_ = node_name; }
  inline void SetLocalName(std::string local_name) { local_name_ = local_name; }
  inline void SetClassName(std::string class_name) { class_name_ = class_name; }
  inline void SetNodeValue(std::string node_value) { node_value_ = node_value; }
  inline void SetChildrenCount(uint64_t children_count) { children_count_ = children_count; }
  inline void AddChild(const DomainMetas& meta) { children_.emplace_back(meta); }
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
  // It is used to expand logic. It must be assigned a value and cannot be used from children_ read
  uint64_t children_count_;
};
}  // namespace hippy::devtools
