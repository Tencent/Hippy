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

typedef footstone::utils::PersistentObjectMap<uint32_t, std::shared_ptr<TextViewNode>> TextViewNodeMap;
static footstone::utils::PersistentObjectMap<uint32_t, std::shared_ptr<TextViewNodeMap>> persistent_map_;

TextViewNode::TextViewNode(const std::shared_ptr<hippy::dom::DomNode> &dom_node, RenderInfo info)
    : ViewNode(dom_node, info) {}

void TextViewNode::SyncTextAttributes(const std::shared_ptr<hippy::DomNode>& dom_node) {
  if (!layout_view_) {
    // Not in TDF UI Task Runner, have no ViewContext
    layout_view_ = TDF_MAKE_SHARED(TextView, nullptr);
  }
  HandleTextStyleUpdate(layout_view_, dom_node, GenerateStyleInfo(dom_node));
}

void TextViewNode::RegisterMeasureFunction(uint32_t root_id, const std::shared_ptr<hippy::DomNode>& dom_node,
                                           const std::shared_ptr<TextViewNode>& view_node) {
  dom_node->GetLayoutNode()->SetMeasureFunction([view_node](float width, LayoutMeasureMode width_measure_mode,
                                                            float height, LayoutMeasureMode height_measure_mode,
                                                            void* layoutContext) {
    auto size = view_node->layout_view_->MeasureText(width);
    hippy::LayoutSize layout_result{static_cast<float>(size.width), static_cast<float>(size.height)};
    return layout_result;
  });

  std::shared_ptr<TextViewNodeMap> text_node_map;
  auto find = persistent_map_.Find(root_id, text_node_map);
  if (!find) {
    text_node_map = std::make_shared<TextViewNodeMap>();
    persistent_map_.Insert(root_id, text_node_map);
  }
  text_node_map->Insert(dom_node->GetRenderInfo().id, view_node);
}

void TextViewNode::UnregisterMeasureFunction(uint32_t root_id, const std::shared_ptr<hippy::DomNode>& dom_node) {
  dom_node->GetLayoutNode()->SetMeasureFunction(nullptr);

  std::shared_ptr<TextViewNodeMap> text_node_map;
  auto find = persistent_map_.Find(root_id, text_node_map);
  if (find) {
    text_node_map->Erase(dom_node->GetRenderInfo().id);
  }
}

std::shared_ptr<TextViewNode> TextViewNode::FindLayoutTextViewNode(uint32_t root_id, const std::shared_ptr<hippy::DomNode> &dom_node) {
  std::shared_ptr<TextViewNodeMap> text_node_map;
  auto find = persistent_map_.Find(root_id, text_node_map);
  FOOTSTONE_CHECK(find);
  std::shared_ptr<TextViewNode> textViewNode;
  if(text_node_map->Find(dom_node->GetRenderInfo().id, textViewNode)) {
    return textViewNode;
  }
  return nullptr;
}

std::shared_ptr<tdfcore::TextView> TextViewNode::GetTextView() {
  return GetView<tdfcore::TextView>();
}

std::shared_ptr<tdfcore::View> TextViewNode::CreateView(const std::shared_ptr<ViewContext> &context) {
  auto text_view = TDF_MAKE_SHARED(TextView, context);
  auto text_style = text_view->GetTextStyle();
  text_style.color = kDefaultTextColor;
  text_view->SetTextStyle(text_style);
  text_view->SetVerticalAlign(tdfcore::VerticalAlign::kCenter);
  return text_view;
}

void TextViewNode::HandleStyleUpdate(const DomStyleMap& dom_style, const DomDeleteProps& dom_delete_props) {
  if (IsAttached()) {
    ViewNode::HandleStyleUpdate(dom_style, dom_delete_props);
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
  SetHorizontalAlign(dom_style, text_view);
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
  if (auto it = dom_style.find(text::kText); it != dom_style.end() && it->second != nullptr) {
    auto unicode_str = footstone::string_view::new_from_utf8(it->second->ToStringChecked().c_str());
    auto utf16_string =
        footstone::stringview::StringViewUtils::ConvertEncoding(unicode_str, footstone::string_view::Encoding::Utf16);
    text_view->SetText(utf16_string.utf16_value());
  }
}

void TextViewNode::SetTextColor(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto it = dom_style.find(text::kColor); it != dom_style.end() && it->second != nullptr) {
    text_style.color = util::ConversionIntToColor(static_cast<uint32_t>(it->second->ToDoubleChecked()));
  }
}

void TextViewNode::SetFontSize(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto it = dom_style.find(text::kFontSize); it != dom_style.end() && it->second != nullptr) {
    font_size_ = static_cast<tdfcore::TScalar>(it->second->ToDoubleChecked());
    text_style.font_size = font_size_;
  }
}

