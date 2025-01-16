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

#include "renderer/arkui/stack_node.h"
#include "renderer/arkui/native_node_api.h"

namespace hippy {
inline namespace render {
inline namespace native {

StackNode::StackNode() 
    : ArkUINode(NativeNodeApi::GetInstance()->createNode(ArkUI_NodeType::ARKUI_NODE_STACK)) {
  SetDefaultAttributes();
}

StackNode::~StackNode() {}

void StackNode::SetDefaultAttributes() {
  SetStackAlignContent(ARKUI_ALIGNMENT_TOP_START);
  subAttributesFlagValue_ = 0;
}

StackNode &StackNode::SetStackAlignContent(ArkUI_Alignment align) {
  ArkUI_NumberValue value[] = {{.i32 = align}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_STACK_ALIGN_CONTENT, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::STACK_ALIGN_CONTENT);
  return *this;
}

void StackNode::ResetAllAttributes() {
  ArkUINode::ResetAllAttributes();
  if (!subAttributesFlagValue_) {
    return;
  }
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::STACK_ALIGN_CONTENT, NODE_STACK_ALIGN_CONTENT);
  SetDefaultAttributes();
}

} // namespace native
} // namespace render
} // namespace hippy
