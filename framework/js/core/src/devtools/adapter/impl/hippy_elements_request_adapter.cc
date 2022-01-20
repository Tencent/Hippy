//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#include "devtools/adapter/hippy_elements_request_adapter.h"
#include <string>
#include "devtools/devtool_utils.h"

namespace hippy {
namespace devtools {
void HippyElementsRequestAdapter::GetDomainData(int32_t node_id,
                                                bool is_root,
                                                uint32_t depth,
                                                DomainDataCallback callback) {
  if (!domain_handler_) {
    return;
  }
  std::function func = [this, node_id, is_root, depth, callback] {
    domain_handler_(node_id, is_root, depth, callback);
  };
  DevToolUtils::PostDomTask(dom_id_, func);
}

void HippyElementsRequestAdapter::GetNodeIdByLocation(double x, double y, DomainDataCallback callback) {
  if (!node_handler_) {
    return;
  }
  std::function func = [this, x, y, callback] { node_handler_(x, y, callback); };
  DevToolUtils::PostDomTask(dom_id_, func);
}
}  // namespace devtools
}  // namespace hippy
