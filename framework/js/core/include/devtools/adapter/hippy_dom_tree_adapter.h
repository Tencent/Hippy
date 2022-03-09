//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#pragma once

#include <string>

#include "devtools_backend/provider/devtools_dom_tree_adapter.h"

namespace hippy {
namespace devtools {
class HippyDomTreeAdapter : public tdf::devtools::DomTreeAdapter {
 public:
  explicit HippyDomTreeAdapter(int32_t dom_id) : dom_id_(dom_id) {}

  void UpdateDomTree(tdf::devtools::UpdateDomNodeMetas metas, UpdateDomTreeCallback callback) override;
  void GetDomTree(DumpDomTreeCallback callback) override;

 private:
  int16_t dom_id_;
};
}  // namespace devtools
}  // namespace hippy
