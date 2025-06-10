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
  virtual void OnWaterFlowWillScroll(float_t offset, ArkUI_ScrollState state, int32_t source) {}
  virtual void OnScroll(float scrollOffsetX, float scrollOffsetY) {}
  virtual void OnScrollStart() {}
  virtual void OnScrollStop() {}
  virtual void OnReachStart() {}
  virtual void OnReachEnd() {}
};

class WaterFlowNode : public ArkUINode {
protected:
  enum class AttributeFlag {
    SCROLL_EDGE_EFFECT = 0,
    SCROLL_OFFSET,
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
    WATER_FLOW_SECTION_OPTION,
    WATER_FLOW_NODE_ADAPTER,
  };
  WaterFlowNodeDelegate *waterFlowNodeDelegate_ = nullptr;
public:
  WaterFlowNode();
  ~WaterFlowNode();

  HRPoint GetScrollOffset();
  void SetScrollEdgeEffect(ArkUI_EdgeEffect effect);
  void SetColumnGap(float_t gap);
  void SetRowGap(float_t gap);
  void SetColumnsTemplate(const std::string &columnsTemplate);
  void SetRowTemplate(const std::string &rowsTemplate);
  void SetCachedCount(int32_t count);  
  void SetLayoutDirection(ArkUI_FlexDirection direction);
  void ScrollTo(float offsetX, float offsetY, bool animated);
  void ScrollToIndex(int32_t index, bool animated, ArkUI_ScrollAlignment align);

  void SetEnableScrollInteraction(bool bEnable);
  void SetScrollNestedScroll(ArkUI_ScrollNestedMode forward, ArkUI_ScrollNestedMode backward);
  void SetScrollBarDisplayMode(ArkUI_ScrollBarDisplayMode mode);
  void SetFooter(ArkUI_NodeHandle footer);
  void SetSectionOption(ArkUI_WaterFlowSectionOption *option);
  void SetLazyAdapter(ArkUI_NodeAdapterHandle adapterHandle);
  
  void ResetLazyAdapter();
  void ResetAllAttributes() override;

  void OnNodeEvent(ArkUI_NodeEvent *event) override;
  void SetNodeDelegate(WaterFlowNodeDelegate *delegate);

private:
  bool hasAdapter_ = false;
};

} // namespace native
} // namespace render
} // namespace hippy
