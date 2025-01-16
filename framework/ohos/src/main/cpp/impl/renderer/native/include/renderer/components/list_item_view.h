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
#include "renderer/arkui/list_item_node.h"

namespace hippy {
inline namespace render {
inline namespace native {

class ListItemView : public BaseView {
public:
  ListItemView(std::shared_ptr<NativeRenderContext> &ctx);
  ~ListItemView();

  ListItemNode *GetLocalRootArkUINode() override;
  void CreateArkUINodeImpl() override;
  void DestroyArkUINodeImpl() override;
  bool RecycleArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) override;
  bool ReuseArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) override;
  bool SetViewProp(const std::string &propKey, const HippyValue &propValue) override;
  bool SetPropImpl(const std::string &propKey, const HippyValue &propValue) override;
  
  void OnChildInsertedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) override;
  void OnChildRemovedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) override;
  void UpdateRenderViewFrameImpl(const HRRect &frame, const HRPadding &padding) override;
  
  float GetWidth();
  float GetHeight();
  std::string &GetType() { return type_; }
  bool IsSticky() { return sticky_; }

  void CheckExposureView(float currentRatio);
protected:
  uint32_t CalculateExposureState(float currentRatio);
  void MoveToExposureState(uint32_t state);
  
  static const uint32_t EXPOSURE_STATE_FULL_VISIBLE = 1;
  static const uint32_t EXPOSURE_STATE_INVISIBLE = 2;
  static const uint32_t EXPOSURE_STATE_PART_VISIBLE = 3;

  std::shared_ptr<ListItemNode> itemNode_;
  std::shared_ptr<StackNode> stackNode_;
  
  float width_ = 0;
  float height_ = 0;

  std::string type_;
  bool sticky_ = false;

  uint32_t exposureState_ = ListItemView::EXPOSURE_STATE_INVISIBLE;
};

} // namespace native
} // namespace render
} // namespace hippy
