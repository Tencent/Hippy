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

#include "renderer/tdf/view/view_pager.h"

#include "core/common/point.h"
#include "core/common/rect.h"
#include "core/common/scalar.h"

namespace hippy {
inline namespace render {
inline namespace tdf {
inline namespace view {

using tdfcore::TPoint;
using tdfcore::TRect;
using tdfcore::TScalar;

ViewPager::ViewPager(const std::shared_ptr<ViewContext> &context) : tdfcore::ScrollView(context) {}

void ViewPager::Init() {
  ScrollView::Init();

  auto physics = std::static_pointer_cast<tdfcore::DefaultScrollPhysics>(GetScrollPhysics());
  physics->SetPagingEnabled(true);

  AddScrollUpdateListener([WEAK_THIS](TPoint before, TPoint after) {
    DEFINE_AND_CHECK_SELF(ViewPager)
    if (self->offset_listener_) {
      auto main_axis_offset = self->IsHorizontal() ? (after.x - before.x) : (after.y - after.y);
      self->offset_listener_(self->current_page_, main_axis_offset);
    }
  });

  AddDragStartListener([WEAK_THIS]() {
    DEFINE_AND_CHECK_SELF(ViewPager)
    self->SetScrollStateType(ScrollStateType::kScrollStateDragging);
  });

  AddDragEndListener([WEAK_THIS]() {
    DEFINE_AND_CHECK_SELF(ViewPager)
    self->SetScrollStateType(ScrollStateType::kScrollStateSettling);
  });

  AddScrollStartListener([WEAK_THIS]() {
    DEFINE_AND_CHECK_SELF(ViewPager)
    if (self->scroll_state_ == ScrollStateType::kScrollStateDragging) {
      return;
    }
    self->SetScrollStateType(ScrollStateType::kScrollStateSettling);
  });

  AddScrollEndListener([WEAK_THIS]() {
    DEFINE_AND_CHECK_SELF(ViewPager)
    if (self->has_draged_) {
      auto page = self->CalculateCurrentPage();
      self->UpdateCurrentPage(page);
    }
    self->SetScrollStateType(ScrollStateType::kScrollStateIdle);
  });

  AddDragEndListener([WEAK_THIS]() {
    DEFINE_AND_CHECK_SELF(ViewPager)
    self->has_draged_ = true;
  });
}

void ViewPager::SetAxis(ScrollAxis axis) {
  if (axis == axis_) {
    return;
  }
  axis_ = axis;
  if (IsHorizontal()) {
    SetScrollDirection(tdfcore::ScrollDirection::kHorizontal);
    SetHorizontalOverscrollEnabled(true);
  } else {
    SetScrollDirection(tdfcore::ScrollDirection::kVertical);
    SetVerticalOverscrollEnabled(true);
  }
}

void ViewPager::Layout() {
  ScrollView::Layout();

  content_extent_size_ = 0;
  for (const auto& child : GetChildren()) {
    if (IsHorizontal()) {
      content_extent_size_ += child->GetFrame().Width();
    } else {
      content_extent_size_ += child->GetFrame().Height();
    }
  }
  content_extent_size_ += static_cast<float>((GetChildren().size() - 1)) * page_margin_;

  if (IsHorizontal()) {
    SetContentRect(TRect::MakeLTRB(0, 0, content_extent_size_, GetFrame().Height()));
  } else {
    SetContentRect(TRect::MakeLTRB(0, 0, GetFrame().Width(), content_extent_size_));
  }

  LayoutChildrenFrame();
}

void ViewPager::LayoutChildrenFrame() {
  float delta = 0;
  auto children = GetChildren();
  for (auto& child : children) {
    TRect rect = child->GetFrame();
    if (IsHorizontal()) {
      child->SetFrame(TRect::MakeXYWH(delta, rect.top, rect.Width(), rect.Height()));
      delta += rect.Width();
    } else {
      child->SetFrame(TRect::MakeXYWH(rect.left, delta, rect.Width(), rect.Height()));
      delta += rect.Height();
    }
    delta += page_margin_;
  }
}

void ViewPager::SetCurrentPage(int32_t page) {
  UpdateCurrentPage(page);
  ScrollTo(current_page_, false);
}

void ViewPager::UpdateCurrentPage(int32_t page) {
  has_draged_ = false;

  auto max = static_cast<int32_t>(GetChildren().size() - 1);
  int32_t real_page = std::max(0, std::min(page, max));

  if (real_page != current_page_ && selected_listener_) {
    selected_listener_(real_page);
  }
  current_page_ = real_page;
}

int32_t ViewPager::CalculateCurrentPage() {
  int page = 0;
  auto offset = GetOffset();
  auto delta = (IsHorizontal() ? offset.x : offset.y) + 1.f;
  auto children = GetChildren();
  for (auto& child : children) {
    TRect rect = child->GetFrame();
    if (IsHorizontal()) {
      delta -= rect.Width();
    } else {
      delta -= rect.Height();
    }

    if(delta > 0) {
      ++page;
    } else {
      break;
    }

    delta -= page_margin_;
  }
  return page;
}

void ViewPager::ScrollTo(int32_t target_page, bool animated) {
  if (GetIsAnimating()) {
    return;
  }
  float to = 0;
  auto children = GetChildren();
  for (auto child = children.cbegin(); child != children.cend(); child++) {
    if (std::distance(children.cbegin(), child) == target_page) {
      break;
    }
    auto main_axis_length = IsHorizontal() ? (*child)->GetFrame().Width() : (*child)->GetFrame().Height();
    to = to + main_axis_length + page_margin_;
  }

  const TScalar x = IsHorizontal() ? to : GetOffset().x;
  const TScalar y = IsVertical() ? to : GetOffset().y;
  SetOffset(TPoint::Make(x, y), animated);
}

void ViewPager::SetScrollStateType(ScrollStateType new_state) {
  if (scroll_state_ == new_state) {
    return;
  }
  std::string old_state_name = kScrollStateMap.at(scroll_state_);
  std::string new_state_name = kScrollStateMap.at(new_state);
  if (state_changed_listener_) {
    state_changed_listener_(old_state_name, new_state_name);
  }
  scroll_state_ = new_state;
}

void ViewPager::SwitchToPage(int32_t target_page, bool animated) {
  UpdateCurrentPage(target_page);
  ScrollTo(current_page_, animated);
}

void ViewPager::SwitchNextPage() { SwitchToPage(current_page_ + 1, true); }

void ViewPager::SwitchPrevPage() { SwitchToPage(current_page_ - 1, true); }

}  // namespace view
}  // namespace tdf
}  // namespace render
}  // namespace hippy
