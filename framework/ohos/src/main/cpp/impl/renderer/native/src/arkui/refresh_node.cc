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

#include "renderer/arkui/refresh_node.h"
#include "renderer/arkui/native_node_api.h"

namespace hippy {
inline namespace render {
inline namespace native {

static constexpr ArkUI_NodeEventType REFRESH_NODE_EVENT_TYPES[] = {
  NODE_REFRESH_STATE_CHANGE,
  NODE_REFRESH_ON_REFRESH,
  NODE_REFRESH_ON_OFFSET_CHANGE,
};

RefreshNode::RefreshNode()
    : ArkUINode(NativeNodeApi::GetInstance()->createNode(ArkUI_NodeType::ARKUI_NODE_REFRESH)) {
  for (auto eventType : REFRESH_NODE_EVENT_TYPES) {
    MaybeThrow(NativeNodeApi::GetInstance()->registerNodeEvent(nodeHandle_, eventType, 0, nullptr));
  } 
}

RefreshNode::~RefreshNode() {
  for (auto eventType : REFRESH_NODE_EVENT_TYPES) {
    NativeNodeApi::GetInstance()->unregisterNodeEvent(nodeHandle_, eventType);
  }
}

void RefreshNode::SetRefreshRefreshing(bool flag) {
  ArkUI_NumberValue value[] = {{.i32 = flag}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_REFRESH_REFRESHING, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::REFRESH_REFRESHING);
}

void RefreshNode::SetRefreshContent(ArkUI_NodeHandle nodeHandle) {
  ArkUI_AttributeItem item = {nullptr, 0, nullptr, nodeHandle};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_REFRESH_CONTENT, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::REFRESH_CONTENT);
}

void RefreshNode::SetRefreshPullDownRatio(float ratio) {
  ArkUI_NumberValue value[] = {{.f32 = ratio}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_REFRESH_PULL_DOWN_RATIO, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::REFRESH_PULL_DOWN_RATIO);
}

void RefreshNode::SetRefreshOffset(float offset) {
  ArkUI_NumberValue value[] = {{.f32 = offset}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_REFRESH_OFFSET, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::REFRESH_OFFSET);
}

void RefreshNode::SetRefreshPullToRefresh(bool flag) {
  ArkUI_NumberValue value[] = {{.i32 = flag}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_REFRESH_PULL_TO_REFRESH, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::REFRESH_PULL_TO_REFRESH);
}

void RefreshNode::ResetRefreshContent() {
  MaybeThrow(NativeNodeApi::GetInstance()->resetAttribute(nodeHandle_, NODE_REFRESH_CONTENT));
}

void RefreshNode::ResetAllAttributes() {
  ArkUINode::ResetAllAttributes();
  if (!subAttributesFlagValue_) {
    return;
  }
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::REFRESH_REFRESHING, NODE_REFRESH_REFRESHING);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::REFRESH_CONTENT, NODE_REFRESH_CONTENT);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::REFRESH_PULL_DOWN_RATIO, NODE_REFRESH_PULL_DOWN_RATIO);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::REFRESH_OFFSET, NODE_REFRESH_OFFSET);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::REFRESH_PULL_TO_REFRESH, NODE_REFRESH_PULL_TO_REFRESH);
  subAttributesFlagValue_ = 0;
}

void RefreshNode::SetNodeDelegate(RefreshNodeDelegate *refreshNodeDelegate) {
  refreshNodeDelegate_ = refreshNodeDelegate;
}

void RefreshNode::OnNodeEvent(ArkUI_NodeEvent *event) {
  if (!refreshNodeDelegate_) {
    return;
  }
  auto eventType = OH_ArkUI_NodeEvent_GetEventType(event);
  auto nodeComponentEvent = OH_ArkUI_NodeEvent_GetNodeComponentEvent(event);
  if (eventType == ArkUI_NodeEventType::NODE_REFRESH_STATE_CHANGE) {
    int32_t state = nodeComponentEvent->data[0].i32;    
    refreshNodeDelegate_->OnStateChange(state);
  } else if(eventType == ArkUI_NodeEventType::NODE_REFRESH_ON_REFRESH){
    refreshNodeDelegate_->OnRefreshing();    
  } else if(eventType == ArkUI_NodeEventType::NODE_REFRESH_ON_OFFSET_CHANGE){
    float offset = nodeComponentEvent->data[0].f32;    
    refreshNodeDelegate_->OnOffsetChange(offset);
  }
}

} // namespace native
} // namespace render
} // namespace hippy
