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
#include "renderer/tdf/viewnode/node_attributes_parser.h"
#include "src/core/SkBlurMask.h"

namespace tdfrender {

using tdfcore::TextAttributes;

TextViewNode::TextViewNode(RenderInfo info) : ViewNode(info) {
  text_shadow_.fColor = tdfcore::Color::Transparent();
  text_shadow_.fOffset = tdfcore::TPoint::Make(0, 0);
}
void TextViewNode::OnCreate() {
  ViewNode::OnCreate();
  auto shell = tdfcore::ViewContext::GetCurrent()->GetShell();
  // set the related DomNode's measure function immediately after create.
  /// TODO(kloudwang) sync measure
  GetDomNode()->GetLayoutNode()->SetMeasureFunction([this, shell](float width, LayoutMeasureMode width_measure_mode,
                                                                  float height, LayoutMeasureMode height_measure_mode,
                                                                  void* layoutContext) {
    std::shared_ptr<tdfcore::TextView> text_view = nullptr;
    std::promise<tdfcore::TSize> text_size;
    shell->GetUITaskRunner()->PostTask([&text_view, this, &text_size, width]() {
      text_view = GetTextView();
      // sync the style for measure
      if (!IsAttached()) {
        HandleStyleUpdate(GenerateStyleInfo());
      }
      text_size.set_value(text_view->MeasureText(width));
    });
    auto future = text_size.get_future();
    future.wait();
    auto size = future.get();
    hippy::LayoutSize layout_result{static_cast<float>(size.width), static_cast<float>(size.height)};
    return layout_result;
  });
}

std::shared_ptr<tdfcore::TextView> TextViewNode::GetTextView() {
  if (layout_view_ == nullptr) {
    layout_view_ = std::static_pointer_cast<tdfcore::TextView>(CreateView());
  }
  auto view = layout_view_;
  if (IsAttached()) {
    view = GetView<tdfcore::TextView>();
  }
  return view;
}

std::shared_ptr<tdfcore::View> TextViewNode::CreateView() {
  auto text_view = TDF_MAKE_SHARED(TextView);
  auto text_style = text_view->GetTextStyle();
  text_style.setColor(kDefaultTextColor);
  text_view->SetTextStyle(text_style);
  return text_view;
}

void TextViewNode::HandleStyleUpdate(const DomStyleMap& dom_style) {
  if (IsAttached()) {
    ViewNode::HandleStyleUpdate(dom_style);
  }
  auto text_view = GetTextView();
  auto text_style = text_view->GetTextStyle();

  SetText(dom_style, text_style);
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

  if (has_shadow_) {
    text_style.addShadow(text_shadow_);
  }
  text_view->SetTextStyle(text_style);
  if (auto dome_node = GetDomNode()) {
    dome_node->GetLayoutNode()->MarkDirty();
  }
}

void TextViewNode::HandleLayoutUpdate(hippy::LayoutResult layout_result) {
  // TODO TDFCore 暂不支持 Padding，这里直接修改Frame来模拟（其实是Margin的效果了）
  layout_result.left += layout_result.paddingLeft;
  layout_result.width -= layout_result.paddingRight;
  layout_result.top += layout_result.paddingTop;
  layout_result.height -= layout_result.paddingBottom;
  ViewNode::HandleLayoutUpdate(layout_result);
}

void TextViewNode::OnChildAdd(const std::shared_ptr<ViewNode>& child, int64_t index) {
  ViewNode::OnChildAdd(child, index);
  FOOTSTONE_DCHECK(child->IsAttached());
  // 不能嵌套非Text的节点。Hippy也可以嵌套Image，这里暂时不支持
  if (child->GetViewName() != kTextViewName) {
    return;
  }
  auto text_node = std::static_pointer_cast<TextViewNode>(child);
  auto text_span = text_node->GetTextView()->GetTextSpan();
  children_text_span_.push_back(text_span);
  GetTextView()->GetTextSpan()->SetChildren(children_text_span_);
}

void TextViewNode::OnChildRemove(const std::shared_ptr<ViewNode>& child) {
  ViewNode::OnChildRemove(child);
  if (child->GetViewName() != kTextViewName) {
    return;
  }
  auto text_node = std::static_pointer_cast<TextViewNode>(child);
  auto text_span = text_node->GetTextView()->GetTextSpan();
  auto location = std::find(children_text_span_.begin(), children_text_span_.end(), text_span);
  if (location != children_text_span_.end()) {
    children_text_span_.erase(location);
    GetTextView()->GetTextSpan()->SetChildren(children_text_span_);
  }
}

void TextViewNode::SetText(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(text::kText); iter != dom_style.end()) {
    auto utf8_string = footstone::unicode_string_view::new_from_utf8(iter->second->ToStringChecked().c_str());
    auto utf16_string =
        hippy::base::StringViewUtils::CovertToUtf16(utf8_string, footstone::unicode_string_view::Encoding::Utf8);
    GetTextView()->GetTextSpan()->SetText(utf16_string.utf16_value());
  }
}

void TextViewNode::SetTextColor(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(text::kColor); iter != dom_style.end()) {
    text_style.setColor(util::ConversionIntToColor(static_cast<int64_t>(iter->second->ToDoubleChecked())));
  }
}

void TextViewNode::SetFontSize(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(text::kFontSize); iter != dom_style.end()) {
    font_size_ = static_cast<SkScalar>(iter->second->ToDoubleChecked());
    text_style.setFontSize(font_size_);
    text_style.setHeight(line_height_ / font_size_);
  }
}

