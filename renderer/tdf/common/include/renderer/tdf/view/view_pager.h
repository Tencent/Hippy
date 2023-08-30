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

#include <string>
#include <vector>

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
#include "core/support/animation/ticker.h"
#include "core/support/physics/scroll_physics.h"
#include "tdfui/view/scroll_view.h"
#include "tdfui/view/view.h"
#include "tdfui/view/view_context.h"
#pragma clang diagnostic pop

namespace hippy {
inline namespace render {
inline namespace tdf {
inline namespace view {

using tdfcore::ScrollView;
using tdfcore::ViewContext;

using ScrollOffsetListener = std::function<void(int32_t position, double offset)>;
using PageSelectedListener = std::function<void(int32_t position)>;
using ScrollStateChangedListener = std::function<void(std::string old_state, std::string new_state)>;

enum class ScrollStateType { kScrollStateIdle, kScrollStateDragging, kScrollStateSettling };
const std::unordered_map<ScrollStateType, std::string> kScrollStateMap = {
    {ScrollStateType::kScrollStateIdle, "idle"},
    {ScrollStateType::kScrollStateDragging, "dragging"},
    {ScrollStateType::kScrollStateSettling, "settling"}};

enum class ScrollAxis {
  kNone,
  kHorizontal,
  kVertical,
};

class ViewPager : public ScrollView {
  TDF_REFF_CLASS_META(ViewPager)

 public:
  ViewPager(const std::shared_ptr<ViewContext> &context);

  void Init() override;

  /**
   * @brief layout component
   */
  void Layout() override;

  /**
   * @brief set init value of component page item index
   * @param initial_page
   */
  void SetInitialPage(int32_t initial_page) { current_page_ = initial_page; }

  /**
   * @brief set current value of component page item index
   * @param page
   */
  void SetCurrentPage(int32_t page);

  /**
   * @brief get current component page item index
   * @return index
   */
  constexpr int32_t GetCurrentPage() const { return current_page_; }

  /**
   * @brief layout child component
   */
  void LayoutChildrenFrame();

  /**
   * @brief set margin of current page
   * @param margin
   */
  void SetPageMargin(float margin) { page_margin_ = margin; }

  /**
   * @brief get margin of current page
   * @return margin
   */
  constexpr float GetPageMargin() const { return page_margin_; }

  /**
   * @brief set scroll axis
   * @param axis
   */
  void SetAxis(ScrollAxis axis);

  /**
   * @brief get scroll axis
   * @return scroll axis
   */
  constexpr ScrollAxis GetAxis() const { return axis_; }

  constexpr inline bool IsHorizontal() const { return axis_ == ScrollAxis::kHorizontal; }

  constexpr inline bool IsVertical() const { return axis_ == ScrollAxis::kVertical; }

  /**
   * @brief set scroll offset listener
   * @param offsetListener
   */
  void SetScrollOffsetListener(const ScrollOffsetListener &offsetListener) { offset_listener_ = offsetListener; }

  /**
   * @brief get scroll offset listener
   */
  constexpr const ScrollOffsetListener &GetScrollOffsetListener() const { return offset_listener_; }

  /**
   * @brief set page selected listener
   * @param selectedListener
   */
  void SetPageSelectedListener(const PageSelectedListener &selectedListener) { selected_listener_ = selectedListener; }

  /**
   * @brief get page selected listener
   * @return selected_listener_
   */
  constexpr const PageSelectedListener &GetPageSelectedListener() const { return selected_listener_; }

  /**
   * @brief set page switch state listener
   * @param stateChangedListener
   */
  void SetScrollStateChangedListener(const ScrollStateChangedListener &stateChangedListener) {
    state_changed_listener_ = stateChangedListener;
  }

  /**
   * @brief get page switch state listener
   * @return state_changed_listener_
   */
  constexpr const ScrollStateChangedListener &GetScrollStateChangedListener() const { return state_changed_listener_; }

  void SwitchToPage(int32_t index, bool animated);

  /**
   * @brief scroll to next page
   */
  void SwitchNextPage();

  /**
   * @brief scroll to pre page
   */
  void SwitchPrevPage();

 private:
  /**
   * scroll to target page
   */
  void ScrollTo(int32_t target, bool animated = true);

  void SetScrollStateType(ScrollStateType state);

  void UpdateCurrentPage(int32_t page);

  int32_t CalculateCurrentPage();

  ScrollAxis axis_ = ScrollAxis::kNone;

  float content_extent_size_ = 0.0;
  int32_t current_page_ = 0;
  float page_margin_ = 0;

  bool has_draged_ = false;

  ScrollOffsetListener offset_listener_;
  PageSelectedListener selected_listener_;
  ScrollStateChangedListener state_changed_listener_;
  ScrollStateType scroll_state_ = ScrollStateType::kScrollStateIdle;

  FRIEND_OF_TDF_ALLOC
};

}  // namespace view
}  // namespace tdf
}  // namespace render
}  // namespace hippy

TDF_REFL_DEFINE(hippy::render::tdf::view::ViewPager, bases<tdfcore::View>)
TDF_REFL_END(tdf::view::ViewPager)
