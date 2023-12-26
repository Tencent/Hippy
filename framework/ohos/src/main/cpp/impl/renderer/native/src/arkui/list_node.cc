/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#include "renderer/arkui/list_node.h"
#include "renderer/arkui/native_node_api.h"

namespace hippy {
inline namespace render {
inline namespace native {

static constexpr ArkUI_NodeEventType LIST_NODE_EVENT_TYPES[] = {
  NODE_LIST_ON_SCROLL_INDEX,
  NODE_LIST_ON_WILL_SCROLL,
  NODE_SCROLL_EVENT_ON_SCROLL,
  NODE_SCROLL_EVENT_ON_SCROLL_START,
  NODE_SCROLL_EVENT_ON_SCROLL_STOP,
  NODE_SCROLL_EVENT_ON_REACH_START,
  NODE_SCROLL_EVENT_ON_REACH_END,
};

ListNode::ListNode()
    : ArkUINode(NativeNodeApi::GetInstance()->createNode(ArkUI_NodeType::ARKUI_NODE_LIST)) {
  RegisterAppearEvent();
  RegisterDisappearEvent();
  RegisterTouchEvent();
  for (auto eventType : LIST_NODE_EVENT_TYPES) {
    MaybeThrow(NativeNodeApi::GetInstance()->registerNodeEvent(nodeHandle_, eventType, 0, nullptr));
  }
}

ListNode::~ListNode() {
  UnregisterAppearEvent();
  UnregisterDisappearEvent();
  UnregisterTouchEvent();
  for (auto eventType : LIST_NODE_EVENT_TYPES) {
    NativeNodeApi::GetInstance()->unregisterNodeEvent(nodeHandle_, eventType);
  }
  ResetLazyAdapter();
}

void ListNode::RemoveAllChildren() {
  uint32_t count = NativeNodeApi::GetInstance()->getTotalChildCount(nodeHandle_);
  for (int32_t i = static_cast<int32_t>(count) - 1; i >= 0; i--) {
    ArkUI_NodeHandle childHandle = NativeNodeApi::GetInstance()->getChildAt(nodeHandle_, i);
    if (childHandle) {
      MaybeThrow(NativeNodeApi::GetInstance()->removeChild(nodeHandle_, childHandle));
    }
  }
}

HRPoint ListNode::GetScrollOffset() {
  auto item = NativeNodeApi::GetInstance()->getAttribute(nodeHandle_, NODE_SCROLL_OFFSET);
  float x = item->value[0].f32;
  float y = item->value[1].f32;
  return HRPoint(x, y);
}

void ListNode::ScrollTo(float offsetX, float offsetY, bool animated) {
  ArkUI_NumberValue value[] = {{.f32 = offsetX},
                               {.f32 = offsetY},
                               {.i32 = animated ? 1000 : 0},
                               {.i32 = ArkUI_AnimationCurve::ARKUI_CURVE_SMOOTH},
                               {.i32 = 0}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_SCROLL_OFFSET, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::SCROLL_OFFSET);
}

void ListNode::ScrollToIndex(int32_t index, bool animated, bool isScrollAlignStart) {
  ArkUI_NumberValue value[] = {{.i32 = index},
                               {.i32 = animated ? 1 : 0},
                               {.i32 = isScrollAlignStart ? ARKUI_SCROLL_ALIGNMENT_START : ARKUI_SCROLL_ALIGNMENT_END}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_LIST_SCROLL_TO_INDEX, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::LIST_SCROLL_TO_INDEX);
}

void ListNode::SetListDirection(bool isVertical) {
  ArkUI_NumberValue value[] = {{.i32 = isVertical ? ARKUI_AXIS_VERTICAL : ARKUI_AXIS_HORIZONTAL}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_LIST_DIRECTION, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::LIST_DIRECTION);
}

void ListNode::SetListInitialIndex(int32_t index) {
  ArkUI_NumberValue value[] = {{.i32 = index}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_LIST_INITIAL_INDEX, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::LIST_INITIAL_INDEX);
}

void ListNode::SetScrollEdgeEffect(bool hasEffect) {
  ArkUI_NumberValue value[] = {{.i32 = hasEffect ? ARKUI_EDGE_EFFECT_SPRING : ARKUI_EDGE_EFFECT_NONE},
                               {.i32 = hasEffect ? 1 : 0}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_SCROLL_EDGE_EFFECT, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::SCROLL_EDGE_EFFECT);
}

void ListNode::SetScrollNestedScroll(ArkUI_ScrollNestedMode scrollForward, ArkUI_ScrollNestedMode scrollBackward) {
  ArkUI_NumberValue value[] = {{.i32 = scrollBackward}, {.i32 = scrollForward}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_SCROLL_NESTED_SCROLL, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::SCROLL_NESTED_SCROLL);
}

void ListNode::SetEnableScrollInteraction(bool enabled) {
  ArkUI_NumberValue value[] = {{.i32 = enabled}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_SCROLL_ENABLE_SCROLL_INTERACTION, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::SCROLL_ENABLE_SCROLL_INTERACTION);
}

void ListNode::SetListCachedCount(int32_t count) {
  ArkUI_NumberValue value[] = {{.i32 = count}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_LIST_CACHED_COUNT, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::LIST_CACHED_COUNT);
}

void ListNode::SetScrollBarDisplayMode(ArkUI_ScrollBarDisplayMode mode) {
  ArkUI_NumberValue value[] = {{.i32 = mode}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_SCROLL_BAR_DISPLAY_MODE, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::SCROLL_BAR_DISPLAY_MODE);
}

void ListNode::SetLazyAdapter(ArkUI_NodeAdapterHandle adapterHandle) {
  ArkUI_AttributeItem item{nullptr, 0, nullptr, adapterHandle};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_LIST_NODE_ADAPTER, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::LIST_NODE_ADAPTER);
  hasAdapter_ = true;
}

void ListNode::ResetLazyAdapter() {
  if (hasAdapter_) {
    NativeNodeApi::GetInstance()->resetAttribute(nodeHandle_, NODE_LIST_NODE_ADAPTER);
    hasAdapter_ = false;
  }
}

void ListNode::ResetAllAttributes() {
  ArkUINode::ResetAllAttributes();
  if (!subAttributesFlagValue_) {
    return;
  }
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::SCROLL_OFFSET, NODE_SCROLL_OFFSET);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::LIST_SCROLL_TO_INDEX, NODE_LIST_SCROLL_TO_INDEX);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::LIST_DIRECTION, NODE_LIST_DIRECTION);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::LIST_INITIAL_INDEX, NODE_LIST_INITIAL_INDEX);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::SCROLL_EDGE_EFFECT, NODE_SCROLL_EDGE_EFFECT);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::SCROLL_NESTED_SCROLL, NODE_SCROLL_NESTED_SCROLL);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::SCROLL_ENABLE_SCROLL_INTERACTION, NODE_SCROLL_ENABLE_SCROLL_INTERACTION);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::LIST_CACHED_COUNT, NODE_LIST_CACHED_COUNT);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::SCROLL_BAR_DISPLAY_MODE, NODE_SCROLL_BAR_DISPLAY_MODE);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::LIST_NODE_ADAPTER, NODE_LIST_NODE_ADAPTER);
  subAttributesFlagValue_ = 0;
}

