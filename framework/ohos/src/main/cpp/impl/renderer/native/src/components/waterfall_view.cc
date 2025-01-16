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

#include "renderer/components/waterfall_view.h"
#include "renderer/components/rich_text_view.h"
#include "renderer/utils/hr_pixel_utils.h"
#include "renderer/utils/hr_value_utils.h"
#include "renderer/native_render_provider.h"
#include "renderer/components/waterfall_item_view.h"

namespace hippy {
inline namespace render {
inline namespace native {

WaterfallView::WaterfallView(std::shared_ptr<NativeRenderContext> &ctx) : BaseView(ctx) {
}

WaterfallView::~WaterfallView() {
  if (stackNode_) {
    stackNode_->UnregisterAppearEvent();
    stackNode_->UnregisterDisappearEvent();
  }
  if (!children_.empty()) {
    if (GetLocalRootArkUINode()) {
      for (const auto &child : children_) {
        GetLocalRootArkUINode()->RemoveChild(child->GetLocalRootArkUINode());
      }
    }
    children_.clear();
  }
}

ArkUINode *WaterfallView::GetLocalRootArkUINode() { return stackNode_.get();}

void WaterfallView::CreateArkUINodeImpl() {
  stackNode_ = std::make_shared<StackNode>();
  listNode_ = std::make_shared<ListNode>();
  colInnerNode_ = std::make_shared<ColumnNode>();
  flowListNode_ = std::make_shared<ListItemNode>();
  flowNode_ = std::make_shared<WaterFlowNode>();
  bannerListNode_ = std::make_shared<ListItemNode>();

  stackNode_->RegisterAppearEvent();
  stackNode_->RegisterDisappearEvent();
  stackNode_->SetArkUINodeDelegate(this);
  flowNode_->SetNodeDelegate(this);
  listNode_->SetNodeDelegate(this);
}

void WaterfallView::DestroyArkUINodeImpl() {
  stackNode_->SetArkUINodeDelegate(nullptr);
  flowNode_->SetNodeDelegate(nullptr);
  listNode_->SetNodeDelegate(nullptr);

  stackNode_ = nullptr;
  listNode_ = nullptr;
  colInnerNode_ = nullptr;
  flowListNode_ = nullptr;
  flowNode_ = nullptr;
  bannerListNode_ = nullptr;
}

bool WaterfallView::SetPropImpl(const std::string &propKey, const HippyValue &propValue) {
  if (propKey == "bounces") {
    int32_t type = HRValueUtils::GetInt32(propValue, 0);
    if(type == 0)
      this->edgeEffect_ = ArkUI_EdgeEffect::ARKUI_EDGE_EFFECT_SPRING;
    else if (type == 1)
      this->edgeEffect_ = ArkUI_EdgeEffect::ARKUI_EDGE_EFFECT_FADE;
    else if(type == 2)
      this->edgeEffect_ = ArkUI_EdgeEffect::ARKUI_EDGE_EFFECT_NONE;
    return true;
  } else if (propKey == "contentInset") {
    HippyValueObjectType data;
    if(propValue.ToObject(data)){
       this->padding_.paddingTop = HRValueUtils::GetFloat(data["top"]);
       this->padding_.paddingBottom = HRValueUtils::GetFloat(data["bottom"]);
       this->padding_.paddingLeft = HRValueUtils::GetFloat(data["left"]);
       this->padding_.paddingRight = HRValueUtils::GetFloat(data["right"]);
    }else{
       this->padding_= HRPadding(0,0,0,0);
    }
    return true;
  } else if (propKey == "scrollEventThrottle") {
    this->scrollEventThrottle_ = HRValueUtils::GetFloat(propValue, 30);
    return true;
  } else if (propKey == "preloadItemNumber") {
    this->preloadItemNumber_ = HRValueUtils::GetInt32(propValue);
    return true;
  } else if (propKey == "interItemSpacing") {
    this->interItemSpacing_ = HRValueUtils::GetFloat(propValue,0);
    return true;
  } else if (propKey == "columnSpacing") {
    this->columnSpacing_ = HRValueUtils::GetFloat(propValue, 0);
    return true;
  } else if (propKey == "numberOfColumns") {
    int  columns = (int)HRValueUtils::GetDouble(propValue,2);
    this->columnsTemplate_ = "1fr";
    for(int i = 1 ; i < columns ; i++){
       this->columnsTemplate_ += " 1fr";
    }
    return true;
  } else if (propKey == "scroll") {
    scrollEnable_ = HRValueUtils::GetBool(propValue, false);
    return true;
  } else if (propKey == "endreached") {
    return true;
  }
  return BaseView::SetPropImpl(propKey, propValue);
}

void WaterfallView::OnSetPropsEndImpl(){
  return BaseView::OnSetPropsEndImpl();
}

void WaterfallView::Init() {
  BaseView::Init();
  auto weak_view = weak_from_this();
  end_batch_callback_id_ = ctx_->GetNativeRender().lock()->AddEndBatchCallback(ctx_->GetRootId(), [weak_view]() {
    auto view = weak_view.lock();
    if (view) {
      auto waterfallView = std::static_pointer_cast<WaterfallView>(view);
      waterfallView->CheckInitListReadyNotify();
    }
  });
}

void WaterfallView::HandleOnChildrenUpdated() {
  colInnerNode_->SetPadding(
    HRPixelUtils::DpToVp(this->padding_.paddingTop),
    HRPixelUtils::DpToVp(this->padding_.paddingRight),
    HRPixelUtils::DpToVp(this->padding_.paddingBottom),
    HRPixelUtils::DpToVp(this->padding_.paddingLeft));
  flowNode_->SetWidthPercent(1.0);
  flowNode_->SetScrollEdgeEffect(this->edgeEffect_);
  flowNode_->SetColumnGap(this->columnSpacing_);
  flowNode_->SetRowGap(this->interItemSpacing_);
  flowNode_->SetColumnsTemplate(this->columnsTemplate_);
  flowNode_->SetCachedCount(4);
  flowNode_->SetScrollEnableInteraction(true);
  flowNode_->SetNestedScroll(ARKUI_SCROLL_NESTED_MODE_PARENT_FIRST, ARKUI_SCROLL_NESTED_MODE_SELF_FIRST);
  stackNode_->AddChild(colInnerNode_.get());
  colInnerNode_->AddChild(listNode_.get());
  if(this->bannerView)
    this->bannerView->GetLocalRootArkUINode()->SetPosition(HRPosition(0,0));

  if (headerView){
    listNode_->InsertChild(headerView->GetLocalRootArkUINode(),0);
    listNode_->InsertChild(bannerListNode_.get(), 1);
    headerView->GetLocalRootArkUINode()->SetNodeDelegate(this);
    headerView->GetLocalRootArkUINode()->SetItemIndex(0);
    listNode_->ScrollToIndex(1, true, true);
  }
  else{
    listNode_->InsertChild(bannerListNode_.get(), 0);
    listNode_->ScrollToIndex(0, true, true);
  }

  listNode_->AddChild(flowListNode_.get());
  flowListNode_->AddChild(flowNode_.get());
  if(footerView) {
    listNode_->AddChild(footerView->GetLocalRootArkUINode());
    footerView->GetLocalRootArkUINode()->SetWidthPercent(1.0);
    footerView->Show(false);
    footerView->GetLocalRootArkUINode()->SetNodeDelegate(this);
    lastScrollIndex_ = (int32_t)listNode_->GetTotalChildCount()-1;
    footerView->GetLocalRootArkUINode()->SetItemIndex(lastScrollIndex_);
    UpdateFooterView();
  }
}

void WaterfallView::OnChildInsertedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) {
  if(childView->GetViewType() == "PullHeaderView") {
    this->headerView = std::dynamic_pointer_cast<PullHeaderView>(childView);
  } else if(childView->GetViewType() == "PullFooterView") {
    this->footerView = std::dynamic_pointer_cast<PullFooterView>(childView);
  } else if (childView->GetViewType() == "View") {
      if (!this->bannerView) {
        this->bannerView = std::dynamic_pointer_cast<DivView>(childView);
        if(this->bannerView){
          bannerListNode_->AddChild(this->bannerView->GetLocalRootArkUINode());
        }
     }
  } else if (childView->GetViewType() == "WaterfallItem") {
      auto flowItem = std::dynamic_pointer_cast<WaterfallItemView>(childView);
      flowItem->GetLocalRootArkUINode()->SetNodeDelegate(this);
      flowItem->GetLocalRootArkUINode()->SetItemIndex(index);
      flowNode_->AddChild(childView->GetLocalRootArkUINode());
  } else {
      FOOTSTONE_DLOG(INFO) << __FUNCTION__ << " new child index = " << index;
  }
}

void WaterfallView::OnChildRemovedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) {
  BaseView::OnChildRemovedImpl(childView, index);
  flowNode_->RemoveChild(childView->GetLocalRootArkUINode());
}

void WaterfallView::UpdateRenderViewFrameImpl(const HRRect &frame, const HRPadding &padding) {
  BaseView::UpdateRenderViewFrameImpl(frame, padding);
  width_ = frame.width;
  height_ = frame.height;
}

void WaterfallView::CallImpl(const std::string &method, const std::vector<HippyValue> params,
              std::function<void(const HippyValue &result)> callback){
  FOOTSTONE_DLOG(INFO)<<__FUNCTION__<<" method = "<<method;
  if(method == "scrollToIndex"){
    int32_t index = HRValueUtils::GetInt32(params[1]);
    bool animate = HRValueUtils::GetBool(params[2], false);
    flowNode_->ScrollToIndex(index, animate);
  } else if (method == "scrollToContentOffset") {

  } else if (method == "scrollToTop"){
    listNode_->ScrollToIndex(1, true,true);
  } else {
    BaseView::CallImpl(method, params, callback);
  }
}

void WaterfallView::OnWaterFlowScrollIndex(int32_t firstIndex, int32_t lastIndex){

}

void WaterfallView::OnWaterFlowDidScroll(float_t offset, ArkUI_ScrollState state){
  FOOTSTONE_DLOG(INFO)<<__FUNCTION__;
}

void WaterfallView::OnWaterFlowWillScroll(float_t offset, ArkUI_ScrollState state, int32_t source){
  FOOTSTONE_DLOG(INFO)<<__FUNCTION__;

}

void WaterfallView::OnScrollIndex(int32_t firstIndex, int32_t lastIndex, int32_t centerIndex){

}

void WaterfallView::OnScroll(float scrollOffsetX, float scrollOffsetY) {
  auto offset = listNode_->GetScrollOffset();
  HippyValueObjectType params;
  if(headerView && headerVisible){
    if(isDragging_){
      params["contentOffset"] = HRPixelUtils::VpToDp(-offset.y+headerView->GetHeight());
      HREventUtils::SendComponentEvent(headerView->GetCtx(), headerView->GetTag(),
                                       HREventUtils::EVENT_PULL_HEADER_PULLING, std::make_shared<HippyValue>(params));
    } else{
      HREventUtils::SendComponentEvent(headerView->GetCtx(), headerView->GetTag(),
                                       HREventUtils::EVENT_PULL_HEADER_RELEASED, nullptr);
    }
  }
  if(footerView && footerVisible)
     UpdateFooterView();
}

void WaterfallView::OnWillScroll(float offset, ArkUI_ScrollState state){
  if (offset > 0) {
    if (footerView) {
      footerView->Show(true);
    }
  }
}

void WaterfallView::OnTouch(int32_t actionType, const HRPosition &screenPosition){
  BaseView::OnTouch(actionType, screenPosition);

//  FOOTSTONE_DLOG(INFO)<<__FUNCTION__<<" actionType = "<<actionType;
  if (actionType == UI_TOUCH_EVENT_ACTION_DOWN || actionType == UI_TOUCH_EVENT_ACTION_MOVE) {
    if(!isDragging_)
      isDragging_ = true;
  } else if (actionType == UI_TOUCH_EVENT_ACTION_UP || actionType == UI_TOUCH_EVENT_ACTION_CANCEL) {
    if(isDragging_)
      isDragging_ = false;
  }
}

void WaterfallView::OnAppear() {
  HandleOnChildrenUpdated();
}

void WaterfallView::OnDisappear() {
  ctx_->GetNativeRender().lock()->RemoveEndBatchCallback(ctx_->GetRootId(), end_batch_callback_id_);
}

void WaterfallView::OnFlowItemVisibleAreaChange(int32_t index, bool isVisible, float currentRatio){

}

void WaterfallView::OnItemVisibleAreaChange(int32_t index, bool isVisible, float currentRatio){
//  FOOTSTONE_DLOG(INFO)<<__FUNCTION__<<" index = "<<index<<" isvisible = "<<isVisible;
  if(headerView && index == 0){
    if(isVisible){
      headerVisible = true;
    } else{
      headerVisible = false;
    }
  }
  if(footerView && index == lastScrollIndex_){
    if(isVisible){
      footerVisible = true;
    } else{
      footerVisible = false;
    }
  }
}

void WaterfallView::OnFlowItemClick(int32_t index){
  FOOTSTONE_DLOG(INFO)<<__FUNCTION__<<" index = "<<index;
}

void WaterfallView::OnHeadRefreshFinish(int32_t delay){
  FOOTSTONE_DLOG(INFO)<<__FUNCTION__<<" delay = "<<delay;
  if(delay > 0 ){
    //TODO setTimeout(delay)
    listNode_->ScrollToIndex(1, true, true);
  }
}

void WaterfallView::OnHeadRefresh(){
  FOOTSTONE_DLOG(INFO)<<__FUNCTION__;
}

void WaterfallView::SendOnReachedEvent(){
  FOOTSTONE_DLOG(INFO)<<__FUNCTION__;
  HREventUtils::SendComponentEvent(ctx_, tag_, HREventUtils::EVENT_RECYCLER_END_REACHED, nullptr);
  HREventUtils::SendComponentEvent(ctx_, tag_, HREventUtils::EVENT_RECYCLER_LOAD_MORE, nullptr);
}

void WaterfallView::OnScrollStart() {
   FOOTSTONE_DLOG(INFO)<<__FUNCTION__;
}

void WaterfallView::OnScrollStop() {
  FOOTSTONE_DLOG(INFO)<<__FUNCTION__;
}

void WaterfallView::OnReachStart() {
}

void WaterfallView::OnReachEnd() {
  FOOTSTONE_DLOG(INFO)<<__FUNCTION__;
  SendOnReachedEvent();
  UpdateFooterView();
}

void WaterfallView::UpdateFooterView(){
  if(footerView){
    auto childrens = footerView->GetChildren();
    for(uint64_t i = 0; i < childrens.size();i++) {
      if(childrens[i]->GetViewType() == "Text"){
         auto textView = std::dynamic_pointer_cast<RichTextView>(childrens[i]);
         if(textView)
            textView->GetLocalRootArkUINode()->SetPosition(HRPosition(0,0));
      }
    }
  }
}

void WaterfallView::CheckInitListReadyNotify() {
  if (!isInitListReadyNotified) {
    HREventUtils::SendComponentEvent(ctx_, tag_, HREventUtils::EVENT_RECYCLER_LIST_READY, nullptr);
    isInitListReadyNotified = true;
  }
}

} // namespace native
} // namespace render
} // namespace hippy
