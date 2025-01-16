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

#include "renderer/components/pager_item_view.h"
#include "renderer/utils/hr_value_utils.h"

namespace hippy {
inline namespace render {
inline namespace native {

PagerItemView::PagerItemView(std::shared_ptr<NativeRenderContext> &ctx) : BaseView(ctx) {}

PagerItemView::~PagerItemView() {
  if (!children_.empty()) {
    if (stackNode_) {
      for (const auto &child : children_) {
        stackNode_->RemoveChild(child->GetLocalRootArkUINode());
      }
    }
    children_.clear();
  }
}

StackNode *PagerItemView::GetLocalRootArkUINode() { return stackNode_.get(); }

void PagerItemView::CreateArkUINodeImpl() {
  stackNode_ = std::make_shared<StackNode>();
}

void PagerItemView::DestroyArkUINodeImpl() {
  stackNode_ = nullptr;
}

bool PagerItemView::SetPropImpl(const std::string &propKey, const HippyValue &propValue) {
  return BaseView::SetPropImpl(propKey, propValue);
}

void PagerItemView::OnChildInsertedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) {
  BaseView::OnChildInsertedImpl(childView, index);
  stackNode_->InsertChild(childView->GetLocalRootArkUINode(), index);
}

void PagerItemView::OnChildRemovedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) {
  BaseView::OnChildRemovedImpl(childView, index);
  stackNode_->RemoveChild(childView->GetLocalRootArkUINode());
}

void PagerItemView::UpdateRenderViewFrameImpl(const HRRect &frame, const HRPadding &padding) {
  // Not set position here, or scroll error.
  GetLocalRootArkUINode()->SetSize(HRSize(frame.width, frame.height));
}
} // namespace native
} // namespace render
} // namespace hippy
