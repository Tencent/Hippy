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

#include "taitank.h"

#include "taitank_util.h"

namespace taitank {

TaitankNodeRef TaitankNodeCreate() { return new TaitankNode(); }

void TaitankNodeFree(TaitankNodeRef node) {
  if (node == nullptr) return;
  // free self
  delete node;
}

void TaitankNodeFreeRecursive(TaitankNodeRef node) {
  if (node == nullptr) {
    return;
  }

  while (node->child_count() > 0) {
    TaitankNodeRef child = node->get_child(0);
    TaitankNodeFreeRecursive(child);
  }

  TaitankNodeFree(node);
}

void set_taitank_node_style_direction(TaitankNodeRef node, TaitankDirection direction) {
  if (node == nullptr || node->style_.direction_ == direction) {
    return;
  }

  node->style_.direction_ = direction;
  node->markAsDirty();
}

void set_taitank_node_style_width(TaitankNodeRef node, float width) {
  if (node == nullptr || FloatIsEqual(node->style_.dim_[DIMENSION_WIDTH], width)) {
    return;
  }

  node->style_.dim_[DIMENSION_WIDTH] = width;
  node->markAsDirty();
}

void set_taitank_node_style_height(TaitankNodeRef node, float height) {
  if (node == nullptr || FloatIsEqual(node->style_.dim_[DIMENSION_HEIGHT], height)) return;

  node->style_.dim_[DIMENSION_HEIGHT] = height;
  node->markAsDirty();
}

bool set_taitank_node_measure_function(TaitankNodeRef node,
                                       TaitankMeasureFunction measure_function) {
  if (node == nullptr) return false;

  return node->set_measure_function(measure_function);
}

void set_taitank_node_style_flex(TaitankNodeRef node, float flex) {
  if (node == nullptr || FloatIsEqual(node->style_.flex_, flex)) return;
  if (FloatIsEqual(flex, 0.0f)) {
    set_taitank_node_style_flex_grow(node, 0.0f);
    set_taitank_node_style_flex_shrink(node, 0.0f);
  } else if (flex > 0.0f) {
    set_taitank_node_style_flex_grow(node, flex);
    set_taitank_node_style_flex_shrink(node, 1.0f);
  } else {
    set_taitank_node_style_flex_grow(node, 0.0f);
    set_taitank_node_style_flex_shrink(node, -flex);
  }
  node->style_.flex_ = flex;
  node->markAsDirty();
}

void set_taitank_node_style_flex_grow(TaitankNodeRef node, float flex_grow) {
  if (node == nullptr || FloatIsEqual(node->style_.flex_grow_, flex_grow)) return;

  node->style_.flex_grow_ = flex_grow;
  node->markAsDirty();
}

void set_taitank_node_style_flex_shrink(TaitankNodeRef node, float flex_shrink) {
  if (node == nullptr || FloatIsEqual(node->style_.flex_shrink_, flex_shrink)) return;

  node->style_.flex_shrink_ = flex_shrink;
  node->markAsDirty();
}

void set_taitank_node_style_flex_basis(TaitankNodeRef node, float flex_basis) {
  if (node == nullptr || FloatIsEqual(node->style_.flex_basis_, flex_basis)) return;

  node->style_.flex_basis_ = flex_basis;
  node->markAsDirty();
}

void set_taitank_node_style_flex_direction(TaitankNodeRef node, FlexDirection direction) {
  if (node == nullptr || node->style_.flex_direction_ == direction) return;

  node->style_.flex_direction_ = direction;
  node->markAsDirty();
}

void set_taitank_node_style_position_type(TaitankNodeRef node, PositionType position_type) {
  if (node == nullptr || node->style_.position_type_ == position_type) return;
  node->style_.position_type_ = position_type;
  node->markAsDirty();
}

void set_taitank_node_style_position(TaitankNodeRef node, CSSDirection dir, float value) {
  if (node == nullptr || FloatIsEqual(node->style_.position_[dir], value)) return;
  if (node->style_.set_position(dir, value)) {
    node->markAsDirty();
  }
}

void set_taitank_node_style_margin(TaitankNodeRef node, CSSDirection dir, float value) {
  if (node == nullptr) return;
  if (node->style_.set_margin(dir, value)) {
    node->markAsDirty();
  }
}

void set_taitank_node_style_margin_auto(TaitankNodeRef node, CSSDirection dir) {
  set_taitank_node_style_margin(node, dir, VALUE_AUTO);
}

void set_taitank_node_style_padding(TaitankNodeRef node, CSSDirection dir, float value) {
  if (node == nullptr) return;
  if (node->style_.set_padding(dir, value)) {
    node->markAsDirty();
  }
}

void set_taitank_node_style_border(TaitankNodeRef node, CSSDirection dir, float value) {
  if (node == nullptr) return;
  if (node->style_.set_border(dir, value)) {
    node->markAsDirty();
  }
}

void set_taitank_node_style_flex_wrap(TaitankNodeRef node, FlexWrapMode wrap_mode) {
  if (node == nullptr || node->style_.flex_wrap_ == wrap_mode) return;

  node->style_.flex_wrap_ = wrap_mode;
  node->markAsDirty();
}

void set_taitank_node_style_justify_content(TaitankNodeRef node, FlexAlign justify) {
  if (node == nullptr || node->style_.justify_content_ == justify) return;
  node->style_.justify_content_ = justify;
  node->markAsDirty();
}

void set_taitank_node_style_align_content(TaitankNodeRef node, FlexAlign align) {
  if (node == nullptr || node->style_.align_content_ == align) return;
  node->style_.align_content_ = align;
  node->markAsDirty();
}

void set_taitank_node_style_align_items(TaitankNodeRef node, FlexAlign align) {
  if (node == nullptr || node->style_.align_items_ == align) return;
  // FlexAlignStart == FlexAlignBaseline
  node->style_.align_items_ = align;
  node->markAsDirty();
}

void set_taitank_node_style_align_self(TaitankNodeRef node, FlexAlign align) {
  if (node == nullptr || node->style_.align_self_ == align) return;
  node->style_.align_self_ = align;
  node->markAsDirty();
}

float get_taitank_node_layout_left(TaitankNodeRef node) {
  if (node == nullptr) return 0;
  return node->layout_result_.position[CSS_LEFT];
}

float get_taitank_node_layout_top(TaitankNodeRef node) {
  if (node == nullptr) return 0;
  return node->layout_result_.position[CSS_TOP];
}

float get_taitank_node_layout_right(TaitankNodeRef node) {
  if (node == nullptr) return 0;
  return node->layout_result_.position[CSS_RIGHT];
}

float get_taitank_node_layout_bottom(TaitankNodeRef node) {
  if (node == nullptr) return 0;
  return node->layout_result_.position[CSS_BOTTOM];
}

float get_taitank_node_layout_width(TaitankNodeRef node) {
  if (node == nullptr) return 0;
  return node->layout_result_.dim[DIMENSION_WIDTH];
}

float get_taitank_node_layout_height(TaitankNodeRef node) {
  if (node == nullptr) return 0;
  return node->layout_result_.dim[DIMENSION_HEIGHT];
}

float get_taitank_node_layout_margin(TaitankNodeRef node, CSSDirection dir) {
  if (node == nullptr || dir > CSS_BOTTOM) return 0;
  return node->layout_result_.margin[dir];
}

float get_taitank_node_layout_padding(TaitankNodeRef node, CSSDirection dir) {
  if (node == nullptr || dir > CSS_BOTTOM) return 0;
  return node->layout_result_.padding[dir];
}
float get_taitank_node_layout_border(TaitankNodeRef node, CSSDirection dir) {
  if (node == nullptr || dir > CSS_BOTTOM) return 0;
  return node->layout_result_.border[dir];
}
bool get_taitank_node_layout_had_overflow(TaitankNodeRef node) {
  if (node == nullptr) return false;
  return node->layout_result_.had_overflow;
}

void set_taitank_node_style_display(TaitankNodeRef node, DisplayType display_type) {
  if (node == nullptr) return;
  node->set_display_type(display_type);
}

void set_taitank_node_style_max_width(TaitankNodeRef node, float value) {
  if (node == nullptr || FloatIsEqual(node->style_.max_dim_[DIMENSION_WIDTH], value)) return;
  node->style_.max_dim_[DIMENSION_WIDTH] = value;
  node->markAsDirty();
}

void set_taitank_node_style_max_height(TaitankNodeRef node, float value) {
  if (node == nullptr || FloatIsEqual(node->style_.max_dim_[DIMENSION_HEIGHT], value)) return;
  node->style_.max_dim_[DIMENSION_HEIGHT] = value;
  node->markAsDirty();
}

void set_taitank_node_style_min_width(TaitankNodeRef node, float value) {
  if (node == nullptr || FloatIsEqual(node->style_.min_dim_[DIMENSION_WIDTH], value)) return;
  node->style_.min_dim_[DIMENSION_WIDTH] = value;
  node->markAsDirty();
}

void set_taitank_node_style_min_height(TaitankNodeRef node, float value) {
  if (node == nullptr || FloatIsEqual(node->style_.min_dim_[DIMENSION_HEIGHT], value)) return;
  node->style_.min_dim_[DIMENSION_HEIGHT] = value;
  node->markAsDirty();
}

void set_taitank_node_node_type(TaitankNodeRef node, NodeType node_type) {
  if (node == nullptr || node_type == node->style_.node_type_) return;
  node->style_.node_type_ = node_type;
  //  node->markAsDirty();
}

void set_taitank_node_style_overflow(TaitankNodeRef node, OverflowType overflow_type) {
  if (node == nullptr || overflow_type == node->style_.overflow_type_) return;

  node->style_.overflow_type_ = overflow_type;
  node->markAsDirty();
}

bool TaitankNodeInsertChild(TaitankNodeRef node, TaitankNodeRef child, uint32_t index) {
  if (node == nullptr) return false;

  return node->InsertChild(child, index);
}

bool TaitankNodeRemoveChild(TaitankNodeRef node, TaitankNodeRef child) {
  if (node == nullptr) return false;
  return node->RemoveChild(child);
}

bool get_taitank_node_has_new_layout(TaitankNodeRef node) {
  if (node == nullptr) return false;
  return node->get_has_new_layout();
}

void set_taitank_node_has_new_layout(TaitankNodeRef node, bool has_new_layout) {
  if (node == nullptr) return;
  node->set_has_new_layout(has_new_layout);
}

void TaitankNodeMarkDirty(TaitankNodeRef node) {
  if (node == nullptr) return;
  node->markAsDirty();
}

bool TaitankNodeIsDirty(TaitankNodeRef node) {
  if (node == nullptr) return false;
  return node->is_dirty_;
}

void TaitankNodeDoLayout(TaitankNodeRef node, float parent_width, float parent_height,
                         TaitankDirection direction, void* layoutContext) {
  if (node == nullptr) return;

  node->layout(parent_width, parent_height, direction, layoutContext);
}

void TaitankNodePrint(TaitankNodeRef node) {
  if (node == nullptr) return;
  node->PrintNode();
}

bool TaitankNodeReset(TaitankNodeRef node) {
  if (node == nullptr || node->child_count() != 0 || node->get_parent() != nullptr) return false;

  return node->Reset();
}
}  // namespace taitank
