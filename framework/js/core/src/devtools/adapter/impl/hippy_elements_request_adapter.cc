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
#if TDF_SERVICE_ENABLED
  if (!callback) {
    return;
  }
  std::function func = [this, node_id, is_root, depth, callback] {
    std::shared_ptr<DomManager> dom_manager = DomManager::Find(static_cast<int32_t>(dom_id_));
    if (is_root) {
      auto root_node = dom_manager->GetNode(dom_manager->GetRootId());
      callback(root_node->GetDomDomainData(depth, dom_manager));
      return;
    }
    auto node = dom_manager->GetNode(node_id);
    assert(node != nullptr);
    callback(node->GetDomDomainData(depth, dom_manager));
  };
  DevToolUtils::PostDomTask(dom_id_, func);
#endif
}

void HippyElementsRequestAdapter::GetNodeIdByLocation(double x, double y, DomainDataCallback callback) {
#if TDF_SERVICE_ENABLED
  if (!callback) {
    return;
  }
  std::function func = [this, x, y, callback] {
    std::shared_ptr<DomManager> dom_manager = DomManager::Find(static_cast<int32_t>(dom_id_));
    auto root_node = dom_manager->GetNode(dom_manager->GetRootId());
    callback(root_node->GetNodeIdByDomLocation(x, y));
  };
  DevToolUtils::PostDomTask(dom_id_, func);
#endif
}

}  // namespace devtools
}  // namespace hippy
