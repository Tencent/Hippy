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

#include "renderer/tdf/viewnode/text_view_node.h"

#include "dom/layout_node.h"
#include "footstone/string_view_utils.h"
#include "footstone/persistent_object_map.h"
#include "renderer/tdf/viewnode/node_attributes_parser.h"

namespace hippy {
inline namespace render {
inline namespace tdf {

using hippy::LayoutMeasureMode;
using tdfcore::TextAttributes;

static footstone::utils::PersistentObjectMap<uint32_t, std::shared_ptr<TextViewNode>> persistent_map_;

TextViewNode::TextViewNode(RenderInfo info) : ViewNode(info) {}

void TextViewNode::SyncTextAttributes(const std::shared_ptr<hippy::DomNode>& dom_node) {
  if (!layout_view_) {
    layout_view_ = std::static_pointer_cast<tdfcore::TextView>(CreateView());
  }
  HandleTextStyleUpdate(layout_view_, dom_node, GenerateStyleInfo(dom_node));
}

void TextViewNode::RegisterMeasureFunction(const std::shared_ptr<hippy::DomNode>& dom_node,
                                           const std::shared_ptr<TextViewNode>& view_node) {
  dom_node->GetLayoutNode()->SetMeasureFunction([view_node](float width, LayoutMeasureMode width_measure_mode,
                                                            float height, LayoutMeasureMode height_measure_mode,
                                                            void* layoutContext) {
    auto size = view_node->layout_view_->MeasureText(width);
    hippy::LayoutSize layout_result{static_cast<float>(size.width), static_cast<float>(size.height)};
    return layout_result;
  });
  persistent_map_.Insert(dom_node->GetRenderInfo().id, view_node);
}

void TextViewNode::UnregisterMeasureFunction(const std::shared_ptr<hippy::DomNode>& dom_node) {
  dom_node->GetLayoutNode()->SetMeasureFunction(nullptr);
  persistent_map_.Erase(dom_node->GetRenderInfo().id);
}

std::shared_ptr<TextViewNode> TextViewNode::FindLayoutTextViewNode(const std::shared_ptr<hippy::DomNode> &dom_node) {
  std::shared_ptr<TextViewNode> result;
  auto find = persistent_map_.Find(dom_node->GetRenderInfo().id, result);
  FOOTSTONE_CHECK(find);
  return result;
}

std::shared_ptr<tdfcore::TextView> TextViewNode::GetTextView() {
  return GetView<tdfcore::TextView>();
}

std::shared_ptr<tdfcore::View> TextViewNode::CreateView() {
  auto text_view = TDF_MAKE_SHARED(TextView);
  auto text_style = text_view->GetTextStyle();
  text_style.color = kDefaultTextColor;
  text_view->SetTextStyle(text_style);
  return text_view;
}

void TextViewNode::HandleStyleUpdate(const DomStyleMap& dom_style) {
  if (IsAttached()) {
    ViewNode::HandleStyleUpdate(dom_style);
  }
  HandleTextStyleUpdate(GetTextView(), GetDomNode(), dom_style);
}

void TextViewNode::HandleTextStyleUpdate(std::shared_ptr<tdfcore::TextView> text_view, const std::shared_ptr<hippy::DomNode>& dom_node, const DomStyleMap& dom_style){
  auto text_style = text_view->GetTextStyle();
  SetText(dom_style, text_view);
  SetTextColor(dom_style, text_style);
  SetFontSize(dom_style, text_style);
  SetFontWeight(dom_style, text_style);
  SetFontStyle(dom_style, text_style);
  SetLineHeight(dom_style, text_style);
  SetLetterSpacing(dom_style, text_style);
  SetFontFamily(dom_style, text_style);
  SetDecorationLine(dom_style, text_style);
  SetTextShadowOffset(dom_style);
  SetTextShadowColor(dom_style);
  SetTextShadowRadius(dom_style);
  SetLineSpacingMultiplier(dom_style, text_style);
  SetLineSpacingExtra(dom_style, text_style);
  SetNumberOfLines(dom_style, text_view);
  SetTextAlign(dom_style, text_view);
  SetEnableScale(dom_style, text_view);
  text_view->SetTextStyle(text_style);
  if (dom_node) {
    dom_node->GetLayoutNode()->MarkDirty();
  }
}

void TextViewNode::HandleLayoutUpdate(hippy::LayoutResult layout_result) {
  layout_result.left += layout_result.paddingLeft;
  layout_result.width -= layout_result.paddingRight;
  layout_result.top += layout_result.paddingTop;
  layout_result.height -= layout_result.paddingBottom;
  ViewNode::HandleLayoutUpdate(layout_result);
}

void TextViewNode::OnChildAdd(const std::shared_ptr<ViewNode>& child, int64_t index) {
  ViewNode::OnChildAdd(child, index);
}

void TextViewNode::OnChildRemove(const std::shared_ptr<ViewNode>& child) { ViewNode::OnChildRemove(child); }

void TextViewNode::SetText(const DomStyleMap& dom_style, std::shared_ptr<TextView>& text_view) {
  if (auto iter = dom_style.find(text::kText); iter != dom_style.end()) {
    auto unicode_str = footstone::string_view::new_from_utf8(iter->second->ToStringChecked().c_str());
    auto utf16_string =
        footstone::stringview::StringViewUtils::ConvertEncoding(unicode_str, footstone::string_view::Encoding::Utf16);
    text_view->SetText(utf16_string.utf16_value());
  }
}

void TextViewNode::SetTextColor(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(text::kColor); iter != dom_style.end()) {
    text_style.color = util::ConversionIntToColor(static_cast<uint32_t>(iter->second->ToDoubleChecked()));
  }
}

void TextViewNode::SetFontSize(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(text::kFontSize); iter != dom_style.end()) {
    font_size_ = static_cast<tdfcore::TScalar>(iter->second->ToDoubleChecked());
    text_style.font_size = font_size_;
  }
}

void TextViewNode::SetFontWeight(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(text::kFontWeight); iter != dom_style.end()) {
    auto dom_value = iter->second;
    if (dom_value->IsString()) {
      font_weight_ = dom_value->ToStringChecked();
    } else {
      auto font_weight = dom_value->ToDoubleChecked();
      if (font_weight > 500) {
        font_weight_ = "bold";
      }
    }
    UpdateFontStyle(text_style);
  }
}