void TextViewNode::SetFontWeight(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto it = dom_style.find(text::kFontWeight); it != dom_style.end() && it->second != nullptr) {
    auto hippy_value = it->second;
    if (hippy_value->IsString()) {
      font_weight_ = hippy_value->ToStringChecked();
    } else {
      auto font_weight = hippy_value->ToDoubleChecked();
      if (font_weight > 500) {
        font_weight_ = "bold";
      }
    }
    UpdateFontStyle(text_style);
  }
}

void TextViewNode::SetFontStyle(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto it = dom_style.find(text::kFontStyle); it != dom_style.end() && it->second != nullptr) {
    font_style_ = it->second->ToStringChecked();
    UpdateFontStyle(text_style);
  }
}

void TextViewNode::UpdateFontStyle(TextStyle& text_style) {
  text_style.bold = font_weight_ == "bold";
  text_style.italic = font_style_ == "italic";
}

void TextViewNode::SetLineHeight(const DomStyleMap& dom_style, TextStyle& text_style) {}

void TextViewNode::SetLetterSpacing(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto it = dom_style.find(text::kLetterSpacing); it != dom_style.end() && it->second != nullptr) {
    auto letter_spacing = static_cast<tdfcore::TScalar>(it->second->ToDoubleChecked());
    text_style.letter_spacing = letter_spacing;
  }
}

void TextViewNode::SetFontFamily(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto it = dom_style.find(text::kFontFamily); it != dom_style.end() && it->second != nullptr) {
    std::vector<std::string> families;
    families.push_back(it->second->ToStringChecked());
    text_style.font_families = families;
  }
}

void TextViewNode::SetDecorationLine(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto it = dom_style.find(text::kTextDecorationLine); it != dom_style.end() && it->second != nullptr) {
  }
}

void TextViewNode::SetTextShadowOffset(const DomStyleMap& dom_style) {
  if (auto it = dom_style.find(text::kTextShadowOffset); it != dom_style.end() && it->second != nullptr) {
    auto value_object = it->second->ToObjectChecked();
    has_shadow_ = true;
  }
}

void TextViewNode::SetTextShadowColor(const DomStyleMap& dom_style) {
  if (auto it = dom_style.find(text::kTextShadowColor); it != dom_style.end() && it->second != nullptr) {
    has_shadow_ = true;
  }
}

void TextViewNode::SetTextShadowRadius(const DomStyleMap& dom_style) {
  if (auto it = dom_style.find(text::kTextShadowRadius); it != dom_style.end() && it->second != nullptr) {
    has_shadow_ = true;
  }
}

void TextViewNode::SetLineSpacingMultiplier(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto it = dom_style.find(text::kLineSpacingMultiplier); it != dom_style.end() && it->second != nullptr) {
    // todo(kloudwang) 设置行间距
    // auto line_spacing_multiplier = it->second->ToDoubleChecked();
  }
}

void TextViewNode::SetLineSpacingExtra(const DomStyleMap& dom_style, TextStyle& text_style) {
  // todo(koudwang) 设置lineSpacingExtra属性
}

void TextViewNode::SetNumberOfLines(const DomStyleMap& dom_style, std::shared_ptr<TextView>& text_view) {
  if (auto it = dom_style.find(text::kNumberOfLines); it != dom_style.end() && it->second != nullptr) {
    if (it->second->IsString()) {
      auto number_of_lines = atoi(it->second->ToStringChecked().c_str());
      text_view->SetMaxLines(number_of_lines == 0 ? 1 : static_cast<size_t>(number_of_lines));
    } else if (it->second->IsNumber()) {
      auto number_of_lines = static_cast<int64_t>(it->second->ToDoubleChecked());
      text_view->SetMaxLines(number_of_lines == 0 ? 1 : static_cast<size_t>(number_of_lines));
    }
  }
}

void TextViewNode::SetHorizontalAlign(const DomStyleMap& dom_style, std::shared_ptr<TextView>& text_view) {
  if (auto it = dom_style.find(text::kTextAlign); it != dom_style.end() && it->second != nullptr) {
    auto text_align = it->second->ToStringChecked();
    HorizontalAlign hori_align = tdfcore::HorizontalAlign::kLeft;
    if (text_align == "auto" || text_align == "left") {
      hori_align = HorizontalAlign::kLeft;
    } else if (text_align == "right") {
      hori_align = HorizontalAlign::kRight;
    } else if (text_align == "center") {
      hori_align = HorizontalAlign::kCenter;
    } else if (text_align == "justify") {
      hori_align = HorizontalAlign::kJustify;
    }
    text_view->SetHorizontalAlign(hori_align);
  }
}

void TextViewNode::SetEnableScale(const DomStyleMap& dom_style, std::shared_ptr<TextView>& text_view) {
  if (auto it = dom_style.find(text::kEnableScale); it != dom_style.end() && it->second != nullptr) {
    auto enable_scale = it->second->ToBooleanChecked();
    if (!enable_scale) {
      // not support
    }
  }
}

}  // namespace tdf
}  // namespace render
}  // namespace hippy
