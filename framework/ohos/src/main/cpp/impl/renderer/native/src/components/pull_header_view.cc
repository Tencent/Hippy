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

#include "renderer/components/pull_header_view.h"
#include "renderer/components/list_view.h"
#include "renderer/components/waterfall_view.h"
#include "renderer/utils/hr_value_utils.h"

namespace hippy {
inline namespace render {
inline namespace native {

PullHeaderView::PullHeaderView(std::shared_ptr<NativeRenderContext> &ctx) : ListItemView(ctx) {
  type_ = "PullHeader";
}

PullHeaderView::~PullHeaderView() {
  if (!children_.empty()) {
    if (headerItemNode_) {
      for (const auto &child : children_) {
        headerItemNode_->RemoveChild(child->GetLocalRootArkUINode());
      }
    }
    children_.clear();
  }
}

ArkUINode *PullHeaderView::GetLocalRootArkUINode() { return headerItemNode_.get(); }

void PullHeaderView::CreateArkUINodeImpl() {
  headerItemNode_ = std::make_shared<StackNode>();
}

void PullHeaderView::DestroyArkUINodeImpl() {
  headerItemNode_ = nullptr;
}

bool PullHeaderView::RecycleArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) {
  headerItemNode_->ResetAllAttributes();
  recycleView->cachedNodes_.resize(1);
  recycleView->cachedNodes_[0] = headerItemNode_;
  headerItemNode_ = nullptr;
  return true;
}

bool PullHeaderView::ReuseArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) {
  if (recycleView->cachedNodes_.size() < 1) {
    return false;
  }
  headerItemNode_ = std::static_pointer_cast<StackNode>(recycleView->cachedNodes_[0]);
  return true;
}

void PullHeaderView::OnChildInsertedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) {
  BaseView::OnChildInsertedImpl(childView, index);
  headerItemNode_->InsertChild(childView->GetLocalRootArkUINode(), index);
}

void PullHeaderView::OnChildRemovedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) {
  BaseView::OnChildRemovedImpl(childView, index);;
  headerItemNode_->RemoveChild(childView->GetLocalRootArkUINode());
}

void PullHeaderView::UpdateRenderViewFrameImpl(const HRRect &frame, const HRPadding &padding) {
  headerItemNode_->SetSize(HRSize(frame.width, frame.height));
  width_ = frame.width;
  height_ = frame.height;
  
  if (viewDelegate_) {
    viewDelegate_->OnPullHeaderViewSizeUpdated(HRSize(width_, height_));
  }
}

bool PullHeaderView::SetPropImpl(const std::string &propKey, const HippyValue &propValue) {
  return BaseView::SetPropImpl(propKey, propValue);
}

void PullHeaderView::OnSetPropsEndImpl() {
  return ListItemView::OnSetPropsEndImpl();
}

void PullHeaderView::CallImpl(const std::string &method, const std::vector<HippyValue> params,
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

void PullHeaderView::OnHeadRefreshFinish(int32_t delay) {
  auto parentView = parent_.lock();
  if (parentView) {
    auto listView = std::static_pointer_cast<ListView>(parentView);
    listView->OnHeadRefreshFinish(delay);
  }
}

void PullHeaderView::OnHeaderRefresh() {
  auto parentView = parent_.lock();
  if (parentView) {
    auto listView = std::static_pointer_cast<ListView>(parentView);
    listView->OnHeadRefresh();
  }
}

} // namespace native
} // namespace render
} // namespace hippy
