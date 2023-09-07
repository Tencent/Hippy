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

#include "renderer/tdf/viewnode/root_view_node.h"
#include "renderer/tdf/viewnode/base64_image_loader.h"
#include "renderer/tdf/viewnode/net_image_loader.h"
#include "tdfui/view/window_manager.h"

namespace hippy {
inline namespace render {
inline namespace tdf {

using tdfcore::ViewContext;

constexpr const char kUpdateFrame[] = "frameupdate";

RootViewNode::RootViewNode(const RenderInfo info, const std::shared_ptr<tdfcore::Shell>& shell,
                           const std::shared_ptr<tdfcore::RenderContext>& render_context,
                           const std::shared_ptr<hippy::DomManager>& manager, UriDataGetter getter)
    : ViewNode(nullptr, info), shell_(shell), render_context_(render_context), dom_manager_(manager), getter_(getter) {}

void RootViewNode::Init() {
  RegisterViewNode(render_info_.id, shared_from_this());
  shell_.lock()->GetUITaskRunner()->PostTask([WEAK_THIS] {
    DEFINE_AND_CHECK_SELF(RootViewNode)
    auto on_create_content_view = [](const std::shared_ptr<ViewContext> &vc) { return TDF_MAKE_SHARED(tdfcore::View, vc); };
    self->view_context_ = tdfcore::ViewContext::Make(self->shell_.lock(), self->render_context_.lock(), on_create_content_view);
    self->AttachView(self->view_context_->GetWindowManager()->GetMainWindow()->GetContentView());
    if (auto shell = self->shell_.lock()) {
      shell->GetEventCenter()->AddListener(tdfcore::PostRunLoopEvent::ClassType(),
                                           [weak_this](const std::shared_ptr<tdfcore::Event>& event, uint64_t id) {
                                             if (auto self = std::static_pointer_cast<RootViewNode>(weak_this.lock())) {
                                               if (self->is_enable_update_animation_.load()) {
                                                 self->PostAnimationUpdateTask();
                                               }
                                             }
                                             return tdfcore::EventDispatchBehavior::kContinue;
                                           });
    }
    self->UpdateDomeRootNodeSize(self->view_context_->GetViewportMetrics());
    self->GetShell()->GetEventCenter()->AddListener(
        tdfcore::ViewportEvent::ClassType(), [weak_this](const std::shared_ptr<tdfcore::Event>& event, uint64_t id) {
          auto self = std::static_pointer_cast<RootViewNode>(weak_this.lock());
          if (!self) {
            return tdfcore::EventDispatchBehavior::kContinue;
          }
          self->GetShell()->GetUITaskRunner()->PostTask([event, weak_this] {
            DEFINE_AND_CHECK_SELF(RootViewNode)
            auto viewport_event = std::static_pointer_cast<tdfcore::ViewportEvent>(event);
            self->UpdateDomeRootNodeSize(viewport_event->GetViewportMetrics());
          });
          return tdfcore::EventDispatchBehavior::kContinue;
        });

    // register custom image loader
    auto https_scheme = "https";
    auto https_net_image_loader = TDF_MAKE_SHARED(tdf::NetImageLoader, https_scheme, self->getter_);
    self->view_context_->GetImageManager()->GetImageLoadManager()->RegisterImageLoader(https_scheme,
                                                                                       https_net_image_loader);

    auto http_scheme = "http";
    auto http_net_image_loader = TDF_MAKE_SHARED(tdf::NetImageLoader, http_scheme, self->getter_);
    self->view_context_->GetImageManager()->GetImageLoadManager()->RegisterImageLoader(http_scheme,
                                                                                       http_net_image_loader);

    auto base64_image_loader = TDF_MAKE_SHARED(tdf::Base64ImageLoader);
    self->view_context_->GetImageManager()->GetImageLoadManager()->RegisterImageLoader(
        tdf::Base64ImageLoader::GetScheme(), base64_image_loader);
  });
}

void RootViewNode::AttachView(std::shared_ptr<tdfcore::View> view) {
  is_attached_ = true;
  attached_view_ = view;
}

std::shared_ptr<tdfcore::View> RootViewNode::CreateView(const std::shared_ptr<ViewContext> &context) {
  // Should never be called.
  FOOTSTONE_UNREACHABLE();
}

void RootViewNode::RegisterViewNode(uint32_t id, const std::shared_ptr<ViewNode>& view_node) {
  view_node->SetRootNode(std::static_pointer_cast<RootViewNode>(ViewNode::shared_from_this()));
  nodes_query_table_.insert(std::make_pair(id, view_node));
}

void RootViewNode::UnregisterViewNode(uint32_t id) {
  if (id == hippy::dom::kInvalidId) {
    return;
  }
  FOOTSTONE_DCHECK(nodes_query_table_.find(id) != nodes_query_table_.end());
  nodes_query_table_.erase(id);
}

std::shared_ptr<ViewNode> RootViewNode::FindViewNode(uint32_t id) const {
  FOOTSTONE_DCHECK(nodes_query_table_.find(id) != nodes_query_table_.end());
  return nodes_query_table_.find(id)->second;
}

std::shared_ptr<hippy::DomManager> RootViewNode::GetDomManager() {
  FOOTSTONE_DCHECK(!dom_manager_.expired());
  return dom_manager_.lock();
}

uint64_t RootViewNode::AddEndBatchListener(const std::function<void()>& listener) {
  return end_batch_listener_.Add(listener);
}

void RootViewNode::RemoveEndBatchListener(uint64_t id) { end_batch_listener_.Remove(id); }

void RootViewNode::EndBatch() {
  end_batch_listener_.Notify();
  view_context_->MarkNeedsBuild();
}

void RootViewNode::SetEnableUpdateAnimation(bool enable) { is_enable_update_animation_ = enable; }

void RootViewNode::PostAnimationUpdateTask() const {
  auto& root_map = hippy::dom::RootNode::PersistentMap();
  std::shared_ptr<hippy::RootNode> root_node;
  root_map.Find(render_info_.id, root_node);
  std::vector<std::function<void()>> ops = {[node = std::move(root_node)] {
    auto event = std::make_shared<hippy::DomEvent>(kUpdateFrame, node);
    node->HandleEvent(event);
  }};
  if (auto dom_manager = dom_manager_.lock()) {
    dom_manager->PostTask(hippy::Scene(std::move(ops)));
  }
}

void RootViewNode::UpdateDomeRootNodeSize(tdfcore::ViewportMetrics viewport_metrics) {
  auto device_pixel_ratio = viewport_metrics.device_pixel_ratio;
  auto width = viewport_metrics.width / device_pixel_ratio;
  auto height = viewport_metrics.height / device_pixel_ratio;
  std::vector<std::function<void()>> ops;
  ops.emplace_back([WEAK_THIS, width, height, device_pixel_ratio] {
    DEFINE_AND_CHECK_SELF(RootViewNode)
    auto& root_map = hippy::dom::RootNode::PersistentMap();
    std::shared_ptr<hippy::RootNode> root_node;
    root_map.Find(self->render_info_.id, root_node);
    root_node->GetLayoutNode()->SetScaleFactor(static_cast<float>(device_pixel_ratio));
    self->dom_manager_.lock()->SetRootSize(root_node, static_cast<float>(width), static_cast<float>(height));
    self->dom_manager_.lock()->DoLayout(root_node);
    self->dom_manager_.lock()->EndBatch(root_node);
  });
  dom_manager_.lock()->PostTask(hippy::Scene(std::move(ops)));
}

}  // namespace tdf
}  // namespace render
}  // namespace hippy
