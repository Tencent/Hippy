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

#include "renderer/tdf/viewnode/modal_view_node.h"
#include "renderer/tdf/viewnode/root_view_node.h"
#include "tdfui/view/window_manager.h"

namespace hippy {
inline namespace render {
inline namespace tdf {

using tdfcore::View;
using tdfcore::ViewContext;

void ModalViewNode::HandleStyleUpdate(const DomStyleMap& dom_style, const DomDeleteProps& dom_delete_props) {
  ViewNode::HandleStyleUpdate(dom_style, dom_delete_props);

  if (auto it = dom_style.find(kImmersionStatusBar); it != dom_style.end() && it->second != nullptr) {
    SetImmersionStatusBar(it->second->ToBooleanChecked());
  }

  if (auto it = dom_style.find(kTransparent); it != dom_style.end() && it->second != nullptr) {
    if (it->second->ToBooleanChecked()) {
      GetView()->SetBackgroundColor(tdfcore::Color::Transparent());
    } else {
      GetView()->SetBackgroundColor(tdfcore::Color::ARGB(100, 99, 99, 99));
    }
  }
}

void ModalViewNode::OnCreate() {
  ViewNode::OnCreate();
}

void ModalViewNode::HandleLayoutUpdate(hippy::LayoutResult layout_result) {
  ViewNode::HandleLayoutUpdate(layout_result);
  auto root_view_frame = GetView()->GetViewContext()->GetWindowManager()->GetMainWindow()->GetContentView()->GetFrame();
  GetView()->SetFrame(TRect::MakeXYWH(0, 0, root_view_frame.Width(), root_view_frame.Height()));
}

std::shared_ptr<View> ModalViewNode::CreateView(const std::shared_ptr<ViewContext> &context) {
  auto modal_view = TDF_MAKE_SHARED(ModalView, context);
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

}  // namespace tdf
}  // namespace render
}  // namespace hippy
