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

#pragma once

#include "renderer/arkui/arkui_node.h"
#include <cmath>
#include <cstdint>

namespace hippy {
inline namespace render {
inline namespace native {

class FlowItemNodeDelegate {
public:
  virtual ~FlowItemNodeDelegate() = default;
  virtual void OnFlowItemVisibleAreaChange(int32_t index, bool isVisible, float currentRatio) {}
  virtual void OnFlowItemClick(int32_t index){}
};

class WaterFlowItemNode : public ArkUINode {
protected:
  enum class AttributeFlag {
    WATER_FLOW_ITEM_CONSTRAINT_SIZE = 0,
  };
  FlowItemNodeDelegate* flowItemNodeDelegate_= nullptr;
  int32_t itemIndex_ = -1;
public:
  WaterFlowItemNode();
  ~WaterFlowItemNode();

  void OnNodeEvent(ArkUI_NodeEvent *event) override;  
  void SetNodeDelegate(FlowItemNodeDelegate* delegate);  
  void SetConstraintSize(float minWidth,float maxWidth,float minHeight,float maxHeight);
  void SetItemIndex(int32_t index) { itemIndex_ = index; }
  
  void ResetAllAttributes() override;
};

} // namespace native
} // namespace render
} // namespace hippy
