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

#include "renderer/components/root_view.h"
#include "renderer/utils/hr_display_sync_utils.h"

namespace hippy {
inline namespace render {
inline namespace native {

RootView::RootView(std::shared_ptr<NativeRenderContext> &ctx) : DivView(ctx) {
}

RootView::~RootView() {
  if (GetLocalRootArkUINode()) {
    GetLocalRootArkUINode()->UnregisterDisappearEvent();
  }
  HRDisplaySyncUtils::UnregisterDoFrameListener(ctx_->GetInstanceId(), tag_);
}

void RootView::CreateArkUINodeImpl() {
  DivView::CreateArkUINodeImpl();
  GetLocalRootArkUINode()->RegisterDisappearEvent();
}

void RootView::DestroyArkUINodeImpl() {
  DivView::DestroyArkUINodeImpl();
}

bool RootView::SetPropImpl(const std::string &propKey, const HippyValue &propValue) {
  if (propKey.length() > 0 && propValue.IsBoolean()) {
    HandleRootEvent(propKey, propValue.ToBooleanChecked());
  }
  return BaseView::SetPropImpl(propKey, propValue);
}

void RootView::HandleRootEvent(const std::string &event, bool enable) {
  if (event == "frameupdate") {
    if (enable) {
      HRDisplaySyncUtils::RegisterDoFrameListener(ctx_->GetInstanceId(), tag_);
    } else {
      HRDisplaySyncUtils::UnregisterDoFrameListener(ctx_->GetInstanceId(), tag_);
    }
  }
}

void RootView::OnDisappear() {
  HRDisplaySyncUtils::UnregisterDoFrameListener(ctx_->GetInstanceId(), tag_);
}

} // namespace native
} // namespace render
} // namespace hippy
