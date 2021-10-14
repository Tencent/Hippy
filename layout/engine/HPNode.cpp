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

#include "HPNode.h"

#include <string.h>

#include <algorithm>
#include <string>

// the layout progress refers
// https://www.w3.org/TR/css-flexbox-1/#layout-algorithm

std::string getIndentString(int indent) {
  std::string str;
  for (int i = 0; i < indent; i++) {
    str += " ";
  }
  return str;
}

std::string toString(float value) {
  if (isUndefined(value)) {
    return "NAN";
  } else {
    char str[10] = {0};
    snprintf(str, 9, "%0.f", PixelRoundInt(value));
    return str;
  }
}

void HPNode::printNode(uint32_t indent) {
  std::string indentStr = getIndentString(indent);
  std::string startStr;
  startStr = indentStr + "<div layout=\"width:%s; height:%s; left:%s; top:%s;\" style=\"%s\">\n";
  HPLogd(startStr.c_str(), toString(result.dim[0]).c_str(), toString(result.dim[1]).c_str(),
         toString(result.position[0]).c_str(), toString(result.position[1]).c_str(),
         style.toString().c_str());

  std::vector<HPNodeRef>& items = children;
  for (size_t i = 0; i < items.size(); i++) {
    HPNodeRef item = items[i];
    item->printNode(indent + 4);
  }
  std::string endStr = indentStr + "</div>\n";
  HPLogd(endStr.c_str());
}

HPNode::HPNode() {
  context = nullptr;
  parent = nullptr;
  measure = nullptr;
  dirtiedFunc = nullptr;

  initLayoutResult();
  inInitailState = true;
}

HPNode::~HPNode() {
  // remove from parent
  if (parent != nullptr) {
    parent->removeChild(this);
    parent = nullptr;
  }

  // set child's parent as null
  for (size_t i = 0; i < children.size(); i++) {
    HPNodeRef item = children[i];
    if (item != nullptr) {
      item->setParent(nullptr);
    }
  }

  children.clear();
}

void HPNode::initLayoutResult() {
#ifdef LAYOUT_TIME_ANALYZE
  fetchCount = 0;
#endif
  isFrozen = false;
  isDirty = true;
  _hasNewLayout = false;
  result.dim[DimWidth] = 0;
  result.dim[DimHeight] = 0;

  memset(reinterpret_cast<void*>(result.position), 0, sizeof(float) * 4);
  memset(reinterpret_cast<void*>(result.cachedPosition), 0, sizeof(float) * 4);
  memset(reinterpret_cast<void*>(result.margin), 0, sizeof(float) * 4);
  memset(reinterpret_cast<void*>(result.padding), 0, sizeof(float) * 4);
  memset(reinterpret_cast<void*>(result.border), 0, sizeof(float) * 4);

  result.hadOverflow = false;
  result.direction = DirectionInherit;
}

bool HPNode::reset() {
  if (childCount() != 0 || getParent() != nullptr)
    return false;
  children.clear();
  children.shrink_to_fit();
  initLayoutResult();
  inInitailState = true;
  return true;
}

void HPNode::resetLayoutRecursive(bool isDisplayNone) {
  if (inInitailState && isDisplayNone) {
    return;
  }
  initLayoutResult();
  if (!isDisplayNone) {  // see HPNode::removeChild
    // set result as undefined.see HPNodeChildTest.cpp
    // in tests/folder
    result.dim[DimWidth] = VALUE_UNDEFINED;
    result.dim[DimHeight] = VALUE_UNDEFINED;
  } else {
    inInitailState = true;  // prevent resetLayoutRecursive run many times in recursive
    // in DisplayNone state, set hasNewLayout as true;
    // set dirty false;
    setHasNewLayout(true);
    setDirty(false);
  }
  // if just because parent's display type change,
  // not to clear child layout cache, can be reused.
  layoutCache.clearCache();
  for (size_t i = 0; i < children.size(); i++) {
    HPNodeRef item = children[i];
    item->resetLayoutRecursive(isDisplayNone);
  }
}

HPStyle HPNode::getStyle() {
  return style;
}

void HPNode::setStyle(const HPStyle& st) {
  style = st;
  // TODO(ianwang): layout if needed???
}

bool HPNode::setMeasureFunc(HPMeasureFunc _measure) {
  if (measure == _measure) {
    return true;
  }

  // not leaf node , not set measure
  if (childCount() > 0) {
    return false;
  }

  measure = _measure;
  style.nodeType = _measure ? NodeTypeText : NodeTypeDefault;
  markAsDirty();
  return true;
}

void HPNode::setParent(HPNodeRef _parent) {
  parent = _parent;
}

HPNodeRef HPNode::getParent() {
  return parent;
}

void HPNode::addChild(HPNodeRef item) {
  if (item == nullptr) {
    return;
  }
  item->setParent(this);
  children.push_back(item);
  markAsDirty();
}

bool HPNode::insertChild(HPNodeRef item, uint32_t index) {
  // measure node cannot have child.
  if (item == nullptr || measure != nullptr) {
    return false;
  }
  item->setParent(this);
  children.insert(children.begin() + index, item);
  markAsDirty();
  return true;
}

HPNodeRef HPNode::getChild(uint32_t index) {
  if (index > children.size() - 1) {
    return nullptr;
  }
  return children[index];
}

bool HPNode::removeChild(HPNodeRef child) {
  std::vector<HPNodeRef>::iterator p = std::find(children.begin(), children.end(), child);
  if (p != children.end()) {
    children.erase(p);
    child->setParent(nullptr);
    child->resetLayoutRecursive(false);
    markAsDirty();
    return true;
  }
  return false;
}

bool HPNode::removeChild(uint32_t index) {
  if (index > children.size() - 1) {
    return false;
  }
  HPNodeRef child = getChild(index);
  if (child != nullptr) {
    child->setParent(nullptr);
    child->resetLayoutRecursive(false);
  }
  children.erase(children.begin() + index);
  markAsDirty();
  return true;
}

uint32_t HPNode::childCount() {
  return children.size();
}

void HPNode::setDisplayType(DisplayType displayType) {
  if (style.displayType == displayType)
    return;
  style.displayType = displayType;
  isDirty = false;  // force following markAsDirty did effect to its parent
  markAsDirty();
}

void HPNode::markAsDirty() {
  if (!isDirty) {
    setDirty(true);
    if (parent) {
      parent->markAsDirty();
    }
  }
}

void HPNode::setHasNewLayout(bool hasNewLayoutOrNot) {
  _hasNewLayout = hasNewLayoutOrNot;
}

bool HPNode::hasNewLayout() {
  return _hasNewLayout;
}

void HPNode::setDirty(bool dirtyOrNot) {
  if (isDirty == dirtyOrNot) {
    return;
  }
  isDirty = dirtyOrNot;
  if (isDirty) {
    // reset layout direction to initial state
    // need to calculated again
    setLayoutDirection(DirectionInherit);
    // if is dirty, reset frozen.
    isFrozen = false;
    // if is dirty, layout cache muse be in clear state.
    layoutCache.clearCache();
    if (dirtiedFunc != nullptr) {
      dirtiedFunc(this);
    }
  }
}

void HPNode::setDirtiedFunc(HPDirtiedFunc _dirtiedFunc) {
  dirtiedFunc = _dirtiedFunc;
}

void HPNode::setContext(void* _context) {
  context = _context;
}

void* HPNode::getContext() {
  return context;
}

bool HPNode::isLayoutDimDefined(FlexDirection axis) {
  return isDefined(result.dim[axisDim[axis]]);
}

