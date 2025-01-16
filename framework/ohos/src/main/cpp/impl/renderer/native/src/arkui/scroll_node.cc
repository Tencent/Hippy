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

#include "renderer/arkui/scroll_node.h"
#include "renderer/arkui/native_node_api.h"
#include "renderer/utils/hr_pixel_utils.h"

namespace hippy {
inline namespace render {
inline namespace native {

static constexpr ArkUI_NodeEventType SCROLL_NODE_EVENT_TYPES[] = {
  NODE_SCROLL_EVENT_ON_SCROLL,
  NODE_SCROLL_EVENT_ON_SCROLL_START,
  NODE_SCROLL_EVENT_ON_SCROLL_STOP,
};

ScrollNode::ScrollNode()
    : ArkUINode(NativeNodeApi::GetInstance()->createNode(ArkUI_NodeType::ARKUI_NODE_SCROLL)),
      scrollNodeDelegate_(nullptr) {
  initialContentOffset_ = 0;
  scrollEventThrottle_ = 30;
  scrollMinOffset_ = 5;
  RegisterAppearEvent();
  RegisterTouchEvent();
  for (auto eventType : SCROLL_NODE_EVENT_TYPES) {
    MaybeThrow(NativeNodeApi::GetInstance()->registerNodeEvent(nodeHandle_, eventType, 0, nullptr));
  }
}

ScrollNode::~ScrollNode() {
  UnregisterAppearEvent();
  UnregisterTouchEvent();
  for (auto eventType : SCROLL_NODE_EVENT_TYPES) {
    NativeNodeApi::GetInstance()->unregisterNodeEvent(nodeHandle_, eventType);
  }
}

void ScrollNode::SetNodeDelegate(ScrollNodeDelegate *scrollNodeDelegate) { scrollNodeDelegate_ = scrollNodeDelegate; }

ScrollNode &ScrollNode::SetShowScrollIndicator(bool showScrollIndicator) {
  ArkUI_ScrollBarDisplayMode displayMode = ARKUI_SCROLL_BAR_DISPLAY_MODE_OFF;
  if (showScrollIndicator) {
    displayMode = ARKUI_SCROLL_BAR_DISPLAY_MODE_AUTO;
  }

  ArkUI_NumberValue value[] = {{.i32 = static_cast<int32_t>(displayMode)}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_SCROLL_BAR_DISPLAY_MODE, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::SCROLL_BAR_DISPLAY_MODE);
  return *this;
}

ScrollNode &ScrollNode::SetPagingEnabled(bool pagingEnabled) {
  ArkUI_NumberValue value[] = {{.i32 = static_cast<int32_t>(pagingEnabled)}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_SCROLL_ENABLE_PAGING, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::SCROLL_ENABLE_PAGING);
  return *this;
}

ScrollNode &ScrollNode::SetFlingEnabled(bool flingEnabled) {
  float friction = flingEnabled ? 20 : static_cast<float>(0.8);
  ArkUI_NumberValue value[] = {{.f32 = static_cast<float>(friction)}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_SCROLL_FRICTION, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::SCROLL_FRICTION);
  return *this;
}

ScrollNode &ScrollNode::SetContentOffset4Reuse(const HRPoint &contentOffset4Reuse) {
  float contentOffset = 0;
  if (axis_ == ARKUI_SCROLL_DIRECTION_VERTICAL) {
    contentOffset = contentOffset4Reuse.y;
  } else {
    contentOffset = contentOffset4Reuse.x;
  }
  ScrollToContentOffset(contentOffset);
  return *this;
}

ScrollNode &ScrollNode::SetScrollEnabled(bool scrollEnabled) {
  ArkUI_NumberValue value[] = {{.i32 = static_cast<int32_t>(scrollEnabled)}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_SCROLL_ENABLE_SCROLL_INTERACTION, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::SCROLL_ENABLE_SCROLL_INTERACTION);
  return *this;
}

ScrollNode &ScrollNode::SetHorizontal(bool horizontal) {
  ArkUI_ScrollDirection scrollDirection = ARKUI_SCROLL_DIRECTION_VERTICAL;
  if (horizontal) {
    scrollDirection = ARKUI_SCROLL_DIRECTION_HORIZONTAL;
  }
  axis_ = scrollDirection;
  ArkUI_NumberValue value[] = {{.i32 = static_cast<int32_t>(scrollDirection)}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_SCROLL_SCROLL_DIRECTION, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::SCROLL_SCROLL_DIRECTION);
  return *this;
}

ScrollNode &ScrollNode::SetInitialContentOffset(float initialContentOffset) {
  initialContentOffset_ = initialContentOffset;
  return *this;
}

ScrollNode &ScrollNode::SetScrollEventThrottle(float scrollEventThrottle) {
  scrollEventThrottle_ = scrollEventThrottle;
  return *this;
}

ScrollNode &ScrollNode::SetScrollMinOffset(float scrollMinOffset) {
  scrollMinOffset_ = scrollMinOffset;
  return *this;
}

ScrollNode &ScrollNode::SetNestedScroll(ArkUI_ScrollNestedMode forward, ArkUI_ScrollNestedMode backward){
  ArkUI_NumberValue value[] = {{.i32 = forward},{.i32 = backward}}; 
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_SCROLL_NESTED_SCROLL, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::SCROLL_NESTED_SCROLL);
  return *this;
}

ScrollNode &ScrollNode::SetScrollEdgeEffect(ArkUI_EdgeEffect effect) {
  ArkUI_NumberValue value[] = {{.i32 = effect},};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_SCROLL_EDGE_EFFECT, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::SCROLL_EDGE_EFFECT);
  return *this;
}

void ScrollNode::OnNodeEvent(ArkUI_NodeEvent *event) {
  ArkUINode::OnNodeEvent(event);
  if (!scrollNodeDelegate_) {
    return;
  }
  auto eventType = OH_ArkUI_NodeEvent_GetEventType(event);
  auto nodeComponentEvent = OH_ArkUI_NodeEvent_GetNodeComponentEvent(event);
  if (eventType == ArkUI_NodeEventType::NODE_EVENT_ON_APPEAR) {
    ScrollToContentOffset(initialContentOffset_);
  } else if (eventType == ArkUI_NodeEventType::NODE_SCROLL_EVENT_ON_SCROLL_STOP) {
    scrollNodeDelegate_->OnScrollStop();
  } else if (eventType == ArkUI_NodeEventType::NODE_SCROLL_EVENT_ON_SCROLL_START) {
    scrollNodeDelegate_->OnScrollStart();
  } else if (eventType == ArkUI_NodeEventType::NODE_SCROLL_EVENT_ON_SCROLL) {
    float x = nodeComponentEvent->data[0].f32;
    float y = nodeComponentEvent->data[1].f32;
    scrollNodeDelegate_->OnScroll(x, y);
  }
}

void ScrollNode::ScrollTo(float x, float y, bool animated, int32_t duration) {
  int32_t timeValue = 1000;
  if (!animated) {
    timeValue = 0;
  }
  if (duration > 0) {
    timeValue = duration;
  }
  ArkUI_AttributeItem item;
  ArkUI_NumberValue value[] = {{.f32 = HRPixelUtils::DpToVp(x)},
                               {.f32 = HRPixelUtils::DpToVp(y)},
                               {.i32 = timeValue},
                               {.i32 = ArkUI_AnimationCurve::ARKUI_CURVE_SMOOTH},
                               {.i32 = 0}};
  item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_SCROLL_OFFSET, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::SCROLL_OFFSET);
}

