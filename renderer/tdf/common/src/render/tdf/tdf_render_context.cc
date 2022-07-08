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

#include "render/tdf/tdf_render_context.h"

#include <cassert>
#include <utility>

#include "bridge/root_node_repo.h"
#include "dom/root_node.h"
#include "render/tdf/image/base64_image_loader.h"
#include "render/tdf/image/net_image_loader.h"
#include "render/tdf/vdom/root_view_node.h"
#include "render/tdf/vdom/view_node.h"

namespace tdfrender {

TDFRenderContext::TDFRenderContext(uint32_t root_id, const std::shared_ptr<tdfcore::Shell>& shell,
                                   const std::shared_ptr<hippy::DomManager>& manager, UriDataGetter getter)
    : root_id_(root_id), shell_(shell), dom_manager_(manager), getter_(std::move(getter)) {
  assert(manager);
}

void TDFRenderContext::Init() {
  shell_.lock()->GetUITaskRunner()->PostTask([WEAK_THIS] {
    DEFINE_AND_CHECK_SELF(TDFRenderContext)

    self->view_context_ = TDF_MAKE_SHARED(tdfcore::ViewContext, self->shell_.lock());
    self->view_context_->SetCurrent();

    hippy::DomNode::RenderInfo info = {self->root_id_, 0, 0};
    auto root_view_node = TDF_MAKE_SHARED(RootViewNode, info, self->view_context_->GetRootView());

    self->Register(self->root_id_, root_view_node);
    self->view_context_->SetupDefaultBuildFunction();

    self->UpdateRootNodeSize(self->shell_.lock()->GetViewportMetrics());
    self->GetShell()->GetEventCenter()->AddListener(
        tdfcore::ViewportEvent::ClassType(), [weak_this](const std::shared_ptr<tdfcore::Event>& event, uint64_t id) {
          auto self = weak_this.lock();
          if (!self) {
            return tdfcore::EventDispatchBehavior::kContinue;
          }
          self->GetShell()->GetUITaskRunner()->PostTask([event, weak_this] {
            DEFINE_AND_CHECK_SELF(TDFRenderContext)
            auto viewport_event = std::static_pointer_cast<tdfcore::ViewportEvent>(event);
            self->UpdateRootNodeSize(viewport_event->GetViewportMetrics());
          });
          return tdfcore::EventDispatchBehavior::kContinue;
        });

    // TODO: provide a FrameworkProxy Binding
    // register custom image loader
    auto https_scheme = "https";
    auto https_net_image_loader = TDF_MAKE_SHARED(tdfrender::NetImageLoader, https_scheme, self->getter_);
    self->view_context_->GetImageManager()->GetImageLoadManager()->RegisterImageLoader(https_scheme,
                                                                                       https_net_image_loader);

    auto http_scheme = "http";
    auto http_net_image_loader = TDF_MAKE_SHARED(tdfrender::NetImageLoader, http_scheme, self->getter_);
    self->view_context_->GetImageManager()->GetImageLoadManager()->RegisterImageLoader(http_scheme,
                                                                                       http_net_image_loader);

    auto base64_image_loader = TDF_MAKE_SHARED(tdfrender::Base64ImageLoader);
    self->view_context_->GetImageManager()->GetImageLoadManager()->RegisterImageLoader(
        tdfrender::Base64ImageLoader::GetScheme(), base64_image_loader);

  });
}

void TDFRenderContext::UpdateRootNodeSize(tdfcore::ViewportMetrics viewport_metrics) {
  auto device_pixel_ratio = viewport_metrics.device_pixel_ratio;
  auto width = viewport_metrics.width / device_pixel_ratio;
  auto height = viewport_metrics.height / device_pixel_ratio;
  std::vector<std::function<void()>> ops;
  ops.emplace_back([WEAK_THIS, width, height] {
    DEFINE_AND_CHECK_SELF(TDFRenderContext)
    std::shared_ptr<hippy::RootNode> root_node = hippy::bridge::RootNodeRepo::Find(self->root_id_);
    self->dom_manager_.lock()->SetRootSize(root_node, static_cast<float>(width), static_cast<float>(height));
    self->dom_manager_.lock()->DoLayout(root_node);
    self->dom_manager_.lock()->EndBatch(root_node);
  });
  dom_manager_.lock()->PostTask(hippy::Scene(std::move(ops)));
}

void tdfrender::TDFRenderContext::Register(uint32_t id, const std::shared_ptr<ViewNode>& view_node) {
  view_node->SetRenderContext(weak_from_this());
  nodes_query_table_.insert(std::make_pair(id, view_node));
}

void TDFRenderContext::Unregister(uint32_t id) {
  assert(nodes_query_table_.find(id) != nodes_query_table_.end());
  nodes_query_table_.erase(id);
}

std::shared_ptr<ViewNode> TDFRenderContext::Find(uint32_t id) {
  assert(nodes_query_table_.find(id) != nodes_query_table_.end());
  return nodes_query_table_.find(id)->second;
}

void TDFRenderContext::NotifyEndBatch() {
  end_batch_listener_.Notify();
  view_context_->MarkNeedsBuild();
}

std::shared_ptr<hippy::DomNode> TDFRenderContext::FindDomNode(uint32_t id) {
  std::shared_ptr<hippy::RootNode> root_node = hippy::bridge::RootNodeRepo::Find(root_id_);
  if (auto manager = dom_manager_.lock(); manager != nullptr) {
    auto dom_node = manager->GetNode(root_node, id);
    return dom_node;
  }
  assert(false);
}

}  // namespace tdfrender
