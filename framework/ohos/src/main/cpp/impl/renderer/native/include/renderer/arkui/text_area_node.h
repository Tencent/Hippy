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

#include "renderer/arkui/text_input_base_node.h"

namespace hippy {
inline namespace render {
inline namespace native {

class TextAreaNodeDelegate {
public:
  virtual ~TextAreaNodeDelegate() = default;
  virtual void OnChange(std::string text){}
  virtual void OnBlur(){}
  virtual void OnFocus(){}
  virtual void OnPaste(){}
  virtual void OnTextSelectionChange(int32_t location, int32_t length){}
};

class TextAreaNode : public TextInputBaseNode {
protected:
  enum class AttributeFlag {
    TEXT_AREA_TEXT = (uint32_t)TextInputBaseNode::AttributeFlag::NEXT_FLAG,
    TEXT_AREA_TEXT_SELECTION,
    TEXT_AREA_CARET_COLOR,
    TEXT_AREA_MAX_LENGTH,
    TEXT_AREA_PLACEHOLDER,
    TEXT_AREA_PLACEHOLDER_COLOR,
    TEXT_AREA_TYPE,
    TEXT_AREA_EDITING,
    TEXT_AREA_ENTER_KEY_TYPE,
  };
  TextAreaNodeDelegate *textAreaNodeDelegate_;

public:
  TextAreaNode();
  ~TextAreaNode();
  
  void OnNodeEvent(ArkUI_NodeEvent *event) override;
  void SetTextAreaNodeDelegate(TextAreaNodeDelegate *textAreaNodeDelegate);
  
  void SetTextContent(std::string const &textContent) override;
  void SetTextSelection(int32_t start, int32_t end) override;
  void SetCaretColor(uint32_t const &color) override;
  void SetMaxLength(int32_t const &maxLength) override;
  void SetPlaceholder(std::string const &placeholder) override;
  void SetPlaceholderColor(uint32_t const &color) override;
  std::string GetTextContent() override;
  void SetTextEditing(bool const enable) override;
  void SetInputType(int32_t const &keyboardType) override;
  void SetEnterKeyType(ArkUI_EnterKeyType const &returnKeyType) override;
  HRRect GetTextContentRect() override;
    
  HRPoint GetTextAreaOffset() const;
  
  void ResetAllAttributes() override;
    
};

} // namespace native
} // namespace render
} // namespace hippy
