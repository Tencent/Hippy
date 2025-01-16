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
#include <bits/alltypes.h>

namespace hippy {
inline namespace render {
inline namespace native {

enum class TextAlignment {
  Natural,
  Left,
  Center,
  Right,
  Justified
};

class TextInputBaseNode : public ArkUINode {
protected:
  enum class AttributeFlag {
    RESPONSE_REGION = 0,
    FONT_COLOR,
    TEXT_ALIGN,
    ALIGNMENT,
    FONT_WEIGHT,
    FONT_STYLE,
    FONT_SIZE,
    FONT_FAMILY,
    TEXT_MAX_LINES,
    
    NEXT_FLAG,
  };
  TextInputBaseNode(ArkUI_NodeType nodeType);
  virtual ~TextInputBaseNode();

public:
  void SetResponseRegion(HRPosition const &position, HRSize const &size);
  void SetFontColor(uint32_t const &color);
  void SetTextAlign(ArkUI_TextAlignment const &textAlign);
  void SetTextAlignVertical(ArkUI_Alignment const &alignment);
  void SetFontWeight(ArkUI_FontWeight const &weight);
  void SetFontStyle(ArkUI_FontStyle const &style);
  void SetFontSize(float_t const &size);
  void SetFontFamily(std::string const &family);
  void SetMaxLines(int32_t const &lines);
  
  void ResetAllAttributes() override;
  
  virtual void SetTextContent(std::string const &textContent) = 0;
  virtual void SetTextSelection(int32_t start, int32_t end) = 0;
  virtual void SetCaretColor(uint32_t const &color) = 0;
  virtual void SetMaxLength(int32_t const &maxLength) = 0;
  virtual void SetPlaceholder(std::string const &placeholder) = 0;
  virtual void SetPlaceholderColor(uint32_t const &color) = 0;
  virtual std::string GetTextContent() = 0;
  virtual void SetTextEditing(bool const enable) = 0;
  virtual void SetInputType(int32_t const &keyboardType) = 0;
  virtual void SetEnterKeyType(ArkUI_EnterKeyType const &enterKeyType) = 0;
  virtual HRRect GetTextContentRect() = 0;
};

} // namespace native
} // namespace render
} // namespace hippy
