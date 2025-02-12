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

#include "renderer/arkui/row_node.h"
#include "renderer/components/base_view.h"
#include "renderer/arkui/stack_node.h"
#include "renderer/arkui/column_node.h"
#include "renderer/arkui/water_flow_node.h"
#include "renderer/arkui/refresh_node.h"
#include "renderer/arkui/scroll_node.h"
#include "renderer/arkui/list_node.h"
#include "renderer/arkui/water_flow_item_node.h"
#include "renderer/components/pull_footer_view.h"
#include "renderer/components/pull_header_view.h"
#include "renderer/components/div_view.h"

namespace hippy {
inline namespace render {
inline namespace native {

class WaterfallView : public BaseView ,public WaterFlowNodeDelegate ,public FlowItemNodeDelegate,public ListItemNodeDelegate,public ListNodeDelegate{
public:
  WaterfallView(std::shared_ptr<NativeRenderContext> &ctx);
  ~WaterfallView();

  //baseview override
  ArkUINode *GetLocalRootArkUINode() override;
  void CreateArkUINodeImpl() override;
  void DestroyArkUINodeImpl() override;
  void Init() override;
  bool SetPropImpl(const std::string &propKey, const HippyValue &propValue) override;
  void OnSetPropsEndImpl() override;
  void OnChildInsertedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) override;
  void OnChildRemovedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) override;
  void UpdateRenderViewFrameImpl(const HRRect &frame, const HRPadding &padding) override;
  void CallImpl(const std::string &method, const std::vector<HippyValue> params,
              std::function<void(const HippyValue &result)> callback) override;

  //WaterFlowNodeDelegate override
  void OnWaterFlowScrollIndex(int32_t firstIndex, int32_t lastIndex) override;
  void OnWaterFlowDidScroll(float_t offset, ArkUI_ScrollState state) override;
  void OnWaterFlowWillScroll(float_t offset, ArkUI_ScrollState state, int32_t source) override;

  //ListNodeDelegate override
  void OnScrollIndex(int32_t firstIndex, int32_t lastIndex, int32_t centerIndex) override;
  void OnScroll(float scrollOffsetX, float scrollOffsetY) override;
  void OnWillScroll(float offset, ArkUI_ScrollState state) override;
  void OnTouch(int32_t actionType, const HRPosition &screenPosition) override;
  void OnScrollStart() override;
  void OnScrollStop() override;
  void OnReachStart() override;
  void OnReachEnd() override;

  //ArkUINodeDelegate override
  void OnAppear() override;
  void OnDisappear() override;

  //FlowItemNodeDelegate
  void OnFlowItemVisibleAreaChange(int32_t index, bool isVisible, float currentRatio) override ;
  void OnFlowItemClick(int32_t index) override ;

  //ListItemNodeDelegate
  void OnItemVisibleAreaChange(int32_t index, bool isVisible, float currentRatio) override ;
  //pull head
  void OnHeadRefreshFinish(int32_t delay);
  void OnHeadRefresh();
private:

  void HandleOnChildrenUpdated();
  void SendOnReachedEvent();
  void UpdateFooterView();
  void CheckInitListReadyNotify();
  std::shared_ptr<StackNode> stackNode_;
  std::shared_ptr<ListNode> listNode_;
  std::shared_ptr<ColumnNode> colInnerNode_;
  std::shared_ptr<ListItemNode> flowListNode_;
  std::shared_ptr<WaterFlowNode> flowNode_;
  std::shared_ptr<ListItemNode> bannerListNode_;

  ArkUI_EdgeEffect edgeEffect_ = ArkUI_EdgeEffect::ARKUI_EDGE_EFFECT_SPRING;
  HRPadding padding_ = {0, 0, 0, 0};
  float_t scrollEventThrottle_ = 30.0;
  int32_t preloadItemNumber_ = 0;
  float_t interItemSpacing_ = 0;
  float_t columnSpacing_ = 0;
  std::string columnsTemplate_ = "1fr 1fr";

  uint64_t end_batch_callback_id_;
  std::shared_ptr<PullHeaderView> headerView = nullptr;
  std::shared_ptr<DivView> bannerView = nullptr;
  std::shared_ptr<PullFooterView> footerView = nullptr;
  float width_ = 0;
  float height_ = 0;
  bool scrollEnable_ = false;
  bool isDragging_;
  int32_t lastScrollIndex_ = 0;
  bool headerVisible = false;
  bool footerVisible = false;
  
  bool isInitListReadyNotified = false;
};

} // namespace native
} // namespace render
} // namespace hippy
