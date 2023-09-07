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

#include "renderer/tdf/viewnode/refresh_wrapper_node.h"

#include "renderer/tdf/viewnode/view_names.h"

namespace hippy {
inline namespace render {
inline namespace tdf {

constexpr const char kRefreshEvent[] = "refresh";

void HippyRefreshHeader::Init() { tdfcore::RefreshHeader::Init(); }

std::shared_ptr<tdfcore::View> RefreshWrapperItemNode::CreateView(const std::shared_ptr<ViewContext> &context) {
  auto view = ViewNode::CreateView(context);
  view->SetClipToBounds(true);
  return view;
}

void RefreshWrapperItemNode::HandleLayoutUpdate(hippy::LayoutResult layout_result) {
  // Do not use Hippy's layout location.Only use Hippy's layout size. The same to ListViewItemNode.
  TDF_RENDER_CHECK_ATTACH
  auto origin_left = GetView()->GetFrame().left;
  auto origin_top = GetView()->GetFrame().top;
  layout_result.left = origin_left;
  layout_result.top = origin_top;
  ViewNode::HandleLayoutUpdate(layout_result);
}

std::shared_ptr<tdfcore::View> RefreshWrapperNode::CreateView(const std::shared_ptr<ViewContext> &context) {
  auto view = ViewNode::CreateView(context);
  view->SetClipToBounds(true);
  return view;
}

void RefreshWrapperNode::OnChildAdd(const std::shared_ptr<ViewNode>& child, int64_t index) {
  auto child_dom_node = child->GetDomNode();
  FOOTSTONE_DCHECK(IsAttached());
  if (child_dom_node->GetViewName() == kRefreshWrapperItemViewName) {
    item_node_ = std::static_pointer_cast<RefreshWrapperItemNode>(child->GetSharedPtr());
    item_node_id_ = child->GetRenderInfo().id;
    auto view_context = GetView()->GetViewContext();
    refresh_header_ = TDF_MAKE_SHARED(HippyRefreshHeader, view_context, item_node_->CreateView(view_context));
    child->Attach(view_context, refresh_header_->GetView());
    return;
  }

  // RefreshHeader's location in ViewNode Tree is different from View Tree,
  // so we need to correct index here.
  child->SetCorrectedIndex(static_cast<int32_t>(index - 1));
  ViewNode::OnChildAdd(child, index);
  if (child_dom_node->GetViewName() == kListViewName) {
    list_view_node_id_ = child->GetRenderInfo().id;
    list_node_ = std::static_pointer_cast<ListViewNode>(child->GetSharedPtr());
    FOOTSTONE_DCHECK(item_node_ != nullptr && item_node_->IsAttached());
    list_node_->GetView<tdfcore::CustomLayoutView>()->SetHeader(refresh_header_);
    refresh_header_->AddStateListener(tdfcore::RefreshHeaderState::kRefreshing, [WEAK_THIS]() {
      DEFINE_AND_CHECK_SELF(RefreshWrapperNode)
      self->SendUIDomEvent(kRefreshEvent);
    });
  }
}
void RefreshWrapperNode::OnChildRemove(const std::shared_ptr<ViewNode>& child) {
  uint32_t id = child->GetRenderInfo().id;
  if (id == list_view_node_id_) {
    list_node_->GetView<tdfcore::CustomLayoutView>()->SetHeader(nullptr);
  } else  if (id == item_node_id_) {
    child->Detach(false);
    return;
  }

  ViewNode::OnChildRemove(child);
}

void RefreshWrapperNode::CallFunction(const std::string& name, const DomArgument& param, const uint32_t call_back_id) {
  ViewNode::CallFunction(name, param, call_back_id);
  if (name == kRefreshComplected) {
    if (refresh_header_ && refresh_header_->GetState() == tdfcore::RefreshHeaderState::kRefreshing) {
      refresh_header_->FinishRefresh();
    }
  } else if (name == kStartRefresh) {
    // TDF not support
  }
}

}  // namespace tdf
}  // namespace render
}  // namespace hippy
