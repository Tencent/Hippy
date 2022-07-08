/**
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

#pragma once

#include <memory>
#include <unordered_map>
#include "core/common/listener.h"
#include "core/common/object.h"
#include "core/tdfi/shell.h"
#include "core/tdfi/view/view_context.h"
#include "dom/dom_manager.h"
#include "dom/root_node.h"

namespace tdfrender {
using StringView = footstone::stringview::unicode_string_view;
using DataCb = std::function<void(StringView::u8string)>;
using UriDataGetter = std::function<bool(const StringView& uri, DataCb cb)>;

class ViewNode;

using ViewNodeMap = std::unordered_map<uint32_t, std::shared_ptr<ViewNode>>;

class TDFRenderContext : public tdfcore::Object, public std::enable_shared_from_this<TDFRenderContext> {
 public:
  explicit TDFRenderContext(uint32_t root_id, const std::shared_ptr<tdfcore::Shell>& shell,
                            const std::shared_ptr<hippy::DomManager>& manager, UriDataGetter getter);

  void Init() override;

  void Register(uint32_t id, const std::shared_ptr<ViewNode>& view_node);

  void Unregister(uint32_t id);

  std::shared_ptr<ViewNode> Find(uint32_t id);

  std::shared_ptr<hippy::DomNode> FindDomNode(uint32_t id);

  std::shared_ptr<tdfcore::Shell> GetShell() { return shell_.lock(); }

  void NotifyEndBatch();

  uint64_t AddEndBatchListener(const std::function<void()>& listener) { return end_batch_listener_.Add(listener); }

  void RemoveEndBatchListener(uint64_t id) { end_batch_listener_.Remove(id); }

  std::shared_ptr<hippy::DomManager> GetDomManager() {
    assert(!dom_manager_.expired());
    return dom_manager_.lock();
  }

 private:
  void UpdateRootNodeSize(tdfcore::ViewportMetrics viewport_metrics);

  // Record the map from render_info.id(from DomNode) to ViewNode
  ViewNodeMap nodes_query_table_;

  tdfcore::NoArgListener end_batch_listener_;

  uint32_t root_id_;
  std::weak_ptr<tdfcore::Shell> shell_;
  std::weak_ptr<hippy::DomManager> dom_manager_;
  std::shared_ptr<tdfcore::ViewContext> view_context_;
  UriDataGetter getter_;
};

}  // namespace tdfrender
