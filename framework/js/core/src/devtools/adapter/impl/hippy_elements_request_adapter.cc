//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#include "devtools/adapter/hippy_elements_request_adapter.h"

#include <string>
#include "dom/devtools/dom_devtools_utils.h"
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
  tdf::base::DomValue domValue;
  std::function func = [this, node_id, is_root, depth, callback] {
    std::shared_ptr<DomManager> dom_manager = DomManager::Find(static_cast<int32_t>(dom_id_));
    if (is_root) {
      auto root_node = dom_manager->GetNode(dom_manager->GetRootId());
      tdf::devtools::DomainMetas metas = DomDevtoolsUtils::GetDomDomainData(root_node, depth, dom_manager);
      callback(metas);
      return;
    }
    auto node = dom_manager->GetNode(node_id);
    assert(node != nullptr);
    tdf::devtools::DomainMetas metas = DomDevtoolsUtils::GetDomDomainData(node, depth, dom_manager);
    callback(metas);
  };
  DevToolUtils::PostDomTask(dom_id_, func);
#endif
}

void HippyElementsRequestAdapter::GetNodeIdByLocation(double x, double y, NodeLocationCallback callback) {
#if TDF_SERVICE_ENABLED
  if (!callback) {
    return;
  }
  std::function func = [this, x, y, callback] {
    std::shared_ptr<DomManager> dom_manager = DomManager::Find(static_cast<int32_t>(dom_id_));
    auto root_node = dom_manager->GetNode(dom_manager->GetRootId());
    callback(DomDevtoolsUtils::GetNodeIdByDomLocation(root_node, x, y));
  };
  DevToolUtils::PostDomTask(dom_id_, func);
#endif
}

}  // namespace devtools
}  // namespace hippy
