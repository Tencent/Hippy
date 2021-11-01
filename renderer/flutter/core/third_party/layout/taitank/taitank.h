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

#ifndef TAITANK_TAITANK_H_
#define TAITANK_TAITANK_H_

#include "taitank_node.h"

namespace taitank {

TaitankNodeRef TaitankNodeCreate();
void TaitankNodeFree(TaitankNodeRef node);
void TaitankNodeFreeRecursive(TaitankNodeRef node);

bool set_taitank_node_measure_function(TaitankNodeRef node,
                                       TaitankMeasureFunction measure_function);
void set_taitank_node_style_direction(TaitankNodeRef node, TaitankDirection direction);
void set_taitank_node_style_width(TaitankNodeRef node, float width);
void set_taitank_node_style_height(TaitankNodeRef node, float height);
void set_taitank_node_style_flex(TaitankNodeRef node, float flex);
void set_taitank_node_style_flex_grow(TaitankNodeRef node, float flex_grow);
void set_taitank_node_style_flex_shrink(TaitankNodeRef node, float flex_shrink);
void set_taitank_node_style_flex_basis(TaitankNodeRef node, float flex_basis);
void set_taitank_node_style_flex_direction(TaitankNodeRef node, FlexDirection direction);
void set_taitank_node_style_position_type(TaitankNodeRef node, PositionType position_type);
void set_taitank_node_style_position(TaitankNodeRef node, CSSDirection dir, float value);
void set_taitank_node_style_margin(TaitankNodeRef node, CSSDirection dir, float value);
void set_taitank_node_style_margin_auto(TaitankNodeRef node, CSSDirection dir);
void set_taitank_node_style_padding(TaitankNodeRef node, CSSDirection dir, float value);
void set_taitank_node_style_border(TaitankNodeRef node, CSSDirection dir, float value);

void set_taitank_node_style_flex_wrap(TaitankNodeRef node, FlexWrapMode wrap_mode);
void set_taitank_node_style_justify_content(TaitankNodeRef node, FlexAlign justify);
void set_taitank_node_style_align_content(TaitankNodeRef node, FlexAlign align);
void set_taitank_node_style_align_items(TaitankNodeRef node, FlexAlign align);
void set_taitank_node_style_align_self(TaitankNodeRef node, FlexAlign align);
void set_taitank_node_style_display(TaitankNodeRef node, DisplayType display_type);
void set_taitank_node_style_max_width(TaitankNodeRef node, float value);
void set_taitank_node_style_max_height(TaitankNodeRef node, float value);
void set_taitank_node_style_min_width(TaitankNodeRef node, float value);
void set_taitank_node_style_min_height(TaitankNodeRef node, float value);
void set_taitank_node_style_overflow(TaitankNodeRef node, OverflowType overflow_type);
void set_taitank_node_node_type(TaitankNodeRef node, NodeType nodeType);

float get_taitank_node_layout_left(TaitankNodeRef node);
float get_taitank_node_layout_top(TaitankNodeRef node);
float get_taitank_node_layout_right(TaitankNodeRef node);
float get_taitank_node_layout_bottom(TaitankNodeRef node);
float get_taitank_node_layout_width(TaitankNodeRef node);
float get_taitank_node_layout_height(TaitankNodeRef node);
float get_taitank_node_layout_margin(TaitankNodeRef node, CSSDirection dir);
float get_taitank_node_layout_padding(TaitankNodeRef node, CSSDirection dir);
float get_taitank_node_layout_border(TaitankNodeRef node, CSSDirection dir);
bool get_taitank_node_layout_had_overflow(TaitankNodeRef node);

bool TaitankNodeInsertChild(TaitankNodeRef node, TaitankNodeRef child, uint32_t index);
bool TaitankNodeRemoveChild(TaitankNodeRef node, TaitankNodeRef child);

bool get_taitank_node_has_new_layout(TaitankNodeRef node);
void set_taitank_node_has_new_layout(TaitankNodeRef node, bool has_new_layout);

void TaitankNodeMarkDirty(TaitankNodeRef node);
bool TaitankNodeIsDirty(TaitankNodeRef node);
void TaitankNodeDoLayout(TaitankNodeRef node, float parent_width, float parent_height,
                         TaitankDirection direction = DIRECTION_LTR,
                         void* layout_context = nullptr);
void TaitankNodePrint(TaitankNodeRef node);
bool TaitankNodeReset(TaitankNodeRef node);
}  // namespace taitank

#endif  // TAITANK_TAITANK_H_
