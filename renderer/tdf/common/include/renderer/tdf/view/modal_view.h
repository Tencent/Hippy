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

#include "core/common/rect.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wsign-conversion"
#pragma clang diagnostic ignored "-Wsign-compare"
#pragma clang diagnostic ignored "-Wextra-semi"
#pragma clang diagnostic ignored "-Wc++98-compat-extra-semi"
#pragma clang diagnostic ignored "-Wignored-qualifiers"
#pragma clang diagnostic ignored "-Wimplicit-float-conversion"
#pragma clang diagnostic ignored "-Wimplicit-int-conversion"
#pragma clang diagnostic ignored "-Wfloat-conversion"
#pragma clang diagnostic ignored "-Wshadow"
#pragma clang diagnostic ignored "-Wdeprecated-copy"
#include "core/common/reflection.h"
#include "tdfui/view/view.h"
#include "tdfui/view/view_context.h"
#pragma clang diagnostic pop

namespace hippy {
inline namespace render {
inline namespace tdf {
inline namespace view {

using tdfcore::TRect;
using tdfcore::View;
using tdfcore::ViewContext;

using OnShowCallBack = std::function<void()>;
using OnDismissCallBack = std::function<void()>;
using OnRequestCloseCallBack = std::function<void()>;
using OnOrientationChangeCallBack = std::function<void()>;

class ModalView : public View {
  TDF_REFF_CLASS_META(ModalView)

 public:
  ~ModalView() override;

  ModalView(const std::shared_ptr<ViewContext> &context);

  void AddView(const std::shared_ptr<View> &child) override;

  void AddView(const std::shared_ptr<View> &child, int64_t index) override;

  void RemoveView(const std::shared_ptr<View> &child) override;

  void InternalSetRenderBackgroundColor(tdfcore::Color color) override;

  void InternalSetFrame(const TRect &frame) override;

  void Mount() override;

  void Unmount() override;

  /**
   * set StatusBar whether immersion display
   * @param immersion_status
   */
  void SetImmersionStatusBar(bool immersion_status);

  /**
   * @brief set modal View display callback
   * @param show_callback
   */
  void SetShowCallback(const OnShowCallBack &show_callback);

  /**
   * @brief set modal View disappear callback
   * @param dismiss_callback
   */
  void SetDismissCallback(const OnDismissCallBack &dismiss_callback);

  /**
   * @brief set close request callback
   * @param close_callback
   */
  void SetRequestCloseCallback(const OnRequestCloseCallBack &close_callback);

  /**
   * @brief set orientation changed callback
   * @param change_callback 回调
   */
  void SetOrientationChangeCallback(const OnOrientationChangeCallBack &change_callback);

 private:
  bool is_immersion_status_bar = false;
  OnShowCallBack show_callback_;
  OnDismissCallBack dismiss_callback_;
  OnRequestCloseCallBack request_close_callback_;
  OnOrientationChangeCallBack orientation_change_callback_;
  std::shared_ptr<View> modal_view_;
  std::shared_ptr<View> root_view_;

  FRIEND_OF_TDF_ALLOC
};

}  // namespace view
}  // namespace tdf
}  // namespace render
}  // namespace hippy

TDF_REFL_DEFINE(hippy::render::tdf::view::ModalView, bases<tdfcore::View>)
TDF_REFL_END(tdf::view::ModalView)