void HPNode::setLayoutDim(FlexDirection axis, float value) {
  result.dim[axisDim[axis]] = value;
}

inline void HPNode::setLayoutDirection(HPDirection direction) {
  result.direction = direction;
}

inline HPDirection HPNode::getLayoutDirection() {
  return result.direction;
}

float HPNode::getLayoutDim(FlexDirection axis) {
  if (!isLayoutDimDefined(axis)) {
    return VALUE_UNDEFINED;
  }
  return result.dim[axisDim[axis]];
}

float HPNode::getMainAxisDim() {
  FlexDirection mainAxis = style.flexDirection;
  if (!isLayoutDimDefined(mainAxis)) {
    return VALUE_UNDEFINED;
  }
  return result.dim[axisDim[mainAxis]];
}

float HPNode::getStartBorder(FlexDirection axis) {
  return style.getStartBorder(axis);
}

float HPNode::getEndBorder(FlexDirection axis) {
  return style.getEndBorder(axis);
}

float HPNode::getStartPaddingAndBorder(FlexDirection axis) {
  return style.getStartPadding(axis) + style.getStartBorder(axis);
}

float HPNode::getEndPaddingAndBorder(FlexDirection axis) {
  return style.getEndPadding(axis) + style.getEndBorder(axis);
}

float HPNode::getPaddingAndBorder(FlexDirection axis) {
  return getStartPaddingAndBorder(axis) + getEndPaddingAndBorder(axis);
}

float HPNode::getStartMargin(FlexDirection axis) {
  return style.getStartMargin(axis);
}

float HPNode::getEndMargin(FlexDirection axis) {
  return style.getEndMargin(axis);
}

float HPNode::getMargin(FlexDirection axis) {
  return style.getStartMargin(axis) + style.getEndMargin(axis);
}

bool HPNode::isAutoStartMargin(FlexDirection axis) {
  return style.isAutoStartMargin(axis);
}

bool HPNode::isAutoEndMargin(FlexDirection axis) {
  return style.isAutoEndMargin(axis);
}

void HPNode::setLayoutStartMargin(FlexDirection axis, float value) {
  result.margin[axisStart[axis]] = value;
}

void HPNode::setLayoutEndMargin(FlexDirection axis, float value) {
  result.margin[axisEnd[axis]] = value;
}

inline float HPNode::getLayoutMargin(FlexDirection axis) {
  return getLayoutStartMargin(axis) + getLayoutEndMargin(axis);
}

float HPNode::getLayoutStartMargin(FlexDirection axis) {
  return isDefined(result.margin[axisStart[axis]]) ? result.margin[axisStart[axis]] : 0;
}

float HPNode::getLayoutEndMargin(FlexDirection axis) {
  return isDefined(result.margin[axisEnd[axis]]) ? result.margin[axisEnd[axis]] : 0;
}

/* If both axisStart and axisEnd are defined,
 * then use axisStart. Otherwise use which is defined.
 * @param axis flex direction
 * @param forAxisStart
 * 		  true  get relative value for axis start
 * 		  false get relative value for axis end
 */
float HPNode::resolveRelativePosition(FlexDirection axis, bool forAxisStart) {
  if (style.positionType != PositionTypeRelative) {
    return 0.0f;
  }

  if (isDefined(style.getStartPosition(axis))) {
    float value = style.getStartPosition(axis);
    return forAxisStart ? value : -value;
  } else if (isDefined(style.getEndPosition(axis))) {
    float value = style.getEndPosition(axis);
    return forAxisStart ? -value : value;
  }

  return 0.0f;
}

void HPNode::setLayoutStartPosition(FlexDirection axis, float value, bool addRelativePosition) {
  if (addRelativePosition && style.positionType == PositionTypeRelative) {
    value += resolveRelativePosition(axis, true);
  }

  if (!FloatIsEqual(result.cachedPosition[axisStart[axis]], value)) {
    result.cachedPosition[axisStart[axis]] = value;
    setHasNewLayout(true);
  }

  result.position[axisStart[axis]] = value;
}

void HPNode::setLayoutEndPosition(FlexDirection axis, float value, bool addRelativePosition) {
  if (addRelativePosition && style.positionType == PositionTypeRelative) {
    value += resolveRelativePosition(axis, false);
  }

  if (!FloatIsEqual(result.cachedPosition[axisEnd[axis]], value)) {
    result.cachedPosition[axisEnd[axis]] = value;
    setHasNewLayout(true);
  }

  result.position[axisEnd[axis]] = value;
}

float HPNode::getLayoutStartPosition(FlexDirection axis) {
  return result.position[axisStart[axis]];
}

float HPNode::getLayoutEndPosition(FlexDirection axis) {
  return result.position[axisEnd[axis]];
}

// calculate main axis by refer this node's flex direction
// and layout direction which resolved in resolveDirection.
FlexDirection HPNode::resolveMainAxis() {
  FlexDirection mainAxis = style.flexDirection;
  HPDirection direction = getLayoutDirection();
  if (direction == DirectionRTL) {
    if (mainAxis == FLexDirectionRow) {
      return FLexDirectionRowReverse;
    } else if (mainAxis == FLexDirectionRowReverse) {
      return FLexDirectionRow;
    }
  }
  return mainAxis;
}

/* calculate cross axis by refer this node's flex properties
 * and layout direction which resolved in resolveDirection.
 * must use this method when cross axis alignment
 * to determine cross start & cross end
 */
FlexDirection HPNode::resolveCrossAxis() {
  FlexDirection mainAxis = style.flexDirection;
  FlexDirection crossAxis;
  // cross axis's direction rely on flex wrap mode.
  if (isRowDirection(mainAxis)) {
    if (style.flexWrap == FlexWrapReverse) {
      crossAxis = FLexDirectionColumnReverse;
    } else {
      crossAxis = FLexDirectionColumn;
    }
  } else {
    if (style.flexWrap == FlexWrapReverse) {
      crossAxis = FLexDirectionRowReverse;
    } else {
      crossAxis = FLexDirectionRow;
    }
    // in this situation crossAxis is Row Direction
    // should think about node's layout direction(HPDirection)
    HPDirection direction = getLayoutDirection();
    if (direction == DirectionRTL) {
      if (crossAxis == FLexDirectionRow) {
        crossAxis = FLexDirectionRowReverse;
      } else if (crossAxis == FLexDirectionRowReverse) {
        crossAxis = FLexDirectionRow;
      }
    }
  }
  return crossAxis;
}

FlexAlign HPNode::getNodeAlign(HPNodeRef item) {
  ASSERT(item != nullptr);
  if (item->style.alignSelf == FlexAlignAuto) {
    return style.alignItems;
  }
  return item->style.alignSelf;
}

float HPNode::boundAxis(FlexDirection axis, float value) {
  float min = style.minDim[axisDim[axis]];
  float max = style.maxDim[axisDim[axis]];
  float boundValue = value;
  if (!isUndefined(max) && max >= 0.0 && boundValue > max) {
    boundValue = max;
  }
  if (!isUndefined(min) && min >= 0.0 && boundValue < min) {
    boundValue = min;
  }
  return boundValue;
}

inline HPDirection HPNode::resolveDirection(HPDirection parentDirection) {
  return style.direction == DirectionInherit
             ? (parentDirection > DirectionInherit ? parentDirection : DirectionLTR)
             : style.direction;
}

