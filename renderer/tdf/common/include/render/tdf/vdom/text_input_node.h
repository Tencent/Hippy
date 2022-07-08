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

#include "core/tdfi/view/text/text_input_view.h"
#include "render/tdf/vdom/view_node.h"

namespace tdfrender {

using skia::textlayout::TextShadow;
using skia::textlayout::TextStyle;
using tdfcore::Color;
using tdfcore::KeyboardAction;
using tdfcore::KeyboardInputType;
using tdfcore::TextEditingController;
using tdfcore::TextInputView;
using tdfcore::TextSelectionControl;
using tdfcore::View;

using OnBlur = std::function<void()>;
using OnChangeText = std::function<void(std::string)>;
using OnKeyboardHeightChange = std::function<void(float)>;
using OnEndEditing = std::function<void(std::u16string)>;
using OnSelectionChange = std::function<void(size_t, size_t)>;
using JsFunctionPrototype = std::function<void(const uint32_t callback_id, const DomArgument& dom_value)>;

class TextInputNode : public ViewNode {
 public:
  explicit TextInputNode(const RenderInfo info);
  ~TextInputNode() override;

  void CallFunction(const std::string& function_name, const DomArgument& param, const uint32_t call_back_id) override;

  static node_creator GetCreator();

  struct EventCallback {
    bool on_selection_change_flag = false;
    bool on_blur_flag = false;
    bool on_change_text_flag = false;
    bool on_end_editing_flag = false;

    OnBlur on_blur;
    OnChangeText on_change_text;
    // 监听键盘高度变化
    OnKeyboardHeightChange on_keyboard_height_change;
    OnEndEditing on_end_editing;
    OnSelectionChange on_selection_change;
  };

 protected:
  void HandleStyleUpdate(const DomStyleMap& dom_style) override;
  std::shared_ptr<tdfcore::View> CreateView() override;

 private:
  void InitJsCall();
  void InitCallback();
  void RegisterViewportListener();
  void UnregisterViewportListener();
  void DidChangeTextEditingValue(std::shared_ptr<TextInputView> text_input_view);

  void SetCaretColor(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetColor(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetDefaultValue(const DomStyleMap& dom_style, std::shared_ptr<TextInputView>& text_input_view);
  void SetEditable(const DomStyleMap& dom_style, std::shared_ptr<TextInputView>& text_input_view);
  void SetFontFamily(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetFontSize(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetLineHeight(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetFontStyle(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetFontWeight(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetKeyBoardType(const DomStyleMap& dom_style, std::shared_ptr<TextInputView>& text_input_view);
  void SetLetterSpacing(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetMaxLength(const DomStyleMap& dom_style, TextInputView::Attributes& attributes);
  void SetMultiline(const DomStyleMap& dom_style, TextInputView::Attributes& attributes);
  void SetNumberOfLines(const DomStyleMap& dom_style, std::shared_ptr<TextInputView>& text_input_view);
  void SetPlaceHolder(const DomStyleMap& dom_style);
  void SetPlaceHolderTextColor(const DomStyleMap& dom_style);
  void SetKeyBoardAction(const DomStyleMap& dom_style, std::shared_ptr<TextInputView>& text_input_view);
  void SetTextAlign(const DomStyleMap& dom_style, std::shared_ptr<TextInputView>& text_input_view);
  void SetTextShadowOffset(const DomStyleMap& dom_style);
  void SetTextShadowColor(const DomStyleMap& dom_style);
  void SetTextShadowRadius(const DomStyleMap& dom_style);
  void SetTextAlignVertical(const DomStyleMap& dom_style, TextStyle& text_style);

  // TODO(kloudwang): underlineColorAndroid/validator/value 属性

  void UpdateBlurAttr(const DomStyleMap& dom_style);
  void UpdateChangeTextAttr(const DomStyleMap& dom_style);
  void UpdateContentSizeChangeAttr(const DomStyleMap& dom_style);
  void UpdateEndEditingAttr(const DomStyleMap& dom_style);
  void UpdateFocusAttr(const DomStyleMap& dom_style);
  void UpdateSelectionChangeAttr(const DomStyleMap& dom_style);
  void UpdateKeyBoardWillShowAttr(const DomStyleMap& dom_style);

  void UpdateFontStyle(TextStyle& text_style);

  std::weak_ptr<TextInputView> text_input_view_;
  std::shared_ptr<tdfcore::TextEditingController> edit_controller_;
  std::shared_ptr<tdfcore::TextSelectionControl> selection_control_;
  std::map<std::string, JsFunctionPrototype> js_function_map_;
  tdfcore::TextSelection text_selection_;
  std::string font_style_ = "";
  std::string font_weight_ = "";
  float font_size_ = 16.0;
  float line_height_ = 16.0;
  TextShadow text_shadow_;
  bool has_shadow_ = true;
  std::string place_holder_;
  Color place_holder_color_ = Color::Black();
  tdfcore::KeyboardAction keyboard_action_ = tdfcore::KeyboardAction::kDone;
  uint64_t viewport_listener_id_ = 0;
  EventCallback event_callback_;
};

}  // namespace tdfrender
