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

#include "renderer/components/waterfall_item_view.h"
#include "renderer/utils/hr_value_utils.h"

namespace hippy {
inline namespace render {
inline namespace native {

WaterfallItemView::WaterfallItemView(std::shared_ptr<NativeRenderContext> &ctx) : BaseView(ctx) {}

WaterfallItemView::~WaterfallItemView() {
  if (!children_.empty()) {
    if (itemNode_) {
      for (const auto &child : children_) {
        itemNode_->RemoveChild(child->GetLocalRootArkUINode());
      }
    }
    children_.clear();
  }
}

WaterFlowItemNode *WaterfallItemView::GetLocalRootArkUINode() { return itemNode_.get(); }

void WaterfallItemView::CreateArkUINodeImpl() {
  itemNode_ = std::make_shared<WaterFlowItemNode>();
}

void WaterfallItemView::DestroyArkUINodeImpl() {
  itemNode_ = nullptr;
}

bool WaterfallItemView::RecycleArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) {
  itemNode_->ResetAllAttributes();
  recycleView->cachedNodes_.resize(1);
  recycleView->cachedNodes_[0] = itemNode_;
  itemNode_ = nullptr;
  return true;
}

bool WaterfallItemView::ReuseArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) {
  if (recycleView->cachedNodes_.size() < 1) {
    return false;
  }
  itemNode_ = std::static_pointer_cast<WaterFlowItemNode>(recycleView->cachedNodes_[0]);
  return true;
}

bool WaterfallItemView::SetPropImpl(const std::string &propKey, const HippyValue &propValue) {
  if (propKey == "type") {
    return true;
  }
  return BaseView::SetPropImpl(propKey, propValue);
}

void WaterfallItemView::OnSetPropsEndImpl(){
  return BaseView::OnSetPropsEndImpl();
}

void WaterfallItemView::OnChildInsertedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) {
  BaseView::OnChildInsertedImpl(childView, index);
  itemNode_->InsertChild(childView->GetLocalRootArkUINode(), index);
}

void WaterfallItemView::OnChildRemovedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) {
  BaseView::OnChildRemovedImpl(childView, index);;
  itemNode_->RemoveChild(childView->GetLocalRootArkUINode());
}

void WaterfallItemView::UpdateRenderViewFrameImpl(const HRRect &frame, const HRPadding &padding) {
//  BaseView::UpdateRenderViewFrameImpl(frame,padding);
}

} // namespace native
} // namespace render
} // namespace hippy
