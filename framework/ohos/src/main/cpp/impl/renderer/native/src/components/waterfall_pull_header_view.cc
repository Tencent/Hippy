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

#include "renderer/components/waterfall_pull_header_view.h"
#include "renderer/components/waterfall_view.h"
#include "renderer/utils/hr_value_utils.h"

namespace hippy {
inline namespace render {
inline namespace native {

WaterfallPullHeaderView::WaterfallPullHeaderView(std::shared_ptr<NativeRenderContext> &ctx) : WaterfallItemView(ctx) {
  type_ = "PullHeader";
}

WaterfallPullHeaderView::~WaterfallPullHeaderView() {
  if (!children_.empty()) {
    if (headerItemNode_) {
      for (const auto &child : children_) {
        headerItemNode_->RemoveChild(child->GetLocalRootArkUINode());
      }
    }
    children_.clear();
  }
}

ArkUINode *WaterfallPullHeaderView::GetLocalRootArkUINode() { return headerItemNode_.get(); }

void WaterfallPullHeaderView::CreateArkUINodeImpl() {
  headerItemNode_ = std::make_shared<StackNode>();
}

void WaterfallPullHeaderView::DestroyArkUINodeImpl() {
  headerItemNode_ = nullptr;
}

bool WaterfallPullHeaderView::RecycleArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) {
  headerItemNode_->ResetAllAttributes();
  recycleView->cachedNodes_.resize(1);
  recycleView->cachedNodes_[0] = headerItemNode_;
  headerItemNode_ = nullptr;
  return true;
}

bool WaterfallPullHeaderView::ReuseArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) {
  if (recycleView->cachedNodes_.size() < 1) {
    return false;
  }
  headerItemNode_ = std::static_pointer_cast<StackNode>(recycleView->cachedNodes_[0]);
  return true;
}

void WaterfallPullHeaderView::OnChildInsertedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) {
  BaseView::OnChildInsertedImpl(childView, index);
  headerItemNode_->InsertChild(childView->GetLocalRootArkUINode(), index);
}

void WaterfallPullHeaderView::OnChildRemovedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) {
  BaseView::OnChildRemovedImpl(childView, index);;
  headerItemNode_->RemoveChild(childView->GetLocalRootArkUINode());
}

bool WaterfallPullHeaderView::SetPropImpl(const std::string &propKey, const HippyValue &propValue) {
//  FOOTSTONE_DLOG(INFO)<<__FUNCTION__<<" propKey = "<<propKey;
  return WaterfallItemView::SetPropImpl(propKey, propValue);
}

void WaterfallPullHeaderView::OnSetPropsEndImpl() {
  return WaterfallItemView::OnSetPropsEndImpl();
}

void WaterfallPullHeaderView::CallImpl(const std::string &method, const std::vector<HippyValue> params,
                    std::function<void(const HippyValue &result)> callback) {
  FOOTSTONE_DLOG(INFO)<<__FUNCTION__<<" method = "<<method; 
  if (method == "collapsePullHeader") {
    OnHeadRefreshFinish();
  } else if (method == "collapsePullHeaderWithOptions") {
    HippyValueObjectType map;
    bool r = params[0].ToObject(map);
    if (r && map.size() > 0) {
      auto collapseTime = HRValueUtils::GetInt32(map["time"]);
      if (collapseTime > 0) {
        OnHeadRefreshFinish(collapseTime);
      } else {
        OnHeadRefreshFinish();
      }
    }
  } else if (method == "expandPullHeader") {
    OnHeaderRefresh();
  } else {
    BaseView::CallImpl(method, params, callback);
  }
}

void WaterfallPullHeaderView::OnHeadRefreshFinish(int32_t delay) {
  auto parentView = parent_.lock();
  if (parentView) {
    auto waterView = std::static_pointer_cast<WaterfallView>(parentView);
    waterView->OnHeadRefreshFinish(delay);
  }
}

void WaterfallPullHeaderView::OnHeaderRefresh() {
  auto parentView = parent_.lock();
  if (parentView) {
    auto waterView = std::static_pointer_cast<WaterfallView>(parentView);
    waterView->OnHeadRefresh();
  }
}

} // namespace native
} // namespace render
} // namespace hippy