// called after resolveDirection
void HPNode::resolveStyleValues() {
  //  if (!isDirty) {
  //    return;
  //  }
  FlexDirection mainAxis = resolveMainAxis();
  FlexDirection crossAxis = resolveCrossAxis();
  // set layout margin value
  // auto margins are treated as zero. may be modified during layout process
  setLayoutStartMargin(mainAxis, getStartMargin(mainAxis));
  setLayoutEndMargin(mainAxis, getEndMargin(mainAxis));
  setLayoutStartMargin(crossAxis, getStartMargin(crossAxis));
  setLayoutEndMargin(crossAxis, getEndMargin(crossAxis));

  // set layout padding value
  result.padding[axisStart[mainAxis]] = style.getStartPadding(mainAxis);
  result.padding[axisEnd[mainAxis]] = style.getEndPadding(mainAxis);
  result.padding[axisStart[crossAxis]] = style.getStartPadding(crossAxis);
  result.padding[axisEnd[crossAxis]] = style.getEndPadding(crossAxis);

  // set layout border value;
  result.border[axisStart[mainAxis]] = style.getStartBorder(mainAxis);
  result.border[axisEnd[mainAxis]] = style.getEndBorder(mainAxis);
  result.border[axisStart[crossAxis]] = style.getStartBorder(crossAxis);
  result.border[axisEnd[crossAxis]] = style.getEndBorder(crossAxis);
}

#ifdef LAYOUT_TIME_ANALYZE
static int layoutCount = 0;
static int layoutCacheCount = 0;
static int measureCount = 0;
static int measureCacheCount = 0;
#endif

void HPNode::layout(float parentWidth,
                    float parentHeight,
                    HPDirection parentDirection,
                    void* layoutContext) {
#ifdef LAYOUT_TIME_ANALYZE
  layoutCount = 0;
  layoutCacheCount = 0;
  measureCount = 0;
  measureCacheCount = 0;
#endif
  if (isUndefined(style.flexBasis) && !isUndefined(style.dim[axisDim[style.flexDirection]])) {
    style.flexBasis = style.dim[axisDim[style.flexDirection]];
  }

  // if container not set itself width and parent width is set,
  // set container width  as parentWidth subtract margin
  bool styleWidthReset = false;
  if (isUndefined(style.dim[DimWidth]) && isDefined(parentWidth)) {
    float containerWidth = parentWidth - getMargin(FLexDirectionRow);
    style.setDim(DimWidth, containerWidth > 0.0f ? containerWidth : 0.0f);
    styleWidthReset = true;
  }

  bool styleHeightReset = false;
  if (isUndefined(style.dim[DimHeight]) && isDefined(parentHeight)) {
    float containerHeight = parentHeight - getMargin(FLexDirectionColumn);
    style.setDim(DimHeight, containerHeight > 0.0f ? containerHeight : 0.0f);
    styleHeightReset = true;
  }
  layoutImpl(parentWidth, parentHeight, parentDirection, LayoutActionLayout, layoutContext);
  if (styleWidthReset) {
    style.setDim(DimWidth, VALUE_UNDEFINED);
  }
  if (styleHeightReset) {
    style.setDim(DimHeight, VALUE_UNDEFINED);
  }

  // calculate container's position
  FlexDirection mainAxis = resolveMainAxis();
  FlexDirection crossAxis = resolveCrossAxis();
  setLayoutStartPosition(mainAxis, getStartMargin(mainAxis), true);
  setLayoutEndPosition(mainAxis, getEndMargin(mainAxis), true);
  setLayoutStartPosition(crossAxis, getStartMargin(crossAxis), true);
  setLayoutEndPosition(crossAxis, getEndMargin(crossAxis), true);

  // node 's layout is complete
  // convert its and its descendants position and size to a integer value.
#ifndef ANDROID
  convertLayoutResult(0.0f, 0.0f, HPNode::scaleFactor);  // layout result convert has been taken in
                                    // java . 3.8.2018. ianwang..
#endif

#ifdef LAYOUT_TIME_ANALYZE
  HPLog(LogLevelDebug, "HippyLayoutTime layout: count %d cache %d, measure: count %d cache %d",
        layoutCount, layoutCacheCount, measureCount, measureCacheCount);
#endif
}

// 3.Determine the flex base size and hypothetical main size of each item
void HPNode::calculateItemsFlexBasis(HPSize availableSize, void* layoutContext) {
  FlexDirection mainAxis = style.flexDirection;
  std::vector<HPNodeRef>& items = children;
  for (size_t i = 0; i < items.size(); i++) {
    HPNodeRef item = items[i];
    // for display none item, reset its and its descendants layout result.
    if (item->style.displayType == DisplayTypeNone) {
      item->resetLayoutRecursive();
      continue;
    }
    // https://stackoverflow.com/questions/34352140/what-are-the-differences-between-flex-basis-and-width
    // flex-basis has no effect on absolutely-positioned flex items. width and
    // height properties would be necessary. Absolutely-positioned flex items do
    // not participate in flex layout.
    if (item->style.positionType == PositionTypeAbsolute) {
      continue;
    }
    // 3.Determine the flex base size and hypothetical main size of each item:
    // 3.1 If the item has a definite used flex basis, that's the flex base
    // size.
    if (isDefined(item->style.getFlexBasis()) && isDefined(style.dim[axisDim[mainAxis]])) {
      item->result.flexBaseSize = item->style.getFlexBasis();
    } else if (isDefined(item->style.dim[axisDim[mainAxis]])) {
      // flex-basis:auto:
      // When specified on a flex item, the auto keyword retrieves the value
      // of the main size property as the used flex-basis.
      // If that value is itself auto, then the used value is content.
      item->result.flexBaseSize = item->style.dim[axisDim[mainAxis]];
    } else {
      // 3.2 Otherwise, size the item into the available space using its used
      // flex basis in place of its main size,
      float oldMainDim = item->style.getDim(mainAxis);
      // item->style.flexBasis is auto value
      item->style.setDim(mainAxis, item->style.flexBasis);
      item->layoutImpl(
          availableSize.width, availableSize.height, getLayoutDirection(),
          isRowDirection(mainAxis) ? LayoutActionMeasureWidth : LayoutActionMeasureHeight,
          layoutContext);
      item->style.setDim(mainAxis, oldMainDim);

      item->result.flexBaseSize =
          isDefined(item->result.dim[axisDim[mainAxis]]) ? item->result.dim[axisDim[mainAxis]] : 0;
    }

    // item->result.dim[axisDim[mainAxis]] = item->boundAxis(mainAxis,
    // item->result.flexBasis); The hypothetical main size is the item's flex
    // base size clamped according to its min and max main size properties (and
    // flooring the content box size at zero).
    item->result.hypotheticalMainAxisSize = item->boundAxis(mainAxis, item->result.flexBaseSize);
    item->result.hypotheticalMainAxisMarginBoxSize =
        item->result.hypotheticalMainAxisSize + item->getMargin(mainAxis);
  }
}

bool HPNode::collectFlexLines(std::vector<FlexLine*>& flexLines, HPSize availableSize) {
  std::vector<HPNodeRef>& items = children;
  bool sumHypotheticalMainSizeOverflow = false;
  float availableWidth =
      axisDim[style.flexDirection] == DimWidth ? availableSize.width : availableSize.height;
  if (isUndefined(availableWidth)) {
    availableWidth = INFINITY;
  }

  FlexLine* line = nullptr;
  int itemsSize = items.size();
  int i = 0;
  while (i < itemsSize) {
    HPNodeRef item = items[i];
    if (item->style.positionType == PositionTypeAbsolute ||
        item->style.displayType == DisplayTypeNone) {
      // see HippyTest.dirty_mark_all_children_as_dirty_when_display_changes
      // when display changes.
      if (i == itemsSize - 1 && line != nullptr) {
        flexLines.push_back(line);
        break;
      }
      //
      i++;
      continue;
    }

    if (line == nullptr) {
      line = new FlexLine(this);
    }

    float leftSpace = availableWidth - (line->sumHypotheticalMainSize +
                                        item->result.hypotheticalMainAxisMarginBoxSize);
    if (leftSpace < 0) {
      // may be line wrap happened
      sumHypotheticalMainSizeOverflow = true;
    }

    if (style.flexWrap == FlexNoWrap) {
      line->addItem(item);
      if (i == itemsSize - 1) {
        flexLines.push_back(line);
        break;
      }
      i++;
    } else {
      if (leftSpace >= 0 || line->isEmpty()) {
        line->addItem(item);
        if (i == itemsSize - 1) {
          flexLines.push_back(line);
          line = nullptr;
        }
        i++;
      } else {
        flexLines.push_back(line);
        line = nullptr;
      }
    }
  }

  return sumHypotheticalMainSizeOverflow;
}

