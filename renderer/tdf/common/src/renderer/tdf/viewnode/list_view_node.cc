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

#include "renderer/tdf/viewnode/list_view_node.h"

#include <cassert>
#include "dom/node_props.h"
#include "renderer/tdf/viewnode/root_view_node.h"
#include "renderer/tdf/viewnode/view_node.h"

namespace hippy {
inline namespace render {
inline namespace tdf {

inline namespace listviewitem {
constexpr const char kViewType[] = "type";
constexpr const char kSticky[] = "sticky";
constexpr const char kViewTypeNew[] = "itemViewType";
}  // namespace listviewitem

std::shared_ptr<tdfcore::View> ListViewNode::CreateView(const std::shared_ptr<ViewContext> &context) {
  auto data_source = TDF_MAKE_SHARED(ListViewDataSource, std::static_pointer_cast<ListViewNode>(shared_from_this()));
  auto layout = TDF_MAKE_SHARED(tdfcore::LinearCustomLayout);
  auto view = TDF_MAKE_SHARED(tdfcore::CustomLayoutView, context, data_source, layout);
  view->SetClipToBounds(true);
  view->SetScrollDirection(tdfcore::ScrollDirection::kVertical);
  return view;
}

void ListViewNode::OnAttach() {
  auto list_view = GetView<tdfcore::CustomLayoutView>();
  list_view->SetItemChangeCallback(
      [WEAK_THIS](int64_t index, const std::shared_ptr<tdfcore::View>& item, tdfcore::ItemAction action) {
        DEFINE_AND_CHECK_SELF(ListViewNode)
        auto new_index = static_cast<uint32_t>(index);
        if (action == tdfcore::ItemAction::kAdd) {
          FOOTSTONE_DCHECK(new_index >= 0 && new_index < self->GetChildren().size());
          auto node = self->GetChildren()[new_index];
          FOOTSTONE_DCHECK(!node->IsAttached());
          node->Attach(self->GetView()->GetViewContext(), item);
        } else {
          FOOTSTONE_DCHECK(new_index >= 0);
          bool found = false;
          if (new_index < self->GetChildren().size()) {
            auto node = self->GetChildren()[new_index];
            if (node->IsAttached() && node->GetView() == item) {
              node->Detach(false);
              found = true;
            }
          }
          if (!found) {
            for (uint32_t i = 0; i < self->GetChildren().size(); i++) {
              auto node = self->GetChildren()[i];
              if (node->IsAttached() && node->GetView() == item) {
                node->Detach(false);
                break;
              }
            }
          }
        }
      });
  batch_end_listener_id_ = GetRootNode()->AddEndBatchListener([WEAK_THIS]() {
    DEFINE_AND_CHECK_SELF(ListViewNode)
    if (self->should_reload_) {
      auto view = self->GetView<tdfcore::CustomLayoutView>();
      auto data_source = std::static_pointer_cast<ListViewDataSource>(view->GetDataSource());
      data_source->SetItemNodes(self->GetChildren());
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
  SendUIDomEvent(hippy::kInitialListReady);
}

void ListViewNode::OnDetach() {
  auto list_view = GetView<tdfcore::CustomLayoutView>();
  list_view->SetItemChangeCallback(nullptr);
  GetRootNode()->RemoveEndBatchListener(batch_end_listener_id_);
  list_view->RemoveScrollUpdateListener(on_reach_end_listener_id_);
}

void ListViewNode::HandleStyleUpdate(const DomStyleMap& dom_style, const DomDeleteProps& dom_delete_props) {
  ScrollViewNode::HandleStyleUpdate(dom_style, dom_delete_props);
}

void ListViewNode::HandleEndReachedEvent() {
  ViewNode::SendUIDomEvent(kEndreached);
  ViewNode::SendUIDomEvent(kLoadmore);
}

void ListViewNode::CallFunction(const std::string &function_name,
                                const DomArgument &param,
                                const uint32_t call_back_id) {
  ViewNode::CallFunction(function_name, param, call_back_id);
  auto list_view = GetView<tdfcore::CustomLayoutView>();
  footstone::HippyValue value;
  param.ToObject(value);
  footstone::value::HippyValue::HippyValueArrayType hippy_value_array;
  auto result = value.ToArray(hippy_value_array);
  FOOTSTONE_CHECK(result);
  if (!result) {
    return;
  }
  if (function_name == kScrollToIndex) {
    auto x_offset = hippy_value_array.at(0).ToInt32Checked();
    auto y_offset = hippy_value_array.at(1).ToInt32Checked();
    auto animated = hippy_value_array.at(2).ToBooleanChecked();
    auto scroll_direction = list_view->GetScrollDirection();
    if (scroll_direction == tdfcore::ScrollDirection::kHorizontal) {
      list_view->ScrollToIndex(x_offset, animated);
    } else {
      list_view->ScrollToIndex(y_offset, animated);
    }
  } else if (function_name == kScrollToContentOffset) {
    auto x = static_cast<float>(hippy_value_array.at(0).ToDoubleChecked());
    auto y = static_cast<float>(hippy_value_array.at(1).ToDoubleChecked());
    auto animated = hippy_value_array.at(2).ToBooleanChecked();
    list_view->SetOffset({x, y}, animated);
  }
}

void ListViewItemNode::HandleLayoutUpdate(hippy::LayoutResult layout_result) {
  TDF_RENDER_CHECK_ATTACH
  if (layout_result.height != GetView()->GetFrame().Height()) {
    auto list_view_node = std::static_pointer_cast<ListViewNode>(GetParent());
    list_view_node->SetShouldReload();
  }
  auto origin_left = GetView()->GetFrame().left;
  auto origin_top = GetView()->GetFrame().top;
  layout_result.left = origin_left;
  layout_result.top = origin_top;
  ViewNode::HandleLayoutUpdate(layout_result);
}

void ListViewNode::OnChildAdd(const std::shared_ptr<ViewNode>& child, int64_t index) {
  should_reload_ = true;

  auto new_index = static_cast<uint64_t>(index);
  FOOTSTONE_DCHECK(new_index >= 0 && new_index < GetChildren().size());
  auto node = std::static_pointer_cast<ListViewItemNode>(GetChildren()[new_index]);
  auto dom_node = node->GetDomNode();
  auto dom_style = GenerateStyleInfo(dom_node);
  node->UpdateViewType(dom_style);
}

void ListViewNode::OnChildRemove(const std::shared_ptr<ViewNode>& child) { should_reload_ = true; }

std::shared_ptr<tdfcore::View> ListViewItemNode::CreateView(const std::shared_ptr<ViewContext> &context) {
  auto view = TDF_MAKE_SHARED(tdfcore::View, context);
  view->SetClipToBounds(true);
  return view;
}

void ListViewItemNode::UpdateViewType(const DomStyleMap& dom_style) {
  bool found = false;
  if (auto it = dom_style.find(listviewitem::kViewType); it != dom_style.cend() && it->second != nullptr) {
    if (it->second->IsString()) {
      view_type_ = static_cast<int64_t>(std::hash<std::string>{}(it->second->ToStringChecked()));
      found = true;
    } else if (it->second->IsNumber()) {
      view_type_ = static_cast<int64_t>(it->second->ToDoubleChecked());
      found = true;
    }
  }
  if (auto it = dom_style.find(listviewitem::kViewTypeNew); it != dom_style.cend() && it->second != nullptr) {
    FOOTSTONE_DCHECK(it->second->IsInt32());
    view_type_ = it->second->ToInt32Checked();
    found = true;
  }

  if (!found) {
    auto list_view_node = std::static_pointer_cast<ListViewNode>(GetParent());
    view_type_ = list_view_node->NextUniqueItemViewType();
  }
}

void ListViewItemNode::HandleStyleUpdate(const DomStyleMap& dom_style, const DomDeleteProps& dom_delete_props) {
  ViewNode::HandleStyleUpdate(dom_style, dom_delete_props);
  if (auto it = dom_style.find(listviewitem::kSticky); it != dom_style.cend() && it->second != nullptr) {
    is_sticky_ = it->second->ToBooleanChecked();
  }
  UpdateViewType(dom_style);
}

void ListViewItemNode::OnDelete() {
  Detach(false);
  ViewNode::OnDelete();
}

std::shared_ptr<tdfcore::View> ListViewDataSource::GetItem(
    int64_t index, const std::shared_ptr<tdfcore::CustomLayoutView>& custom_layout_view) {
  FOOTSTONE_DCHECK(!list_view_node_.expired());
  FOOTSTONE_DCHECK(index >= 0 && static_cast<uint32_t>(index) < item_nodes_.size());
  auto node =
      std::static_pointer_cast<ListViewItemNode>(item_nodes_[static_cast<uint32_t>(index)]);
  return node->CreateView(custom_layout_view->GetViewContext());
}

int64_t ListViewDataSource::GetItemCount() {
  return static_cast<int64_t>(item_nodes_.size());
}

void ListViewDataSource::UpdateItem(int64_t index, const std::shared_ptr<tdfcore::View>& item,
                                    const std::shared_ptr<tdfcore::CustomLayoutView>& custom_layout_view) {
  FOOTSTONE_DCHECK(!list_view_node_.expired());
  FOOTSTONE_DCHECK(index >= 0 && static_cast<uint32_t>(index) < item_nodes_.size());

  auto new_index = static_cast<uint64_t>(index);
  auto node = item_nodes_[new_index];
  auto dom_node = node->GetDomNode();
  if (!dom_node) {
    return;
  }
  auto layout_result = dom_node->GetRenderLayoutResult();
  auto origin_left = item->GetFrame().left;
  auto origin_top = item->GetFrame().top;
  auto new_frame =
      tdfcore::TRect::MakeXYWH(origin_left, origin_top, layout_result.width, layout_result.height);
  item->SetFrame(new_frame);
}

int64_t ListViewDataSource::GetItemType(int64_t index) {
  FOOTSTONE_DCHECK(!list_view_node_.expired());
  FOOTSTONE_DCHECK(index >= 0 && static_cast<uint32_t>(index) < item_nodes_.size());
  auto node =
      std::static_pointer_cast<ListViewItemNode>(item_nodes_[static_cast<uint32_t>(index)]);
  return node->GetViewType();
}

bool ListViewDataSource::IsItemSticky(int64_t index) {
  FOOTSTONE_DCHECK(!list_view_node_.expired());
  return false;
}

void ListViewDataSource::SetItemNodes(std::vector<std::shared_ptr<ViewNode>> item_nodes) {
  item_nodes_ = item_nodes;
}

}  // namespace tdf
}  // namespace render
}  // namespace hippy
