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

#include <chrono>
#include <string>
#include <vector>
#include "api/adapter/data/serializable.h"

namespace tdf {
namespace devtools {

struct BoundRect {
  double left;
  double top;
  double right;
  double bottom;
};

class DomNodeMetas : public Serializable {
 public:
  DomNodeMetas() = default;
  explicit DomNodeMetas(uint32_t node_id) : node_id_(node_id) {}
  void SetNodeType(std::string node_type) { node_type_ = node_type; }
  void SetWidth(uint32_t width) { width_ = width; }
  void SetHeight(uint32_t height) { height_ = height; }
  void SetTotalProps(std::string total_props) { total_props_ = total_props; }
  void SetStyleProps(std::string style_props) { style_props_ = style_props; }
  void SetBounds(const BoundRect& bound) { bound_ = bound; }
  void AddChild(const DomNodeMetas& meta);
  std::string Serialize() const override;

 private:
  uint32_t node_id_;
  std::string node_type_;
  std::string total_props_;
  std::string style_props_;
  BoundRect bound_;
  uint32_t width_;
  uint32_t height_;
  std::vector<DomNodeMetas> children_;
};
}  // namespace devtools
}  // namespace tdf
