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

namespace hippy {
inline namespace render {
inline namespace tdf {

void ViewPagerNode::OnChildAdd(const std::shared_ptr<ViewNode>& child, int64_t index) {
  ViewNode::OnChildAdd(child, index);
  child->SetUseViewLayoutOrigin(true);
}

void ViewPagerNode::HandleStyleUpdate(const DomStyleMap& dom_style) {
  ViewNode::HandleStyleUpdate(dom_style);
  auto view_pager = GetView<ViewPager>();

  InitialPage(dom_style, view_pager);
  SetScrollEnable(dom_style, view_pager);
  SetPageMargin(dom_style, view_pager);
  SetDirection(dom_style, view_pager);
}

std::shared_ptr<tdfcore::View> ViewPagerNode::CreateView() {
  auto view_pager = TDF_MAKE_SHARED(ViewPager);
  return view_pager;
}

void ViewPagerNode::CallFunction(const std::string& function_name, const DomArgument& param,
                                 const uint32_t call_back_id) {
  ViewNode::CallFunction(function_name, param, call_back_id);
  auto view_pager = GetView<ViewPager>();
  footstone::HippyValue value;
  param.ToObject(value);
  footstone::value::HippyValue::DomValueArrayType dom_value_array;
  auto result = value.ToArray(dom_value_array);
  FOOTSTONE_CHECK(result);
  if (!result) {
    return;
  }
  auto index = dom_value_array.at(0).ToInt32Checked();
  FOOTSTONE_LOG(INFO) << "CallFunction index = " << index;
  if (function_name == kSetPage) {
    view_pager->SwitchToPage(index, true);
  } else if (function_name == kSetPageWithoutAnimation) {
    view_pager->SwitchToPage(index, false);
  } else if (function_name == kSetIndex) {
    view_pager->SetCurrentPage(index);
  } else if (function_name == kNext) {
    view_pager->SwitchNextPage();
  } else if (function_name == kPrev) {
    view_pager->SwitchPrevPage();
  } else {
    FOOTSTONE_UNREACHABLE();
  }
}

void ViewPagerNode::InitialPage(const DomStyleMap& dom_style, std::shared_ptr<ViewPager> view_pager) {
  if (auto iterator = dom_style.find(viewpager::kInitialPage); iterator != dom_style.end()) {
    auto init_page = static_cast<int32_t>(iterator->second->ToDoubleChecked());
    view_pager->SetInitialPage(init_page);
  }
}

void ViewPagerNode::HandleEventInfoUpdate() {
  auto supported_events = GetSupportedEvents();
  if (auto iterator = supported_events.find(kOnPageSelected); iterator != supported_events.end()) {
    has_on_page_selected_event_ = true;
  }
  if (auto iterator = supported_events.find(kOnPageScroll); iterator != supported_events.end()) {
    has_on_page_scroll_event_ = true;
  }
  if (auto iterator = supported_events.find(kOnPageScrollStateChanged); iterator != supported_events.end()) {
    has_on_page_scroll_state_changed_event_ = true;
  }
  UpdatePagerCallBack(GetView<ViewPager>());
}

void ViewPagerNode::SetScrollEnable(const DomStyleMap& dom_style, std::shared_ptr<ViewPager> view_pager) {
  if (auto iterator = dom_style.find(viewpager::kScrollEnabled); iterator != dom_style.end()) {
    view_pager->SetScrollEnabled(iterator->second->ToBooleanChecked());
  }
}

void ViewPagerNode::SetPageMargin(const DomStyleMap& dom_style, std::shared_ptr<ViewPager> view_pager) {
  if (auto iterator = dom_style.find(viewpager::kPageMargin); iterator != dom_style.end()) {
    view_pager->SetPageMargin(static_cast<float>(iterator->second->ToDoubleChecked()));
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

}  // namespace tdf
}  // namespace render
}  // namespace hippy
