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
#include "renderer/arkui/water_flow_item_node.h"
#include "renderer/components/pull_footer_view.h"
#include "renderer/components/pull_header_view.h"
#include "renderer/components/div_view.h"
#include "renderer/components/waterfall_item_adapter.h"
#include "renderer/components/waterfall_pull_footer_view.h"
#include "renderer/components/waterfall_pull_header_view.h"

namespace hippy {
inline namespace render {
inline namespace native {

class WaterfallView : public BaseView, public WaterFlowNodeDelegate, public FlowItemNodeDelegate, public RefreshNodeDelegate {
public:
  WaterfallView(std::shared_ptr<NativeRenderContext> &ctx);
  ~WaterfallView();

  // BaseView override
  ArkUINode *GetLocalRootArkUINode() override;
  void CreateArkUINodeImpl() override;
  void DestroyArkUINodeImpl() override;
  void Init() override;
  bool SetPropImpl(const std::string &propKey, const HippyValue &propValue) override;
  void OnSetPropsEndImpl() override;

  void OnChildInserted(std::shared_ptr<BaseView> const &childView, int index) override;
  void OnChildRemoved(std::shared_ptr<BaseView> const &childView, int32_t index) override;
  void OnChildInsertedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) override;
  void OnChildRemovedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) override;
  void OnChildReusedImpl(std::shared_ptr<BaseView> const &childView, int index) override;
  void UpdateRenderViewFrameImpl(const HRRect &frame, const HRPadding &padding) override;

  void CallImpl(const std::string &method, const std::vector<HippyValue> params,
              std::function<void(const HippyValue &result)> callback) override;

  // WaterFlowNodeDelegate override
  void OnWaterFlowScrollIndex(int32_t firstIndex, int32_t lastIndex) override;
  void OnWaterFlowDidScroll(float_t offset, ArkUI_ScrollState state) override;
  void OnWaterFlowWillScroll(float_t offset, ArkUI_ScrollState state, int32_t source) override;
  void OnScroll(float scrollOffsetX, float scrollOffsetY) override;
  void OnScrollStart() override;
  void OnScrollStop() override;
  void OnReachStart() override;
  void OnReachEnd() override;

  // ArkUINodeDelegate
  void OnTouch(int32_t actionType, const HRPosition &screenPosition) override;

  // RefreshNodeDelegate
  void OnRefreshing() override;
  void OnStateChange(int32_t state) override;
  void OnOffsetChange(float_t offset) override;
  
  // pull head
  void OnHeadRefreshFinish(int32_t delay);
  void OnHeadRefresh();
private:

  void HandleOnChildrenUpdated();
  
  void EmitScrollEvent(const std::string &eventName);
  void CheckSendOnScrollEvent();
  void CheckBeginDrag();
  void CheckEndDrag();
  
  void SendOnReachedEvent();

  void CheckValidListSize();
  void CheckInitListReadyNotify();
  
  void UpdateSectionOption();
  
  static float GetItemMainSizeCallback(int32_t itemIndex, void* userData);
  
  constexpr static const char *PULL_HEADER_VIEW_TYPE = "PullHeaderView";
  constexpr static const char *PULL_FOOTER_VIEW_TYPE = "PullFooterView";
  
  std::shared_ptr<RefreshNode> refreshNode_;
  std::shared_ptr<WaterFlowNode> flowNode_;
  
  std::shared_ptr<WaterfallItemAdapter> adapter_;
  
  ArkUI_WaterFlowSectionOption *sectionOption_ = nullptr;

  float_t scrollEventThrottle_ = 30.0;
  int32_t preloadItemNumber_ = 0;
  float_t interItemSpacing_ = 0;
  float_t columnSpacing_ = 0;
  int32_t numberOfColumns_ = 2;
  bool toUpdateSection_ = false;
  
  bool onScrollEventEnable_ = false;
  int64_t lastScrollTime_ = 0;
  
  bool hasPullHeader_ = false;

  uint64_t end_batch_callback_id_;
  std::shared_ptr<WaterfallPullHeaderView> headerView_ = nullptr;
  std::shared_ptr<WaterfallPullFooterView> footerView_ = nullptr;
  std::shared_ptr<WaterfallItemView> headBannerView_ = nullptr;
  std::shared_ptr<WaterfallItemView> footBannerView_ = nullptr;
  
  float width_ = 0;
  float height_ = 0;
  bool isDragging_ = false;
  
  bool isListZeroSize = false;
  bool isInitListReadyNotified_ = false;
};

} // namespace native
} // namespace render
} // namespace hippy