void HPNode::cacheLayoutOrMeasureResult(HPSize availableSize,
                                        HPSizeMode measureMode,
                                        FlexLayoutAction layoutAction) {
  HPSize resultSize = {result.dim[DimWidth], result.dim[DimHeight]};
  layoutCache.cacheResult(availableSize, resultSize, measureMode, layoutAction);
  if (layoutAction == LayoutActionLayout) {
    setDirty(false);
    setHasNewLayout(true);
    inInitailState = false;
  }
}

/*
 * availableWidth/availableHeight  has subtract its margin and padding.
 */
void HPNode::layoutSingleNode(float availableWidth,
                              MeasureMode widthMeasureMode,
                              float availableHeight,
                              MeasureMode heightMeasureMode,
                              FlexLayoutAction layoutAction,
                              void* layoutContext) {
  if (widthMeasureMode == MeasureModeExactly && heightMeasureMode == MeasureModeExactly) {
    result.dim[DimWidth] = availableWidth + getPaddingAndBorder(FLexDirectionRow);
    result.dim[DimHeight] = availableHeight + getPaddingAndBorder(FLexDirectionColumn);
  } else {
    // measure text, image etc. content node;
    HPSize dim = {0, 0};
    bool needMeasure = true;
    if (style.flexGrow > 0 && style.flexShrink > 0 && parent && parent->childCount() == 1 &&
        !parent->style.isDimensionAuto(FLexDirectionRow) &&
        !parent->style.isDimensionAuto(FLexDirectionColumn)) {
      // don't measure single grow shrink child
      // see HPMeasureTest.cpp dont_measure_single_grow_shrink_child
      needMeasure = false;
    }

    if (!needMeasure) {
      dim.width = availableWidth;
      dim.height = availableHeight;
    } else if (measure != nullptr && needMeasure) {
      dim = measure(this, availableWidth, widthMeasureMode, availableHeight, heightMeasureMode,
                    layoutContext);
    }

    result.dim[DimWidth] =
        boundAxis(FLexDirectionRow, widthMeasureMode == MeasureModeExactly
                                        ? (availableWidth + getPaddingAndBorder(FLexDirectionRow))
                                        : (dim.width + getPaddingAndBorder(FLexDirectionRow)));

    result.dim[DimHeight] = boundAxis(
        FLexDirectionColumn, heightMeasureMode == MeasureModeExactly
                                 ? (availableHeight + getPaddingAndBorder(FLexDirectionColumn))
                                 : (dim.height + getPaddingAndBorder(FLexDirectionColumn)));
  }

  HPSize availableSize = {availableWidth, availableHeight};
  HPSizeMode measureMode = {widthMeasureMode, heightMeasureMode};
  cacheLayoutOrMeasureResult(availableSize, measureMode, layoutAction);
}

