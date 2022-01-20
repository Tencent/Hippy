//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#include "devtools/adapter/hippy_dom_tree_adapter.h"

#include <string>

#include "devtools/devtool_utils.h"

namespace hippy {
namespace devtools {
void HippyDomTreeAdapter::UpdateDomTree(std::string tree_data, UpdateDomTreeCallback callback) {}

void HippyDomTreeAdapter::GetDomTree(DumpDomTreeCallback callback) {
  if (callback) {
    std::function func = [this, callback] {
      std::shared_ptr<DomManager> dom_manager = DomManager::Find(static_cast<int32_t>(dom_id_));
      if (dom_manager) {
        auto root_node = dom_manager->GetNode(dom_manager->GetRootId());
        nlohmann::json node_json = root_node->ToJSONString();
        callback(true, node_json);
      }
    };
    DevToolUtils::PostDomTask(dom_id_, func);
  }
}

}  // namespace devtools
}  // namespace hippy