void TextViewNode::SetFontWeight(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(text::kFontWeight); iter != dom_style.end()) {
    auto dom_value = iter->second;
    if (dom_value->IsString()) {
      font_weight_ = dom_value->ToStringChecked();
    } else {
      auto font_weight = dom_value->ToDoubleChecked();
      if (font_weight > SkFontStyle::Weight::kMedium_Weight) {
        font_weight_ = "bold";
      }
      auto font_style = SkFontStyle(font_weight, SkFontStyle::kNormal_Width, SkFontStyle::kUpright_Slant);
      text_style.setFontStyle(font_style);
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
  bool is_italic = false;
  bool is_bold = false;
  if (font_style_ == "italic") {
    is_italic = true;
  }
  if (font_weight_ == "bold") {
    is_bold = true;
  }

  if (is_italic && is_bold) {
    auto font_style = SkFontStyle::BoldItalic();
    text_style.setFontStyle(font_style);
  } else if (is_bold) {
    auto font_style = SkFontStyle::Bold();
    text_style.setFontStyle(font_style);
  } else if (is_italic) {
    auto font_style = SkFontStyle::Italic();
    text_style.setFontStyle(font_style);
  }
}

void TextViewNode::SetLineHeight(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(text::kLineHeight); iter != dom_style.end()) {
    if (iter->second->IsDouble()) {
      line_height_ = iter->second->ToDoubleChecked();
      text_style.setHeight(line_height_ / font_size_);
      text_style.setHeightOverride(true);
      text_style.setHalfLeading(true);
    }
  }
}

void TextViewNode::SetLetterSpacing(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(text::kLetterSpacing); iter != dom_style.end()) {
    auto letter_spacing = static_cast<SkScalar>(iter->second->ToDoubleChecked());
    text_style.setLetterSpacing(letter_spacing);
  }
}

void TextViewNode::SetFontFamily(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(text::kFontFamily); iter != dom_style.end()) {
    auto font_family = iter->second->ToStringChecked();
    text_style.setFontFamilies({SkString(font_family.c_str())});
  }
}

void TextViewNode::SetDecorationLine(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(text::kTextDecorationLine); iter != dom_style.end()) {
    auto text_decoration_line = iter->second->ToStringChecked();
    TextDecoration decoration = TextDecoration::kNoDecoration;
    if (text_decoration_line == "underline" || text_decoration_line == "underline line-through") {
      decoration = TextDecoration::kUnderline;
    } else if (text_decoration_line == "line-through") {
      decoration = TextDecoration::kLineThrough;
    }
    text_style.setDecoration(decoration);
  }
}

void TextViewNode::SetTextShadowOffset(const DomStyleMap& dom_style) {
  if (auto iter = dom_style.find(text::kTextShadowOffset); iter != dom_style.end()) {
    auto value_object = iter->second->ToObjectChecked();
    // todo remove use of hippy namespace
    auto width_value = value_object.find("width")->second.ToDoubleChecked();
    auto height_value = value_object.find("height")->second.ToDoubleChecked();
    text_shadow_.fOffset = tdfcore::TPoint::Make(width_value, height_value);
    has_shadow_ = true;
  }
}

void TextViewNode::SetTextShadowColor(const DomStyleMap& dom_style) {
  if (auto iter = dom_style.find(text::kTextShadowColor); iter != dom_style.end()) {
    text_shadow_.fColor = util::ConversionIntToColor(static_cast<int64_t>(iter->second->ToDoubleChecked()));
    has_shadow_ = true;
  }
}

void TextViewNode::SetTextShadowRadius(const DomStyleMap& dom_style) {
  if (auto iter = dom_style.find(text::kTextShadowRadius); iter != dom_style.end()) {
    auto text_shadow_radius = iter->second->ToDoubleChecked();
    /// TODO(kloudwang) 这里SkBlurMask的计算应该要在tdfcore加一层包装，这里不应该直接依赖skia,后期tdf core
    /// 去skia，直接依赖skia就会有问题
    text_shadow_.fBlurSigma = SkBlurMask::ConvertRadiusToSigma(text_shadow_radius);
    has_shadow_ = true;
  }
}

void TextViewNode::SetLineSpacingMultiplier(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(text::kLineSpacingMultiplier); iter != dom_style.end()) {
    // todo(kloudwang) 设置行间距
    auto line_spacing_multiplier = iter->second->ToDoubleChecked();
  }
}

void TextViewNode::SetLineSpacingExtra(const DomStyleMap& dom_style, TextStyle& text_style) {
  // todo(koudwang) 设置lineSpacingExtra属性
}

void TextViewNode::SetNumberOfLines(const DomStyleMap& dom_style, std::shared_ptr<TextView>& text_view) {
  if (auto iter = dom_style.find(text::kNumberOfLines); iter != dom_style.end()) {
    auto number_of_lines = 1;
    if (iter->second->IsDouble()) {
      number_of_lines = iter->second->ToDoubleChecked();
    }
    auto lines = number_of_lines == 0 ? 1 : number_of_lines;
    text_view->SetMaxLines(lines);
  }
}

void TextViewNode::SetTextAlign(const DomStyleMap& dom_style, std::shared_ptr<TextView>& text_view) {
  if (auto iter = dom_style.find(text::kTextAlign); iter != dom_style.end()) {
    auto text_align = iter->second->ToStringChecked();
    TextAlign sk_text_align = TextAlign::kStart;
    if (text_align == "auto" || text_align == "left") {
      sk_text_align = TextAlign::kLeft;
    } else if (text_align == "right") {
      sk_text_align = TextAlign::kRight;
    } else if (text_align == "center") {
      sk_text_align = TextAlign::kCenter;
    } else if (text_align == "justify") {
      sk_text_align = TextAlign::kJustify;
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

}  // namespace tdfrender