// reference: https://www.w3.org/TR/css-flexbox-1/#layout-algorithm
void HPNode::layoutImpl(float parentWidth,
                        float parentHeight,
                        HPDirection parentDirection,
                        FlexLayoutAction layoutAction,
                        void* layoutContext) {
#ifdef LAYOUT_TIME_ANALYZE
  if (layoutAction == LayoutActionLayout) {
    layoutCount++;
  } else {
    measureCount++;
  }
#endif

  HPDirection direction = resolveDirection(parentDirection);
  if (getLayoutDirection() != direction) {
    setLayoutDirection(direction);
    layoutCache.clearCache();
    resolveStyleValues();
  }

  FlexDirection mainAxis = style.flexDirection;
  bool performLayout = layoutAction == LayoutActionLayout;
  if (isDefined(parentWidth)) {
    parentWidth -= getMargin(FLexDirectionRow);
    parentWidth = parentWidth >= 0.0f ? parentWidth : 0.0f;
  }

  if (isDefined(parentHeight)) {
    parentHeight -= getMargin(FLexDirectionColumn);
    parentHeight = parentHeight >= 0.0f ? parentHeight : 0.0f;
  }

  // get node dim from style
  float nodeWidth = isDefined(style.dim[DimWidth])
                        ? boundAxis(FLexDirectionRow, style.dim[DimWidth])
                        : VALUE_UNDEFINED;

  float nodeHeight = isDefined(style.dim[DimHeight])
                         ? boundAxis(FLexDirectionColumn, style.dim[DimHeight])
                         : VALUE_UNDEFINED;

  // layoutMeasuredWidth  layoutMeasuredHeight used in
  // "Determine the flex base size and hypothetical main size of each item"
  if (layoutAction == LayoutActionMeasureWidth && isDefined(nodeWidth)) {
#ifdef LAYOUT_TIME_ANALYZE
    measureCacheCount++;
#endif
    result.dim[DimWidth] = nodeWidth;
    return;
  } else if (layoutAction == LayoutActionMeasureHeight && isDefined(nodeHeight)) {
#ifdef LAYOUT_TIME_ANALYZE
    measureCacheCount++;
#endif
    result.dim[DimHeight] = nodeHeight;
    return;
  }

  // 9.2.Line Length Determination
  // Determine the available main and cross space for the flex items.
  // For each dimension, if that dimension of the flex container's content box
  // is a definite size, use that; if that dimension of the flex container is
  // being sized under a min or max-content constraint, the available space in
  // that dimension is that constraint; otherwise, subtract the flex container's
  // margin, border, and padding from the space available to the flex container
  // in that dimension and use that value. This might result in an infinite
  // value.

  // get available size for layout or measure
  float availableWidth = VALUE_UNDEFINED;
  if (isDefined(nodeWidth)) {
    availableWidth = nodeWidth - getPaddingAndBorder(FLexDirectionRow);
  } else if (isDefined(parentWidth)) {
    availableWidth = parentWidth - getPaddingAndBorder(FLexDirectionRow);
  }

  float availableHeight = VALUE_UNDEFINED;
  if (isDefined(nodeHeight)) {
    availableHeight = nodeHeight - getPaddingAndBorder(FLexDirectionColumn);
  } else if (isDefined(parentHeight)) {
    availableHeight = parentHeight - getPaddingAndBorder(FLexDirectionColumn);
  }

  if (isDefined(style.maxDim[DimWidth])) {
    if (FloatIsEqual(style.maxDim[DimWidth], style.minDim[DimWidth])) {
      style.dim[DimWidth] = style.minDim[DimWidth];
    }
    float maxDimWidth = style.maxDim[DimWidth] - getPaddingAndBorder(FLexDirectionRow);
    if (maxDimWidth >= 0.0f && maxDimWidth < NanAsINF(availableWidth)) {
      availableWidth = maxDimWidth;
    }
  }

  if (isDefined(style.maxDim[DimHeight])) {
    if (FloatIsEqual(style.maxDim[DimHeight], style.minDim[DimHeight])) {
      style.dim[DimHeight] = style.minDim[DimHeight];
    }
    float maxDimHeight = style.maxDim[DimHeight] - getPaddingAndBorder(FLexDirectionColumn);
    if (maxDimHeight >= 0.0f && maxDimHeight < NanAsINF(availableHeight)) {
      availableHeight = maxDimHeight;
    }
  }

  // available size to layout...
  availableWidth = availableWidth < 0.0f ? 0.0f : availableWidth;
  availableHeight = availableHeight < 0.0f ? 0.0f : availableHeight;

  MeasureMode widthMeasureMode = MeasureModeUndefined;
  if (isDefined(style.dim[DimWidth])) {
    widthMeasureMode = MeasureModeExactly;
  } else if (isDefined(availableWidth)) {
    if (parent && parent->style.isOverflowScroll() && isRowDirection(parent->style.flexDirection)) {
      widthMeasureMode = MeasureModeUndefined;
      availableWidth = VALUE_AUTO;
    } else {
      widthMeasureMode = MeasureModeAtMost;
    }
  }

  MeasureMode heightMeasureMode = MeasureModeUndefined;
  if (isDefined(style.dim[DimHeight])) {
    heightMeasureMode = MeasureModeExactly;
  } else if (isDefined(availableHeight)) {
    if (parent && parent->style.isOverflowScroll() &&
        isColumnDirection(parent->style.flexDirection)) {
      heightMeasureMode = MeasureModeUndefined;
      availableHeight = VALUE_AUTO;
    } else {
      heightMeasureMode = MeasureModeAtMost;
    }
  }

  HPSize availableSize = {availableWidth, availableHeight};
  HPSizeMode measureMode = {widthMeasureMode, heightMeasureMode};
  MeasureResult* cacheResult = layoutCache.getCachedMeasureResult(availableSize, measureMode,
                                                                  layoutAction, measure != nullptr);
  if (cacheResult != nullptr) {
    // set Result....
    switch (layoutAction) {
      case LayoutActionMeasureWidth:
#ifdef LAYOUT_TIME_ANALYZE
        measureCacheCount++;
#endif
        ASSERT(isDefined(cacheResult->resultSize.width));
        result.dim[DimWidth] = cacheResult->resultSize.width;
        break;
      case LayoutActionMeasureHeight:
#ifdef LAYOUT_TIME_ANALYZE
        measureCacheCount++;
#endif
        ASSERT(isDefined(cacheResult->resultSize.height));
        result.dim[DimHeight] = cacheResult->resultSize.height;
        break;
      case LayoutActionLayout:

        // if it's a measure node and cache result cached by
        // LayoutActionMeasureWidth or LayoutActionMeasureHeight so this is first
        // layout for current Measure Node, set hasNewLayout as true, if not,
        // this node's layout result value has been fetched to java and set
        // hasNewLayout false in FlexNode.cc so not set hasNewLayout as true to
        // avoid JNI call again in FLexNode.cc
        if (cacheResult->layoutAction != LayoutActionLayout && measure != nullptr) {
          // need assign result size if layoutAction is different 3.14.2018
          result.dim[DimWidth] = cacheResult->resultSize.width;
          result.dim[DimHeight] = cacheResult->resultSize.height;
          cacheLayoutOrMeasureResult(availableSize, measureMode, layoutAction);
        } else {
#ifdef LAYOUT_TIME_ANALYZE
          layoutCacheCount++;
#endif
          // do nothing..
          // layoutCache.cachedLayout object is last layout result.
          // used to determine need layout or not.
        }

        // if it's a measure node , layout could be cache by
        // LayoutActionMeasureWidth or LayoutActionMeasureHeight,so in this case,
        // we need set dirty as false;
        setDirty(false);

        break;
      default:
        break;
    }
    return;
  }
  // before layout set result's hadOverflow as false.
  if (layoutAction == LayoutActionLayout) {
    result.hadOverflow = false;
  }
  // single element measure width and height
  if ((children.size() == 0)) {
    layoutSingleNode(availableWidth, widthMeasureMode, availableHeight, heightMeasureMode,
                     layoutAction, layoutContext);
    return;
  }
  // 3.Determine the flex base size and hypothetical main size of each item
  calculateItemsFlexBasis(availableSize, layoutContext);
  // 9.3. Main Size Determination
  // 5. Collect flex items into flex lines:
  std::vector<FlexLine*> flexLines;
  bool sumHypotheticalMainSizeOverflow = collectFlexLines(flexLines, availableSize);

  // get max line's  main size
  float maxSumItemsMainSize = 0;
  for (size_t i = 0; i < flexLines.size(); i++) {
    if (flexLines[i]->sumHypotheticalMainSize > maxSumItemsMainSize) {
      maxSumItemsMainSize = flexLines[i]->sumHypotheticalMainSize;
    }
  }

  // 4. Determine the main size of the flex container using the rules of the
  // formatting context
  // in which it participates. For this computation, auto margins on flex items
  // are treated as 0.
  // TODO(ianwang): if has set , what to do for next run in determineCrossAxisSize's
  // layoutImpl
  float containerInnerMainSize = 0.0f;
  if (isDefined(style.dim[axisDim[mainAxis]])) {
    // MeasureModeExactly
    containerInnerMainSize = style.dim[axisDim[mainAxis]] - getPaddingAndBorder(mainAxis);
  } else {
    if (sumHypotheticalMainSizeOverflow) {  // MeasureModeAtMost
      // if sum of hypothetical MainSize > available size;
      float mainInnerSize =
          axisDim[mainAxis] == DimWidth ? availableSize.width : availableSize.height;

      if (maxSumItemsMainSize > mainInnerSize && !style.isOverflowScroll()) {
        if (parent && parent->getNodeAlign(this) == FlexAlignStretch &&
            axisDim[mainAxis] == axisDim[parent->resolveCrossAxis()] &&
            style.positionType != PositionTypeAbsolute) {
          // it this node has text child and node main axis(width) is stretch
          // ,cross axis length(height) is undefined
          // text can has multi-line, text's height can affect parent's height
          // in this situation, use availableSize if possible
          containerInnerMainSize = mainInnerSize;
        } else {
          containerInnerMainSize = maxSumItemsMainSize;
        }
      } else {
        containerInnerMainSize = mainInnerSize;
      }
    } else {
      containerInnerMainSize = maxSumItemsMainSize;
    }
  }
  result.dim[axisDim[mainAxis]] =
      boundAxis(mainAxis, containerInnerMainSize + getPaddingAndBorder(mainAxis));
  // return if its just in measure
  if ((layoutAction == LayoutActionMeasureWidth && isRowDirection(mainAxis)) ||
      (layoutAction == LayoutActionMeasureHeight && isColumnDirection(mainAxis))) {
    // cache layout result & state...
    cacheLayoutOrMeasureResult(availableSize, measureMode, layoutAction);
    // free flexLines, allocate in collectFlexLines.
    // TODO(ianwang): opt.
    for (size_t i = 0; i < flexLines.size(); i++) {
      delete flexLines[i];
    }
    return;
  }

  // 6. Resolving Flexible Lengths
  // To resolve the flexible lengths of the items within a flex line:
  // TODO(ianwang): this's the only place that confirm child items main axis size, see
  // item->setLayoutDim
  determineItemsMainAxisSize(flexLines, layoutAction);

  // 9.4. Cross Size Determination
  // calculate line's cross size in flexLines
  // TODO(ianwang): The real place that Determine
  // the flex container's used cross size is at step 15.

  float sumLinesCrossSize =
      determineCrossAxisSize(flexLines, availableSize, layoutAction, layoutContext);

  if (!performLayout) {
    // TODO(ianwang): for measure, I put the calculate of flex container's cross size in
    // here..
    // TODO(ianwang): why must in step 15 in W3 flex layout algorithm
    // noted by ianwang 12.30.2017.

    // 15.Determine the flex container's used cross size:
    // If the cross size property is a definite size, use that,
    // clamped by the min and max cross size properties of the flex container.
    // Otherwise, use the sum of the flex lines' cross sizes,
    // clamped by the min and max cross size properties of the flex container.
    FlexDirection crossAxis = resolveCrossAxis();
    float crossDimSize;
    if (isDefined(style.dim[axisDim[crossAxis]])) {
      crossDimSize = style.dim[axisDim[crossAxis]];
    } else {
      crossDimSize = (sumLinesCrossSize + getPaddingAndBorder(crossAxis));
    }
    result.dim[axisDim[crossAxis]] = boundAxis(crossAxis, crossDimSize);
    // cache layout result & state...
    cacheLayoutOrMeasureResult(availableSize, measureMode, layoutAction);

    // free flexLines, allocate in collectFlexLines.
    for (size_t i = 0; i < flexLines.size(); i++) {
      delete flexLines[i];
    }
    return;
  }

  // 9.5. Main-Axis Alignment
  mainAxisAlignment(flexLines);

  // 9.6. Cross-Axis Alignment
  // if contianer's innerCross size not defined,
  // then it will be determined in step 15 of crossAxisAlignment
  crossAxisAlignment(flexLines);

  // free flexLines, allocate in collectFlexLines.
  for (size_t i = 0; i < flexLines.size(); i++) {
    delete flexLines[i];
  }

  // cache layout result & state...
  cacheLayoutOrMeasureResult(availableSize, measureMode, layoutAction);
  // layout fixed elements...
  layoutFixedItems(measureMode, layoutContext);

  return;
}

