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

#include "renderer/tdf/view/modal_view.h"
#include "footstone/logging.h"
#include "tdfui/view/window_manager.h"

namespace hippy {
inline namespace render {
inline namespace tdf {
inline namespace view {

ModalView::~ModalView() {
  if (is_mounted_) {
    root_view_->RemoveView(modal_view_);
  }
}

ModalView::ModalView(const std::shared_ptr<ViewContext> &context) : tdfcore::View(context) {
  modal_view_ = TDF_MAKE_SHARED(View, GetViewContext());
  root_view_ = GetViewContext()->GetWindowManager()->GetMainWindow()->GetContentView();
}

void ModalView::Mount() {
  View::Mount();
  root_view_->AddView(modal_view_);
}

void ModalView::Unmount() {
  View::Unmount();
  root_view_->RemoveView(modal_view_);
}

void ModalView::AddView(const std::shared_ptr<tdfcore::View>& child) {
  if (show_callback_) {
    show_callback_();
  }
  modal_view_->AddView(child);
}

void ModalView::AddView(const std::shared_ptr<tdfcore::View>& child, int64_t index) {
  if (show_callback_) {
    show_callback_();
  }
  modal_view_->AddView(child, index);
}

void ModalView::RemoveView(const std::shared_ptr<tdfcore::View>& child) { modal_view_->RemoveView(child); }

void ModalView::SetImmersionStatusBar(bool show_immersion_status_bar) {
  is_immersion_status_bar = show_immersion_status_bar;
}

void ModalView::InternalSetFrame(const TRect& frame) {
  if (is_immersion_status_bar) {
    modal_view_->SetFrame(frame);
  } else {
    auto viewport = GetViewContext()->GetViewportMetrics();
    auto padding_top = viewport.view_padding_top / viewport.device_pixel_ratio;
    modal_view_->SetFrame(TRect::MakeXYWH(frame.left, static_cast<float>(padding_top + frame.top), frame.Width(),
                                          static_cast<float>(frame.Height() - padding_top)));
  }
}

void ModalView::InternalSetRenderBackgroundColor(tdfcore::Color color) {
  View::InternalSetRenderBackgroundColor(color);
  modal_view_->SetBackgroundColor(color);
}

void ModalView::SetShowCallback(const OnShowCallBack& show_callback) { show_callback_ = show_callback; }

void ModalView::SetDismissCallback(const OnDismissCallBack& dismiss_callback) { dismiss_callback_ = dismiss_callback; }

void ModalView::SetRequestCloseCallback(const OnRequestCloseCallBack& close_closure_callback) {
  request_close_callback_ = close_closure_callback;
}

void ModalView::SetOrientationChangeCallback(const OnOrientationChangeCallBack& change_callback) {
  orientation_change_callback_ = change_callback;
}

}  // namespace view
}  // namespace tdf
}  // namespace render
}  // namespace hippy
