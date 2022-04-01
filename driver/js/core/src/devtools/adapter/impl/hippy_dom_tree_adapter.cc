//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#include "devtools/adapter/hippy_dom_tree_adapter.h"

#include <string>

#include "devtools/devtool_utils.h"
#include "dom/dom_value.h"
#include "dom/node_props.h"

namespace hippy {
namespace devtools {

void HippyDomTreeAdapter::UpdateDomTree(tdf::devtools::UpdateDomNodeMetas metas, UpdateDomTreeCallback callback) {
#if TDF_SERVICE_ENABLED
  bool is_success = false;
  int32_t node_id = metas.GetNodeId();
  auto metas_list = metas.GetStyleMetasList();
  if (!callback || node_id <= 0 || metas_list.empty()) {
    callback(is_success);
    return;
  }

  std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>> style_map{};
  for (auto &metas : metas_list) {
    if (metas.IsDouble()) {
      style_map.insert({metas.GetKey(), std::make_shared<tdf::base::DomValue>(metas.ToDouble())});
    } else if (metas.IsString()) {
      style_map.insert({metas.GetKey(), std::make_shared<tdf::base::DomValue>(metas.ToString())});
    }
  }
  std::shared_ptr<DomManager> dom_manager = DomManager::Find(static_cast<int32_t>(dom_id_));
  if (dom_manager) {
    auto node = dom_manager->GetNode(node_id);
    node->UpdateProperties(style_map, std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>>{});
    is_success = true;
  }
  callback(is_success);
#endif
}

void HippyDomTreeAdapter::GetDomTree(DumpDomTreeCallback callback) {
  if (callback) {
#if TDF_SERVICE_ENABLED
    std::function func = [this, callback] {
      std::shared_ptr<DomManager> dom_manager = DomManager::Find(static_cast<int32_t>(dom_id_));
      if (dom_manager) {
        auto root_node = dom_manager->GetNode(dom_manager->GetRootId());
        tdf::devtools::DomNodeMetas metas = DevToolUtils::ToDomNodeMetas(root_node);
        callback(true, metas);
      }
    };
    DevToolUtils::PostDomTask(dom_id_, func);
#endif
  }
}

}  // namespace devtools
}  // namespace hippy
