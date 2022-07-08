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

#include "render/tdf/vdom/list_view_node.h"
#include <cassert>
#include "dom/node_props.h"
#include "render/tdf/vdom/view_node.h"

namespace tdfrender {

inline namespace listviewitem {
constexpr const char* kViewType = "type";
constexpr const char* kSticky = "sticky";
constexpr const char* kViewTypeNew = "itemViewType";
}  // namespace listviewitem

constexpr const char* kEndreached = "endreached";
constexpr const char* kLoadmore = "loadmore";

node_creator ListViewNode::GetCreator() {
  return [](RenderInfo info) { return std::make_shared<ListViewNode>(info); };
}

std::shared_ptr<tdfcore::View> ListViewNode::CreateView() {
  data_source_ = TDF_MAKE_SHARED(ListViewDataSource, std::static_pointer_cast<ListViewNode>(shared_from_this()));
  auto layout = TDF_MAKE_SHARED(tdfcore::LinearCustomLayout);
  return TDF_MAKE_SHARED(tdfcore::CustomLayoutView, data_source_, layout);
}

void ListViewNode::OnAttach() {
  auto list_view = GetView<tdfcore::CustomLayoutView>();
  list_view->SetItemChangeCallback(
      [this](int64_t index, const std::shared_ptr<tdfcore::View>& item, tdfcore::ItemAction action) {
        assert(index < GetChildren().size());
        auto node = std::static_pointer_cast<ListViewItemNode>(GetChildren()[index]);
        if (action == tdfcore::ItemAction::kAdd) {
          // attach when updateItem (before add to listview)
          assert(node->IsAttached());
        } else {
          assert(GetChildren()[index]->IsAttached());
          GetChildren()[index]->Detach(false);
        }
      });
  batch_end_listener_id_ = GetRenderContext()->AddEndBatchListener([WEAK_THIS]() {
    DEFINE_AND_CHECK_SELF(ListViewNode)
    if (self->should_reload_) {
      self->GetView<tdfcore::CustomLayoutView>()->Reload();
      self->should_reload_ = false;
    }
  });
  using tdfcore::TPoint;
  on_reach_end_listener_id_ = list_view->AddScrollUpdateListener([WEAK_THIS](Point old_offset, Point offset) {
    DEFINE_AND_CHECK_SELF(ListViewNode);
    auto list_view = self->GetView<tdfcore::CustomLayoutView>();
    auto has_reach_horizontal_end = list_view->GetHorizontalOverscrollEnabled() &&
                                    offset.x > list_view->GetContentRect().right - list_view->GetFrame().right;
    auto has_reach_vertical_end = list_view->GetVerticalOverscrollEnabled() &&
                                  offset.y > list_view->GetContentRect().bottom - list_view->GetFrame().bottom;
    if (has_reach_horizontal_end || has_reach_vertical_end) {
      if (!self->has_reached_end_) {
        self->has_reached_end_ = true;
        self->HandleEndReachedEvent();
      }
    } else {
      self->has_reached_end_ = false;
    }
  });
  // TODO(vimerzhao) move to more proper location
  SendUIDomEvent(hippy::kInitialListReady);
}

void ListViewNode::OnDetach() {
  auto list_view = GetView<tdfcore::CustomLayoutView>();
  list_view->SetItemChangeCallback(nullptr);
  GetRenderContext()->RemoveEndBatchListener(batch_end_listener_id_);
  list_view->RemoveScrollUpdateListener(on_reach_end_listener_id_);
}

void ListViewNode::HandleStyleUpdate(const DomStyleMap& dom_style) { ViewNode::HandleStyleUpdate(dom_style); }

void ListViewNode::HandleEndReachedEvent() {
  ViewNode::SendUIDomEvent(kEndreached);
  ViewNode::SendUIDomEvent(kLoadmore);
}

void ListViewItemNode::HandleLayoutUpdate(hippy::LayoutResult layout_result) {
  TDF_RENDER_CHECK_ATTACH
  auto origin_left = GetView()->GetFrame().left;
  auto origin_top = GetView()->GetFrame().top;
  layout_result.left = origin_left;
  layout_result.top = origin_top;
  ViewNode::HandleLayoutUpdate(layout_result);
}

void ListViewNode::OnChildAdd(ViewNode& child, int64_t index) { should_reload_ = true; }

void ListViewNode::OnChildRemove(ViewNode& child) { should_reload_ = true; }

node_creator ListViewItemNode::GetCreator() {
  return [](RenderInfo info) { return std::make_shared<ListViewItemNode>(info); };
}

std::shared_ptr<tdfcore::View> ListViewItemNode::CreateView() { return TDF_MAKE_SHARED(tdfcore::View); }

void ListViewItemNode::HandleStyleUpdate(const DomStyleMap& dom_style) {
  ViewNode::HandleStyleUpdate(dom_style);
  if (auto it = dom_style.find(listviewitem::kSticky); it != dom_style.cend()) {
    is_sticky_ = it->second->ToBooleanChecked();
  }
  if (auto it = dom_style.find(listviewitem::kViewType); it != dom_style.cend()) {
    if (it->second->IsString()) {
      view_type_ = static_cast<int64_t>(std::hash<std::string>{}(it->second->ToStringChecked()));
    } else if (it->second->IsInt32()){
      view_type_ = it->second->ToInt32Checked();
    }
    // TODO Other Type
  }
  if (auto it = dom_style.find(listviewitem::kViewTypeNew); it != dom_style.cend()) {
    assert(it->second->IsInt32());
    view_type_ = it->second->ToInt32Checked();
  }
}

std::shared_ptr<tdfcore::View> ListViewDataSource::GetItem(
    int64_t index, const std::shared_ptr<tdfcore::CustomLayoutView>& custom_layout_view) {
  assert(!list_view_node_.expired());
  assert(index >= 0 && index < list_view_node_.lock()->GetChildren().size());
  auto node = std::static_pointer_cast<ListViewItemNode>(list_view_node_.lock()->GetChildren()[index]);
  return node->CreateView();
}

int64_t ListViewDataSource::GetItemCount() { return list_view_node_.lock()->GetChildren().size(); }

void ListViewDataSource::UpdateItem(int64_t index, const std::shared_ptr<tdfcore::View>& item,
                                    const std::shared_ptr<tdfcore::CustomLayoutView>& custom_layout_view) {
  assert(!list_view_node_.expired());
  assert(index >= 0 && index < list_view_node_.lock()->GetChildren().size());
  auto node = std::static_pointer_cast<ListViewItemNode>(list_view_node_.lock()->GetChildren()[index]);
  node->Attach(item);
}

int64_t ListViewDataSource::GetItemType(int64_t index) {
  assert(!list_view_node_.expired());
  assert(index >= 0 && index < list_view_node_.lock()->GetChildren().size());
  auto node = std::static_pointer_cast<ListViewItemNode>(list_view_node_.lock()->GetChildren()[index]);
  /// TODO(kloudwang) 复用机制还有点问题，临时先屏蔽
  // return node->GetViewType();
  return index;
}

bool ListViewDataSource::IsItemSticky(int64_t index) {
  assert(!list_view_node_.expired());
  // TODO(vimerzhao): TDFCore's sticky feature is conflict with Hippy. Need to improve.
  return false;
}

}  // namespace tdfrender
