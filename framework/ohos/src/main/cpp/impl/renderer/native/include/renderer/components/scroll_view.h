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
#include "renderer/arkui/scroll_node.h"

namespace hippy {
inline namespace render {
inline namespace native {

class ScrollView : public BaseView, ScrollNodeDelegate {
public:
  ScrollView(std::shared_ptr<NativeRenderContext> &ctx);
  ~ScrollView();

  ScrollNode *GetLocalRootArkUINode() override;
  void CreateArkUINodeImpl() override;
  void DestroyArkUINodeImpl() override;
  bool SetPropImpl(const std::string &propKey, const HippyValue &propValue) override;
  void CallImpl(const std::string &method, const std::vector<HippyValue> params,
            std::function<void(const HippyValue &result)> callback) override;

  void OnChildInsertedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) override;
  void OnChildRemovedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) override;

  void OnScroll(float xOffset, float yOffset) override;
  void OnScrollStart() override;
  void OnScrollStop() override;
  void OnTouch(int32_t actionType, const HRPosition &screenPosition) override;

private:
  void CheckFireBeginDragEvent();
  void CheckFireEndDragEvent();
  void EmitScrollEvent(std::string &eventName);

  std::shared_ptr<ScrollNode> scrollNode_;
  std::shared_ptr<StackNode> stackNode_;
  bool isDragging_;
  float lastScrollOffset_;
  int64_t lastScrollTime_;
};

} // namespace native
} // namespace render
} // namespace hippy
