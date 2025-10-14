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

#include "renderer/components/list_view.h"
#include "renderer/components/list_item_view.h"
#include "renderer/components/refresh_wrapper_view.h"
#include "renderer/dom_node/hr_node_props.h"
#include "renderer/utils/hr_convert_utils.h"
#include "renderer/utils/hr_event_utils.h"
#include "renderer/utils/hr_pixel_utils.h"
#include "renderer/utils/hr_value_utils.h"

// #define LIST_VIEW_DEBUG_LOG

namespace hippy {
inline namespace render {
inline namespace native {

ListView::ListView(std::shared_ptr<NativeRenderContext> &ctx) : BaseView(ctx) {
  
}

ListView::~ListView() {
  ctx_->GetNativeRender().lock()->RemoveEndBatchCallback(ctx_->GetRootId(), end_batch_callback_id_);
  if (listNode_) {
    listNode_->SetArkUINodeDelegate(nullptr);
    listNode_->ResetLazyAdapter();
  }
  if (adapter_) {
    adapter_.reset();
  }
  if (!children_.empty()) {
    children_.clear();
  }
  if (stackNode_) {
    stackNode_->RemoveAllChildren();
  }
  if (headerView_) {
    headerView_->SetPullHeaderViewDelegate(nullptr);
    headerView_->DestroyArkUINode();
  }
}

void ListView::Init() {
  BaseView::Init();
  auto weak_view = weak_from_this();
  end_batch_callback_id_ = ctx_->GetNativeRender().lock()->AddEndBatchCallback(ctx_->GetRootId(), [weak_view]() {
    auto view = weak_view.lock();
    if (view) {
      auto listView = std::static_pointer_cast<ListView>(view);
      listView->HandleOnChildrenUpdated();
      listView->CheckInitOffset();
      listView->CheckInitListReadyNotify();
    }
  });
}

ArkUINode *ListView::GetLocalRootArkUINode() { return stackNode_.get(); }

void ListView::CreateArkUINodeImpl() {
  stackNode_ = std::make_shared<StackNode>();
  listNode_ = std::make_shared<ListNode>();
  
  listNode_->SetArkUINodeDelegate(this);
  listNode_->SetNodeDelegate(this);
  listNode_->SetSizePercent(HRSize(1.f, 1.f));
  listNode_->SetScrollBarDisplayMode(ARKUI_SCROLL_BAR_DISPLAY_MODE_OFF);
  listNode_->SetListCachedCount(4);
  listNode_->SetScrollNestedScroll(ARKUI_SCROLL_NESTED_MODE_SELF_FIRST, ARKUI_SCROLL_NESTED_MODE_SELF_FIRST);
  
  if (children_.size() > 0) {
    CreateArkUINodeAfterHeaderCheck();
  }
  
  CheckInitOffset();
}

void ListView::DestroyArkUINodeImpl() {
  hasCreateAfterHeaderCheck_ = false;
  
  listNode_->SetArkUINodeDelegate(nullptr);
  listNode_->SetNodeDelegate(nullptr);
  listNode_->ResetLazyAdapter();
  
  stackNode_ = nullptr;
  listNode_ = nullptr;

  if (adapter_) {
    adapter_.reset();
    adapter_ = nullptr;
  }
  
  if (refreshNode_) {
    refreshNode_->SetNodeDelegate(nullptr);
    refreshNode_ = nullptr;
  }
}

bool ListView::SetPropImpl(const std::string &propKey, const HippyValue &propValue) {
  if (propKey == HRNodeProps::PROP_PRIORITY) {
    auto mode = HRConvertUtils::ScrollNestedModeToArk(propValue);
    scrollForward_ = mode;
    scrollBackward_ = mode;
    toSetScrollNestedMode_ = true;
    return true;
  } else if (propKey == HRNodeProps::PROP_LEFT_PRIORITY) {
    scrollForward_ = HRConvertUtils::ScrollNestedModeToArk(propValue);
    toSetScrollNestedMode_ = true;
    return true;
  } else if (propKey == HRNodeProps::PROP_TOP_PRIORITY) {
    scrollForward_ = HRConvertUtils::ScrollNestedModeToArk(propValue);
    toSetScrollNestedMode_ = true;
    return true;
  } else if (propKey == HRNodeProps::PROP_RIGHT_PRIORITY) {
    scrollBackward_ = HRConvertUtils::ScrollNestedModeToArk(propValue);
    toSetScrollNestedMode_ = true;
    return true;
  } else if (propKey == HRNodeProps::PROP_BOTTOM_PRIORITY) {
    scrollBackward_ = HRConvertUtils::ScrollNestedModeToArk(propValue);
    toSetScrollNestedMode_ = true;
    return true;
  } else if (propKey == "horizontal") {
    auto value = HRValueUtils::GetBool(propValue, false);
    isVertical_ = !value;
    listNode_->SetListDirection(isVertical_);
    return true;
  } else if (propKey == "scrollEnabled") {
    auto value = HRValueUtils::GetBool(propValue, true);
    listNode_->SetEnableScrollInteraction(value);
    return true;
  } else if (propKey == "initialContentOffset") {
    initialOffset_ = HRValueUtils::GetFloat(propValue);
    return true;
  } else if (propKey == "itemViewCacheSize") {
    auto value = HRValueUtils::GetInt32(propValue);
    listNode_->SetListCachedCount(value);
    return true;
  } else if (propKey == "scrollEventThrottle") {
    scrollEventThrottle_ = HRValueUtils::GetInt32(propValue, 30);
    return true;
  } else if (propKey == "preloadItemNumber") {
    preloadItemNumber_ = HRValueUtils::GetInt32(propValue);
    return true;
  } else if (propKey == "exposureEventEnabled") {
    exposureEventEnabled_ = HRValueUtils::GetBool(propValue, false);
    return true;
  } else if (propKey == "rowShouldSticky") {
    rowShouldSticky_ = HRValueUtils::GetBool(propValue, false);
    return true;
  } else if (propKey == "bounces") {
    bool b = HRValueUtils::GetBool(propValue, true);
    listNode_->SetScrollEdgeEffect(b);
    return true;
  } else if (propKey == "scrollbegindrag") {
    scrollBeginDragEventEnable_ = HRValueUtils::GetBool(propValue, false);
    return true;
  } else if (propKey == "scrollenddrag") {
    scrollEndDragEventEnable_ = HRValueUtils::GetBool(propValue, false);
    return true;
  } else if (propKey == "momentumscrollbegin") {
    momentumScrollBeginEventEnable_ = HRValueUtils::GetBool(propValue, false);
    return true;
  } else if (propKey == "momentumscrollend") {
    momentumScrollEndEventEnable_ = HRValueUtils::GetBool(propValue, false);
    return true;
  } else if (propKey == "scroll") {
    onScrollEventEnable_ = HRValueUtils::GetBool(propValue, false);
    return true;
  }
  return BaseView::SetPropImpl(propKey, propValue);
}

void ListView::OnSetPropsEndImpl() {
  if (toSetScrollNestedMode_) {
    toSetScrollNestedMode_ = false;
    listNode_->SetScrollNestedScroll(scrollForward_, scrollBackward_);
  }
  BaseView::OnSetPropsEndImpl();
}

void ListView::CallImpl(const std::string &method, const std::vector<HippyValue> params,
                    std::function<void(const HippyValue &result)> callback) {
  FOOTSTONE_DLOG(INFO) << "ListView call: method " << method << ", params: " << params.size();
  if (method == "scrollToIndex") {
    auto xIndex = HRValueUtils::GetInt32(params[0]);
    auto yIndex = HRValueUtils::GetInt32(params[1]);
    auto animated = HRValueUtils::GetBool(params[2], false);
    ArkUI_ScrollAlignment align = ARKUI_SCROLL_ALIGNMENT_START;
    if (params.size() >= 4) {
      align = HRConvertUtils::ScrollAlignmentToArk(params[3]);
    }
    auto index = isVertical_ ? yIndex : xIndex;
    auto totalItemCount = ((int32_t)children_.size() - (hasPullHeader_ ? 1 : 0) - (footerView_ ? 1 : 0));
    if (index > totalItemCount - 1) {
      index = totalItemCount - 1;
    }
    listNode_->ScrollToIndex(index, animated, align);
  } else if (method == "scrollToContentOffset") {
    auto xOffset = HRValueUtils::GetFloat(params[0]);
    auto yOffset = HRValueUtils::GetFloat(params[1]);
    auto animated = HRValueUtils::GetBool(params[2], false);
    listNode_->ScrollTo(xOffset, yOffset, animated);
  } else if (method == "scrollToTop") {
    listNode_->ScrollToIndex(0, true, ARKUI_SCROLL_ALIGNMENT_START);
  } else {
    BaseView::CallImpl(method, params, callback);
  }
}

void ListView::OnChildInserted(std::shared_ptr<BaseView> const &childView, int index) {
  BaseView::OnChildInserted(childView, index);
  if (adapter_) {
    adapter_->InsertItem(index);
  }
}

void ListView::OnChildRemoved(std::shared_ptr<BaseView> const &childView, int32_t index) {
  BaseView::OnChildRemoved(childView, index);
  if (adapter_) {
    adapter_->RemoveItem(index);
  }
}

void ListView::OnChildInsertedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) {
  BaseView::OnChildInsertedImpl(childView, index);

#ifdef LIST_VIEW_DEBUG_LOG
  FOOTSTONE_DLOG(INFO) << "hippy ListView - on child inserted: " << index;
#endif
  
  auto itemView = std::static_pointer_cast<ListItemView>(childView);
  if (itemView->GetType() != "PullHeader") {
    auto node = (ListItemNode *)(itemView->GetLocalRootArkUINode());
    node->SetNodeDelegate(this);
    node->SetItemIndex(index);
  }
}

void ListView::OnChildRemovedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) {
  BaseView::OnChildRemovedImpl(childView, index);
}

void ListView::OnChildReusedImpl(std::shared_ptr<BaseView> const &childView, int index) {
  BaseView::OnChildReusedImpl(childView, index);
  
  auto itemView = std::static_pointer_cast<ListItemView>(childView);
  if (itemView->GetType() != "PullHeader") {
    auto node = (ListItemNode *)(itemView->GetLocalRootArkUINode());
    node->SetItemIndex(index);
  }
}

void ListView::UpdateRenderViewFrameImpl(const HRRect &frame, const HRPadding &padding) {
  auto parent = parent_.lock();
  if (parent && parent->GetViewType() == "RefreshWrapper") {
    GetLocalRootArkUINode()->SetSize(HRSize(frame.width, frame.height));
  } else {
    BaseView::UpdateRenderViewFrameImpl(frame, padding);
  }
  width_ = frame.width;
  height_ = frame.height;
  
  CheckValidListSize();
}

void ListView::ScrollToIndex(int32_t index, bool animated) {
  listNode_->ScrollToIndex(index, animated, ARKUI_SCROLL_ALIGNMENT_START);
}

void ListView::OnAppear() {
  
}

void ListView::OnDisappear() {
  
}

void ListView::OnScrollIndex(int32_t firstIndex, int32_t lastIndex, int32_t centerIndex) {
#ifdef LIST_VIEW_DEBUG_LOG
  FOOTSTONE_DLOG(INFO) << "hippy ListView - on scroll index, first: " << firstIndex << ", last: " << lastIndex;
#endif
  CheckSendReachEndEvent(lastIndex);
}

void ListView::OnWillScroll(float offset, ArkUI_ScrollState state) {
  if (offset > 0) {
    if (footerView_) {
      footerView_->Show(true);
    }
  }
  
  // 检测生效/失效吸顶并更新吸顶item显示位置
  CheckAndUpdateSticky();
}

void ListView::OnScroll(float scrollOffsetX, float scrollOffsetY) {
  CheckSendOnScrollEvent();
  CheckPullOnScroll();
}

void ListView::OnScrollStart() {
#ifdef LIST_VIEW_DEBUG_LOG
  FOOTSTONE_DLOG(INFO) << "hippy ListView on scroll start";
#endif
}

void ListView::OnScrollStop() {
#ifdef LIST_VIEW_DEBUG_LOG
  FOOTSTONE_DLOG(INFO) << "hippy ListView on scroll stop";
#endif
  if (momentumScrollEndEventEnable_) {
    EmitScrollEvent(HREventUtils::EVENT_SCROLLER_MOMENTUM_END);
  }
  if (onScrollEventEnable_) {
    EmitScrollEvent(HREventUtils::EVENT_SCROLLER_ON_SCROLL);
  }
}

void ListView::OnReachStart() {
  FOOTSTONE_DLOG(INFO) << "ListView onReachStart";
}

void ListView::OnReachEnd() {
  FOOTSTONE_DLOG(INFO) << "ListView onReachEnd";
  SendOnReachedEvent();
}

void ListView::OnTouch(int32_t actionType, const HRPosition &screenPosition) {
  BaseView::OnTouch(actionType, screenPosition);
  
  if (actionType == UI_TOUCH_EVENT_ACTION_DOWN || actionType == UI_TOUCH_EVENT_ACTION_MOVE) {
    CheckBeginDrag();
  } else if (actionType == UI_TOUCH_EVENT_ACTION_UP || actionType == UI_TOUCH_EVENT_ACTION_CANCEL) {
    CheckEndDrag();
  }
}

void ListView::OnItemVisibleAreaChange(int32_t index, bool isVisible, float currentRatio) {
#ifdef LIST_VIEW_DEBUG_LOG
  FOOTSTONE_DLOG(INFO) << "hippy ListView - on item visible area change, index: " << index
    << ", isVisible: " << isVisible << ", currentRatio: " << currentRatio
    << ", lastIndex: " << static_cast<int32_t>(children_.size()) - 1;
#endif
  
  CheckPullOnItemVisibleAreaChange(index, isVisible, currentRatio);
  if (exposureEventEnabled_) {
    if (index >= 0 && index < static_cast<int32_t>(children_.size())) {
      auto &view = children_[static_cast<uint32_t>(index)];
      if (view->GetViewType() == LIST_VIEW_ITEM_TYPE) {
        auto itemView = std::static_pointer_cast<ListItemView>(view);
        itemView->CheckExposureView(isVisible ? currentRatio : 0.0);
      }
    }
  }
}

void ListView::OnRefreshing() {
  refreshNode_->SetRefreshRefreshing(true);
  HREventUtils::SendComponentEvent(headerView_->GetCtx(), headerView_->GetTag(),
                                   HREventUtils::EVENT_PULL_HEADER_RELEASED, nullptr);
}

void ListView::OnStateChange(int32_t state) {
  
}

void ListView::OnOffsetChange(float_t offset) {
  auto refreshOffset = isVertical_ ? headerView_->GetHeight() : headerView_->GetWidth();
  headerView_->SetPosition({0, offset - refreshOffset});
  if (isDragging_) {
    HippyValueObjectType params;
    params["contentOffset"] = HRPixelUtils::VpToDp(offset);
    HREventUtils::SendComponentEvent(headerView_->GetCtx(), headerView_->GetTag(),
                                     HREventUtils::EVENT_PULL_HEADER_PULLING, std::make_shared<HippyValue>(params));
  }
}

void ListView::OnPullHeaderViewSizeUpdated(const HRSize &size) {
  if (size.height > 0 && size.width > 0) {
    pullHeaderWH_ = isVertical_ ? size.height : size.width;
    if (isVertical_) {
      headerView_->SetPosition({0, - pullHeaderWH_});
    } else {
      headerView_->SetPosition({- pullHeaderWH_, 0});
    }
    if (refreshNode_) {
      auto refreshOffset = pullHeaderWH_;
      refreshNode_->SetRefreshOffset(refreshOffset);
    }
  }
}

void ListView::OnHeadRefreshFinish(int32_t delay) {
  FOOTSTONE_DLOG(INFO) << __FUNCTION__ << " delay = " << delay;
  refreshNode_->SetRefreshRefreshing(false);
}

void ListView::OnHeadRefresh() {
  FOOTSTONE_DLOG(INFO) << __FUNCTION__;
}

void ListView::HandleOnChildrenUpdated() {
  auto childrenCount = children_.size();
  if (childrenCount > 0) {
    if (children_[0]->GetViewType() == PULL_HEADER_VIEW_TYPE) {
      auto newHeaderView = std::static_pointer_cast<PullHeaderView>(children_[0]);
      if (newHeaderView != headerView_) { // 不宜重复设置headerView的position，否则会闪
        headerView_ = newHeaderView;
        headerView_->SetPullHeaderViewDelegate(this);
        hasPullHeader_ = true;
        pullHeaderWH_ = isVertical_ ? headerView_->GetHeight() : headerView_->GetWidth();
        
        headerView_->CreateArkUINode(true, 0);
        if (isVertical_) {
          headerView_->SetPosition({0, - pullHeaderWH_});
        } else {
          headerView_->SetPosition({- pullHeaderWH_, 0});
        }
        
        if (refreshNode_) {
          refreshNode_->SetRefreshContent(headerView_->GetLocalRootArkUINode()->GetArkUINodeHandle());
          auto refreshOffset = pullHeaderWH_;
          refreshNode_->SetRefreshOffset(refreshOffset);
        }
      }
    }
    if (children_[childrenCount - 1]->GetViewType() == PULL_FOOTER_VIEW_TYPE) {
      footerView_ = std::static_pointer_cast<PullFooterView>(children_[childrenCount - 1]);
      footerView_->Show(false);
    }
    
    // Index must be recalculated.
    for (uint32_t i = 0; i < childrenCount; i++) {
      auto itemView = std::static_pointer_cast<ListItemView>(children_[i]);
      if (itemView->GetType() != "PullHeader") {
        auto node = (ListItemNode *)(itemView->GetLocalRootArkUINode());
        if (node) {
          node->SetItemIndex((int32_t)i);
        }
      }
    }
    
    if (GetLocalRootArkUINode()) {
      CreateArkUINodeAfterHeaderCheck();
    }
  }
  
  CheckStickyOnChildrenUpdated();
}

void ListView::CreateArkUINodeAfterHeaderCheck() {
  if (hasCreateAfterHeaderCheck_) {
    return;
  }
  hasCreateAfterHeaderCheck_ = true;
  
  if (hasPullHeader_) {
    refreshNode_ = std::make_shared<RefreshNode>();
    refreshNode_->SetNodeDelegate(this);
    refreshNode_->SetRefreshPullToRefresh(true);
    refreshNode_->SetRefreshRefreshing(false);
    refreshNode_->SetRefreshPullDownRatio(1);
    // 当List嵌套在lazyItem里时，可能更新children时List还没创建，进而headerView没有创建成功，所以这里需要重建
    if (!headerView_->GetLocalRootArkUINode()) {
      headerView_->CreateArkUINode(true, 0);
      if (isVertical_) {
        headerView_->SetPosition({0, - pullHeaderWH_});
      } else {
        headerView_->SetPosition({- pullHeaderWH_, 0});
      }
    }
    refreshNode_->SetRefreshContent(headerView_->GetLocalRootArkUINode()->GetArkUINodeHandle());
    auto refreshOffset = pullHeaderWH_;
    refreshNode_->SetRefreshOffset(refreshOffset);
    refreshNode_->AddChild(listNode_.get());
    stackNode_->InsertChild(refreshNode_.get(), 0);
  } else {
    stackNode_->InsertChild(listNode_.get(), 0);
  }
  if (!adapter_) {
    adapter_ = std::make_shared<ListItemAdapter>(children_, hasPullHeader_ ? 1 : 0);
    listNode_->SetLazyAdapter(adapter_->GetHandle());
  }
}

void ListView::EmitScrollEvent(const std::string &eventName) {
  if (!HREventUtils::CheckRegisteredEvent(ctx_, tag_, eventName)) {
    return;
  }

  HippyValueObjectType contentInset;
  contentInset["top"] = HippyValue(0);
  contentInset["bottom"] = HippyValue(0);
  contentInset["left"] = HippyValue(0);
  contentInset["right"] = HippyValue(0);

  auto offset = listNode_->GetScrollOffset();
  
  HippyValueObjectType contentOffset;
  contentOffset["x"] = HippyValue(HRPixelUtils::VpToDp(offset.x));
  contentOffset["y"] = HippyValue(HRPixelUtils::VpToDp(offset.y));
  
  float contentWidth = width_;
  float contentHeight = height_;
  if (children_.size() > 0) {
    auto view = std::static_pointer_cast<ListItemView>(children_[0]);
    contentWidth = view->GetWidth();
    contentHeight = view->GetHeight();
  }

  HippyValueObjectType contentSize;
  contentSize["width"] = HippyValue(HRPixelUtils::VpToDp(contentWidth));
  contentSize["height"] = HippyValue(HRPixelUtils::VpToDp(contentHeight));

  HippyValueObjectType layoutMeasurement;
  contentSize["width"] = HippyValue(HRPixelUtils::VpToDp(width_));
  contentSize["height"] = HippyValue(HRPixelUtils::VpToDp(height_));

  HippyValueObjectType params;
  params["contentInset"] = contentInset;
  params["contentOffset"] = contentOffset;
  params["contentSize"] = contentSize;
  params["layoutMeasurement"] = layoutMeasurement;
  
  HREventUtils::SendComponentEvent(ctx_, tag_, eventName, std::make_shared<HippyValue>(params));
}

void ListView::CheckSendOnScrollEvent() {
  if (onScrollEventEnable_) {
    auto currentTime = GetTimeMilliSeconds();
    if (currentTime - lastScrollTime_ >= scrollEventThrottle_) {
      lastScrollTime_ = currentTime;
      EmitScrollEvent(HREventUtils::EVENT_SCROLLER_ON_SCROLL);
    }
  }
}

void ListView::CheckSendReachEndEvent(int32_t lastIndex) {
  bool isThisTimeReachEnd = IsReachEnd(lastIndex);
  if (!isLastTimeReachEnd_ && isThisTimeReachEnd) {
    SendOnReachedEvent();
  }
  isLastTimeReachEnd_ = isThisTimeReachEnd;
}

bool ListView::IsReachEnd(int32_t lastIndex) {
  if (preloadItemNumber_ > 0 && lastIndex >= (static_cast<int32_t>(children_.size()) - preloadItemNumber_)) {
    return true;
  } else {
    return false;
  }
}

void ListView::SendOnReachedEvent() {
  HREventUtils::SendComponentEvent(ctx_, tag_, HREventUtils::EVENT_RECYCLER_END_REACHED, nullptr);
  HREventUtils::SendComponentEvent(ctx_, tag_, HREventUtils::EVENT_RECYCLER_LOAD_MORE, nullptr);
}

void ListView::CheckBeginDrag() {
  if (!isDragging_) {
    isDragging_ = true;
    if (scrollBeginDragEventEnable_) {
      EmitScrollEvent(HREventUtils::EVENT_SCROLLER_BEGIN_DRAG);
    }
    
    // 检测生效/失效吸顶并更新吸顶item显示位置
    CheckAndUpdateSticky();
  }
}

void ListView::CheckEndDrag() {
  if (isDragging_) {
    isDragging_ = false;
    if (scrollEndDragEventEnable_) {
      EmitScrollEvent(HREventUtils::EVENT_SCROLLER_END_DRAG);
    }
    if (momentumScrollBeginEventEnable_) {
      EmitScrollEvent(HREventUtils::EVENT_SCROLLER_MOMENTUM_BEGIN);
    }

    if (footerView_ && pullAction_ == ScrollAction::PullFooter) {
      if (footerViewFullVisible_) {
        HREventUtils::SendComponentEvent(footerView_->GetCtx(), footerView_->GetTag(),
                                         HREventUtils::EVENT_PULL_FOOTER_RELEASED, nullptr);
      } else {
        auto lastIndex = static_cast<int32_t>(children_.size()) - 1;
        listNode_->ScrollToIndex(lastIndex - 1 - (hasPullHeader_? 1 : 0), true, ARKUI_SCROLL_ALIGNMENT_END);
      }
      pullAction_ = ScrollAction::None;
    }
  }
}

void ListView::CheckPullOnItemVisibleAreaChange(int32_t index, bool isVisible, float currentRatio) {
  auto lastIndex = static_cast<int32_t>(children_.size()) - 1;
  if (footerView_ && index == lastIndex) {
    if (isVisible) {
      if (isDragging_) {
        pullAction_ = ScrollAction::PullFooter;
        if (currentRatio >= 1.0) {
          footerViewFullVisible_ = true;
        } else {
          footerViewFullVisible_ = false;
        }
      } else {
        listNode_->ScrollToIndex(lastIndex - 1 - (hasPullHeader_? 1 : 0), true, ARKUI_SCROLL_ALIGNMENT_END);
      }
    } else {
      footerViewFullVisible_ = false;
      if (currentRatio <= 0.0) {
        pullAction_ = ScrollAction::None;
      }
    }
  } else if (footerView_ && index == lastIndex - 1) {
    if (isVisible && currentRatio >= 1.0) {
      lastItemFullVisibleOffset_ = isVertical_ ? listNode_->GetScrollOffset().y : listNode_->GetScrollOffset().x;
    }
  }
}

void ListView::CheckPullOnScroll() {
  auto offset = listNode_->GetScrollOffset();
  auto xyOff = isVertical_ ? offset.y : offset.x;

  if (footerView_ && pullAction_ == ScrollAction::PullFooter) {
    HippyValueObjectType params;
    params[CONTENT_OFFSET] = HRPixelUtils::VpToDp(xyOff - lastItemFullVisibleOffset_);
    HREventUtils::SendComponentEvent(footerView_->GetCtx(), footerView_->GetTag(),
                                     HREventUtils::EVENT_PULL_FOOTER_PULLING, std::make_shared<HippyValue>(params));
  }
}

void ListView::CheckInitOffset() {
  if (listNode_) {
    if (initialOffset_ > 0) {
      float xy = initialOffset_;
      float xOff = isVertical_ ? 0 : xy;
      float yOff = isVertical_ ? xy : 0;
      listNode_->ScrollTo(xOff, yOff, true);
      initialOffset_ = 0;
    }
  }
}

void ListView::CheckValidListSize() {
  // 注意：这里不宜重建adapter，而是同一个adapter清理又恢复。
  // 之前重建adapter后，pager嵌套list的场景list adapter有概率不触发ON_ADD_NODE_TO_ADAPTER事件。
  if (width_ == 0 && height_ == 0) {
    isListZeroSize = true;
    for (uint32_t i = hasPullHeader_ ? 1 : 0; i < children_.size(); i++) {
      children_[i]->DestroyArkUINode();
    }
    if (adapter_) {
      adapter_->ClearAll();
    }
  } else {
    if (isListZeroSize) {
      isListZeroSize = false;
      if (adapter_) {
        adapter_->RestoreAll();
      }
    }
  }
}

void ListView::CheckInitListReadyNotify() {
  if (!isInitListReadyNotified) {
    HREventUtils::SendComponentEvent(ctx_, tag_, HREventUtils::EVENT_RECYCLER_LIST_READY, nullptr);
    isInitListReadyNotified = true;
  }
}

void ListView::CheckStickyOnChildrenUpdated() {
  if (!rowShouldSticky_) {
    return;
  }
  // 找出所有吸顶item
  stickyArray_.clear();
  auto childrenCount = children_.size();
  for (uint32_t i = 0; i < childrenCount; i++) {
    auto &view = children_[i];
    if (view->GetViewType() == LIST_VIEW_ITEM_TYPE) {
      auto itemView = std::static_pointer_cast<ListItemView>(view);
      if (itemView->IsSticky()) {
        stickyArray_.push_back(static_cast<int32_t>(i));
      }
    }
  }
  
  // 检测生效/失效吸顶并设置吸顶item显示位置，目前只支持1个item吸顶显示
  if (stickyingIndex_ != INVALID_STICKY_INDEX) {
    StopSticky();
  }
  if (stickyArray_.size() > 0) {
    stickyIndex_ = stickyArray_[0];
    
    stickyItemOffsetXY_ = 0;
    int beginIndex = hasPullHeader_ ? 1 : 0;
    for (int i = beginIndex; i < stickyIndex_; i++) {
      auto iItemView = std::static_pointer_cast<ListItemView>(children_[(size_t)i]);
      stickyItemOffsetXY_ += (isVertical_ ? iItemView->GetHeight() : iItemView->GetWidth());
    }
    
    CheckAndUpdateSticky();
  }
}

bool ListView::ShouldSticky() {
  if (!rowShouldSticky_) {
    return false;
  }
  if (stickyIndex_ == INVALID_STICKY_INDEX) {
    return false;
  }
  auto totalOffset = listNode_->GetScrollOffset();
  if (isVertical_) {
    if (totalOffset.y > stickyItemOffsetXY_ + 0.5) {
      return true;
    }
  } else {
    if (totalOffset.x > stickyItemOffsetXY_ + 0.5) {
      return true;
    }
  }
  return false;
}

bool ListView::CalculateStickyItemPosition(HRPosition *resultPosition) {
  if (!resultPosition) {
    return false;
  }
  auto totalOffset = listNode_->GetScrollOffset();
  float x = 0;
  float y = 0;
  if (isVertical_) {
    x = 0;
    y = totalOffset.y > stickyItemOffsetXY_ ? 0 : stickyItemOffsetXY_ - totalOffset.y;
  } else {
    x = totalOffset.x > stickyItemOffsetXY_ ? 0 : stickyItemOffsetXY_ - totalOffset.x;
    y = 0;
  }
  resultPosition->x = x;
  resultPosition->y = y;
  return true;
}

void ListView::StopSticky() {
  stackNode_->RemoveChild(stickyNode_.get());
  stickyNode_ = nullptr;
  auto itemView = std::static_pointer_cast<ListItemView>(children_[(size_t)stickyingIndex_]);
  itemView->EndSticky();
  stickyingIndex_ = INVALID_STICKY_INDEX;
}

void ListView::CheckAndUpdateSticky() {
  bool isSticky = ShouldSticky();
  if (isSticky && stickyNode_ == nullptr) {
    auto itemView = std::static_pointer_cast<ListItemView>(children_[(size_t)stickyIndex_]);
    itemView->StartSticky();
    stickyNode_ = itemView->GetStickyRootArkUINode();
    stackNode_->AddChild(stickyNode_.get());
    stickyingIndex_ = stickyIndex_;
  }
  if (!isSticky && stickyNode_) {
    StopSticky();
  }
  if (stickyNode_) {
    HRPosition pos(0, 0);
    CalculateStickyItemPosition(&pos);
    stickyNode_->SetPosition(pos);
  }
}

} // namespace native
} // namespace render
} // namespace hippy
