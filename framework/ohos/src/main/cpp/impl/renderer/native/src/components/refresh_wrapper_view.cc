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

#include "renderer/components/refresh_wrapper_view.h"
#include "renderer/components/list_view.h"
#include "renderer/utils/hr_event_utils.h"
#include "renderer/utils/hr_pixel_utils.h"
#include "renderer/utils/hr_value_utils.h"

namespace hippy {
inline namespace render {
inline namespace native {

RefreshWrapperView::RefreshWrapperView(std::shared_ptr<NativeRenderContext> &ctx) : BaseView(ctx) {
}

RefreshWrapperView::~RefreshWrapperView() {
  if (!children_.empty()) {
    if (refreshNode_) {
      for (const auto &child : children_) {
        refreshNode_->RemoveChild(child->GetLocalRootArkUINode());
      }
    }
    children_.clear();
  }
}

void RefreshWrapperView::Init() {
  BaseView::Init();
}

RefreshNode *RefreshWrapperView::GetLocalRootArkUINode() { return refreshNode_.get(); }

void RefreshWrapperView::CreateArkUINodeImpl() {
  refreshNode_ = std::make_shared<RefreshNode>();
  refreshNode_->SetNodeDelegate(this);
  refreshNode_->SetRefreshPullToRefresh(true);
  refreshNode_->SetRefreshRefreshing(false);
}

void RefreshWrapperView::DestroyArkUINodeImpl() {
  refreshNode_->SetNodeDelegate(nullptr);
  refreshNode_ = nullptr;
}

bool RefreshWrapperView::SetPropImpl(const std::string &propKey, const HippyValue &propValue) {
  if (propKey == "bounceTime") {
    bounceTime_ = HRValueUtils::GetInt32(propValue);
    return true;
  } else if (propKey == "onScrollEnable") {
    scrollEventEnable_ = HRValueUtils::GetBool(propValue, false);
    return true;
  } else if (propKey == "scrollEventThrottle") {
    scrollEventThrottle_ = HRValueUtils::GetInt32(propValue, 30);
    return true;
  }
  return BaseView::SetPropImpl(propKey, propValue);
}

void RefreshWrapperView::CallImpl(const std::string &method, const std::vector<HippyValue> params,
                              std::function<void(const HippyValue &result)> callback) {
  FOOTSTONE_DLOG(INFO) << "RefreshWrapperView call: method " << method << ", params: " << params.size();
  if (method == "refreshComplected") {
    RefreshComplected();
  } else if (method == "startRefresh") {
    StartRefresh();
  } else {
    BaseView::CallImpl(method, params, callback);
  }
}

void RefreshWrapperView::OnChildInsertedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) {
  BaseView::OnChildInsertedImpl(childView, index);

  if (childView->GetViewType() == "RefreshWrapperItemView") {
    refreshNode_->SetRefreshContent(childView->GetLocalRootArkUINode()->GetArkUINodeHandle());
    childView->SetPosition({0, - refresh_offset_});
    item_view_ = childView;
  } else {
    refreshNode_->AddChild(childView->GetLocalRootArkUINode());
  }
}

void RefreshWrapperView::OnChildRemovedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) {
  BaseView::OnChildRemovedImpl(childView, index);

  if (childView->GetViewType() == "RefreshWrapperItemView") {
    refreshNode_->ResetRefreshContent();
  } else {
    refreshNode_->RemoveChild(childView->GetLocalRootArkUINode());
  }
}

void RefreshWrapperView::OnRefreshing() {
  FOOTSTONE_DLOG(INFO) << "Refresh wrapper view, OnRefreshing";
  refreshNode_->SetRefreshRefreshing(true);
  HREventUtils::SendComponentEvent(ctx_, tag_, HREventUtils::EVENT_REFRESH_WRAPPER_REFRESH, nullptr);
}

void RefreshWrapperView::OnStateChange(int32_t state) {
  FOOTSTONE_DLOG(INFO) << "Refresh wrapper view, OnStateChange: " << state;
  
}

void RefreshWrapperView::OnOffsetChange(float_t offset) {
  // FOOTSTONE_DLOG(INFO) << "Refresh wrapper view, OnOffsetChange: " << offset;
  auto item_view = item_view_.lock();
  if (item_view) {
    item_view->SetPosition({0, offset - refresh_offset_});
  }

  SendOnScrollEvent(-offset);
}

void RefreshWrapperView::SetRefreshOffset(float offset) {
  refresh_offset_ = offset;
  refreshNode_->SetRefreshOffset(offset);
}

void RefreshWrapperView::BounceToHead() {
  refreshNode_->SetRefreshRefreshing(false);
}

void RefreshWrapperView::StartRefresh() {
  // 鸿蒙不支持程序开始刷新
}

void RefreshWrapperView::RefreshComplected() {
  BounceToHead();
}

void RefreshWrapperView::SendOnScrollEvent(float y) {
  if (scrollEventEnable_) {
    auto currTime = GetTimeMilliSeconds();
    if (currTime - lastScrollEventTimeStamp_ < scrollEventThrottle_) {
      return;
    }
    HippyValueObjectType contentOffset;
    contentOffset["x"] = HippyValue(0);
    contentOffset["y"] = HippyValue(HRPixelUtils::VpToDp(y));
    HippyValueObjectType event;
    event["contentOffset"] = contentOffset;
    HREventUtils::SendComponentEvent(ctx_, tag_, HREventUtils::EVENT_REFRESH_WRAPPER_SCROLL, std::make_shared<HippyValue>(event));
    lastScrollEventTimeStamp_ = currTime;
  }
}

} // namespace native
} // namespace render
} // namespace hippy
