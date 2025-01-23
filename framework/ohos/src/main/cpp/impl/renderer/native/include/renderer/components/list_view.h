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

#include <vector>
#include "renderer/components/base_view.h"
#include "renderer/arkui/stack_node.h"
#include "renderer/arkui/list_node.h"
#include "renderer/components/list_item_adapter.h"
#include "renderer/components/pull_footer_view.h"
#include "renderer/components/pull_header_view.h"

namespace hippy {
inline namespace render {
inline namespace native {

const int32_t INVALID_STICKY_INDEX = -1;

enum class ScrollAction : int32_t {
  None,
  PullHeader,
  ReleaseHeader,
  PullFooter,
  ReleaseFooter
};

class ListView : public BaseView, public ListNodeDelegate, public ListItemNodeDelegate {
public:
  ListView(std::shared_ptr<NativeRenderContext> &ctx);
  ~ListView();

  void Init() override;

  StackNode *GetLocalRootArkUINode() override;
  void CreateArkUINodeImpl() override;
  void DestroyArkUINodeImpl() override;
  bool SetPropImpl(const std::string &propKey, const HippyValue &propValue) override;
  void CallImpl(const std::string &method, const std::vector<HippyValue> params,
                    std::function<void(const HippyValue &result)> callback) override;

  void OnChildInserted(std::shared_ptr<BaseView> const &childView, int index) override;
  void OnChildRemoved(std::shared_ptr<BaseView> const &childView, int32_t index) override;
  void OnChildInsertedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) override;
  void OnChildRemovedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) override;
  void OnChildReusedImpl(std::shared_ptr<BaseView> const &childView, int index) override;
  void UpdateRenderViewFrameImpl(const HRRect &frame, const HRPadding &padding) override;

  void ScrollToIndex(int32_t index, bool animated);
  void SetScrollNestedMode(ArkUI_ScrollNestedMode scrollForward, ArkUI_ScrollNestedMode scrollBackward);

  void OnAppear() override;
  void OnDisappear() override;
  void OnScrollIndex(int32_t firstIndex, int32_t lastIndex, int32_t centerIndex) override;
  void OnWillScroll(float offset, ArkUI_ScrollState state) override;
  void OnScroll(float scrollOffsetX, float scrollOffsetY) override;
  void OnScrollStart() override;
  void OnScrollStop() override;
  void OnReachStart() override;
  void OnReachEnd() override;
  void OnTouch(int32_t actionType, const HRPosition &screenPosition) override;

  void OnItemVisibleAreaChange(int32_t index, bool isVisible, float currentRatio) override;

private:
  void HandleOnChildrenUpdated();

  void EmitScrollEvent(const std::string &eventName);
  void CheckSendOnScrollEvent();
  void CheckSendReachEndEvent(int32_t lastIndex);
  bool IsReachEnd(int32_t lastIndex);
  void SendOnReachedEvent();
  void CheckBeginDrag();
  void CheckEndDrag();
  void CheckPullOnItemVisibleAreaChange(int32_t index, bool isVisible, float currentRatio);
  void CheckPullOnScroll();
  void CheckStickyOnItemVisibleAreaChange(int32_t index, bool isVisible, float currentRatio);
  void CheckInitOffset();
  void CheckValidListSize();
  void CheckInitListReadyNotify();

  constexpr static const char *CONTENT_OFFSET = "contentOffset";
  constexpr static const char *PULL_HEADER_VIEW_TYPE = "PullHeaderView";
  constexpr static const char *PULL_FOOTER_VIEW_TYPE = "PullFooterView";
  constexpr static const char *LIST_VIEW_ITEM_TYPE = "ListViewItem";

  std::shared_ptr<StackNode> stackNode_;
  std::shared_ptr<ListNode> listNode_;

  std::shared_ptr<ListItemAdapter> adapter_;

  float width_ = 0;
  float height_ = 0;

  bool isVertical_ = true;
  float initialOffset_ = 0;
  int32_t scrollEventThrottle_ = 30;
  int32_t preloadItemNumber_ = 0;
  bool exposureEventEnabled_ = false;
  bool rowShouldSticky_ = false;

  bool scrollBeginDragEventEnable_ = false;
  bool scrollEndDragEventEnable_ = false;
  bool momentumScrollBeginEventEnable_ = false;
  bool momentumScrollEndEventEnable_ = false;
  bool onScrollEventEnable_ = false;

  bool hasPullHeader_ = false;
  float pullHeaderHeight_ = 0;

  ScrollAction pullAction_ = ScrollAction::None;
  std::shared_ptr<PullHeaderView> headerView_ = nullptr;
  std::shared_ptr<PullFooterView> footerView_ = nullptr;
  int64_t lastScrollTime_ = 0;
  bool isLastTimeReachEnd_ = false;

  int32_t stickyIndex_ = INVALID_STICKY_INDEX;
  std::vector<int32_t> stickyArray_;
  std::vector<int32_t> stickyStack_;

  bool isDragging_ = false;
  float lastMoveY_ = 0;

  bool headerViewFullVisible_ = false;
  bool footerViewFullVisible_ = false;
  float lastItemFullVisibleYOffset_ = 0;

  uint64_t end_batch_callback_id_ = 0;
  
  bool isListZeroSize = false;
  
  bool isInitListReadyNotified = false;
};

} // namespace native
} // namespace render
} // namespace hippy
