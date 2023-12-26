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

#pragma once

#include "renderer/arkui/refresh_node.h"
#include "renderer/components/base_view.h"

namespace hippy {
inline namespace render {
inline namespace native {

class RefreshWrapperView : public BaseView, public RefreshNodeDelegate {
public:
  RefreshWrapperView(std::shared_ptr<NativeRenderContext> &ctx);
  ~RefreshWrapperView();

  void Init() override;

  RefreshNode *GetLocalRootArkUINode() override;
  void CreateArkUINodeImpl() override;
  void DestroyArkUINodeImpl() override;
  bool SetPropImpl(const std::string &propKey, const HippyValue &propValue) override;
  void CallImpl(const std::string &method, const std::vector<HippyValue> params,
                    std::function<void(const HippyValue &result)> callback) override;

  void OnChildInsertedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) override;
  void OnChildRemovedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) override;

  void OnRefreshing() override;
  void OnStateChange(int32_t state) override;
  void OnOffsetChange(float_t offset) override;

  void SetRefreshOffset(float offset);

private:
  void BounceToHead();
  void StartRefresh();
  void RefreshComplected();

  void SendOnScrollEvent(float y);

  std::shared_ptr<RefreshNode> refreshNode_;

  int32_t bounceTime_ = 300;

  bool scrollEventEnable_ = true;
  int32_t scrollEventThrottle_ = 400;
  int64_t lastScrollEventTimeStamp_ = -1;

  float refresh_offset_ = 1000.f;
  std::weak_ptr<BaseView> item_view_;
};

} // namespace native
} // namespace render
} // namespace hippy
