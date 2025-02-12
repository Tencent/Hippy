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

#include "renderer/components/modal_view.h"
#include "renderer/utils/hr_value_utils.h"
#include "renderer/utils/hr_event_utils.h"
#include "renderer/native_render_provider.h"

namespace hippy {
inline namespace render {
inline namespace native {
const int DURATION = 200;

ModalView::ModalView(std::shared_ptr<NativeRenderContext> &ctx) : BaseView(ctx) {
}

ModalView::~ModalView() {
  if (stackNode_) {
    stackNode_->UnregisterAreaChangeEvent();
  }
  CloseDialog();
}

StackNode *ModalView::GetLocalRootArkUINode() { return stackNode_.get(); }

void ModalView::CreateArkUINodeImpl() {
  stackNode_ = std::make_shared<StackNode>();
  stackNode_->RegisterAreaChangeEvent();
  stackNode_->ResetNodeAttribute(ArkUI_NodeAttributeType::NODE_OPACITY_TRANSITION);
}

void ModalView::DestroyArkUINodeImpl() {
  stackNode_ = nullptr;
}

bool ModalView::SetPropImpl(const std::string &propKey, const HippyValue &propValue) {
  if(propKey == "transparent"){
    this->transparent = HRValueUtils::GetBool(propValue, true);
  } else if(propKey == "animationType"){
    this->animationType = HRValueUtils::GetString(propValue);
  } else if(propKey == "darkStatusBarText"){
    this->darkStatusBarText = HRValueUtils::GetBool(propValue, false);
  }
  return BaseView::SetPropImpl(propKey, propValue);
}

void ModalView::OnSetPropsEndImpl(){
  if(this->animationType == "fade"){
    GetLocalRootArkUINode()->SetTransitionOpacity(ArkUI_AnimationCurve::ARKUI_CURVE_EASE, DURATION);
  }else if(this->animationType == "slide"){
    GetLocalRootArkUINode()->SetTransitionMove(ArkUI_TransitionEdge::ARKUI_TRANSITION_EDGE_BOTTOM,DURATION);
  }else if(this->animationType == "slide_fade"){
    GetLocalRootArkUINode()->SetTransitionOpacity(ArkUI_AnimationCurve::ARKUI_CURVE_EASE, DURATION);
    GetLocalRootArkUINode()->SetTransitionMove(ArkUI_TransitionEdge::ARKUI_TRANSITION_EDGE_BOTTOM,DURATION);
  }
  BaseView::OnSetPropsEndImpl();
}

void ModalView::UpdateRenderViewFrameImpl(const HRRect &frame, const HRPadding &padding){
//should overwrite this function ,but do nothing, size will change in OnAreaChange
  FOOTSTONE_DLOG(INFO)<<__FUNCTION__<<" frame("<<(int)frame.x<<","<<(int)frame.y<<","<<(int)frame.width<<","<<(int)frame.height<<")";
}

void ModalView::OnChildInsertedImpl(std::shared_ptr<BaseView> const &childView, int index){
  BaseView::OnChildInsertedImpl(childView, index);
  if(childView) {
     GetLocalRootArkUINode()->InsertChild(childView->GetLocalRootArkUINode(), index);
  }
}

void ModalView::OnChildRemovedImpl(std::shared_ptr<BaseView> const &childView, int32_t index){
  BaseView::OnChildRemovedImpl(childView, index);
  if(childView) {
    GetLocalRootArkUINode()->RemoveChild(childView->GetLocalRootArkUINode());
  }
}

void ModalView::Show() {
  CreateArkUINode(false);
  OpenDialog();
}

void ModalView::OpenDialog() {
  if (!dialog_) {
    dialog_ = std::make_shared<DialogController>();
  }
  if(this->transparent) {
    dialog_->SetBackgroundColor(0x00000000);
  }
  dialog_->EnableCustomAnimation(true);
  dialog_->EnableCustomStyle(true);
  dialog_->SetAutoCancel(true);
  dialog_->SetContentAlignment(ArkUI_Alignment::ARKUI_ALIGNMENT_TOP_START, 0, 0);
  dialog_->SetCornerRadius(0, 0, 0, 0);
  dialog_->SetModalMode(true);
  dialog_->SetContent(GetLocalRootArkUINode()->GetArkUINodeHandle());
  dialog_->Show();
  HREventUtils::SendComponentEvent(GetCtx(), GetTag(),HREventUtils::EVENT_MODAL_SHOW, nullptr);

  if(this->transparent) {
    GetLocalRootArkUINode()->SetBackgroundColor(0x00000000);
  }
  GetLocalRootArkUINode()->SetSizePercent(HRSize(1.f,1.f));
  GetLocalRootArkUINode()->SetExpandSafeArea();//TODO will update when NODE_EXPAND_SAFE_AREA add in sdk
}

void ModalView::CloseDialog() {
  if (!dialog_) {
    return;
  }
  dialog_->RemoveContent();
  dialog_->Close();
  dialog_.reset();
  HREventUtils::SendComponentEvent(GetCtx(), GetTag(),HREventUtils::EVENT_MODAL_REQUEST_CLOSE, nullptr);
}

void ModalView::OnAreaChange(ArkUI_NumberValue* data) {
  if(GetLocalRootArkUINode()->GetTotalChildCount() == 0){
    FOOTSTONE_DLOG(INFO)<<__FUNCTION__<<" no child" ;
    return;
  }
  float_t width = data[6].f32;
  float_t height = data[7].f32;
  ctx_->GetNativeRender().lock()->OnSizeChanged2(ctx_->GetRootId(), tag_, width, height, false);
}

} // namespace native
} // namespace render
} // namespace hippy
