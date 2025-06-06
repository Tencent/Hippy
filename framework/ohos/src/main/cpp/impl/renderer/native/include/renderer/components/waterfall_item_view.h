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

#include "renderer/components/base_view.h"
#include "renderer/arkui/stack_node.h"
#include "renderer/arkui/water_flow_item_node.h"

namespace hippy {
inline namespace render {
inline namespace native {

class WaterfallItemView : public BaseView {
public:
  WaterfallItemView(std::shared_ptr<NativeRenderContext> &ctx);
  ~WaterfallItemView();

  ArkUINode *GetLocalRootArkUINode() override;
  void CreateArkUINodeImpl() override;
  void DestroyArkUINodeImpl() override;
  bool RecycleArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) override;
  bool ReuseArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) override;
  bool SetViewProp(const std::string &propKey, const HippyValue &propValue) override;
  bool SetPropImpl(const std::string &propKey, const HippyValue &propValue) override;
  void OnSetPropsEndImpl() override;
  
  void OnChildInsertedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) override;
  void OnChildRemovedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) override;
  void UpdateRenderViewFrameImpl(const HRRect &frame, const HRPadding &padding) override;
  
  float GetWidth();
  float GetHeight();
  std::string &GetType() { return type_; }
  
  constexpr static const char *HEAD_BANNER_TYPE = "HeadBanner";
  constexpr static const char *FOOT_BANNER_TYPE = "FootBanner";
  
protected:
  std::shared_ptr<WaterFlowItemNode> itemNode_;
  
  float width_ = 0;
  float height_ = 0;
  
  std::string type_;
};

} // namespace native
} // namespace render
} // namespace hippy
