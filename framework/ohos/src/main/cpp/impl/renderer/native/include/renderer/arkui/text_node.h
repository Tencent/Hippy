/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#pragma once

#include "renderer/arkui/arkui_node.h"
#include <arkui/styled_string.h>

namespace hippy {
inline namespace render {
inline namespace native {

class TextNode : public ArkUINode {
private:
  enum class AttributeFlag {
    TEXT_CONTENT_WITH_STYLED_STRING = 0,
    TEXT_CONTENT,
    FONT_COLOR,
    FONT_SIZE,
    FONT_STYLE,
    FONT_WEIGHT,
    TEXT_LINE_HEIGHT,
    TEXT_HALF_LEADING,
    TEXT_DECORATION,
    TEXT_CASE,
    TEXT_LETTER_SPACING,
    TEXT_MAX_LINES,
    TEXT_ALIGN,
    TEXT_ELLIPSIS_MODE,
    TEXT_OVERFLOW,
    TEXT_WORD_BREAK,
    FONT_FAMILY,
    TEXT_BASELINE_OFFSET,
    TEXT_TEXT_SHADOW,
    TEXT_FONT,
    TEXT_HEIGHT_ADAPTIVE_POLICY,
    TEXT_INDENT,
  };

public:
  TextNode();
  ~TextNode() override;
  
  TextNode &SetTextContentWithStyledString(const ArkUI_StyledString *styledString);
  TextNode &SetTextContent(const std::string &text);
  TextNode &SetFontColor(uint32_t fontColor);
  TextNode &ResetFontColor();
  TextNode &SetFontSize(float fontSize);
  TextNode &SetFontStyle(int32_t fontStyle);
  TextNode &SetFontWeight(ArkUI_FontWeight fontWeight);
  TextNode &SetTextLineHeight(float textLineHeight);
  TextNode &SetTextHalfLeading(bool verticalCenter);
  TextNode &SetTextDecoration(ArkUI_TextDecorationType decorationType, uint32_t decorationColor, ArkUI_TextDecorationStyle decorationStyle);
  TextNode &SetTextCase(int32_t textCase);
  TextNode &SetTextLetterSpacing(float textLetterSpacing);
  TextNode &SetTextMaxLines(int32_t textMaxLines);
  TextNode &ResetTextMaxLines();
  TextNode &SetTextAlign(ArkUI_TextAlignment align);
  TextNode &SetTextEllipsisMode(ArkUI_EllipsisMode ellipsisMode);
  TextNode &SetTextOverflow(ArkUI_TextOverflow textOverflow);
  TextNode &SetWordBreak(ArkUI_WordBreak workBreak);
  TextNode &SetFontFamily(const std::string &fontFamily);
  TextNode &SetTextBaselineOffset(float textBaselineOffset);
  TextNode &SetTextShadow(float textShadowRadius, ArkUI_ShadowType textShadowType, uint32_t textShadowColor,
                          float textShadowOffsetX, float textShadowOffsetY);
  TextNode &SetTextFont(float fontSize, int32_t fontWeight = ARKUI_FONT_WEIGHT_NORMAL,
                        int32_t fontStyle = ARKUI_FONT_STYLE_NORMAL, const std::string &fontFamily = std::string());
  TextNode &SetTextHeightAdaptivePolicy(int32_t policyType);
  TextNode &SetTextIndent(float textIndent);
  
  void ResetTextContentWithStyledStringAttribute();
  void ResetAllAttributes() override;
  
  bool HasStyledString() {
    return hasStyledString_;
  }
  
private:
  bool hasStyledString_ = false;
};

} // namespace native
} // namespace render
} // namespace hippy
