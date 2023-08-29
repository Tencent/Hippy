/**
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#pragma once

#include "renderer/tdf/view/modal_view.h"
#include "renderer/tdf/viewnode/view_names.h"
#include "renderer/tdf/viewnode/view_node.h"

namespace hippy {
inline namespace render {
inline namespace tdf {

inline namespace modal {
constexpr const char kModal[] = "Modal";
constexpr const char kAnimationType[] = "animationType";            // String
constexpr const char kDarkStatusBarText[] = "darkStatusBarText";    // boolean
constexpr const char kImmersionStatusBar[] = "immersionStatusBar";  // boolean
constexpr const char kTransparent[] = "transparent";                // boolean
constexpr const char kOnShow[] = "onShow";
constexpr const char KOnDismiss[] = "onDismiss";
constexpr const char kOnRequestClose[] = "onRequestClose";
constexpr const char kOnOrientationChange[] = "onOrientationChange";
constexpr const char kSupportedOrientation[] = "supportedOrientations";
}  // namespace modal

class ModalViewNode : public ViewNode {
 public:
  using ViewNode::ViewNode;
  ~ModalViewNode() override = default;

  void OnCreate() override;
  void HandleLayoutUpdate(hippy::LayoutResult layout_result) override;
  void HandleStyleUpdate(const DomStyleMap& dom_style, const DomDeleteProps& dom_delete_props) override;
  std::shared_ptr<tdfcore::View> CreateView(const std::shared_ptr<ViewContext> &context) override;
  std::string GetViewName() const override { return kModaViewName; }

 private:
  void SetImmersionStatusBar(bool show);
  void OnShow();
  void OnDismiss();
  void OnRequestClose();
  void OnOrientationChange();
};

}  // namespace tdf
}  // namespace render
}  // namespace hippy
