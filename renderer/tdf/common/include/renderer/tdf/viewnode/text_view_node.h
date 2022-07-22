/**
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#pragma once

#include "core/support/paragraph/TextStyle.h"
#include "core/tdfi/view/text/text_view.h"
#include "renderer/tdf/viewnode/view_names.h"
#include "renderer/tdf/viewnode/view_node.h"

namespace tdfrender {

using hippy::LayoutMeasureMode;
using tdfcore::TextView;
using tdfcore::textlayout::TextAlign;
using tdfcore::textlayout::TextDecoration;
using tdfcore::textlayout::TextShadow;
using tdfcore::textlayout::TextStyle;

class TextViewNode : public ViewNode {
 public:
  explicit TextViewNode(const RenderInfo info);

  static node_creator GetTextViewNodeCreator();

  void OnCreate() override;

 protected:
  void HandleStyleUpdate(const DomStyleMap& dom_style) override;
  void OnChildAdd(ViewNode& child, int64_t index) override;
  void OnChildRemove(ViewNode& child) override;
  std::string GetViewName() const { return kTextViewName; }

  void HandleLayoutUpdate(hippy::LayoutResult layout_result) override;

 private:
  std::shared_ptr<tdfcore::View> CreateView() override;

  void SetText(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetTextColor(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetFontSize(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetFontWeight(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetFontStyle(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetLineHeight(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetLetterSpacing(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetFontFamily(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetDecorationLine(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetTextShadowOffset(const DomStyleMap& dom_style);
  void SetTextShadowColor(const DomStyleMap& dom_style);
  void SetTextShadowRadius(const DomStyleMap& dom_style);
  void SetLineSpacingMultiplier(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetLineSpacingExtra(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetNumberOfLines(const DomStyleMap& dom_style, std::shared_ptr<TextView>& text_view);
  void SetTextAlign(const DomStyleMap& dom_style, std::shared_ptr<TextView>& text_view);
  void SetEnableScale(const DomStyleMap& dom_style, std::shared_ptr<TextView>& text_view);
  void UpdateFontStyle(TextStyle& text_style);

  /**
   * @brief return layout_view_ if detached, return GetView() if attached.
   */
  std::shared_ptr<tdfcore::TextView> GetTextView();

  std::vector<std::shared_ptr<tdfcore::InlineSpan>> children_text_span_;
  std::string font_style_ = "";
  std::string font_weight_ = "";
  TextShadow text_shadow_;
  bool has_shadow_ = true;
  float font_size_ = 16.0;
  float line_height_ = 16.0;

  // support layout when not attached.
  std::shared_ptr<tdfcore::TextView> layout_view_;
};

}  // namespace tdfrender
