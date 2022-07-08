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

#include "render/tdf/vdom/modal_view_node.h"
#include "core/tdfi/view/view.h"
#include "render/tdf/vdom/node_props.h"

namespace tdfrender {

using tdfcore::View;
using tdfcore::ViewContext;

const auto kOnShow = "onShow";
const auto KOnDismiss = "onDismiss";
const auto kOnRequestClose = "onRequestClose";
const auto kOnOrientationChange = "onOrientationChange";
const auto kSupportedOrientation = "supportedOrientations";

node_creator tdfrender::ModalViewNode::GetCreator() {
  return [](RenderInfo info) { return TDF_MAKE_SHARED(ModalViewNode, info); };
}

void ModalViewNode::HandleStyleUpdate(const DomStyleMap& dom_style) {
  ViewNode::HandleStyleUpdate(dom_style);

  if (auto iterator = dom_style.find(modal::kImmersionStatusBar); iterator != dom_style.end()) {
    SetImmersionStatusBar(iterator->second->ToBooleanChecked());
  }

  if (auto iterator = dom_style.find(modal::kAnimationType); iterator != dom_style.end()) {
    // todo(kloudwang)
  }

  if (auto iterator = dom_style.find(modal::kDarkStatusBarText); iterator != dom_style.end()) {
    // todo(kloudwang)
  }

  if (auto iterator = dom_style.find(kSupportedOrientation); iterator != dom_style.end()) {
    // todo(kloudwang)
  }

  if (auto iterator = dom_style.find(modal::kTransparent); iterator != dom_style.end()) {
    if (iterator->second->ToBooleanChecked()) {
      GetView()->SetBackgroundColor(tdfcore::Color::Transparent());
    } else {
      // todo(kloudwang) : user define background color
      GetView()->SetBackgroundColor(tdfcore::Color::ARGB(100, 99, 99, 99));
    }
  }
}

std::shared_ptr<View> ModalViewNode::CreateView() {
  auto modal_view = TDF_MAKE_SHARED(ModalView);
  modal_view->SetShowCallback([WEAK_THIS] {
    DEFINE_AND_CHECK_SELF(ModalViewNode)
    self->OnShow();
  });
  modal_view->SetDismissCallback([WEAK_THIS] {
    DEFINE_AND_CHECK_SELF(ModalViewNode)
    self->OnDismiss();
  });
  modal_view->SetRequestCloseCallback([WEAK_THIS] {
    DEFINE_AND_CHECK_SELF(ModalViewNode)
    self->OnRequestClose();
  });
  modal_view->SetOrientationChangeCallback([WEAK_THIS] {
    DEFINE_AND_CHECK_SELF(ModalViewNode)
    self->OnOrientationChange();
  });
  auto root_view_frame = tdfcore::ViewContext::GetCurrent()->GetRootView()->GetFrame();
  modal_view->SetFrame(TRect::MakeXYWH(0, 0, root_view_frame.Width(), root_view_frame.Height()));
  return modal_view;
}

void ModalViewNode::SetImmersionStatusBar(bool show) {
  auto view = std::static_pointer_cast<ModalView>(GetView());
  view->SetImmersionStatusBar(show);
}

void ModalViewNode::OnShow() { SendUIDomEvent(kOnShow); }

void ModalViewNode::OnDismiss() { SendUIDomEvent(KOnDismiss); }

void ModalViewNode::OnRequestClose() { SendUIDomEvent(kOnRequestClose); }

void ModalViewNode::OnOrientationChange() { SendUIDomEvent(kOnOrientationChange); }

}  // namespace tdfrender
