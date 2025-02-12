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

namespace hippy {
inline namespace render {
inline namespace native {

class SpanNode : public ArkUINode {
protected:
  enum class AttributeFlag {
    SPAN_CONTENT = 0,
    FONT_COLOR,
    FONT_SIZE,
    FONT_STYLE,
    FONT_WEIGHT,
    TEXT_LINE_HEIGHT,
    TEXT_DECORATION,
    TEXT_CASE,
    TEXT_LETTER_SPACING,
    FONT_FAMILY,
    TEXT_TEXT_SHADOW,
    SPAN_TEXT_BACKGROUND_STYLE,
  };
public:
  SpanNode();
  ~SpanNode();
  
  SpanNode &SetSpanContent(const std::string &text);
  SpanNode &SetFontColor(uint32_t fontColor);
  SpanNode &SetFontSize(float fontSize);
  SpanNode &SetFontStyle(int32_t fontStyle);
  SpanNode &SetFontFamily(const std::string &fontFamily);
  SpanNode &SetFontWeight(int32_t fontWeight);
  SpanNode &SetTextDecoration(ArkUI_TextDecorationType decorationType, uint32_t decorationColor, ArkUI_TextDecorationStyle decorationStyle);
  SpanNode &SetTextLetterSpacing(float textLetterSpacing);
  SpanNode &SetTextShadow(float textShadowRadius, ArkUI_ShadowType textShadowType, uint32_t textShadowColor,
                                  float textShadowOffsetX, float textShadowOffsetY);
  SpanNode &SetTextLineHeight(float textLineHeight);
  SpanNode &SetTextCase(int32_t textCase);
  SpanNode &SetSpanTextBackgroundStyle(uint32_t color);
  
  void ResetAllAttributes() override;
};

} // namespace native
} // namespace render
} // namespace hippy
