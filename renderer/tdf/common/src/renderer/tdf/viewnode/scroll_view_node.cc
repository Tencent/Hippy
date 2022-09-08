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

#include "renderer/tdf/viewnode/scroll_view_node.h"

#include <memory>

namespace hippy {
inline namespace render {
inline namespace tdf {

std::shared_ptr<tdfcore::View> ScrollViewNode::CreateView() {
  auto scroll_view = TDF_MAKE_SHARED(tdfcore::ScrollView);
  scroll_view->SetVerticalOverscrollEnabled(true);  // defaultValue
  RegisterScrollStartListener(scroll_view);
  RegisterScrollEndListener(scroll_view);
  RegisterScrollUpdateListener(scroll_view);
  RegisterDragStartListener(scroll_view);
  RegisterDragEndListener(scroll_view);
  return scroll_view;
}

void ScrollViewNode::HandleStyleUpdate(const DomStyleMap& dom_style) {
  ViewNode::HandleStyleUpdate(dom_style);
  auto map_end = dom_style.cend();
  auto scroll_view = GetView<tdfcore::ScrollView>();

  if (auto it = dom_style.find(scrollview::kPagingEnabled); it != map_end) {
    FOOTSTONE_DCHECK(it->second->IsBoolean());
    auto physics = std::static_pointer_cast<tdfcore::DefaultScrollPhysics>(scroll_view->GetScrollPhysics());
    physics->SetPagingEnabled(it->second->ToBooleanChecked());
  }

  if (auto it = dom_style.find(scrollview::kScrollEnabled); it != map_end) {
    FOOTSTONE_DCHECK(it->second->IsBoolean());
    scroll_view->SetScrollEnabled(it->second->ToBooleanChecked());
  }

  if (auto it = dom_style.find(scrollview::kScrollEventThrottle); it != map_end) {
    FOOTSTONE_DCHECK(it->second->IsInt32());
    scroll_event_throttle_ = it->second->ToInt32Checked();
  }

  if (auto it = dom_style.find(scrollview::kScrollMinOffset); it != map_end) {
    FOOTSTONE_DCHECK(it->second->IsInt32());
    min_scroll_offset_ = it->second->ToInt32Checked();
  }

  if (auto it = dom_style.find(scrollview::kShowScrollIndicator); it != map_end) {
    // Skip
  }

  if (auto it = dom_style.find(kHorizontal); it != map_end && it->second->ToBooleanChecked()) {
    FOOTSTONE_DCHECK(it->second->IsBoolean());
    auto horizontal = it->second->ToBooleanChecked();
    scroll_view->SetHorizontalOverscrollEnabled(horizontal);
    scroll_view->SetVerticalOverscrollEnabled(!horizontal);
  }
}

void ScrollViewNode::OnChildAdd(const std::shared_ptr<ViewNode>& child, int64_t index) {
  FOOTSTONE_DCHECK(GetView()->GetChildren().size() == 0);
  ViewNode::OnChildAdd(child, index);
  child_layout_listener_id_ = child->AddLayoutUpdateListener([WEAK_THIS](tdfcore::TRect rect) {
    DEFINE_AND_CHECK_SELF(ScrollViewNode)
    self->GetView<tdfcore::ScrollView>()->SetContentRect(rect);
  });
}

void ScrollViewNode::OnChildRemove(const std::shared_ptr<ViewNode>& child) {
  ViewNode::OnChildRemove(child);
  child->RemoveLayoutUpdateListener(child_layout_listener_id_);
}

void ScrollViewNode::InitScrollStartListener() {
  scroll_start_listener_ = [WEAK_THIS]() {
    DEFINE_AND_CHECK_SELF(ScrollViewNode)
    self->HandleInnerEvent(kEventTypeMomentumBegin);
  };
}
void ScrollViewNode::InitScrollUpdateListener() {
  scroll_update_listener_ = [WEAK_THIS](tdfcore::TPoint, tdfcore::TPoint) {
    DEFINE_AND_CHECK_SELF(ScrollViewNode)
    self->HandleInnerEvent(kEventTypeScroll);
  };
}

void ScrollViewNode::InitScrollEndListener() {
  scroll_end_listener_ = [WEAK_THIS]() {
    DEFINE_AND_CHECK_SELF(ScrollViewNode)
    self->HandleInnerEvent(kEventTypeMomentumEnd);
  };
}

void ScrollViewNode::InitDragStartListener() {
  drag_start_listener_ = [WEAK_THIS]() {
    DEFINE_AND_CHECK_SELF(ScrollViewNode)
    self->HandleInnerEvent(kEventTypeBeginDrag);
  };
}

void ScrollViewNode::InitDragEndListener() {
  drag_end_listener_ = [WEAK_THIS]() {
    DEFINE_AND_CHECK_SELF(ScrollViewNode)
    self->HandleInnerEvent(kEventTypeEndDrag);
  };
}

#define RegisterListener(Event, listener)                                                            \
  void ScrollViewNode::Register##Event##Listener(std::shared_ptr<tdfcore::ScrollView> scroll_view) { \
    if (listener == nullptr) {                                                                       \
      Init##Event##Listener();                                                                       \
    }                                                                                                \
    listener##id_ = scroll_view->Add##Event##Listener(listener);                                     \
  }

// Called by CreateView
RegisterListener(ScrollStart, scroll_start_listener_) RegisterListener(ScrollUpdate, scroll_update_listener_)
    RegisterListener(ScrollEnd, scroll_end_listener_) RegisterListener(DragStart, drag_start_listener_)
        RegisterListener(DragEnd, drag_end_listener_)
#undef RegisterListener

#define RemoveListener(Event, listener)                                                            \
  void ScrollViewNode::Remove##Event##Listener(std::shared_ptr<tdfcore::ScrollView> scroll_view) { \
    if (listener##id_ != kUninitializedId) {                                                       \
      scroll_view->Remove##Event##Listener(listener##id_);                                         \
    }                                                                                              \
  }

