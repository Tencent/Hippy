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

std::shared_ptr<tdfcore::View> ScrollViewNode::CreateView(const std::shared_ptr<ViewContext> &context) {
  auto scroll_view = TDF_MAKE_SHARED(tdfcore::ScrollView, context);
  scroll_view->SetClipToBounds(true);
  scroll_view->SetVerticalOverscrollEnabled(true);  // defaultValue
  return scroll_view;
}

void ScrollViewNode::HandleStyleUpdate(const DomStyleMap& dom_style, const DomDeleteProps& dom_delete_props) {
  ViewNode::HandleStyleUpdate(dom_style, dom_delete_props);
  auto map_end = dom_style.cend();
  auto scroll_view = GetView<tdfcore::ScrollView>();

  if (auto it = dom_style.find(scrollview::kPagingEnabled); it != map_end && it->second != nullptr) {
    FOOTSTONE_DCHECK(it->second->IsBoolean());
    auto physics = std::static_pointer_cast<tdfcore::DefaultScrollPhysics>(scroll_view->GetScrollPhysics());
    physics->SetPagingEnabled(it->second->ToBooleanChecked());
  }

  if (auto it = dom_style.find(scrollview::kScrollEnabled); it != map_end && it->second != nullptr) {
    FOOTSTONE_DCHECK(it->second->IsBoolean());
    scroll_view->SetScrollEnabled(it->second->ToBooleanChecked());
  }

  if (auto it = dom_style.find(scrollview::kScrollEventThrottle); it != map_end && it->second != nullptr) {
    FOOTSTONE_DCHECK(it->second->IsDouble());
    scroll_event_throttle_ = static_cast<int32_t>(it->second->ToDoubleChecked());
  }

  if (auto it = dom_style.find(scrollview::kScrollMinOffset); it != map_end && it->second != nullptr) {
    FOOTSTONE_DCHECK(it->second->IsInt32());
    min_scroll_offset_ = it->second->ToInt32Checked();
  }

  if (auto it = dom_style.find(scrollview::kShowScrollIndicator); it != map_end && it->second != nullptr) {
    // Skip
  }

  if (auto it = dom_style.find(kHorizontal); it != map_end && it->second != nullptr) {
    // May be undefined
    if (!it->second->IsUndefined() && it->second->ToBooleanChecked()) {
      scroll_view->SetHorizontalOverscrollEnabled(true);
      scroll_view->SetVerticalOverscrollEnabled(false);
      scroll_view->SetScrollDirection(tdfcore::ScrollDirection::kHorizontal);
    } else {
      scroll_view->SetHorizontalOverscrollEnabled(false);
      scroll_view->SetVerticalOverscrollEnabled(true);
      scroll_view->SetScrollDirection(tdfcore::ScrollDirection::kVertical);
    }
  }
}

void ScrollViewNode::CallFunction(const std::string &function_name,
                                  const DomArgument &param,
                                  const uint32_t call_back_id) {
  ViewNode::CallFunction(function_name, param, call_back_id);
  auto scroll_view = GetView<tdfcore::ScrollView>();
  footstone::HippyValue value;
  param.ToObject(value);
  footstone::value::HippyValue::HippyValueArrayType hippy_value_array;
  auto result = value.ToArray(hippy_value_array);
  FOOTSTONE_CHECK(result);
  if (!result) {
    return;
  }
  if (function_name == kScrollTo) {
    auto x = static_cast<float>(hippy_value_array.at(0).ToDoubleChecked());
    auto y = static_cast<float>(hippy_value_array.at(1).ToDoubleChecked());
    auto animated = hippy_value_array.at(2).ToBooleanChecked();
    scroll_view->SetOffset({x, y}, animated);
  }
}

void ScrollViewNode::HandleEventInfoUpdate() {
  auto scroll_view = GetView<tdfcore::ScrollView>();
  if (!scroll_view) {
    return;
  }
  auto supported_events = GetSupportedEvents();

  if (auto it = supported_events.find(kEventTypeScroll); it != supported_events.end()) {
    RegisterScrollUpdateListener(scroll_view);
  } else {
    RemoveScrollUpdateListener(scroll_view);
  }

  if (auto it = supported_events.find(kEventTypeMomentumBegin); it != supported_events.end()) {
    RegisterScrollStartListener(scroll_view);
  } else {
    RemoveScrollStartListener(scroll_view);
  }

  if (auto it = supported_events.find(kEventTypeMomentumEnd); it != supported_events.end()) {
    RegisterScrollEndListener(scroll_view);
  } else {
    RemoveScrollEndListener(scroll_view);
  }

  if (auto it = supported_events.find(kEventTypeBeginDrag); it != supported_events.end()) {
    RegisterDragStartListener(scroll_view);
  } else {
    RemoveDragStartListener(scroll_view);
  }

  if (auto it = supported_events.find(kEventTypeEndDrag); it != supported_events.end()) {
    RegisterDragEndListener(scroll_view);
  } else {
    RemoveDragEndListener(scroll_view);
  }
}

void ScrollViewNode::OnChildAdd(const std::shared_ptr<ViewNode>& child, int64_t index) {
  ViewNode::OnChildAdd(child, index);
  child_layout_listener_id_ = child->AddLayoutUpdateListener([WEAK_THIS](tdfcore::TRect rect) {
    DEFINE_AND_CHECK_SELF(ScrollViewNode)
    self->GetView<tdfcore::ScrollView>()->SetContentRect(rect);
  });
}

void ScrollViewNode::OnChildRemove(const std::shared_ptr<ViewNode>& child) {
  ViewNode::OnChildRemove(child);
  if (child_layout_listener_id_ != kUninitializedId) {
    child->RemoveLayoutUpdateListener(child_layout_listener_id_);
  }
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

#define REGISTER_LISTENER(Event, listener)                                                             \
  void ScrollViewNode::Register##Event##Listener(std::shared_ptr<tdfcore::ScrollView> scroll_view) {  \
    if (listener##id_ == kUninitializedId) {                                                          \
      if (listener == nullptr) {                                                                      \
        Init##Event##Listener();                                                                      \
      }                                                                                               \
      listener##id_ = scroll_view->Add##Event##Listener(listener);                                    \
    }                                                                                                 \
  }                                                                                                   \

// Called by CreateView
REGISTER_LISTENER(ScrollStart, scroll_start_listener_)
REGISTER_LISTENER(ScrollUpdate, scroll_update_listener_)
REGISTER_LISTENER(ScrollEnd, scroll_end_listener_)
REGISTER_LISTENER(DragStart, drag_start_listener_)
REGISTER_LISTENER(DragEnd, drag_end_listener_)
#undef REGISTER_LISTENER

#define REMOVE_LISTENER(Event, listener)                                                            \
  void ScrollViewNode::Remove##Event##Listener(std::shared_ptr<tdfcore::ScrollView> scroll_view) { \
    if (listener##id_ != kUninitializedId) {                                                       \
      scroll_view->Remove##Event##Listener(listener##id_);                                         \
    }                                                                                              \
  }

REMOVE_LISTENER(ScrollStart, scroll_start_listener_)
REMOVE_LISTENER(ScrollUpdate, scroll_update_listener_)
REMOVE_LISTENER(ScrollEnd, scroll_end_listener_)
REMOVE_LISTENER(DragStart, drag_start_listener_)
REMOVE_LISTENER(DragEnd, drag_end_listener_)
#undef REMOVE_LISTENER

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
