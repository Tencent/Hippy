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

namespace hippy::devtools {

struct RenderRect {
  double top;
  double left;
  double bottom;
  double right;
};

class RenderNodeMetas : public Serializable {
 public:
  RenderNodeMetas() = default;
  RenderNodeMetas(uint64_t node_id, std::string render_name) : node_id_(node_id), render_name_(render_name) {}
  void SetRepaintBoundary(bool is_repaint_boundary) { is_repaint_boundary_ = is_repaint_boundary; }
  void SetNeedCompositing(bool need_compositing) { need_compositing_ = need_compositing; }
  void SetBounds(const RenderRect& bounds) { bounds_ = bounds; }
  void AddChild(const RenderNodeMetas& meta);
  std::string Serialize() const override;

 private:
  std::string ToJsonString() const;
  uint64_t node_id_;
  std::string render_name_;
  bool is_repaint_boundary_;
  bool need_compositing_;
  RenderRect bounds_;
  std::vector<RenderNodeMetas> children_;
};
}  // namespace hippy::devtools
