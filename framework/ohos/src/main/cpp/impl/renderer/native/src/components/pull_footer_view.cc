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

#include "renderer/components/pull_footer_view.h"
#include "renderer/components/list_view.h"
#include "renderer/utils/hr_value_utils.h"

namespace hippy {
inline namespace render {
inline namespace native {

PullFooterView::PullFooterView(std::shared_ptr<NativeRenderContext> &ctx) : ListItemView(ctx) {
  type_ = "PullFooter";
}

PullFooterView::~PullFooterView() {}

void PullFooterView::CreateArkUINodeImpl() {
  ListItemView::CreateArkUINodeImpl();
  GetLocalRootArkUINode()->SetVisibility(isVisible_);
}

void PullFooterView::DestroyArkUINodeImpl() {
  ListItemView::DestroyArkUINodeImpl();
}

bool PullFooterView::RecycleArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) {
  return ListItemView::RecycleArkUINodeImpl(recycleView);
}

bool PullFooterView::ReuseArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) {
  bool ret = ListItemView::ReuseArkUINodeImpl(recycleView);
  if (!ret) {
    return false;
  }
  GetLocalRootArkUINode()->SetVisibility(isVisible_);
  return true;
}

bool PullFooterView::SetPropImpl(const std::string &propKey, const HippyValue &propValue) {
  if (propKey == "sticky") {
    auto value = HRValueUtils::GetBool(propValue, false);
    if (value) {
      sticky_ = value;
    }
    return true;
  }
  return ListItemView::SetPropImpl(propKey, propValue);
}

void PullFooterView::OnSetPropsEndImpl(){
   return ListItemView::OnSetPropsEndImpl();
}

void PullFooterView::CallImpl(const std::string &method, const std::vector<HippyValue> params,
                          std::function<void(const HippyValue &result)> callback) {
  FOOTSTONE_DLOG(INFO)<<__FUNCTION__<<" method = "<<method;
  if (method == "collapsePullFooter") {
    Show(false);
  } else {
    BaseView::CallImpl(method, params, callback);
  }
}

void PullFooterView::Show(bool show) {
  if (show != isVisible_) {
    auto node = GetLocalRootArkUINode();
    if (node) {
      isVisible_ = show;
      node->SetVisibility(show);
    }
  }
}

void PullFooterView::UpdateRenderViewFrameImpl(const HRRect &frame, const HRPadding &padding){
//  BaseView::UpdateRenderViewFrameImpl(frame, padding);
}

} // namespace native
} // namespace render
} // namespace hippy
