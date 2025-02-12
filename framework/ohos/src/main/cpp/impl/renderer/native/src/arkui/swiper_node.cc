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

#include "renderer/arkui/swiper_node.h"
#include "renderer/arkui/native_node_api.h"
#include <bits/alltypes.h>
#include <cstdio>
#include "footstone/logging.h"
#include "renderer/utils/hr_event_utils.h"
#include "renderer/arkui/arkui_node_registry.h"
#include "renderer/utils/hr_pixel_utils.h"

namespace hippy {
inline namespace render {
inline namespace native {

static constexpr ArkUI_NodeEventType SWIPER_NODE_EVENT_TYPES[] = {
  NODE_SWIPER_EVENT_ON_CHANGE,        
  NODE_SWIPER_EVENT_ON_ANIMATION_START,
  NODE_SWIPER_EVENT_ON_ANIMATION_END,
  NODE_SWIPER_EVENT_ON_CONTENT_DID_SCROLL,
};

SwiperNode::SwiperNode()
    : ArkUINode(NativeNodeApi::GetInstance()->createNode(ArkUI_NodeType::ARKUI_NODE_SWIPER)) {
  RegisterTouchEvent();
  for (auto eventType : SWIPER_NODE_EVENT_TYPES) {
    MaybeThrow(NativeNodeApi::GetInstance()->registerNodeEvent(nodeHandle_, eventType, 0, nullptr));
  }
}

SwiperNode::~SwiperNode() {
  UnregisterTouchEvent();
  for (auto eventType : SWIPER_NODE_EVENT_TYPES) {
    NativeNodeApi::GetInstance()->unregisterNodeEvent(nodeHandle_, eventType);
  }
}

void SwiperNode::SetNodeDelegate(SwiperNodeDelegate *swiperNodeDelegate) {
  swiperNodeDelegate_ = swiperNodeDelegate;
}

void SwiperNode::OnNodeEvent(ArkUI_NodeEvent *event) {
  ArkUINode::OnNodeEvent(event);
  if (swiperNodeDelegate_ == nullptr) {
    return;
  }
  auto eventType = OH_ArkUI_NodeEvent_GetEventType(event);
  auto nodeComponentEvent = OH_ArkUI_NodeEvent_GetNodeComponentEvent(event);
  if (eventType == ArkUI_NodeEventType::NODE_SWIPER_EVENT_ON_CHANGE) {
    int32_t index = nodeComponentEvent->data[0].i32;
    swiperNodeDelegate_->OnChange(index);
  } else if (eventType == ArkUI_NodeEventType::NODE_SWIPER_EVENT_ON_ANIMATION_START) {
    int32_t currentIndex = nodeComponentEvent->data[0].i32;
    int32_t targetIndex = nodeComponentEvent->data[1].i32;
    float_t currentOffset = nodeComponentEvent->data[2].f32;
    float_t targetOffset = nodeComponentEvent->data[3].f32;
    float_t swipeVelocity = nodeComponentEvent->data[4].f32;
    swiperNodeDelegate_->OnAnimationStart(currentIndex, targetIndex, currentOffset, targetOffset,
                                          swipeVelocity);
  } else if (eventType == ArkUI_NodeEventType::NODE_SWIPER_EVENT_ON_ANIMATION_END) {
    int32_t currentIndex = nodeComponentEvent->data[0].i32;
    float_t currentOffset = nodeComponentEvent->data[1].f32;
    swiperNodeDelegate_->OnAnimationEnd(currentIndex, currentOffset);
  } else if (eventType == ArkUI_NodeEventType::NODE_SWIPER_EVENT_ON_CONTENT_DID_SCROLL) {
    int32_t currentIndex = nodeComponentEvent->data[0].i32;
    int32_t pageIndex = nodeComponentEvent->data[1].i32;
    float_t pageOffset = nodeComponentEvent->data[2].f32;
    swiperNodeDelegate_->OnContentDidScroll(currentIndex, pageIndex, pageOffset);
  }
}

void SwiperNode::SetShowIndicator(bool show) {
  ArkUI_NumberValue value = {.i32 = int32_t(show)};
  ArkUI_AttributeItem item = {&value, 1, nullptr, nullptr};
  MaybeThrow(
      NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_SWIPER_SHOW_INDICATOR, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::SWIPER_SHOW_INDICATOR);
}

void SwiperNode::SetSwiperIndex(int32_t index) {
  ArkUI_NumberValue value = {.i32 = int32_t(index)};
  ArkUI_AttributeItem item = {&value, 1, nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_SWIPER_INDEX, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::SWIPER_INDEX);
}

void SwiperNode::SetSwiperSwipeToIndex(int32_t index, int32_t animation) {
  ArkUI_NumberValue value[] = {{.i32 = int32_t(index)}, {.i32 = int32_t(animation)}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(
      NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_SWIPER_SWIPE_TO_INDEX, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::SWIPER_SWIPE_TO_INDEX);
}

void SwiperNode::SetSwiperVertical(int32_t direction) {
  ArkUI_NumberValue value = {.i32 = int32_t(direction)};
  ArkUI_AttributeItem item = {&value, 1, nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_SWIPER_VERTICAL, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::SWIPER_VERTICAL);
}

void SwiperNode::SetSwiperPrevMargin(float fValue) {
  ArkUI_NumberValue value = {.f32 = HRPixelUtils::DpToVp(fValue)};
  ArkUI_AttributeItem item = {&value, 1, nullptr, nullptr};
  MaybeThrow(
      NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_SWIPER_PREV_MARGIN, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::SWIPER_PREV_MARGIN);
}

void SwiperNode::SetSwiperNextMargin(float fValue) {
  ArkUI_NumberValue value = {.f32 = HRPixelUtils::DpToVp(fValue)};
  ArkUI_AttributeItem item = {&value, 1, nullptr, nullptr};
  MaybeThrow(
      NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_SWIPER_NEXT_MARGIN, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::SWIPER_NEXT_MARGIN);
}

void SwiperNode::SetSwiperLoop(int32_t enable) {
  ArkUI_NumberValue value = {.i32 = enable};
  ArkUI_AttributeItem item = {&value, 1, nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_SWIPER_LOOP, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::SWIPER_LOOP);
}

void SwiperNode::SetSwiperDisableSwipe(int32_t disable) {
  ArkUI_NumberValue value = {.i32 = disable};
  ArkUI_AttributeItem item = {&value, 1, nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_SWIPER_DISABLE_SWIPE, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::SWIPER_DISABLE_SWIPE);
}

void SwiperNode::SetLazyAdapter(ArkUI_NodeAdapterHandle adapterHandle) {
  ArkUI_AttributeItem item{nullptr, 0, nullptr, adapterHandle};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_SWIPER_NODE_ADAPTER, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::SWIPER_NODE_ADAPTER);
  hasAdapter_ = true;
}

void SwiperNode::ResetLazyAdapter() {
  if (hasAdapter_) {
    NativeNodeApi::GetInstance()->resetAttribute(nodeHandle_, NODE_SWIPER_NODE_ADAPTER);
    hasAdapter_ = false;
  }
}

void SwiperNode::ResetAllAttributes() {
  ArkUINode::ResetAllAttributes();
  if (!subAttributesFlagValue_) {
    return;
  }
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::SWIPER_SHOW_INDICATOR, NODE_SWIPER_SHOW_INDICATOR);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::SWIPER_INDEX, NODE_SWIPER_INDEX);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::SWIPER_SWIPE_TO_INDEX, NODE_SWIPER_SWIPE_TO_INDEX);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::SWIPER_VERTICAL, NODE_SWIPER_VERTICAL);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::SWIPER_PREV_MARGIN, NODE_SWIPER_PREV_MARGIN);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::SWIPER_NEXT_MARGIN, NODE_SWIPER_NEXT_MARGIN);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::SWIPER_LOOP, NODE_SWIPER_LOOP);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::SWIPER_DISABLE_SWIPE, NODE_SWIPER_DISABLE_SWIPE);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::SWIPER_NODE_ADAPTER, NODE_SWIPER_NODE_ADAPTER);
  subAttributesFlagValue_ = 0;
}

} // namespace native
} // namespace render
} // namespace hippy