// 9.4. Cross Size Determination
float HPNode::determineCrossAxisSize(std::vector<FlexLine*>& flexLines,
                                     HPSize availableSize,
                                     FlexLayoutAction layoutAction,
                                     void* layoutContext) {
  FlexDirection mainAxis = style.flexDirection;
  FlexDirection crossAxis = resolveCrossAxis();
  float sumLinesCrossSize = 0;
  for (size_t i = 0; i < flexLines.size(); i++) {
    FlexLine* line = flexLines[i];
    float maxItemCrossSize = 0;
    for (size_t j = 0; j < line->items.size(); j++) {
      HPNodeRef item = line->items[j];
      // item's main axis size has been determined.
      // try to calculate the hypothetical cross size of each item
      // that would be stored in result.dim[crossAxis]
      // align stretch may be modify this value in the later step.

      // WARNING TODO::this is the only place that the Recursive flex layout
      // happen. 7.Determine the hypothetical cross size of each item by
      // performing layout with the used main size and the available space,
      // treating auto as fit-content.
      FlexLayoutAction oldLayoutAction = layoutAction;
      if (getNodeAlign(item) == FlexAlignStretch && item->style.isDimensionAuto(crossAxis) &&
          !item->style.hasAutoMargin(crossAxis) && layoutAction == LayoutActionLayout) {
        // Delay layout for stretch item, do layout later in step 11.
        layoutAction =
            axisDim[crossAxis] == DimWidth ? LayoutActionMeasureWidth : LayoutActionMeasureHeight;
      }
      float oldMainDim = item->style.getDim(mainAxis);
      item->style.setDim(mainAxis, item->getLayoutDim(mainAxis));
      item->layoutImpl(availableSize.width, availableSize.height, getLayoutDirection(),
                       layoutAction, layoutContext);
      item->style.setDim(mainAxis, oldMainDim);
      layoutAction = oldLayoutAction;
      // if child item had overflow , then transfer this state to its parent.
      // see HippyTest_HadOverflowTests.spacing_overflow_in_nested_nodes in
      // ./tests/HPHadOverflowTest.cpp
      result.hadOverflow = result.hadOverflow | item->result.hadOverflow;

      // TODO(ianwang): if need support baseline  add here
      // 8.Calculate the cross size of each flex line.
      // 1)Collect all the flex items whose inline-axis is parallel to the
      // main-axis, whose align-self is baseline, and whose cross-axis margins
      // are both non-auto. Find the largest of the distances between each item's
      // baseline and its hypothetical outer cross-start edge, and the largest of
      // the distances between each item's baseline and its hypothetical outer
      // cross-end edge, and sum these two values. 2)Among all the items not
      // collected by the previous step, find the largest outer hypothetical
      // cross size. 3)The used cross-size of the flex line is the largest of the
      // numbers found in the previous two steps and zero.

      // Max item cross size
      float itemOutCrossSize = item->getLayoutDim(crossAxis) + item->getMargin(crossAxis);
      if (itemOutCrossSize > maxItemCrossSize) {
        maxItemCrossSize = itemOutCrossSize;
      }
    }

    // 8.Calculate the cross size of each flex line.
    // clip current container cross axis size..
    maxItemCrossSize = boundAxis(crossAxis, maxItemCrossSize);
    line->lineCrossSize = maxItemCrossSize;
    sumLinesCrossSize += maxItemCrossSize;

    // single line , set line height as container inner height
    if (flexLines.size() == 1 && isDefined(style.dim[axisDim[crossAxis]])) {
      // if following assert is true, means front-end's style is in unsuitable
      // state .. such as main axis is undefined but set flex-wrap as FlexWrap.
      // ASSERT(style.flexWrap == FlexNoWrap);
      float innerCrossSize =
          boundAxis(crossAxis, style.dim[axisDim[crossAxis]]) - getPaddingAndBorder(crossAxis);

      line->lineCrossSize = innerCrossSize;
      sumLinesCrossSize = innerCrossSize;
    }
  }

  // 9.Handle 'align-content: stretch' for lines
  if (isDefined(style.dim[axisDim[crossAxis]]) && style.alignContent == FlexAlignStretch) {
    float innerCrossSize =
        boundAxis(crossAxis, style.dim[axisDim[crossAxis]]) - getPaddingAndBorder(crossAxis);
    if (sumLinesCrossSize < innerCrossSize) {
      for (size_t i = 0; i < flexLines.size(); i++) {
        FlexLine* line = flexLines[i];
        line->lineCrossSize += (innerCrossSize - sumLinesCrossSize) / flexLines.size();
      }
    }
  }

  // 11.Determine the used cross size of each flex item
  // Think about item align-self: stretch
  for (size_t i = 0; i < flexLines.size(); i++) {
    FlexLine* line = flexLines[i];
    for (size_t j = 0; j < line->items.size(); j++) {
      HPNodeRef item = line->items[j];

      // 1): If a flex item has align-self: stretch, its computed cross size
      // property is auto,
      //    and neither of its cross-axis margins are auto, the used outer cross
      //    size is the used cross size of its flex line, clamped according to
      //    the item's min and max cross size properties.
      // 2):Otherwise,the used cross size is the item's hypothetical cross size.
      if (getNodeAlign(item) == FlexAlignStretch && item->style.isDimensionAuto(crossAxis) &&
          !item->style.hasAutoMargin(crossAxis)) {
        item->result.dim[axisDim[crossAxis]] =
            item->boundAxis(crossAxis, line->lineCrossSize - item->getMargin(crossAxis));
        // If the flex item has align-self: stretch, redo layout for its
        // contents, treating this used size as its definite cross size so that
        // percentage-sized children can be resolved.
        float oldMainDim = item->style.getDim(mainAxis);
        float oldCrossDim = item->style.getDim(crossAxis);
        item->style.setDim(mainAxis, item->getLayoutDim(mainAxis));
        item->style.setDim(crossAxis, item->getLayoutDim(crossAxis));
        item->layoutImpl(availableSize.width, availableSize.height, getLayoutDirection(),
                         layoutAction, layoutContext);
        item->style.setDim(mainAxis, oldMainDim);
        item->style.setDim(crossAxis, oldCrossDim);

      } else {
        // Otherwise, the used cross size is the item's hypothetical cross size.
        // see the step7.
        // item's hypothetical cross size. has been set in
        // result.dim[axisDim[crossAxis]].
      }
    }
  }

  // TODO(ianwang): Why Determine  the flex container's used cross size in step 15.
  return sumLinesCrossSize;
}

