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

#include "renderer/recycle/recycle_view.h"

namespace hippy {
inline namespace render {
inline namespace native {

void RecycleView::RemoveSubView(int32_t index) {
  if (index < 0 || index >= (int32_t)children_.size()) {
    return;
  }
  auto &subView = children_[(uint32_t)index];
  subView->cachedNodes_[0]->RemoveSelfFromParent();
  children_.erase(children_.begin() + index);
}

bool HippyIsRecycledView(const std::string &view_type) {
  if (view_type == "View" || view_type == "Image" || view_type == "Text" || view_type == "TextInput"
    || view_type == "ListViewItem" || view_type == "PullHeaderView" || view_type == "PullFooterView"
    || view_type == "WaterfallItem") {
    return true;
  }
  return false;
}

} // namespace native
} // namespace render
} // namespace hippy
