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

#include "renderer/arkui/list_item_node.h"
#include "renderer/arkui/native_node_api.h"

namespace hippy {
inline namespace render {
inline namespace native {

static constexpr ArkUI_NodeEventType LIST_ITEM_NODE_EVENT_TYPES[] = {
  NODE_EVENT_ON_VISIBLE_AREA_CHANGE
};

ListItemNode::ListItemNode() : ArkUINode(NativeNodeApi::GetInstance()->createNode(ArkUI_NodeType::ARKUI_NODE_LIST_ITEM)) {
  for (auto eventType : LIST_ITEM_NODE_EVENT_TYPES) {
    ArkUI_NumberValue value[] = {{.f32 = 0.f},
                                 {.f32 = 1.f}};
    ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
    MaybeThrow(NativeNodeApi::GetInstance()->registerNodeEvent(nodeHandle_, eventType, 0, &item));
  }
}

ListItemNode::~ListItemNode() {
  for (auto eventType : LIST_ITEM_NODE_EVENT_TYPES) {
    NativeNodeApi::GetInstance()->unregisterNodeEvent(nodeHandle_, eventType);
  }
}

void ListItemNode::OnNodeEvent(ArkUI_NodeEvent *event) {
  ArkUINode::OnNodeEvent(event);
  
  if (listItemNodeDelegate_ == nullptr) {
    return;
  }

  auto eventType = OH_ArkUI_NodeEvent_GetEventType(event);
  auto nodeComponentEvent = OH_ArkUI_NodeEvent_GetNodeComponentEvent(event);
  if (eventType == ArkUI_NodeEventType::NODE_EVENT_ON_VISIBLE_AREA_CHANGE) {
    bool isVisible = nodeComponentEvent->data[0].i32;
    float currentRatio = nodeComponentEvent->data[1].f32;
    listItemNodeDelegate_->OnItemVisibleAreaChange(itemIndex_, isVisible, currentRatio);
  }
}

void ListItemNode::SetNodeDelegate(ListItemNodeDelegate *nodeDelegate) { listItemNodeDelegate_ = nodeDelegate; }

} // namespace native
} // namespace render
} // namespace hippy
