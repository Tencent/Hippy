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

#include "devtools/devtools_utils.h"
#include "dom/dom_value.h"
#include "dom/node_props.h"
#include "devtools/devtools_utils.h"

namespace hippy::devtools {
void HippyDomTreeAdapter::UpdateDomTree(hippy::devtools::UpdateDomNodeMetas metas, UpdateDomTreeCallback callback) {
  if (!callback) {
    return;
  }
  std::weak_ptr<HippyDomData> weak_hippy_dom = hippy_dom_;
  std::function func = [weak_hippy_dom, metas, callback] {
    bool is_success = false;
    std::shared_ptr<HippyDomData> hippy_dom = weak_hippy_dom.lock();
    if (!hippy_dom) {
      callback(is_success);
      return;
    }
    int32_t node_id = metas.GetNodeId();
    auto metas_list = metas.GetStyleMetasList();
    if (node_id <= 0 || metas_list.empty()) {
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
    std::shared_ptr<DomManager> dom_manager = DomManager::Find(static_cast<int32_t>(hippy_dom->dom_id));
    if (dom_manager) {
      auto node = dom_manager->GetNode(hippy_dom->root_node, static_cast<uint32_t>(node_id));
      node->UpdateProperties(style_map, std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>>{});
      is_success = true;
    }
    callback(is_success);
  };
  DevToolsUtil::PostDomTask(hippy_dom_->dom_id, func);
}

void HippyDomTreeAdapter::GetDomTree(DumpDomTreeCallback callback) {
  if (!callback) {
    return;
  }
  std::weak_ptr<HippyDomData> weak_hippy_dom = hippy_dom_;
  std::function func = [weak_hippy_dom, callback] {
    std::shared_ptr<HippyDomData> hippy_dom = weak_hippy_dom.lock();
    if (!hippy_dom) {
      return;
    }
    std::shared_ptr<DomManager> dom_manager = DomManager::Find(static_cast<int32_t>(hippy_dom->dom_id));
    if (dom_manager) {
      auto root_node = hippy_dom->root_node.lock();
      if (root_node) {
        hippy::devtools::DomNodeMetas metas = DevToolsUtil::ToDomNodeMetas(root_node);
        callback(true, metas);
      }
    }
  };
  DevToolsUtil::PostDomTask(hippy_dom_->dom_id, func);
}

void HippyDomTreeAdapter::GetDomainData(int32_t node_id,
                                                bool is_root,
                                                uint32_t depth,
                                                DomainDataCallback callback) {
  if (!callback) {
    return;
  }
  tdf::base::DomValue domValue;
  std::weak_ptr<HippyDomData> weak_hippy_dom = hippy_dom_;
  std::function func = [weak_hippy_dom, node_id, is_root, depth, callback] {
    std::shared_ptr<HippyDomData> hippy_dom = weak_hippy_dom.lock();
    if (!hippy_dom) {
      return;
    }
    auto root_node = hippy_dom->root_node.lock();
    if (!root_node) {
      return;
    }
    std::shared_ptr<DomManager> dom_manager = DomManager::Find(hippy_dom->dom_id);
    auto node = dom_manager->GetNode(root_node, is_root ? root_node->GetId() : static_cast<uint32_t>(node_id));
    assert(node != nullptr);
    hippy::devtools::DomainMetas metas = DevToolsUtil::GetDomDomainData(root_node, node, depth, dom_manager);
    callback(metas);
  };
  DevToolsUtil::PostDomTask(hippy_dom_->dom_id, func);
}

void HippyDomTreeAdapter::GetNodeIdByLocation(double x, double y, NodeLocationCallback callback) {
  if (!callback) {
    return;
  }
  std::weak_ptr<HippyDomData> weak_hippy_dom = hippy_dom_;
  std::function func = [weak_hippy_dom, x, y, callback] {
    std::shared_ptr<HippyDomData> hippy_dom = weak_hippy_dom.lock();
    if (!hippy_dom) {
      return;
    }
    auto root_node = hippy_dom->root_node.lock();
    if (!root_node) {
      return;
    }
    std::shared_ptr<DomManager> dom_manager = DomManager::Find(static_cast<int32_t>(hippy_dom->dom_id));
    callback(DevToolsUtil::GetNodeIdByDomLocation(root_node, x, y));
  };
  DevToolsUtil::PostDomTask(hippy_dom_->dom_id, func);
}

void HippyDomTreeAdapter::GetPushNodeByPath(PushNodePath path, PushNodeByPathCallback callback) {
  if (!callback) {
    return;
  }
  std::weak_ptr<HippyDomData> weak_hippy_dom = hippy_dom_;
  auto func = [weak_hippy_dom, path, callback]() {
    std::shared_ptr<HippyDomData> hippy_dom = weak_hippy_dom.lock();
    std::shared_ptr<DomManager> dom_manager = DomManager::Find(hippy_dom->dom_id);
    auto root_node = hippy_dom->root_node.lock();
    if (!root_node) {
      return;
    }
    callback(DevToolsUtil::GetPushNodeByPath(root_node, path));
  };
  DevToolsUtil::PostDomTask(hippy_dom_->dom_id, func);
}
}  // namespace hippy::devtools