            RemoveListener(ScrollStart, scroll_start_listener_) RemoveListener(ScrollUpdate, scroll_update_listener_)
                RemoveListener(ScrollEnd, scroll_end_listener_) RemoveListener(DragStart, drag_start_listener_)
                    RemoveListener(DragEnd, drag_end_listener_)
#undef RemoveListener

                        void ScrollViewNode::HandleInnerEvent(std::string type) {
  DomValueObjectType param;
  footstone::HippyValue::HippyValueObjectType content_offset_param;
  auto scroll_view = GetView<tdfcore::ScrollView>();
  auto offset = scroll_view->GetOffset();
  content_offset_param["x"] = footstone::HippyValue(offset.x);
  content_offset_param["y"] = footstone::HippyValue(offset.y);
  param["contentOffset"] = footstone::HippyValue(content_offset_param);

  auto content_size = scroll_view->GetContentRect();
  auto scroll_frame = scroll_view->GetFrame();
  DomValueObjectType content_size_param;
  content_size_param["width"] = footstone::HippyValue(content_size.Width());
  content_size_param["height"] = footstone::HippyValue(content_size.Height());
  param["contentSize"] = footstone::HippyValue(content_size_param);

  DomValueObjectType content_inset_param;
  content_inset_param["top"] = footstone::HippyValue(0);
  content_inset_param["left"] = footstone::HippyValue(0);
  content_inset_param["bottom"] = footstone::HippyValue(0);
  content_inset_param["right"] = footstone::HippyValue(0);
  param["contentInset"] = content_inset_param;

  DomValueObjectType layout_measurement;
  layout_measurement["width"] = footstone::HippyValue(scroll_frame.Width());
  layout_measurement["height"] = footstone::HippyValue(scroll_frame.Height());
  param["layoutMeasurement"] = footstone::HippyValue(layout_measurement);

  SendGestureDomEvent(type, std::make_shared<footstone::HippyValue>(param));
}

}  // namespace tdf
}  // namespace render
}  // namespace hippy
