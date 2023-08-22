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

#include "renderer/tdf/viewnode/view_node.h"
#include "dom/root_node.h"

namespace hippy {
inline namespace render {
inline namespace tdf {

class RootViewNode : public ViewNode {
 public:
  using StringView = footstone::stringview::string_view;
  using DataCb = std::function<void(StringView::u8string)>;
  using UriDataGetter = std::function<void(const StringView& uri, const DataCb cb)>;

  RootViewNode(const RenderInfo info, const std::shared_ptr<tdfcore::Shell>& shell,
               const std::shared_ptr<tdfcore::RenderContext>& render_context,
               const std::shared_ptr<hippy::DomManager>& manager, UriDataGetter getter);
  ~RootViewNode() override = default;

  void Init() override;

  std::shared_ptr<tdfcore::View> CreateView(const std::shared_ptr<ViewContext> &context) override;

  void RegisterViewNode(uint32_t id, const std::shared_ptr<ViewNode>& view_node);
  void UnregisterViewNode(uint32_t id);
  std::shared_ptr<ViewNode> FindViewNode(uint32_t id) const;

  std::shared_ptr<hippy::DomManager> GetDomManager();

  uint64_t AddEndBatchListener(const std::function<void()>& listener);
  void RemoveEndBatchListener(uint64_t id);

  void EndBatch();
  void SetEnableUpdateAnimation(bool enable);

  std::shared_ptr<tdfcore::Shell> GetShell() { return shell_.lock(); }

  std::shared_ptr<tdfcore::RenderContext> GetRenderContext() { return render_context_.lock(); }

  std::shared_ptr<tdfcore::ViewContext> GetViewContext() { return view_context_; }

 protected:
  bool isRoot() override { return true; }

 private:
  void AttachView(std::shared_ptr<tdfcore::View> view);
  void UpdateDomeRootNodeSize(tdfcore::ViewportMetrics viewport_metrics);
  void PostAnimationUpdateTask() const;

  std::unordered_map<uint32_t, std::shared_ptr<ViewNode>> nodes_query_table_;
  tdfcore::NoArgListener end_batch_listener_;
  std::weak_ptr<tdfcore::Shell> shell_;
  std::weak_ptr<tdfcore::RenderContext> render_context_;
  std::weak_ptr<hippy::DomManager> dom_manager_;
  std::shared_ptr<tdfcore::ViewContext> view_context_;
  UriDataGetter getter_;
  std::atomic<bool> is_enable_update_animation_ = false;
};

}  // namespace tdf
}  // namespace render
}  // namespace hippy