void TextViewNode::SetFontStyle(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(text::kFontStyle); iter != dom_style.end()) {
    font_style_ = iter->second->ToStringChecked();
    UpdateFontStyle(text_style);
  }
}

void TextViewNode::UpdateFontStyle(TextStyle& text_style) {
  text_style.bold = font_weight_ == "bold";
  text_style.italic = font_style_ == "italic";
}

void TextViewNode::SetLineHeight(const DomStyleMap& dom_style, TextStyle& text_style) {}

void TextViewNode::SetLetterSpacing(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(text::kLetterSpacing); iter != dom_style.end()) {
    auto letter_spacing = static_cast<tdfcore::TScalar>(iter->second->ToDoubleChecked());
    text_style.letter_spacing = letter_spacing;
  }
}

void TextViewNode::SetFontFamily(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(text::kFontFamily); iter != dom_style.end()) {
    text_style.font_family = iter->second->ToStringChecked();
  }
}

void TextViewNode::SetDecorationLine(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(text::kTextDecorationLine); iter != dom_style.end()) {
  }
}

void TextViewNode::SetTextShadowOffset(const DomStyleMap& dom_style) {
  if (auto iter = dom_style.find(text::kTextShadowOffset); iter != dom_style.end()) {
    auto value_object = iter->second->ToObjectChecked();
    has_shadow_ = true;
  }
}

void TextViewNode::SetTextShadowColor(const DomStyleMap& dom_style) {
  if (auto iter = dom_style.find(text::kTextShadowColor); iter != dom_style.end()) {
    has_shadow_ = true;
  }
}

void TextViewNode::SetTextShadowRadius(const DomStyleMap& dom_style) {
  if (auto iter = dom_style.find(text::kTextShadowRadius); iter != dom_style.end()) {
    has_shadow_ = true;
  }
}

void TextViewNode::SetLineSpacingMultiplier(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(text::kLineSpacingMultiplier); iter != dom_style.end()) {
    // todo(kloudwang) 设置行间距
    // auto line_spacing_multiplier = iter->second->ToDoubleChecked();
  }
}

void TextViewNode::SetLineSpacingExtra(const DomStyleMap& dom_style, TextStyle& text_style) {
  // todo(koudwang) 设置lineSpacingExtra属性
}

void TextViewNode::SetNumberOfLines(const DomStyleMap& dom_style, std::shared_ptr<TextView>& text_view) {
  if (auto iter = dom_style.find(text::kNumberOfLines); iter != dom_style.end()) {
  }
}

void TextViewNode::SetTextAlign(const DomStyleMap& dom_style, std::shared_ptr<TextView>& text_view) {
  if (auto iter = dom_style.find(text::kTextAlign); iter != dom_style.end()) {
    auto text_align = iter->second->ToStringChecked();
    TextAlign sk_text_align = tdfcore::TextAlign::kLeft;
    if (text_align == "auto" || text_align == "left") {
      sk_text_align = TextAlign::kLeft;
    } else if (text_align == "right") {
      sk_text_align = TextAlign::kRight;
    } else if (text_align == "center") {
      sk_text_align = TextAlign::kCenter;
    } else if (text_align == "justify") {
      sk_text_align = TextAlign::kJustifyLastLineLeft;
    }
    text_view->SetTextAlign(sk_text_align);
  }
}

void TextViewNode::SetEnableScale(const DomStyleMap& dom_style, std::shared_ptr<TextView>& text_view) {
  if (auto iter = dom_style.find(text::kEnableScale); iter != dom_style.end()) {
    auto enable_scale = iter->second->ToBooleanChecked();
    if (!enable_scale) {
      text_view->SetTextScaleFactor(TextAttributes::kDefaultScaleFactor);
    }
  }
}

}  // namespace tdf
}  // namespace render
}  // namespace hippy
