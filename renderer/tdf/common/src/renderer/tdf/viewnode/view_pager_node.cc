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

#include "renderer/tdf/viewnode/view_pager_node.h"

#include "footstone/logging.h"

namespace tdfrender {

enum class FunctionType {
  kFunctionSetPage,
  kFunctionSetPageWithoutAnimation,
  kFunctionSetIndex,
  kFunctionNextPage,
  kFunctionPrevPage
};

void ViewPagerNode::OnChildAdd(const std::shared_ptr<ViewNode>& child, int64_t index) {
  ViewNode::OnChildAdd(child, index);
}

void ViewPagerNode::HandleStyleUpdate(const DomStyleMap& dom_style) {
  ViewNode::HandleStyleUpdate(dom_style);
  auto view_pager = GetView<ViewPager>();

  InitialPage(dom_style, view_pager);
  SetOverFlow(dom_style);
  SetScrollEnable(dom_style, view_pager);
  SetPageMargin(dom_style, view_pager);
  SetDirection(dom_style, view_pager);
  ParsePageScrollStateChangedAttr(dom_style);
}

std::shared_ptr<tdfcore::View> ViewPagerNode::CreateView() {
  auto view_pager = TDF_MAKE_SHARED(ViewPager);
  return view_pager;
}

void ViewPagerNode::CallFunction(const std::string& function_name, const DomArgument& param,
                                 const uint32_t call_back_id) {
  static std::map<std::string, FunctionType> function_map = {
      {kSetPage, FunctionType::kFunctionSetPage},
      {kSetPageWithoutAnimation, FunctionType::kFunctionSetPageWithoutAnimation},
      {kSetIndex, FunctionType::kFunctionSetIndex},
      {kNext, FunctionType::kFunctionNextPage},
      {kPrev, FunctionType::kFunctionPrevPage},
  };
  auto view_pager = GetView<ViewPager>();
  footstone::HippyValue value;
  param.ToObject(value);
  auto index = value.ToArrayChecked().at(0).ToDoubleChecked();
  FOOTSTONE_LOG(INFO) << "CallFunction index = " << index;
  if (function_map.find(function_name) != function_map.end() && view_pager) {
    auto type = function_map.at(function_name);
    switch (type) {
      case FunctionType::kFunctionSetPage:
        view_pager->SwitchToPage(index, true);
        break;
      case FunctionType::kFunctionSetPageWithoutAnimation:
        view_pager->SwitchToPage(index, false);
        break;
      case FunctionType::kFunctionSetIndex:
        view_pager->SetCurrentPage(index);
        break;
      case FunctionType::kFunctionNextPage:
        view_pager->SwitchNextPage();
        break;
      case FunctionType::kFunctionPrevPage:
        view_pager->SwitchPrevPage();
        break;
      default:
        break;
    }
  }
}

void ViewPagerNode::InitialPage(const DomStyleMap& dom_style, std::shared_ptr<ViewPager> view_pager) {
  if (auto iterator = dom_style.find(viewpager::kInitialPage); iterator != dom_style.end()) {
    view_pager->SetInitialPage(iterator->second->ToDoubleChecked());
  }
}

void ViewPagerNode::HandleEventInfoUpdate() {
  /// TODO(kloudwang) infinite loop scroll
  auto supported_events = GetSupportedEvents();
  if (auto iterator = supported_events.find(kOnPageSelected); iterator != supported_events.end()) {
    has_on_page_selected_event_ = true;
  }
  if (auto iterator = supported_events.find(kOnPageScroll); iterator != supported_events.end()) {
    has_on_page_scroll_event_ = true;
  }
  UpdatePagerCallBack(GetView<ViewPager>());
}

void ViewPagerNode::SetOverFlow(const DomStyleMap& dom_style) {
  if (auto iterator = dom_style.find(viewpager::kOverflow); iterator != dom_style.end()) {
    auto over_flow = iterator->second->ToStringChecked();
    if (over_flow == kOverFlowHidden) {
      // todo(kloudwang)不可以超出父区域
    } else {
      // todo(kloudwang)可以超出父区域
    }
  }
}

void ViewPagerNode::SetScrollEnable(const DomStyleMap& dom_style, std::shared_ptr<ViewPager> view_pager) {
  if (auto iterator = dom_style.find(viewpager::kScrollEnabled); iterator != dom_style.end()) {
    view_pager->SetScrollEnabled(iterator->second->ToBooleanChecked());
  }
}

void ViewPagerNode::SetPageMargin(const DomStyleMap& dom_style, std::shared_ptr<ViewPager> view_pager) {
  if (auto iterator = dom_style.find(viewpager::kPageMargin); iterator != dom_style.end()) {
    view_pager->SetPageMargin(iterator->second->ToDoubleChecked());
  }
}

void ViewPagerNode::SetDirection(const DomStyleMap& dom_style, std::shared_ptr<ViewPager> view_pager) {
  //默认横向滑动
  view_pager->SetAxis(ScrollAxis::kHorizontal);
  if (auto iterator = dom_style.find(kDirection); iterator != dom_style.end()) {
    if (iterator->second->ToStringChecked() == kVertical) {
      view_pager->SetAxis(ScrollAxis::kVertical);
    }
  }
}

void ViewPagerNode::ParsePageScrollStateChangedAttr(const DomStyleMap& dom_style) {
  if (auto iterator = dom_style.find(kOnPageScrollStateChanged); iterator != dom_style.end()) {
    has_on_page_scroll_state_changed_event_ = iterator->second->ToBooleanChecked();
  }
}

void ViewPagerNode::UpdatePagerCallBack(std::shared_ptr<ViewPager> view_pager) {
  ScrollOffsetListener offset_listener = [this](int32_t position, double offset) {
    HandleOffsetListener(position, offset);
  };
  PageSelectedListener selected_listener = [this](int32_t position) { HandleSelectedListener(position); };
  ScrollStateChangedListener state_changed_listener = [this](std::string old_state, std::string new_state) {
    HandleStateChangedListener(new_state);
  };
  if (view_pager != nullptr) {
    view_pager->SetScrollOffsetListener(has_on_page_scroll_event_ ? offset_listener : nullptr);
    view_pager->SetPageSelectedListener(has_on_page_selected_event_ ? selected_listener : nullptr);
    view_pager->SetScrollStateChangedListener(has_on_page_scroll_state_changed_event_ ? state_changed_listener
                                                                                      : nullptr);
  }
}

void ViewPagerNode::HandleOffsetListener(int32_t position, double offset) {
  FOOTSTONE_DCHECK(has_on_page_scroll_event_);
  DomValueObjectType param;
  param[kPosition] = position;
  param[kOffset] = offset;
  SendUIDomEvent(kOnPageScroll, std::make_shared<footstone::HippyValue>(param));
}

void ViewPagerNode::HandleSelectedListener(int32_t position) {
  FOOTSTONE_DCHECK(has_on_page_selected_event_);
  DomValueObjectType param;
  param[kPosition] = position;
  SendUIDomEvent(kOnPageSelected, std::make_shared<footstone::HippyValue>(param));
}

void ViewPagerNode::HandleStateChangedListener(std::string state) {
  FOOTSTONE_DCHECK(has_on_page_scroll_state_changed_event_);
  DomValueObjectType param;
  param[kPageScrollState] = state;
  SendUIDomEvent(kOnPageScrollStateChanged, std::make_shared<footstone::HippyValue>(param));
}

}  // namespace tdfrender