// See  9.7 Resolving Flexible Lengths.
void HPNode::determineItemsMainAxisSize(std::vector<FlexLine*>& flexLines,
                                        FlexLayoutAction layoutAction) {
  FlexDirection mainAxis = style.flexDirection;
  float mainAxisContentSize = result.dim[axisDim[mainAxis]] - getPaddingAndBorder(mainAxis);
  // 6. Resolve the flexible lengths of all the flex items to find their used
  // main size (see section 9.7.)
  for (size_t i = 0; i < flexLines.size(); i++) {
    FlexLine* line = flexLines[i];
    line->SetContainerMainInnerSize(mainAxisContentSize);
    line->FreezeInflexibleItems(layoutAction);
    while (!line->ResolveFlexibleLengths()) {
      ASSERT(line->totalFlexGrow >= 0);
      ASSERT(line->totalFlexGrow >= 0);
    }

    if (layoutAction == LayoutActionLayout && line->remainingFreeSpace < 0) {
      result.hadOverflow = true;
    }
  }
}

// 9.5 Main-Axis Alignment
void HPNode::mainAxisAlignment(std::vector<FlexLine*>& flexLines) {
  // TODO(ianwang): RTL::
  // 12. Distribute any remaining free space. For each flex line:
  FlexDirection mainAxis = style.flexDirection;
  float mainAxisContentSize = getLayoutDim(mainAxis) - getPaddingAndBorder(mainAxis);
  for (size_t i = 0; i < flexLines.size(); i++) {
    FlexLine* line = flexLines[i];
    line->SetContainerMainInnerSize(mainAxisContentSize);
    line->alignItems();
  }
}

// 9.6 Cross-Axis Alignment
void HPNode::crossAxisAlignment(std::vector<FlexLine*>& flexLines) {
  FlexDirection crossAxis = resolveCrossAxis();
  float sumLinesCrossSize = 0;
  int linesCount = flexLines.size();
  for (int i = 0; i < linesCount; i++) {
    FlexLine* line = flexLines[i];
    sumLinesCrossSize += line->lineCrossSize;
    for (size_t j = 0; j < line->items.size(); j++) {
      HPNodeRef item = line->items[j];
      // 13.Resolve cross-axis auto margins. If a flex item has auto cross-axis
      // margins:
      float remainingFreeSpace =
          line->lineCrossSize - item->result.dim[axisDim[crossAxis]] - item->getMargin(crossAxis);
      if (remainingFreeSpace > 0) {
        // If its outer cross size (treating those auto margins as zero) is less
        // than the cross size of its flex line, distribute the difference in
        // those sizes equally to the auto margins.
        if (item->isAutoStartMargin(crossAxis) && item->isAutoEndMargin(crossAxis)) {
          item->setLayoutStartMargin(crossAxis, remainingFreeSpace / 2);
          item->setLayoutEndMargin(crossAxis, remainingFreeSpace / 2);
        } else if (item->isAutoStartMargin(crossAxis)) {
          item->setLayoutStartMargin(crossAxis, remainingFreeSpace);
        } else if (item->isAutoEndMargin(crossAxis)) {
          item->setLayoutEndMargin(crossAxis, remainingFreeSpace);
        } else {
          // For margin:: assign style value to result value at this place..
          item->setLayoutStartMargin(crossAxis, item->getStartMargin(crossAxis));
          item->setLayoutEndMargin(crossAxis, item->getEndMargin(crossAxis));
        }
      } else {
        // Otherwise, if the block-start or inline-start margin
        // (whichever is in the cross axis) is auto, set it to zero.
        // Set the opposite margin so that the outer cross size of the
        // item equals the cross size of its flex line.
        item->setLayoutStartMargin(crossAxis, item->getStartMargin(crossAxis));
        item->setLayoutEndMargin(crossAxis, item->getEndMargin(crossAxis));
      }

      // 14.Align all flex items along the cross-axis per align-self,
      // if neither of the item's cross-axis margins are auto.
      // calculate item's offset in its line by style align-self
      remainingFreeSpace = line->lineCrossSize - item->result.dim[axisDim[crossAxis]] -
                           item->getLayoutMargin(crossAxis);
      float offset = item->getLayoutStartMargin(crossAxis);
      switch (getNodeAlign(item)) {  // when align self is auto , it overwrite by align items
        case FlexAlignStart:
          break;
        case FlexAlignCenter:
          offset += remainingFreeSpace / 2;
          break;
        case FlexAlignEnd:
          offset += remainingFreeSpace;
          break;
          // TODO(ianwang): case baseline alignment
        default:
          break;
      }
      // include (axisStart[crossAxis] == CSSTop) and (axisStart[crossAxis] ==
      // CSSBottom) For temporary store. use false parameter
      item->setLayoutStartPosition(crossAxis, offset, false);
    }
  }

  // 15.Determine  the flex container's used cross size:
  // If the cross size property is a definite size, use that,
  // clamped by the min and max cross size properties of the flex container.
  // Otherwise, use the sum of the flex lines' cross sizes,
  // clamped by the min and max cross size properties of the flex container.

  float crossDimSize;
  if (isDefined(style.dim[axisDim[crossAxis]])) {
    crossDimSize = style.dim[axisDim[crossAxis]];
  } else {
    crossDimSize = (sumLinesCrossSize + getPaddingAndBorder(crossAxis));
  }
  result.dim[axisDim[crossAxis]] = boundAxis(crossAxis, crossDimSize);

  // when container's cross size determined align all flex lines by
  // align-content 16.Align all flex lines per align-content
  float innerCrossSize = result.dim[axisDim[crossAxis]] - getPaddingAndBorder(crossAxis);
  float remainingFreeSpace = innerCrossSize - sumLinesCrossSize;
  float offset = getStartPaddingAndBorder(crossAxis);
  float space = 0;
  switch (style.alignContent) {
    case FlexAlignStart:
      break;
    case FlexAlignCenter:
      offset += remainingFreeSpace / 2;
      break;
    case FlexAlignEnd:
      offset += remainingFreeSpace;
      break;
    case FlexAlignSpaceBetween:
      space = remainingFreeSpace / (linesCount - 1);
      break;
    case FlexAlignSpaceAround:
      space = remainingFreeSpace / linesCount;
      offset += space / 2;
      break;
    default:
      break;
  }

  // flex-end::
  // The cross-end margin edge of the flex item is placed flush with the
  // cross-end edge of the line. crossAxisPostionStart calculated along the cross
  // axis direction.
  float crossAxisPostionStart = offset;
  for (int i = 0; i < linesCount; i++) {
    FlexLine* line = flexLines[i];
    for (size_t j = 0; j < line->items.size(); j++) {
      HPNodeRef item = line->items[j];
      // include (axisStart[crossAxis] == CSSTop) and (axisStart[crossAxis] ==
      // CSSBottom) getLayoutStartPosition set in step 14.
      item->setLayoutStartPosition(crossAxis,
                                   crossAxisPostionStart + item->getLayoutStartPosition(crossAxis));
      // layout start position has use relative ,so end position not use it ,use
      // false parameter.
      item->setLayoutEndPosition(
          crossAxis,
          (getLayoutDim(crossAxis) - item->getLayoutStartPosition(crossAxis) -
           item->getLayoutDim(crossAxis)),
          false);
    }

    crossAxisPostionStart += line->lineCrossSize + space;
  }
}