HRPoint ScrollNode::GetScrollContentOffset() const {
  auto value = NativeNodeApi::GetInstance()->getAttribute(nodeHandle_, NODE_SCROLL_OFFSET)->value;
  float x = value->f32;
  value++;
  float y = value->f32;
  return HRPoint{x, y};
}

void ScrollNode::ScrollToContentOffset(float contentOffset) {
  if (axis_ == ARKUI_SCROLL_DIRECTION_VERTICAL) {
    ScrollTo(0, contentOffset, false);
  } else {
    ScrollTo(contentOffset, 0, false);
  }
}

ArkUI_ScrollDirection ScrollNode::GetAxis() const { return axis_; }

float ScrollNode::GetScrollMinOffset() const { return scrollMinOffset_; }

float ScrollNode::GetScrollEventThrottle() const { return scrollEventThrottle_; }

void ScrollNode::ResetAllAttributes() {
  ArkUINode::ResetAllAttributes();
  if (!subAttributesFlagValue_) {
    return;
  }
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::SCROLL_BAR_DISPLAY_MODE, NODE_SCROLL_BAR_DISPLAY_MODE);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::SCROLL_ENABLE_PAGING, NODE_SCROLL_ENABLE_PAGING);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::SCROLL_FRICTION, NODE_SCROLL_FRICTION);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::SCROLL_ENABLE_SCROLL_INTERACTION, NODE_SCROLL_ENABLE_SCROLL_INTERACTION);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::SCROLL_SCROLL_DIRECTION, NODE_SCROLL_SCROLL_DIRECTION);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::SCROLL_NESTED_SCROLL, NODE_SCROLL_NESTED_SCROLL);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::SCROLL_EDGE_EFFECT, NODE_SCROLL_EDGE_EFFECT);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::SCROLL_OFFSET, NODE_SCROLL_OFFSET);
  subAttributesFlagValue_ = 0;
}

} // namespace native
} // namespace render
} // namespace hippy
