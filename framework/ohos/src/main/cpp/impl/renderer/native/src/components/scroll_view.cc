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

#include "renderer/components/scroll_view.h"
#include "renderer/utils/hr_event_utils.h"
#include "renderer/utils/hr_pixel_utils.h"
#include "renderer/utils/hr_value_utils.h"

namespace hippy {
inline namespace render {
inline namespace native {

ScrollView::ScrollView(std::shared_ptr<NativeRenderContext> &ctx) : BaseView(ctx) {
}

ScrollView::~ScrollView() {
  if (!children_.empty()) {
    if (stackNode_) {
      for (const auto &child : children_) {
        stackNode_->RemoveChild(child->GetLocalRootArkUINode());
      }
    }
    children_.clear();
  }
  if (scrollNode_) {
    scrollNode_->RemoveChild(stackNode_.get());
  }
}

ScrollNode *ScrollView::GetLocalRootArkUINode() { return scrollNode_.get(); }

void ScrollView::CreateArkUINodeImpl() {
  scrollNode_ = std::make_shared<ScrollNode>();
  stackNode_ = std::make_shared<StackNode>();

  scrollNode_->SetScrollEnabled(true);
  scrollNode_->SetHorizontal(false);
  scrollNode_->SetShowScrollIndicator(false);
  isDragging_ = false;
  lastScrollOffset_ = 0;
  lastScrollTime_ = 0;
  scrollNode_->SetAlignment(ARKUI_ALIGNMENT_TOP_START);
  scrollNode_->SetNodeDelegate(this);
  scrollNode_->AddChild(stackNode_.get());
}

void ScrollView::DestroyArkUINodeImpl() {
  scrollNode_->SetNodeDelegate(nullptr);
  scrollNode_ = nullptr;
  stackNode_ = nullptr;
}

bool ScrollView::SetPropImpl(const std::string &propKey, const HippyValue &propValue) {
  if (propKey == "showScrollIndicator") {
    auto value = HRValueUtils::GetBool(propValue, false);
    GetLocalRootArkUINode()->SetShowScrollIndicator(value);
    return true;
  } else if (propKey == "pagingEnabled") {
    auto value = HRValueUtils::GetBool(propValue, false);
    GetLocalRootArkUINode()->SetPagingEnabled(value);
    return true;
  } else if (propKey == "flingEnabled") {
    auto value = HRValueUtils::GetBool(propValue, false);
    GetLocalRootArkUINode()->SetFlingEnabled(value);
    return true;
  } else if (propKey == "contentOffset4Reuse") {
    HippyValueObjectType m;
    if (propValue.ToObject(m)) {
      auto x = HRValueUtils::GetFloat(m["x"]);
      auto y = HRValueUtils::GetFloat(m["y"]);
      HRPoint point = {x, y};
      GetLocalRootArkUINode()->SetContentOffset4Reuse(point);
      return true;
    } else {
      return false;
    }
  } else if (propKey == "scrollEnabled") {
    auto value = HRValueUtils::GetBool(propValue, false);
    GetLocalRootArkUINode()->SetScrollEnabled(value);
    return true;
  } else if (propKey == "horizontal") {
    auto value = HRValueUtils::GetBool(propValue, false);
    GetLocalRootArkUINode()->SetHorizontal(value);
    return true;
  } else if (propKey == "initialContentOffset") {
    auto value = HRValueUtils::GetFloat(propValue, 0);
    GetLocalRootArkUINode()->SetInitialContentOffset(value);
    return true;
  } else if (propKey == "scrollEventThrottle") {
    auto value = HRValueUtils::GetFloat(propValue, 30);
    GetLocalRootArkUINode()->SetScrollEventThrottle(value);
    return true;
  } else if (propKey == "scrollMinOffset") {
    auto value = HRValueUtils::GetFloat(propValue, 5);
    GetLocalRootArkUINode()->SetScrollMinOffset(value);
    return true;
  }
  return BaseView::SetPropImpl(propKey, propValue);
}

void ScrollView::OnChildInsertedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) {
  BaseView::OnChildInsertedImpl(childView, index);
  stackNode_->InsertChild(childView->GetLocalRootArkUINode(), index);
}

void ScrollView::OnChildRemovedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) {
  BaseView::OnChildRemovedImpl(childView, index);
  stackNode_->RemoveChild(childView->GetLocalRootArkUINode());
}

void ScrollView::OnTouch(int32_t actionType, const HRPosition &screenPosition) {
  BaseView::OnTouch(actionType, screenPosition);

  if (actionType == UI_TOUCH_EVENT_ACTION_DOWN || actionType == UI_TOUCH_EVENT_ACTION_MOVE) {
    CheckFireBeginDragEvent();
  } else if (actionType == UI_TOUCH_EVENT_ACTION_UP || actionType == UI_TOUCH_EVENT_ACTION_CANCEL) {
    CheckFireEndDragEvent();
  }
}

void ScrollView::CheckFireBeginDragEvent() {
  if (!isDragging_) {
    isDragging_ = true;
    std::string eventName = HREventUtils::EVENT_SCROLLER_BEGIN_DRAG;
    this->EmitScrollEvent(eventName);
  }
}

void ScrollView::CheckFireEndDragEvent() {
  if (isDragging_) {
    isDragging_ = false;
    std::string endDragEventName = HREventUtils::EVENT_SCROLLER_END_DRAG;
    std::string momentumBeginEventName = HREventUtils::EVENT_SCROLLER_MOMENTUM_BEGIN;
    this->EmitScrollEvent(endDragEventName);
    this->EmitScrollEvent(momentumBeginEventName);
  }
}

void ScrollView::EmitScrollEvent(std::string &eventName) {
  if (!CheckRegisteredEvent(eventName)) {
    return;
  }
  HippyValueObjectType contentInsetObj;
  contentInsetObj.insert_or_assign("top", 0);
  contentInsetObj.insert_or_assign("bottom", 0);
  contentInsetObj.insert_or_assign("left", 0);
  contentInsetObj.insert_or_assign("right", 0);

  HippyValueObjectType contentOffsetObj;
  HRPoint contentOffset = GetLocalRootArkUINode()->GetScrollContentOffset();
  contentOffsetObj.insert_or_assign("x", HRPixelUtils::VpToDp(contentOffset.x));
  contentOffsetObj.insert_or_assign("y", HRPixelUtils::VpToDp(contentOffset.y));

  HippyValueObjectType contentSizeObj;
  HRSize layoutSize = scrollNode_->GetSize();
  HRSize size = children_.size() > 0 ? children_[0]->GetLocalRootArkUINode()->GetSize() : layoutSize;
  contentSizeObj.insert_or_assign("width", HRPixelUtils::VpToDp(size.width));
  contentSizeObj.insert_or_assign("height", HRPixelUtils::VpToDp(size.height));

  HippyValueObjectType layoutMeasurementObj;
  layoutMeasurementObj.insert_or_assign("width", HRPixelUtils::VpToDp(layoutSize.width));
  layoutMeasurementObj.insert_or_assign("height", HRPixelUtils::VpToDp(layoutSize.height));

  HippyValueObjectType paramsObj;
  paramsObj.insert_or_assign("contentInset", contentInsetObj);
  paramsObj.insert_or_assign("contentOffset", contentOffsetObj);
  paramsObj.insert_or_assign("contentSize", contentSizeObj);
  paramsObj.insert_or_assign("layoutMeasurement", layoutMeasurementObj);

  std::shared_ptr<HippyValue> params = std::make_shared<HippyValue>(paramsObj);
  HREventUtils::SendComponentEvent(ctx_, tag_, eventName, params);
}

void ScrollView::OnScroll(float xOffset, float yOffset) {
  int64_t now = GetTimeMilliSeconds();
  float minOffset = scrollNode_->GetScrollMinOffset();
  std::string scrollEventName = HREventUtils::EVENT_SCROLLER_ON_SCROLL;
  if (scrollNode_->GetAxis() == ARKUI_SCROLL_DIRECTION_VERTICAL) {
    if (minOffset > 0 && fabsf(yOffset - lastScrollOffset_) > minOffset) {
      lastScrollOffset_ = yOffset;
      EmitScrollEvent(scrollEventName);
      return;
    }
  } else {
    if (minOffset > 0 && fabsf(xOffset - lastScrollOffset_) > minOffset) {
      lastScrollOffset_ = xOffset;
      EmitScrollEvent(scrollEventName);
      return;
    }
  }
  float gap = static_cast<float>(now - lastScrollTime_);
  if (minOffset <= 0 && gap > scrollNode_->GetScrollEventThrottle()) {
    lastScrollTime_ = now;
    EmitScrollEvent(scrollEventName);
  }
}

void ScrollView::OnScrollStart() {}

void ScrollView::OnScrollStop() {
  lastScrollTime_ = 0;
  lastScrollOffset_ = 0;
  std::string eventName = std::string(HREventUtils::EVENT_SCROLLER_MOMENTUM_END);
  this->EmitScrollEvent(eventName);
}

void ScrollView::CallImpl(const std::string &method, const std::vector<HippyValue> params,
                      std::function<void(const HippyValue &)> callback) {
  FOOTSTONE_DLOG(INFO) << "ScrollView call: method " << method << ", params: " << params.size();
  if (method == "scrollTo") {
    auto xOffset = params.size() >= 1 ? HRValueUtils::GetFloat(params[0]) : 0;
    auto yOffset = params.size() >= 2 ? HRValueUtils::GetFloat(params[1]) : 0;
    auto animated = params.size() >= 3 ? HRValueUtils::GetBool(params[2], false) : false;
    scrollNode_->ScrollTo(xOffset, yOffset, animated);
  } else if (method == "scrollToWithOptions") {
    if (params.size() == 0)
      return;
    auto paramsValue = params[0];
    auto paramsMap = paramsValue.ToObjectChecked();
    float xOffset = 0;
    if (paramsMap.find("x") != paramsMap.end()) {
      xOffset = HRValueUtils::GetFloat(paramsMap["x"]);
    }
    float yOffset = 0;
    if (paramsMap.find("y") != paramsMap.end()) {
      yOffset = HRValueUtils::GetFloat(paramsMap["y"]);
    }
    int32_t duration = 0;
    if (paramsMap.find("duration") != paramsMap.end()) {
      duration = HRValueUtils::GetInt32(paramsMap["duration"]);
    }

    if (duration > 0) {
      scrollNode_->ScrollTo(xOffset, yOffset, true, duration);
    } else {
      scrollNode_->ScrollTo(xOffset, yOffset, false);
    }
  } else {
    BaseView::CallImpl(method, params, callback);
  }
}

} // namespace native
} // namespace render
} // namespace hippy
