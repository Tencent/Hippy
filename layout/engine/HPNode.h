/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
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

#ifndef HPNODE_H_
#define HPNODE_H_

#include <vector>
#include "HPUtil.h"

#include "Flex.h"
#include "HPStyle.h"
#include "FlexLine.h"
#include "HPLayoutCache.h"

class HPNode;
typedef HPNode * HPNodeRef;
typedef HPSize (*HPMeasureFunc)(HPNodeRef node, float width,
                                MeasureMode widthMeasureMode, float height,
                                MeasureMode heightMeasureMode,
                                void * layoutContext);
typedef void (*HPDirtiedFunc)(HPNodeRef node);

class HPNode {
 public:
  HPNode();
  virtual ~HPNode();
  void initLayoutResult();
  bool reset();
  void printNode(uint32_t indent = 0);
  HPStyle getStyle();
  void setStyle(const HPStyle& st);
  bool setMeasureFunc(HPMeasureFunc _measure);
  void setParent(HPNodeRef _parent);
  HPNodeRef getParent();
  void addChild(HPNodeRef item);
  bool insertChild(HPNodeRef item, uint32_t index);
  HPNodeRef getChild(uint32_t index);
  bool removeChild(HPNodeRef child);
  bool removeChild(uint32_t index);
  uint32_t childCount();

  void setDisplayType(DisplayType displayType);
  void setHasNewLayout(bool hasNewLayoutOrNot);
  bool hasNewLayout();
  void markAsDirty();
  void setDirty(bool dirtyOrNot);
  void setDirtiedFunc(HPDirtiedFunc _dirtiedFunc);

  void setContext(void * _context);
  void* getContext();

  float getStartBorder(FlexDirection axis);
  float getEndBorder(FlexDirection axis);
  float getStartPaddingAndBorder(FlexDirection axis);
  float getEndPaddingAndBorder(FlexDirection axis);
  float getPaddingAndBorder(FlexDirection axis);
  float getMargin(FlexDirection axis);
  float getStartMargin(FlexDirection axis);
  float getEndMargin(FlexDirection axis);
  bool isAutoStartMargin(FlexDirection axis);
  bool isAutoEndMargin(FlexDirection axis);

  void setLayoutStartMargin(FlexDirection axis, float value);
  void setLayoutEndMargin(FlexDirection axis, float value);
  float getLayoutMargin(FlexDirection axis);
  float getLayoutStartMargin(FlexDirection axis);
  float getLayoutEndMargin(FlexDirection axis);

  float resolveRelativePosition(FlexDirection axis, bool forAxisStart);
  void setLayoutStartPosition(FlexDirection axis, float value,
                              bool addRelativePosition = true);
  void setLayoutEndPosition(FlexDirection axis, float value,
                            bool addRelativePosition = true);
  float getLayoutStartPosition(FlexDirection axis);
  float getLayoutEndPosition(FlexDirection axis);

  //FlexDirection resolveMainAxis(HPDirection direction);
  FlexDirection resolveMainAxis();
  FlexDirection resolveCrossAxis();
  float boundAxis(FlexDirection axis, float value);
  void layout(float parentWidth, float parentHeight, HPDirection parentDirection = DirectionLTR,
              void * layoutContext = nullptr);
  float getMainAxisDim();
  float getLayoutDim(FlexDirection axis);
  bool isLayoutDimDefined(FlexDirection axis);
  void setLayoutDim(FlexDirection axis, float value);
  void setLayoutDirection(HPDirection direction);
  HPDirection getLayoutDirection();
  FlexAlign getNodeAlign(HPNodeRef item);

 protected:

  HPDirection resolveDirection(HPDirection parentDirection);
  void resolveStyleValues();
  void resetLayoutRecursive(bool isDisplayNone = true);
  void cacheLayoutOrMeasureResult(HPSize availableSize, HPSizeMode measureMode,
                                  FlexLayoutAction layoutAction);
  void layoutSingleNode(float availableWidth, MeasureMode widthMeasureMode,
                        float availableHeight, MeasureMode heightMeasureMode,
                        FlexLayoutAction layoutAction, void * layoutContext = nullptr);
  void layoutImpl(float parentWidth, float parentHeight, HPDirection parentDirection,
                  FlexLayoutAction layoutAction, void * layoutContext = nullptr);
  void calculateItemsFlexBasis(HPSize availableSize, void * layoutContext);
  bool collectFlexLines(std::vector<FlexLine *> & flexLines,
                        HPSize availableSize);
  void determineItemsMainAxisSize(std::vector<FlexLine *> & flexLines,
                                  FlexLayoutAction layoutAction);
  float determineCrossAxisSize(std::vector<FlexLine *>& flexLines,
                               HPSize availableSize,
                               FlexLayoutAction layoutAction,
                               void * layoutContext);
  void mainAxisAlignment(std::vector<FlexLine *> & flexLines);
  void crossAxisAlignment(std::vector<FlexLine *> & flexLines);

  void layoutFixedItems(HPSizeMode measureMode, void * layoutContext);
  void calculateFixedItemPosition(HPNodeRef item, FlexDirection axis);

  void convertLayoutResult(float absLeft, float absTop);
 public:
  HPStyle style;
  HPLayout result;

  void* context;
  std::vector<HPNodeRef> children;
  HPNodeRef parent;
  HPMeasureFunc measure;

  bool isFrozen;
  bool isDirty;
  bool _hasNewLayout;
  HPDirtiedFunc dirtiedFunc;

  //cache layout or measure positions, used if conditions are met
  HPLayoutCache layoutCache;
  //layout result is in initial state or not
  bool inInitailState;
#ifdef  LAYOUT_TIME_ANALYZE
  int fetchCount;
#endif
};

#endif
