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

#include "renderer/arkui/custom_node.h"
#include "renderer/arkui/native_node_api.h"
#include "renderer/arkui/arkui_node_registry.h"

namespace hippy {
inline namespace render {
inline namespace native {

static constexpr ArkUI_NodeCustomEventType CUSTOM_NODE_EVENT_TYPES[] = {ARKUI_NODE_CUSTOM_EVENT_ON_FOREGROUND_DRAW};

CustomNode::CustomNode() : ArkUINode(NativeNodeApi::GetInstance()->createNode(ArkUI_NodeType::ARKUI_NODE_CUSTOM)) {
  ArkUINodeRegistry::GetInstance().RegisterCustomNode(this);
  for (auto eventType : CUSTOM_NODE_EVENT_TYPES) {
    MaybeThrow(NativeNodeApi::GetInstance()->registerNodeCustomEvent(nodeHandle_, eventType, 0, nullptr));
  }
}

CustomNode::~CustomNode() {
  if (nodeHandle_ != nullptr) {
    for (auto eventType : CUSTOM_NODE_EVENT_TYPES) {
      NativeNodeApi::GetInstance()->unregisterNodeCustomEvent(nodeHandle_, eventType);
    }
    ArkUINodeRegistry::GetInstance().UnregisterCustomNode(this);
  }
}

void CustomNode::SetCustomNodeDelegate(CustomNodeDelegate *customNodeDelegate) {
  customNodeDelegate_ = customNodeDelegate;
}

void CustomNode::OnNodeCustomEvent(ArkUI_NodeCustomEvent *event) {
  if (customNodeDelegate_ == nullptr) {
    return;
  }

  auto eventType = OH_ArkUI_NodeCustomEvent_GetEventType(event);
  if (eventType == ArkUI_NodeCustomEventType::ARKUI_NODE_CUSTOM_EVENT_ON_FOREGROUND_DRAW) {
    customNodeDelegate_->OnForegroundDraw(event);
  }
}

} // namespace native
} // namespace render
} // namespace hippy
