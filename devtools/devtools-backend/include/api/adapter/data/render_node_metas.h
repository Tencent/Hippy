//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/11/2.
//

#pragma once

#include <chrono>
#include <string>
#include <vector>
#include "api/adapter/data/serializable.h"

namespace tdf {
namespace devtools {

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
}  // namespace devtools
}  // namespace tdf
