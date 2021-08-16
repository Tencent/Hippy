/* Tencent is pleased to support the open source community by making Hippy
 * available. Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights
 * reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include "FlexLine.h"

#include <cmath>

#include "HPNode.h"
#include "HPUtil.h"

FlexLine::FlexLine(HPNodeRef container) {
  ASSERT(container != nullptr);
  flexContainer = container;
  sumHypotheticalMainSize = 0;
  totalFlexGrow = 0;
  totalFlexShrink = 0;
  totalWeightedFlexShrink = 0;
  lineCrossSize = 0;
  initialFreeSpace = 0;
  remainingFreeSpace = 0;
  containerMainInnerSize = 0;
}

/*
 * add a item in flex line.
 */
void FlexLine::addItem(HPNodeRef item) {
  if (item == nullptr) {
    return;
  }

  sumHypotheticalMainSize += item->result.hypotheticalMainAxisMarginBoxSize;
  totalFlexGrow += item->style.flexGrow;
  totalFlexShrink += item->style.flexShrink;
  // For every unfrozen item on the line, multiply its flex shrink factor by its
  // inner flex base size, and note this as its scaled flex shrink factor.
  // TODO(ianwang): inner flex base size ??????????
  totalWeightedFlexShrink += item->style.flexShrink * item->result.flexBaseSize;
  items.push_back(item);
}

bool FlexLine::isEmpty() {
  return items.size() == 0;
}

/*9.7. Resolving Flexible Lengths
 * 1. Determine the used flex factor. Sum the outer hypothetical main sizes of
 * all items on the line. If the sum is less than the flex container's inner
 * main size, use the flex grow factor for the rest of this algorithm;
 * otherwise, use the flex shrink factor.
 * 2. Size inflexible items. Freeze, setting its target main size to its
 * hypothetical main size's any item that has a flex factor of zero if using the
 * flex grow factor: any item that has a flex base size greater than its
 * hypothetical main size if using the flex shrink factor: any item that has a
 * flex base size smaller than its hypothetical main size
 * 3. Calculate initial free space. Sum the outer sizes of all items on the
 * line, and subtract this from the flex container's inner main size. For frozen
 * items, use their outer target main size; for other items, use their outer
 * flex base size.
 */
void FlexLine::FreezeInflexibleItems(FlexLayoutAction layoutAction) {
  // no need use the resolveMainAxis of flexContainer
  // just get main axis from style
  // because it just calculate the size of items.
  FlexDirection mainAxis = flexContainer->style.flexDirection;
  FlexSign flexSign = Sign();
  remainingFreeSpace = containerMainInnerSize - sumHypotheticalMainSize;
  std::vector<HPNodeRef> inFlexibleItems;
  for (size_t i = 0; i < items.size(); i++) {
    HPNodeRef item = items[i];
    if (layoutAction == LayoutActionLayout) {
      // if it in LayoutActionLayout state, reset frozen as false
      // resolve item main size again.
      item->isFrozen = false;
    }

    float flexFactor =
        flexSign == PositiveFlexibility ? item->style.flexGrow : item->style.flexShrink;
    if (flexFactor == 0 ||
        (flexSign == PositiveFlexibility &&
         item->result.flexBaseSize > item->result.hypotheticalMainAxisSize) ||
        (flexSign == NegativeFlexibility &&
         item->result.flexBaseSize < item->result.hypotheticalMainAxisSize)) {
      item->setLayoutDim(mainAxis, item->result.hypotheticalMainAxisSize);
      inFlexibleItems.push_back(item);
    }
  }

  // Recalculate the remaining free space and total flex grow , total flex
  // shrink
  FreezeViolations(inFlexibleItems);
  // Get Initial value here!!!
  initialFreeSpace = remainingFreeSpace;
}

void FlexLine::FreezeViolations(std::vector<HPNode*>& violations) {
  // no need use the resolveMainAxis of flexContainer
  // just get main axis from style
  // because it just calculate the size of items.
  FlexDirection mainAxis = flexContainer->style.flexDirection;
  for (size_t i = 0; i < violations.size(); i++) {
    HPNodeRef item = violations[i];
    if (item->isFrozen)
      continue;
    remainingFreeSpace -= (item->getLayoutDim(mainAxis) - item->result.hypotheticalMainAxisSize);
    totalFlexGrow -= item->style.flexGrow;
    totalFlexShrink -= item->style.flexShrink;
    totalWeightedFlexShrink -= item->style.flexShrink * item->result.flexBaseSize;
    totalWeightedFlexShrink = fmax(totalWeightedFlexShrink, 0.0);
    item->isFrozen = true;
  }
}