// 4.1. Absolutely-Positioned Flex Children
// As it is out-of-flow, an absolutely-positioned child of a flex container
// does not participate in flex layout.
// The static position of an absolutely-positioned child of a flex container
// is determined such that the child is positioned as if it were the sole flex
// item in the flex container, assuming both the child and the flex container
// were fixed-size boxes of their used size. For this purpose, auto margins are
// treated as zero.
void HPNode::layoutFixedItems(HPSizeMode measureMode, void* layoutContext) {
  FlexDirection mainAxis = resolveMainAxis();
  FlexDirection crossAxis = resolveCrossAxis();
  std::vector<HPNodeRef>& items = children;
  for (size_t i = 0; i < items.size(); i++) {
    HPNodeRef item = items[i];
    // for display none item, reset its layout result.
    if (item->style.displayType == DisplayTypeNone) {
      item->resetLayoutRecursive();
      continue;
    }
    if (item->style.positionType != PositionTypeAbsolute) {
      continue;
    }

    float parentWidth = getLayoutDim(FLexDirectionRow) - getPaddingAndBorder(FLexDirectionRow);
    float parentHeight =
        getLayoutDim(FLexDirectionColumn) - getPaddingAndBorder(FLexDirectionColumn);

    float itemOldStyleDimMainAxis = item->style.getDim(mainAxis);
    float itemOldStyleDimCrossAxis = item->style.getDim(crossAxis);

    if (isUndefined(itemOldStyleDimMainAxis) && isDefined(item->style.getStartPosition(mainAxis)) &&
        isDefined(item->style.getEndPosition(mainAxis))) {
      item->style.setDim(mainAxis,
                         (getLayoutDim(mainAxis) - style.getStartBorder(mainAxis) -
                          style.getEndBorder(mainAxis) - item->style.getStartPosition(mainAxis) -
                          item->style.getEndPosition(mainAxis) - item->getMargin(mainAxis)));
    }

    if (isUndefined(itemOldStyleDimCrossAxis) &&
        isDefined(item->style.getStartPosition(crossAxis)) &&
        isDefined(item->style.getEndPosition(crossAxis))) {
      item->style.setDim(crossAxis,
                         (getLayoutDim(crossAxis) - style.getStartBorder(crossAxis) -
                          style.getEndBorder(crossAxis) - item->style.getStartPosition(crossAxis) -
                          item->style.getEndPosition(crossAxis) - item->getMargin(crossAxis)));
    }

    item->layoutImpl(parentWidth, parentHeight, getLayoutDirection(), LayoutActionLayout,
                     layoutContext);
    // recover item's previous style value
    item->style.setDim(mainAxis, itemOldStyleDimMainAxis);
    item->style.setDim(crossAxis, itemOldStyleDimCrossAxis);
    // after layout, calculate fix item 's postion
    // 1) for main axis
    calculateFixedItemPosition(item, mainAxis);
    // 2)for cross axis
    calculateFixedItemPosition(item, crossAxis);
  }
}

// when item's layout complete, update fixed item's position on Specified axis
// called in layoutFixedItems
// should be called twice, one for main axis ,one for cross axis
void HPNode::calculateFixedItemPosition(HPNodeRef item, FlexDirection axis) {
  if (isDefined(item->style.getStartPosition(axis))) {
    item->setLayoutStartPosition(axis, getStartBorder(axis) + item->getLayoutStartMargin(axis) +
                                           item->style.getStartPosition(axis));
    item->setLayoutEndPosition(
        axis, getLayoutDim(axis) - item->getLayoutStartPosition(axis) - item->getLayoutDim(axis));

  } else if (isDefined(item->style.getEndPosition(axis))) {
    item->setLayoutEndPosition(axis, getEndBorder(axis) + item->getLayoutEndMargin(axis) +
                                         item->style.getEndPosition(axis));
    item->setLayoutStartPosition(
        axis, getLayoutDim(axis) - item->getLayoutEndPosition(axis) - item->getLayoutDim(axis));
  } else {
    float remainingFreeSpace =
        getLayoutDim(axis) - getPaddingAndBorder(axis) - item->getLayoutDim(axis);
    float offset = getStartPaddingAndBorder(axis);
    FlexAlign alignMode = (axis == resolveMainAxis() ? style.justifyContent : getNodeAlign(item));
    switch (alignMode) {
      case FlexAlignStart:
        break;
      case FlexAlignCenter:
        offset += remainingFreeSpace / 2;
        break;
      case FlexAlignEnd:
        offset += remainingFreeSpace;
        break;
      default:
        break;
    }

    item->setLayoutStartPosition(
        axis, getStartPaddingAndBorder(axis) + item->getLayoutStartMargin(axis) + offset);
    item->setLayoutEndPosition(
        axis, getLayoutDim(axis) - item->getLayoutStartPosition(axis) - item->getLayoutDim(axis));
  }
}

// convert position and dimension values to integer value..
// absLeft, absTop is mainly think about the influence of parent's Fraction
// offset for example: if parent's Fraction offset is 0.3 and current child
// offset is 0.4 then the child's absolute offset  is 0.7. if use roundf ,
// roundf(0.7) == 1 so we need absLeft, absTop  parameter
void HPNode::convertLayoutResult(float absLeft, float absTop, float scaleFactor) {
  if (!hasNewLayout()) {
    return;
  }
  const float left = result.position[CSSLeft];
  const float top = result.position[CSSTop];
  const float width = result.dim[DimWidth];
  const float height = result.dim[DimHeight];

  absLeft += left;
  absTop += top;
  bool isTextNode = style.nodeType == NodeTypeText;
  result.position[CSSLeft] = HPRoundValueToPixelGrid(left, scaleFactor, false, isTextNode);
  result.position[CSSTop] = HPRoundValueToPixelGrid(top, scaleFactor, false, isTextNode);

  const bool hasFractionalWidth =
      !FloatIsEqual(fmodf(width, 1.0), 0) && !FloatIsEqual(fmodf(width, 1.0), 1.0);
  const bool hasFractionalHeight =
      !FloatIsEqual(fmodf(height, 1.0), 0) && !FloatIsEqual(fmodf(height, 1.0), 1.0);

  const float absRight = absLeft + width;
  const float absBottom = absTop + height;
  result.dim[DimWidth] = HPRoundValueToPixelGrid(absRight, scaleFactor,(isTextNode && hasFractionalWidth),
                                                 (isTextNode && !hasFractionalWidth)) -
                         HPRoundValueToPixelGrid(absLeft, scaleFactor, false, isTextNode);

  result.dim[DimHeight] = HPRoundValueToPixelGrid(absBottom, scaleFactor, (isTextNode && hasFractionalHeight),
                                                  (isTextNode && !hasFractionalHeight)) -
                          HPRoundValueToPixelGrid(absTop, scaleFactor, false, isTextNode);
  std::vector<HPNodeRef>& items = children;
  for (size_t i = 0; i < items.size(); i++) {
    HPNodeRef item = items[i];
    item->convertLayoutResult(absLeft, absTop, scaleFactor);
  }
}


float HPNode::scaleFactor = 1.0f;