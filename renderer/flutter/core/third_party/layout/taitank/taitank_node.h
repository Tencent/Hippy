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

#ifndef TAITANK_TAITANK_NODE_H_
#define TAITANK_TAITANK_NODE_H_

#include <vector>

#include "taitank_cache.h"
#include "taitank_flex.h"
#include "taitank_flexline.h"
#include "taitank_style.h"
#include "taitank_util.h"

namespace taitank {

class TaitankNode;
typedef TaitankNode* TaitankNodeRef;
typedef TaitankSize (*TaitankMeasureFunction)(TaitankNodeRef node, float width,
                                              MeasureMode width_measure_mode, float height,
                                              MeasureMode height_measure_mode,
                                              void* layout_context);
typedef void (*TaitankDirtiedFunction)(TaitankNodeRef node);

class TaitankNode {
 public:
  TaitankNode();
  virtual ~TaitankNode();
  void InitLayoutResult();
  bool Reset();
  void PrintNode(uint32_t indent = 0);
  TaitankStyle get_style();
  void set_style(const TaitankStyle& st);
  bool set_measure_function(TaitankMeasureFunction measure_function);
  void set_parent(TaitankNodeRef parent_ref);
  TaitankNodeRef get_parent();
  void AddChild(TaitankNodeRef item);
  bool InsertChild(TaitankNodeRef item, uint32_t index);
  TaitankNodeRef get_child(uint32_t index);
  bool RemoveChild(TaitankNodeRef child);
  bool RemoveChild(uint32_t index);
  uint32_t child_count();

  void set_display_type(DisplayType display_type);
  void set_has_new_layout(bool has_new_layout);
  bool get_has_new_layout();
  void markAsDirty();
  void set_dirty(bool dirty);
  void set_dirtied_function(TaitankDirtiedFunction dirtied_function);

  void set_context(void* context);
  void* get_context();

  float get_start_border(FlexDirection axis);
  float get_end_border(FlexDirection axis);
  float get_start_padding_and_border(FlexDirection axis);
  float get_end_padding_and_border(FlexDirection axis);
  float get_padding_and_border(FlexDirection axis);
  float get_margin(FlexDirection axis);
  float get_start_margin(FlexDirection axis);
  float get_end_margin(FlexDirection axis);
  bool is_auto_start_margin(FlexDirection axis);
  bool is_auto_end_margin(FlexDirection axis);

  void set_layout_start_margin(FlexDirection axis, float value);
  void set_layout_end_margin(FlexDirection axis, float value);
  float get_layout_margin(FlexDirection axis);
  float get_layout_start_margin(FlexDirection axis);
  float get_layout_end_margin(FlexDirection axis);

  float ResolveRelativePosition(FlexDirection axis, bool for_axis_start);
  void set_layout_start_position(FlexDirection axis, float value,
                                 bool add_relative_position = true);
  void set_layout_end_position(FlexDirection axis, float value, bool add_relative_position = true);
  float get_layout_start_position(FlexDirection axis);
  float get_layout_end_position(FlexDirection axis);

  // FlexDirection resolveMainAxis(HPDirection direction);
  FlexDirection ResolveMainAxis();
  FlexDirection ResolveCrossAxis();
  float get_bound_axis(FlexDirection axis, float value);
  void layout(float parent_width, float parent_height,
              TaitankDirection parent_direction = DIRECTION_LTR, void* layout_context = nullptr);
  float get_main_axis_dim();
  float get_layout_dim(FlexDirection axis);
  bool is_layout_dim_defined(FlexDirection axis);
  void set_layout_dim(FlexDirection axis, float value);
  void set_layout_direction(TaitankDirection direction);
  TaitankDirection get_layout_direction();
  FlexAlign get_node_align(TaitankNodeRef item);

 protected:
  TaitankDirection ResolveDirection(TaitankDirection parentDirection);
  void ResolveStyleValues();
  void ResetLayoutRecursive(bool is_display_none = true);
  void CacheLayoutOrMeasureResult(TaitankSize available_size, TaitankSizeMode measure_mode,
                                  FlexLayoutAction layout_action);
  void LayoutSingleNode(float available_width, MeasureMode width_measure_mode,
                        float available_height, MeasureMode height_measure_mode,
                        FlexLayoutAction layout_action, void* layout_context = nullptr);
  void LayoutImpl(float parent_width, float parent_height, TaitankDirection parent_direction,
                  FlexLayoutAction layout_action, void* layout_context = nullptr);
  void CalculateItemsFlexBasis(TaitankSize available_size, void* layout_context);
  bool CollectFlexLines(std::vector<FlexLine*>& flex_lines, TaitankSize available_size);
  void DetermineItemsMainAxisSize(std::vector<FlexLine*>& flexLines, FlexLayoutAction layoutAction);
  float DetermineCrossAxisSize(std::vector<FlexLine*>& flexLines, TaitankSize availableSize,
                               FlexLayoutAction layoutAction, void* layoutContext);
  void MainAxisAlignment(std::vector<FlexLine*>& flexLines);
  void CrossAxisAlignment(std::vector<FlexLine*>& flexLines);

  void LayoutFixedItems(TaitankSizeMode measureMode, void* layoutContext);
  void CalculateFixedItemPosition(TaitankNodeRef item, FlexDirection axis);

  void ConvertLayoutResult(float absLeft, float absTop);

 public:
  TaitankStyle style_;
  TaitankLayout layout_result_;

  void* context_;
  std::vector<TaitankNodeRef> children_;
  TaitankNodeRef parent_;
  TaitankMeasureFunction measure_;

  bool is_frozen_;
  bool is_dirty_;
  bool has_new_layout_;
  TaitankDirtiedFunction dirtied_function_;

  // cache layout or measure positions, used if conditions are met
  TaitankLayoutCache layout_cache_;
  // layout result is in initial state or not
  bool in_initail_state_;
#ifdef LAYOUT_TIME_ANALYZE
  int fetchCount;
#endif
};

}  // namespace taitank

#endif  // TAITANK_TAITANK_NODE_H_