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

#pragma once

#include <vector>

#include "MTTFlex.h"

class MTTNode;
typedef MTTNode* MTTNodeRef;

enum FlexSign {
  PositiveFlexibility,
  NegativeFlexibility,
};

class FlexLine {
 public:
  explicit FlexLine(MTTNodeRef container);
  void addItem(MTTNodeRef item);
  bool isEmpty();
  FlexSign Sign() const {
    return sumHypotheticalMainSize < containerMainInnerSize ? PositiveFlexibility
                                                            : NegativeFlexibility;
  }
  void SetContainerMainInnerSize(float size) { containerMainInnerSize = size; }
  void FreezeViolations(std::vector<MTTNode*>& violations);
  void FreezeInflexibleItems(FlexLayoutAction layoutAction);
  bool ResolveFlexibleLengths();
  void alignItems();

 public:
  std::vector<MTTNodeRef> items;
  MTTNodeRef flexContainer;
  // inner size in container main axis
  float containerMainInnerSize;
  // accumulate item's Hypothetical MainSize in this line(include item's margin)
  float sumHypotheticalMainSize;
  // accumulate flex grow of items in this line
  float totalFlexGrow;
  float totalFlexShrink;
  // accumulate item's flexShrink * item 's mainSize
  float totalWeightedFlexShrink;

  // this line's cross size:if this is a single line, may be determined by
  // container's style otherwise  determined by the largest item 's cross size.
  float lineCrossSize;

  // init in FreezeInflexibleItems...
  float initialFreeSpace;
  float remainingFreeSpace;
};
