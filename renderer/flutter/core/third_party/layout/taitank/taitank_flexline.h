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

#ifndef TAITANK_TAITANK_FLEXLINE_H_
#define TAITANK_TAITANK_FLEXLINE_H_

#include <vector>

#include "taitank_flex.h"

namespace taitank {
class TaitankNode;
typedef TaitankNode* TaitankNodeRef;

enum FlexSign {
  PositiveFlexibility,
  NegativeFlexibility,
};

class FlexLine {
 public:
  explicit FlexLine(TaitankNodeRef container);
  void AddItem(TaitankNodeRef item);
  bool is_empty();
  FlexSign Sign() const {
    return sum_hypothetical_main_size_ < container_main_inner_size_ ? PositiveFlexibility
                                                                    : NegativeFlexibility;
  }
  void SetContainerMainInnerSize(float size) { container_main_inner_size_ = size; }
  void FreezeViolations(std::vector<TaitankNode*>& violations);
  void FreezeInflexibleItems(FlexLayoutAction layoutAction);
  bool ResolveFlexibleLengths();
  void AlignItems();

 public:
  std::vector<TaitankNodeRef> items_;
  TaitankNodeRef flex_container_;
  // inner size in container main axis
  float container_main_inner_size_;
  // accumulate item's Hypothetical MainSize in this line(include item's margin)
  float sum_hypothetical_main_size_;
  // accumulate flex grow of items in this line
  float total_flex_grow_;
  float total_flex_shrink_;
  // accumulate item's flexShrink * item 's mainSize
  float total_weighted_flex_shrink_;

  // this line's cross size:if this is a single line, may be determined by container's style
  // otherwise  determined by the largest item 's cross size.
  float line_cross_size_;

  // init in FreezeInflexibleItems...
  float initial_free_space_;
  float remaining_free_space_;
};
}  // namespace taitank

#endif  // TAITANK_TAITANK_FLEXLINE_H_