// Should be called in a loop until it returns false.
bool FlexLine::ResolveFlexibleLengths() {
  // no need use the resolveMainAxis of flexContainer
  // just get main axis from style
  // because it just calculate the size of items.
  FlexDirection mainAxis = flexContainer->style.flexDirection;
  float usedFreeSpace = 0;
  float totalViolation = 0;
  std::vector<HPNodeRef> minViolations;
  std::vector<HPNodeRef> maxViolations;

  FlexSign flexSign = Sign();
  float sumFlexFactors = (flexSign == PositiveFlexibility) ? totalFlexGrow : totalFlexShrink;
  /*  If the sum of the unfrozen flex items's flex factors is less than one,
   *  multiply the initial free space by this sum. If the magnitude of this
   *  value is less than the magnitude of the remaining free space,
   *  use this as the remaining free space.
   */
  if (sumFlexFactors > 0 && sumFlexFactors < 1) {
    float value = initialFreeSpace * sumFlexFactors;
    if (value < remainingFreeSpace) {
      remainingFreeSpace = value;
    }
  }

  for (size_t i = 0; i < items.size(); i++) {
    HPNodeRef item = items[i];
    if (item->isFrozen)
      continue;

    float extraSpace = 0;
    if (remainingFreeSpace > 0 && totalFlexGrow > 0 && flexSign == PositiveFlexibility) {
      extraSpace = remainingFreeSpace * item->style.flexGrow / totalFlexGrow;
    } else if (remainingFreeSpace < 0 && totalWeightedFlexShrink > 0 &&
               flexSign == NegativeFlexibility) {
      // For every unfrozen item on the line, multiply its flex shrink factor by
      // its inner flex base size, and note this as its scaled flex shrink
      // factor. Find the ratio of the item's scaled flex shrink factor to the
      // sum of the scaled flex shrink factors of all unfrozen items on the
      // line.

      extraSpace = remainingFreeSpace * item->style.flexShrink * item->result.flexBaseSize /
                   totalWeightedFlexShrink;
    }

    float violation = 0;
    if (std::isfinite(extraSpace)) {
      // Set the item's target main size to its flex base size minus a fraction
      // of the absolute value of the remaining free space proportional to the
      // ratio.
      float itemMainSize = item->result.hypotheticalMainAxisSize + extraSpace;
      float adjustItemMainSize = item->boundAxis(mainAxis, itemMainSize);
      item->setLayoutDim(mainAxis, adjustItemMainSize);
      // use hypotheticalMainAxisSize  instead of item->boundAxis(mainAxis,
      // item->result.flexBasis);
      usedFreeSpace += adjustItemMainSize - item->result.hypotheticalMainAxisSize;
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
    remainingFreeSpace -= usedFreeSpace;
    // TODO(ianwang): FreezeViolations all
    // FreezeViolations(items);
  }

  return !totalViolation;
}

/*
 * 9.5. Main-Axis Alignment
 * 12.Distribute any remaining free space. For each flex line:
 *   1.If the remaining free space is positive and at least one main-axis margin
 * on this line is auto, distribute the free space equally among these margins.
 * Otherwise, set all auto margins to zero. 2.Align the items along the
 * main-axis per justify-content.
 */
void FlexLine::alignItems() {
  // need use the resolveMainAxis of flexContainer
  // because 'alignItems' calculate item's positions
  // which influenced by node's layout direction property.
  FlexDirection mainAxis = flexContainer->resolveMainAxis();
  int itemsSize = items.size();
  // get autoMargin count,assure remainingFreeSpace Calculate again
  remainingFreeSpace = containerMainInnerSize;
  int autoMarginCount = 0;
  for (int i = 0; i < itemsSize; i++) {
    HPNodeRef item = items[i];
    remainingFreeSpace -= (item->getLayoutDim(mainAxis) + item->getMargin(mainAxis));
    // TODO(ianwang): remainingFreeSpace may be a small float value , for example
    // : 1.52587891e-005 == 0.000015
    if (item->isAutoStartMargin(mainAxis)) {
      autoMarginCount++;
    }
    if (item->isAutoEndMargin(mainAxis)) {
      autoMarginCount++;
    }
  }

  // see HippyTest.align_items_center_child_without_margin_bigger_than_parent in
  // /tests folder remainingFreeSpace can be negative, < 0.
  // if(remainingFreeSpace < 0) {
  //  remainingFreeSpace = 0;
  // }

  float autoMargin = 0;
  if (remainingFreeSpace > 0 && autoMarginCount > 0) {
    autoMargin = remainingFreeSpace / autoMarginCount;
    remainingFreeSpace = 0;
  }

  for (int i = 0; i < itemsSize; i++) {
    HPNodeRef item = items[i];
    if (item->isAutoStartMargin(mainAxis)) {
      item->setLayoutStartMargin(mainAxis, autoMargin);
    } else {
      // For margin:: assign style value to result value at this place..
      item->setLayoutStartMargin(mainAxis, item->getStartMargin(mainAxis));
    }

    if (item->isAutoEndMargin(mainAxis)) {
      item->setLayoutEndMargin(mainAxis, autoMargin);
    } else {
      item->setLayoutEndMargin(mainAxis, item->getEndMargin(mainAxis));
    }
  }

  // 2. Align the items along the main-axis per justify-content.
  float offset = flexContainer->getStartPaddingAndBorder(mainAxis);
  HPStyle style = flexContainer->getStyle();
  float space = 0;
  switch (style.justifyContent) {
    case FlexAlignStart:
      break;
    case FlexAlignCenter:
      offset += remainingFreeSpace / 2;
      break;
    case FlexAlignEnd:
      offset += remainingFreeSpace;
      break;
    case FlexAlignSpaceBetween:
      space = remainingFreeSpace / (itemsSize - 1);
      break;
    case FlexAlignSpaceAround:
      space = remainingFreeSpace / itemsSize;
      offset += space / 2;
      break;
    case FlexAlignSpaceEvenly:
      space = remainingFreeSpace / (itemsSize + 1);
      offset += space;
      break;
    default:
      break;
  }

  // start end position set.
  for (int i = 0; i < itemsSize; i++) {
    HPNodeRef item = items[i];
    offset += item->getLayoutStartMargin(mainAxis);
    item->setLayoutStartPosition(mainAxis, offset);
    item->setLayoutEndPosition(
        mainAxis, flexContainer->getLayoutDim(mainAxis) - item->getLayoutDim(mainAxis) - offset);
    offset += item->getLayoutDim(mainAxis) + item->getLayoutEndMargin(mainAxis) + space;
  }
}
