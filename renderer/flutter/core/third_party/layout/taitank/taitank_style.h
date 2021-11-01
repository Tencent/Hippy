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

#ifndef TAITANK_TAITANK_STYLE_H_
#define TAITANK_TAITANK_STYLE_H_

#include <memory.h>

#include <string>

#include "taitank_flex.h"
#include "taitank_util.h"

namespace taitank {

const int kCssPropsCount = 6;

class TaitankStyle {
 public:
  TaitankStyle();
  virtual ~TaitankStyle();
  std::string toString();
  void set_direction(const TaitankDirection direction) { direction_ = direction; }

  bool set_margin(CSSDirection dir, float value);
  bool set_padding(CSSDirection dir, float value);
  bool set_border(CSSDirection dir, float value);

  bool is_dimension_auto(FlexDirection axis);
  float get_start_border(FlexDirection axis);
  float get_end_border(FlexDirection axis);
  float get_start_padding(FlexDirection axis);
  float get_end_padding(FlexDirection axis);
  float get_start_margin(FlexDirection axis);
  float get_end_margin(FlexDirection axis);
  float get_margin(FlexDirection axis);
  bool is_auto_start_margin(FlexDirection axis);
  bool is_auto_end_margin(FlexDirection axis);
  bool has_auto_margin(FlexDirection axis);

  bool set_position(CSSDirection dir, float value);
  float get_start_position(FlexDirection axis);
  float get_end_position(FlexDirection axis);
  void set_dim(FlexDirection axis, float value);
  float get_dim(FlexDirection axis);
  void set_dim(Dimension dimension, float value);
  float get_dim(Dimension dimension);
  bool is_overflow_scroll();
  float get_flex_basis();

 public:
  NodeType node_type_;
  TaitankDirection direction_;
  FlexDirection flex_direction_;
  FlexAlign justify_content_;
  FlexAlign align_content_;
  FlexAlign align_items_;
  FlexAlign align_self_;
  FlexWrapMode flex_wrap_;
  PositionType position_type_;
  DisplayType display_type_;
  OverflowType overflow_type_;

  float flex_basis_;
  float flex_grow_;
  float flex_shrink_;
  float flex_;

  float margin_[kCssPropsCount];
  CSSDirection margin_from_[kCssPropsCount];
  float padding_[kCssPropsCount];
  CSSDirection padding_from_[kCssPropsCount];
  float border_[kCssPropsCount];
  CSSDirection border_from_[kCssPropsCount];
  float position_[kCssPropsCount];

  float dim_[2];
  float min_dim_[2];
  float max_dim_[2];

  float item_space_;
  float line_space_;
};

}  // namespace taitank

#endif  // TAITANK_TAITANK_STYLE_H_
