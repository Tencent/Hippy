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
  tdf::base::DomValue domValue;
  std::function func = [this, node_id, is_root, depth, callback] {
    std::shared_ptr<DomManager> dom_manager = DomManager::Find(static_cast<int32_t>(dom_id_));
    if (is_root) {
      auto root_node = dom_manager->GetNode(dom_manager->GetRootId());
      hippy::devtools::DomainMetas metas = DevToolUtils::GetDomDomainData(root_node, depth, dom_manager);
      callback(metas);
      return;
    }
    auto node = dom_manager->GetNode(static_cast<uint32_t>(node_id));
    assert(node != nullptr);
    hippy::devtools::DomainMetas metas = DevToolUtils::GetDomDomainData(node, depth, dom_manager);
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
    callback(DevToolUtils::GetNodeIdByDomLocation(root_node, x, y));
  };
  DevToolUtils::PostDomTask(dom_id_, func);
#endif
}

}  // namespace devtools
}  // namespace hippy
