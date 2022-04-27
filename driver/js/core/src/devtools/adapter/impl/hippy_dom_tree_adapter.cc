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

#include "devtools/adapter/hippy_dom_tree_adapter.h"

#include <string>

#include "devtools/devtool_utils.h"
#include "dom/dom_value.h"
#include "dom/node_props.h"

namespace hippy {
namespace devtools {
void HippyDomTreeAdapter::UpdateDomTree(hippy::devtools::UpdateDomNodeMetas metas, UpdateDomTreeCallback callback) {
#if TDF_SERVICE_ENABLED
  bool is_success = false;
  int32_t node_id = metas.GetNodeId();
  auto metas_list = metas.GetStyleMetasList();
  if (!callback || node_id <= 0 || metas_list.empty()) {
    callback(is_success);
    return;
  }

  std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>> style_map{};
  for (auto &meta : metas_list) {
    if (meta.IsDouble()) {
      style_map.insert({meta.GetKey(), std::make_shared<tdf::base::DomValue>(meta.ToDouble())});
    } else if (meta.IsString()) {
      style_map.insert({meta.GetKey(), std::make_shared<tdf::base::DomValue>(meta.ToString())});
    }
  }
  std::shared_ptr<DomManager> dom_manager = DomManager::Find(static_cast<int32_t>(dom_id_));
  if (dom_manager) {
    auto node = dom_manager->GetNode(static_cast<uint32_t>(node_id));
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
        hippy::devtools::DomNodeMetas metas = DevToolUtils::ToDomNodeMetas(root_node);
        callback(true, metas);
      }
    };
    DevToolUtils::PostDomTask(dom_id_, func);
#endif
  }
}

}  // namespace devtools
}  // namespace hippy
