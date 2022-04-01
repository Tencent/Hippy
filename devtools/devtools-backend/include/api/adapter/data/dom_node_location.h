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

class DomNodeLocation : public Serializable {
 public:
  DomNodeLocation() = default;
  explicit DomNodeLocation(uint32_t node_id) : node_id_(node_id) {}
  void AddRelationId(uint32_t id) { relation_tree_ids_.emplace_back(id); }
  std::string Serialize() const override;

 private:
  uint32_t node_id_;
  std::vector<uint32_t> relation_tree_ids_;
};
}  // namespace devtools
}  // namespace tdf