void ListNode::OnNodeEvent(ArkUI_NodeEvent *event) {
  ArkUINode::OnNodeEvent(event);
  
  if (listNodeDelegate_ == nullptr) {
    return;
  }

  auto eventType = OH_ArkUI_NodeEvent_GetEventType(event);
  auto nodeComponentEvent = OH_ArkUI_NodeEvent_GetNodeComponentEvent(event);
  if (eventType == ArkUI_NodeEventType::NODE_LIST_ON_SCROLL_INDEX) {
    int32_t firstIndex = nodeComponentEvent->data[0].i32;
    int32_t lastIndex = nodeComponentEvent->data[1].i32;
    int32_t centerIndex = nodeComponentEvent->data[2].i32;
    listNodeDelegate_->OnScrollIndex(firstIndex, lastIndex, centerIndex);
  } else if (eventType == ArkUI_NodeEventType::NODE_LIST_ON_WILL_SCROLL) {
    float offset = nodeComponentEvent->data[0].f32;
    ArkUI_ScrollState state = (ArkUI_ScrollState)nodeComponentEvent->data[1].i32;
    listNodeDelegate_->OnWillScroll(offset, state);
  } else if (eventType == ArkUI_NodeEventType::NODE_SCROLL_EVENT_ON_SCROLL) {
    float x = nodeComponentEvent->data[0].f32;
    float y = nodeComponentEvent->data[1].f32;
    listNodeDelegate_->OnScroll(x, y);
  } else if (eventType == ArkUI_NodeEventType::NODE_SCROLL_EVENT_ON_SCROLL_START) {
    listNodeDelegate_->OnScrollStart();
  } else if (eventType == ArkUI_NodeEventType::NODE_SCROLL_EVENT_ON_SCROLL_STOP) {
    listNodeDelegate_->OnScrollStop();
  } else if (eventType == ArkUI_NodeEventType::NODE_SCROLL_EVENT_ON_REACH_START) {
    listNodeDelegate_->OnReachStart();
  } else if (eventType == ArkUI_NodeEventType::NODE_SCROLL_EVENT_ON_REACH_END) {
    listNodeDelegate_->OnReachEnd();
  }
}

void ListNode::SetNodeDelegate(ListNodeDelegate *listNodeDelegate) { listNodeDelegate_ = listNodeDelegate; }

} // namespace native
} // namespace render
} // namespace hippy
