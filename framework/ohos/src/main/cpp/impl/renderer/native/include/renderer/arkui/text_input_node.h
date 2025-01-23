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

class TextInputNodeDelegate {
public:
  virtual ~TextInputNodeDelegate() = default;
  virtual void OnChange(std::string text){}
  virtual void OnBlur(){}
  virtual void OnFocus(){}
  virtual void OnSubmit(){}
  virtual void OnPaste(){}
  virtual void OnTextSelectionChange(int32_t location, int32_t length){}
};

class TextInputNode : public TextInputBaseNode {
protected:
  enum class AttributeFlag {
    TEXT_INPUT_TEXT = (uint32_t)TextInputBaseNode::AttributeFlag::NEXT_FLAG,
    TEXT_INPUT_TEXT_SELECTION,
    TEXT_INPUT_CARET_COLOR,
    TEXT_INPUT_MAX_LENGTH,
    TEXT_INPUT_PLACEHOLDER,
    TEXT_INPUT_PLACEHOLDER_COLOR,
    TEXT_INPUT_CARET_STYLE,
    TEXT_INPUT_TYPE,
    TEXT_INPUT_SELECTED_BACKGROUND_COLOR,
    TEXT_INPUT_SHOW_PASSWORD_ICON,
    TEXT_INPUT_ENTER_KEY_TYPE,
    TEXT_INPUT_CANCEL_BUTTON,
    TEXT_INPUT_EDITING,
  };
  TextInputNodeDelegate *textInputNodeDelegate_;

public:
  TextInputNode();
  ~TextInputNode();
  
  void OnNodeEvent(ArkUI_NodeEvent *event) override;
  void SetTextInputNodeDelegate(TextInputNodeDelegate *textInputNodeDelegate);
  
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

  HRPoint GetTextInputOffset() const;
  void SetCaretHidden(bool hidden);
  void SetSelectedBackgroundColor(uint32_t const &color);
  void SetPasswordIconVisibility(bool isVisible);
  void SetCancelButtonMode(ArkUI_CancelButtonStyle mode);
  void ResetSelectedBackgroundColor();
  
  void ResetAllAttributes() override;
};

} // namespace native
} // namespace render
} // namespace hippy
