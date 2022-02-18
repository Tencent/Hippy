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

#if TDF_SERVICE_ENABLED
  void UpdateDomTree(std::string tree_data, UpdateDomTreeCallback callback) override;
  void GetDomTree(DumpDomTreeCallback callback) override;
#endif
 
 private:
  int16_t dom_id_;
};
}  // namespace devtools
}  // namespace hippy
