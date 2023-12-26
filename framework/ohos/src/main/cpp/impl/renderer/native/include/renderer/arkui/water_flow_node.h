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

class WaterFlowNodeDelegate {
public:
  virtual ~WaterFlowNodeDelegate() = default;
  virtual void OnWaterFlowScrollIndex(int32_t firstIndex, int32_t lastIndex) {}
  virtual void OnWaterFlowDidScroll(float_t offset, ArkUI_ScrollState state) {}
  virtual void OnWaterFlowWillScroll(float_t offset, ArkUI_ScrollState state, int32_t source) {} //TODO ArkUI_ScrollSource not define in current sdk
};

class WaterFlowNode : public ArkUINode {
protected:
  enum class AttributeFlag {
    SCROLL_EDGE_EFFECT = 0,
    WATER_FLOW_SCROLL_TO_INDEX,
    WATER_FLOW_COLUMN_TEMPLATE,
    WATER_FLOW_ROW_TEMPLATE,
    WATER_FLOW_COLUMN_GAP,
    WATER_FLOW_ROW_GAP,
    WATER_FLOW_CACHED_COUNT,
    WATER_FLOW_LAYOUT_DIRECTION,
    SCROLL_ENABLE_SCROLL_INTERACTION,
    SCROLL_NESTED_SCROLL,
    SCROLL_BAR_DISPLAY_MODE,
    WATER_FLOW_FOOTER,
  };
  WaterFlowNodeDelegate *waterFlowNodeDelegate_ = nullptr;
  int32_t itemIndex_ = -1;
public:
  WaterFlowNode();
  ~WaterFlowNode();

  HRPoint GetScrollOffset();
  void SetScrollEdgeEffect(ArkUI_EdgeEffect effect);
  void SetColumnGap(float_t gap); 
  void SetRowGap(float_t gap);
  void SetColumnsTemplate(std::string columnsTemplate);
  void SetRowTemplate(std::string rowsTemplate);
  void SetCachedCount(int32_t count);  
  void SetLayoutDirection(ArkUI_FlexDirection direction);
  void SetNodeDelegate(WaterFlowNodeDelegate *delegate);
  void SetItemIndex(int32_t index) { itemIndex_ = index; }
  void ScrollToIndex(int32_t index, bool animated,ArkUI_ScrollAlignment align = ArkUI_ScrollAlignment::ARKUI_SCROLL_ALIGNMENT_AUTO);    
  void OnNodeEvent(ArkUI_NodeEvent *event) override;    
    
  void SetScrollEnableInteraction(bool bEnable);  
  void SetNestedScroll(ArkUI_ScrollNestedMode forward, ArkUI_ScrollNestedMode backward);
  void SetScrollBarDisplayMode(ArkUI_ScrollBarDisplayMode mode);
  void SetFooter(ArkUI_NodeHandle footer);
  
  void ResetAllAttributes() override;
};

} // namespace native
} // namespace render
} // namespace hippy
