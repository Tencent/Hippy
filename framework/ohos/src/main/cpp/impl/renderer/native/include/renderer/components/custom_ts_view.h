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
#include "renderer/arkui/custom_ts_node.h"
#include "renderer/arkui/stack_node.h"

namespace hippy {
inline namespace render {
inline namespace native {

class CustomTsView : public BaseView {
public:
  CustomTsView(std::shared_ptr<NativeRenderContext> &ctx, ArkUI_NodeHandle nodeHandle, ArkUI_NodeContentHandle contentHandle);
  ~CustomTsView();

  StackNode *GetLocalRootArkUINode() override;
  void CreateArkUINodeImpl() override;
  void DestroyArkUINodeImpl() override;
  bool SetViewProp(const std::string &propKey, const HippyValue &propValue) override;
  bool SetPropImpl(const std::string &propKey, const HippyValue &propValue) override;
  void UpdateRenderViewFrameImpl(const HRRect &frame, const HRPadding &padding) override;

  void OnChildInserted(std::shared_ptr<BaseView> const &childView, int index) override;
  void OnChildRemoved(std::shared_ptr<BaseView> const &childView, int32_t index) override;
  void OnChildInsertedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) override;
  void OnChildRemovedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) override;

private:
  void OnCustomTsViewChildInserted(uint32_t tag, std::shared_ptr<BaseView> const &childView, int32_t index);
  void OnCustomTsViewChildRemoved(uint32_t tag, std::shared_ptr<BaseView> const &childView, int32_t index);

  // 给TsNode加一个包装节点，这样BuilderProxyNode才会被限制在正确的位置，而不会位于上层节点的左上角从而阻挡事件。
  std::shared_ptr<StackNode> packageNode_;

  std::shared_ptr<CustomTsNode> tsNode_;
  std::shared_ptr<ArkUINode> contentNode_;
  
  bool isContentNativeScroll_ = false;

  ArkUI_NodeHandle customNodeHandle_ = nullptr;
  ArkUI_NodeContentHandle contentHandle_ = nullptr;
};

} // namespace native
} // namespace render
} // namespace hippy
