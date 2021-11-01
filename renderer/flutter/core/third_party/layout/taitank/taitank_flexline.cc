/*
 *
 * Tencent is pleased to support the open source community by making Taitank available. 
 * Copyright (C) 2021 THL A29 Limited, a Tencent company.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the “License”);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    http:// www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed in writing, software
 * distributed under the License is distributed on an “AS IS” BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations
 * under the License.
 *
 */

#include "taitank_flexline.h"

#include <cmath>

#include "taitank_node.h"
#include "taitank_util.h"

namespace taitank {

FlexLine::FlexLine(TaitankNodeRef container) {
  ASSERT(container != nullptr);
  flex_container_ = container;
  sum_hypothetical_main_size_ = 0;
  total_flex_grow_ = 0;
  total_flex_shrink_ = 0;
  total_weighted_flex_shrink_ = 0;
  line_cross_size_ = 0;
  initial_free_space_ = 0;
  remaining_free_space_ = 0;
  container_main_inner_size_ = 0;
}

/*
 * add a item in flex line.
 */
void FlexLine::AddItem(TaitankNodeRef item) {
  if (item == nullptr) {
    return;
  }

  sum_hypothetical_main_size_ += item->layout_result_.hypothetical_main_axis_margin_boxsize;
  total_flex_grow_ += item->style_.flex_grow_;
  total_flex_shrink_ += item->style_.flex_shrink_;
  // For every unfrozen item on the line, multiply its flex shrink factor by its inner
  // flex base size, and note this as its scaled flex shrink factor.
  total_weighted_flex_shrink_ += item->style_.flex_shrink_ * item->layout_result_.flex_base_size;
  items_.push_back(item);
}

bool FlexLine::is_empty() { return items_.size() == 0; }

/*9.7. Resolving Flexible Lengths
 * 1. Determine the used flex factor. Sum the outer hypothetical main sizes of all items on the
 * line. If the sum is less than the flex container's inner main size, use the flex grow factor for
 * the rest of this algorithm; otherwise, use the flex shrink factor.
 * 2. Size inflexible items. Freeze, setting its target main size to its hypothetical main size's
 * any item that has a flex factor of zero
 * if using the flex grow factor: any item that has a flex base size greater than its hypothetical
 * main size if using the flex shrink factor: any item that has a flex base size smaller than its
 * hypothetical main size
 * 3. Calculate initial free space. Sum the outer sizes of all items on the line,
 * and subtract this from the flex container's inner main size.
 * For frozen items, use their outer target main size;
 * for other items, use their outer flex base size.
 */
void FlexLine::FreezeInflexibleItems(FlexLayoutAction layoutAction) {
  // no need use the resolveMainAxis of flexContainer
  // just get main axis from style
  // because it just calculate the size of items.
  FlexDirection mainAxis = flex_container_->style_.flex_direction_;
  FlexSign flexSign = Sign();
  remaining_free_space_ = container_main_inner_size_ - sum_hypothetical_main_size_;
  std::vector<TaitankNodeRef> inFlexibleItems;
  for (size_t i = 0; i < items_.size(); i++) {
    TaitankNodeRef item = items_[i];
    if (layoutAction == LAYOUT_ACTION_LAYOUT) {
      // if it in LayoutActionLayout state, reset frozen as false
      // resolve item main size again.
      item->is_frozen_ = false;
    }

    float flexFactor =
        flexSign == PositiveFlexibility ? item->style_.flex_grow_ : item->style_.flex_shrink_;
    if (flexFactor == 0 ||
        (flexSign == PositiveFlexibility &&
         item->layout_result_.flex_base_size > item->layout_result_.hypothetical_main_axis_size) ||
        (flexSign == NegativeFlexibility &&
         item->layout_result_.flex_base_size < item->layout_result_.hypothetical_main_axis_size)) {
      item->set_layout_dim(mainAxis, item->layout_result_.hypothetical_main_axis_size);
      inFlexibleItems.push_back(item);
    }
  }

  // Recalculate the remaining free space and total flex grow , total flex shrink
  FreezeViolations(inFlexibleItems);
  // Get Initial value here!!!
  initial_free_space_ = remaining_free_space_;
}

void FlexLine::FreezeViolations(std::vector<TaitankNode*>& violations) {
  // no need use the resolveMainAxis of flexContainer
  // just get main axis from style
  // because it just calculate the size of items.
  FlexDirection mainAxis = flex_container_->style_.flex_direction_;
  for (size_t i = 0; i < violations.size(); i++) {
    TaitankNodeRef item = violations[i];
    if (item->is_frozen_) continue;
    remaining_free_space_ -=
        (item->get_layout_dim(mainAxis) - item->layout_result_.hypothetical_main_axis_size);
    total_flex_grow_ -= item->style_.flex_grow_;
    total_flex_shrink_ -= item->style_.flex_shrink_;
    total_weighted_flex_shrink_ -= item->style_.flex_shrink_ * item->layout_result_.flex_base_size;
    total_weighted_flex_shrink_ = fmax(total_weighted_flex_shrink_, 0.0);
    item->is_frozen_ = true;
  }
}

// Should be called in a loop until it returns false.
bool FlexLine::ResolveFlexibleLengths() {
  // no need use the resolveMainAxis of flexContainer
  // just get main axis from style
  // because it just calculate the size of items.
  FlexDirection mainAxis = flex_container_->style_.flex_direction_;
  float usedFreeSpace = 0;
  float totalViolation = 0;
  std::vector<TaitankNodeRef> minViolations;
  std::vector<TaitankNodeRef> maxViolations;

  FlexSign flexSign = Sign();
  float sumFlexFactors = (flexSign == PositiveFlexibility) ? total_flex_grow_ : total_flex_shrink_;
  /*  If the sum of the unfrozen flex items's flex factors is less than one,
   *  multiply the initial free space by this sum. If the magnitude of this
   *  value is less than the magnitude of the remaining free space,
   *  use this as the remaining free space.
   */
  if (sumFlexFactors > 0 && sumFlexFactors < 1) {
    float value = initial_free_space_ * sumFlexFactors;
    if (value < remaining_free_space_) {
      remaining_free_space_ = value;
    }
  }

  for (size_t i = 0; i < items_.size(); i++) {
    TaitankNodeRef item = items_[i];
    if (item->is_frozen_) continue;

    float extraSpace = 0;
    if (remaining_free_space_ > 0 && total_flex_grow_ > 0 && flexSign == PositiveFlexibility) {
      extraSpace = remaining_free_space_ * item->style_.flex_grow_ / total_flex_grow_;
    } else if (remaining_free_space_ < 0 && total_weighted_flex_shrink_ > 0 &&
               flexSign == NegativeFlexibility) {
      // For every unfrozen item on the line, multiply its flex shrink factor by its inner flex base
      // size, and note this as its scaled flex shrink factor. Find the ratio of the item's scaled
      // flex shrink factor to the sum of the scaled flex shrink factors of all unfrozen items on
      // the line.

      extraSpace = remaining_free_space_ * item->style_.flex_shrink_ *
                   item->layout_result_.flex_base_size / total_weighted_flex_shrink_;
    }

    float violation = 0;
    if (std::isfinite(extraSpace)) {
      // Set the item's target main size to its flex base size minus a fraction of the absolute
      // value of the remaining free space proportional to the ratio.
      float itemMainSize = item->layout_result_.hypothetical_main_axis_size + extraSpace;
      float adjustItemMainSize = item->get_bound_axis(mainAxis, itemMainSize);
      item->set_layout_dim(mainAxis, adjustItemMainSize);
      // use hypotheticalMainAxisSize  instead of item->boundAxis(mainAxis, item->result.flexBasis);
      usedFreeSpace += adjustItemMainSize - item->layout_result_.hypothetical_main_axis_size;
      violation = adjustItemMainSize - itemMainSize;
    }

    if (violation > 0) {
      minViolations.push_back(item);
    } else if (violation < 0) {
      maxViolations.push_back(item);
    }
    totalViolation += violation;
  }

  /*Zero
   * Freeze all items.
   * Positive
   * Freeze all the items with min violations.
   * Negative
   * Freeze all the items with max violations.
   */
  if (totalViolation) {
    FreezeViolations(totalViolation < 0 ? maxViolations : minViolations);
  } else {
    remaining_free_space_ -= usedFreeSpace;
  }

  return !totalViolation;
}

/*
 * 9.5. Main-Axis Alignment
 * 12.Distribute any remaining free space. For each flex line:
 *   1.If the remaining free space is positive and at least one main-axis margin on this line is
 * auto, distribute the free space equally among these margins. Otherwise, set all auto margins to
 * zero. 2.Align the items along the main-axis per justify-content.
 */
void FlexLine::AlignItems() {
  // need use the resolveMainAxis of flexContainer
  // because 'alignItems' calculate item's positions
  // which influenced by node's layout direction property.
  FlexDirection mainAxis = flex_container_->ResolveMainAxis();
  int itemsSize = items_.size();
  // get autoMargin count,assure remainingFreeSpace Calculate again
  remaining_free_space_ = container_main_inner_size_;
  int autoMarginCount = 0;
  for (int i = 0; i < itemsSize; i++) {
    TaitankNodeRef item = items_[i];
    remaining_free_space_ -= (item->get_layout_dim(mainAxis) + item->get_margin(mainAxis));
    if (item->is_auto_start_margin(mainAxis)) {
      autoMarginCount++;
    }
    if (item->is_auto_end_margin(mainAxis)) {
      autoMarginCount++;
    }
  }

  //  see HippyTest.align_items_center_child_without_margin_bigger_than_parent in /tests folder
  //  remainingFreeSpace can be negative, < 0.
  //  if(remainingFreeSpace < 0) {
  //    remainingFreeSpace = 0;
  //  }

  float autoMargin = 0;
  if (remaining_free_space_ > 0 && autoMarginCount > 0) {
    autoMargin = remaining_free_space_ / autoMarginCount;
    remaining_free_space_ = 0;
  }

  for (int i = 0; i < itemsSize; i++) {
    TaitankNodeRef item = items_[i];
    if (item->is_auto_start_margin(mainAxis)) {
      item->set_layout_start_margin(mainAxis, autoMargin);
    } else {
      // For margin:: assign style value to result value at this place..
      item->set_layout_start_margin(mainAxis, item->get_start_margin(mainAxis));
    }

    if (item->is_auto_end_margin(mainAxis)) {
      item->set_layout_end_margin(mainAxis, autoMargin);
    } else {
      item->set_layout_end_margin(mainAxis, item->get_end_margin(mainAxis));
    }
  }

  // 2. Align the items along the main-axis per justify-content.
  float offset = flex_container_->get_start_padding_and_border(mainAxis);
  TaitankStyle style = flex_container_->get_style();
  float space = 0;
  switch (style.justify_content_) {
    case FLEX_ALIGN_START:
      break;
    case FLEX_ALIGN_CENTER:
      offset += remaining_free_space_ / 2;
      break;
    case FLEX_ALIGN_END:
      offset += remaining_free_space_;
      break;
    case FLEX_ALIGN_SPACE_BETWEEN:
      space = remaining_free_space_ / (itemsSize - 1);
      break;
    case FLEX_ALIGN_SPACE_AROUND:
      space = remaining_free_space_ / itemsSize;
      offset += space / 2;
      break;
    case FLEX_ALIGN_SPACE_EVENLY:
      space = remaining_free_space_ / (itemsSize + 1);
      offset += space;
      break;
    default:
      break;
  }

  // start end position set.
  for (int i = 0; i < itemsSize; i++) {
    TaitankNodeRef item = items_[i];
    offset += item->get_layout_start_margin(mainAxis);
    item->set_layout_start_position(mainAxis, offset);
    item->set_layout_end_position(mainAxis, flex_container_->get_layout_dim(mainAxis) -
                                                item->get_layout_dim(mainAxis) - offset);
    offset += item->get_layout_dim(mainAxis) + item->get_layout_end_margin(mainAxis) + space;
  }
}

}  // namespace taitank
