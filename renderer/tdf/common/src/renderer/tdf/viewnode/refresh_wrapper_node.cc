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

std::shared_ptr<tdfcore::View> RefreshWrapperItemNode::CreateView() {
  auto view = ViewNode::CreateView();
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

std::shared_ptr<tdfcore::View> RefreshWrapperNode::CreateView() {
  auto view = ViewNode::CreateView();
  view->SetClipToBounds(true);
  return view;
}

void RefreshWrapperNode::OnChildAdd(const std::shared_ptr<ViewNode>& child, int64_t index) {
  auto child_dom_node = child->GetDomNode();
  FOOTSTONE_DCHECK(IsAttached());
  if (child_dom_node->GetViewName() == kRefreshWrapperItemViewName) {
    item_node_ = std::static_pointer_cast<RefreshWrapperItemNode>(child->GetSharedPtr());
    refresh_header_ = TDF_MAKE_SHARED(HippyRefreshHeader, item_node_->CreateView());
    child->Attach(refresh_header_->GetView());
    return;
  }

  // RefreshHeader's location in ViewNode Tree is different from View Tree,
  // so we need to correct index here.
  child->SetCorrectedIndex(static_cast<int32_t>(index - 1));
  ViewNode::OnChildAdd(child, index);
  if (child_dom_node->GetViewName() == kListViewName) {
    refresh_header_node_id_ = child->GetRenderInfo().id;
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
  if (child->GetRenderInfo().id == refresh_header_node_id_) {
    refresh_header_ = nullptr;
    list_node_->GetView<tdfcore::CustomLayoutView>()->SetHeader(nullptr);
    return;
  }
  ViewNode::OnChildRemove(child);
}

void RefreshWrapperNode::CallFunction(const std::string& name, const DomArgument& param, const uint32_t call_back_id) {
  if (name == kRefreshComplected) {
    if (refresh_header_ && refresh_header_->GetState() == tdfcore::RefreshHeaderState::kRefreshing) {
      refresh_header_->FinishRefresh();
    }
  }
}

}  // namespace tdf
}  // namespace render
}  // namespace hippy
