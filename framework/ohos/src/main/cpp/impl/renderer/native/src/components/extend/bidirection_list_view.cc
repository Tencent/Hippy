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

#include "renderer/components/extend/bidirection_list_view.h"
#include "renderer/utils/hr_convert_utils.h"
#include "renderer/utils/hr_event_utils.h"
#include "renderer/utils/hr_pixel_utils.h"
#include "renderer/utils/hr_value_utils.h"

namespace hippy {
inline namespace render {
inline namespace native {

BidirectionListView::BidirectionListView(std::shared_ptr<NativeRenderContext> &ctx) : ListView(ctx) {
  
}

BidirectionListView::~BidirectionListView() {

}

bool BidirectionListView::SetPropImpl(const std::string &propKey, const HippyValue &propValue) {
  if (propKey == "deltaHeightToAppend") {
    auto value = HRValueUtils::GetInt32(propValue);
    deltaHeightToAppend_ = value;
    return true;
  }
  return ListView::SetPropImpl(propKey, propValue);
}

void BidirectionListView::HandleOnChildrenUpdated() {
  ListView::HandleOnChildrenUpdated();

  if (GetLocalRootArkUINode()) {
    if (deltaHeightToAppend_ != 0) {
      auto current = listNode_->GetScrollOffset();
      float dOff = HRPixelUtils::DpToVp((float)deltaHeightToAppend_);
      float xOff = isVertical_ ? 0 : (current.x + dOff);
      float yOff = isVertical_ ? (current.y + dOff) : 0;
      listNode_->ScrollTo(xOff, yOff, false);
      deltaHeightToAppend_ = 0;
    }

    HREventUtils::SendComponentEvent(ctx_, tag_, "onDataRendered", nullptr);
  }
}

} // namespace native
} // namespace render
} // namespace hippy
