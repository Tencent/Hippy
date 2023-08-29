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

#include "renderer/tdf/view/view_pager.h"
#include "renderer/tdf/viewnode/scroll_view_node.h"

namespace hippy {
inline namespace render {
inline namespace tdf {

inline namespace viewpager {
constexpr const char kViewPager[] = "ViewPager";
constexpr const char kInitialPage[] = "initialPage";      // int
constexpr const char kOverflow[] = "overflow";            // String
constexpr const char kPageMargin[] = "pageMargin";        // float
constexpr const char kScrollEnabled[] = "scrollEnabled";  // boolean
constexpr const char kDirection[] = "direction";
constexpr const char kOnPageScroll[] = "pagescroll";
constexpr const char kOnPageSelected[] = "pageselected";
constexpr const char kOnPageScrollStateChanged[] = "pagescrollstatechanged";
constexpr const char kVertical[] = "vertical";
constexpr const char kOverFlowVisible[] = "visible";
constexpr const char kOverFlowHidden[] = "hidden";
constexpr const char kPosition[] = "position";
constexpr const char kSetPage[] = "setPage";
constexpr const char kSetPageWithoutAnimation[] = "setPageWithoutAnimation";
constexpr const char kSetIndex[] = "setIndex";
constexpr const char kNext[] = "next";
constexpr const char kPrev[] = "prev";
constexpr const char kOffset[] = "offset";
constexpr const char kPageScrollState[] = "pageScrollState";
}  // namespace viewpager

class ViewPagerNode : public ScrollViewNode {
 public:
  using ScrollViewNode::ScrollViewNode;
  ~ViewPagerNode() override = default;

  void OnChildAdd(const std::shared_ptr<ViewNode>& child, int64_t index) override;
  void HandleStyleUpdate(const DomStyleMap& dom_style, const DomDeleteProps& dom_delete_props) override;
  std::shared_ptr<tdfcore::View> CreateView(const std::shared_ptr<ViewContext> &context) override;
  void CallFunction(const std::string& function_name, const DomArgument& param, const uint32_t call_back_id) override;

 protected:
  void HandleEventInfoUpdate() override;
  void HandleLayoutUpdate(hippy::LayoutResult layout_result) override;
  void OnAttach() override;
  void OnDetach() override;

 private:
  void InitialPage(const DomStyleMap& dom_style, std::shared_ptr<ViewPager> view_pager);
  void SetOverFlow(const DomStyleMap& dom_style);
  void SetScrollEnable(const DomStyleMap& dom_style, std::shared_ptr<ViewPager> view_pager);
  void SetDirection(const DomStyleMap& dom_style, std::shared_ptr<ViewPager> view_pager);
  void SetPageMargin(const DomStyleMap& dom_style, std::shared_ptr<ViewPager> view_pager);
  void ParsePageScrollStateChangedAttr(const DomStyleMap& dom_style);

  void UpdatePagerCallBack(std::shared_ptr<ViewPager> view_pager);
  void HandleOffsetListener(int32_t position, double offset);
  void HandleSelectedListener(int32_t position);
  void HandleStateChangedListener(std::string state);

  bool has_on_page_scroll_event_ = false;
  bool has_on_page_selected_event_ = false;
  bool has_on_page_scroll_state_changed_event_ = false;

  uint64_t batch_end_listener_id_ = 0;
  bool has_layout_ = false;
};

}  // namespace tdf
}  // namespace render
}  // namespace hippy
