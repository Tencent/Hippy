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

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wsign-conversion"
#pragma clang diagnostic ignored "-Wsign-compare"
#pragma clang diagnostic ignored "-Wextra-semi"
#pragma clang diagnostic ignored "-Wc++98-compat-extra-semi"
#pragma clang diagnostic ignored "-Wignored-qualifiers"
#pragma clang diagnostic ignored "-Wimplicit-float-conversion"
#pragma clang diagnostic ignored "-Wimplicit-int-conversion"
#pragma clang diagnostic ignored "-Wfloat-conversion"
#pragma clang diagnostic ignored "-Wshadow"
#pragma clang diagnostic ignored "-Wdeprecated-copy-with-dtor"
#pragma clang diagnostic ignored "-Wdeprecated-copy"
#pragma clang diagnostic ignored "-Wshorten-64-to-32"
#include "tdfui/view/text/text_input_view.h"
#pragma clang diagnostic pop

#include "renderer/tdf/viewnode/view_names.h"
#include "renderer/tdf/viewnode/view_node.h"

namespace hippy {
inline namespace render {
inline namespace tdf {

using tdfcore::Color;
using tdfcore::KeyboardAction;
using tdfcore::KeyboardInputType;
using tdfcore::TextEditingController;
using tdfcore::TextInputView;
using tdfcore::TextSelectionControl;
using tdfcore::TextStyle;
using tdfcore::View;

using OnBlur = std::function<void()>;
using OnChangeText = std::function<void(std::string)>;
using OnKeyboardHeightChange = std::function<void(float)>;
using OnEndEditing = std::function<void(std::u16string)>;
using OnSelectionChange = std::function<void(size_t, size_t)>;
using InputEventCallBack = std::function<void(const std::string &function_name,
                                              const uint32_t callback_id,
                                              const ViewNode::DomArgument &hippy_value)>;

inline namespace textinput {
constexpr const char kTextInput[] = "TextInput";
constexpr const char kCaret_color[] = "caret_color";                      // int
constexpr const char kColor[] = "color";                                  // int
constexpr const char kDefaultValue[] = "defaultValue";                    // String
constexpr const char kEditable[] = "editable";                            // boolean
constexpr const char kFontFamily[] = "fontFamily";                        // String
constexpr const char kFontSize[] = "fontSize";                            // float
constexpr const char kFontStyle[] = "fontStyle";                          // String
constexpr const char kFontWeight[] = "fontWeight";                        // String
constexpr const char kKeyboardType[] = "keyboardType";                    // String
constexpr const char kLetterSpacing[] = "letterSpacing";                  // float
constexpr const char kMaxLength[] = "maxLength";                          // int
constexpr const char kMultiline[] = "multiline";                          // boolean
constexpr const char kNumberOfLines[] = "numberOfLines";                  // int
// TODO: Fix event name
constexpr const char kOnBlur[] = "onBlur";                                // boolean
constexpr const char kOnChangeText[] = "changetext";                      // boolean
constexpr const char kOnContentSizeChange[] = "onContentSizeChange";      // boolean
constexpr const char kOnEndEditing[] = "endediting";                      // boolean
constexpr const char kOnFocus[] = "onFocus";                              // boolean
constexpr const char kOnSelectionChange[] = "onSelectionChange";          // boolean
constexpr const char kPlaceholder[] = "placeholder";                      // String
constexpr const char kPlaceholderTextColor[] = "placeholderTextColor";    // int
constexpr const char kReturnKeyType[] = "returnKeyType";                  // String
constexpr const char kTextAlign[] = "textAlign";                          // String
constexpr const char kTextAlignVertical[] = "textAlignVertical";          // String
constexpr const char kUnderlineColorAndroid[] = "underlineColorAndroid";  // Integer
constexpr const char kValidator[] = "validator";                          // String
constexpr const char kValue[] = "value";                                  // String
constexpr const char kCaretColor[] = "caret-color";
constexpr const char kHeight[] = "height";                  // float
constexpr const char kWidth[] = "width";                    // String
constexpr const char kKeyActionName[] = "actionName";       // String
constexpr const char kOnEditorAction[] = "onEditorAction";  // String

constexpr const char kBlurTextInput[] = "blurTextInput";
constexpr const char kClear[] = "clear";
constexpr const char kFocusTextInput[] = "focusTextInput";
constexpr const char kGetValue[] = "getValue";
constexpr const char kSetValue[] = "setValue";
constexpr const char kHideInputMethod[] = "hideInputMethod";
constexpr const char kShowInputMethod[] = "showInputMethod";

constexpr const char kKeyboardType_Default[] = "default";
constexpr const char kKeyboardType_Numeric[] = "numeric";
constexpr const char kKeyboardType_Password[] = "password";
constexpr const char kKeyboardType_Email[] = "email";
constexpr const char kKeyboardType_PhonePad[] = "phone-pad";

constexpr const char kKeyboardAction_Done[] = "done";
constexpr const char kKeyboardAction_Go[] = "go";
constexpr const char kKeyboardAction_Next[] = "next";
constexpr const char kKeyboardAction_Search[] = "search";
constexpr const char kKeyboardAction_Send[] = "send";
constexpr const char kKeyboardAction_None[] = "none";
constexpr const char kKeyboardAction_Previous[] = "previous";
constexpr const char kKeyboardAction_Unknown[] = "unknown";

constexpr const char kOnKeyBoardWillShow[] = "onKeyboardWillShow";
constexpr const char kOnKeyBoardWillHide[] = "keyboardWillHide";
constexpr const char kFontBold[] = "bold";
constexpr const char kFontItalic[] = "italic";

constexpr const char kAlignAuto[] = "auto";
constexpr const char kAlignLeft[] = "left";
constexpr const char kAlignRight[] = "right";
constexpr const char kAlignCenter[] = "center";
constexpr const char kAlignJustify[] = "justify";
constexpr const char kAlignTop[] = "top";
constexpr const char kAlignBottom[] = "bottom";
}  // namespace textinput

constexpr const int64_t kViewportListenerInvalidID = 0;

class TextInputNode : public ViewNode {
 public:
  explicit TextInputNode(const std::shared_ptr<hippy::dom::DomNode> &dom_node, const RenderInfo info);
  ~TextInputNode() override;

  std::string GetViewName() const override { return kTextInputViewName; }

  void CallFunction(const std::string& function_name, const DomArgument& param, const uint32_t call_back_id) override;

  struct EventCallback {
    bool on_selection_change_flag = false;
    bool on_blur_flag = false;
    bool on_change_text_flag = false;
    bool on_end_editing_flag = false;

    OnBlur on_blur;
    OnChangeText on_change_text;
    OnKeyboardHeightChange on_keyboard_height_change;
    OnEndEditing on_end_editing;
    OnSelectionChange on_selection_change;
  };

 protected:
  void HandleStyleUpdate(const DomStyleMap& dom_style, const DomDeleteProps& dom_delete_props) override;
  std::shared_ptr<tdfcore::View> CreateView(const std::shared_ptr<ViewContext> &context) override;

 private:
  void InitCallBackMap();
  void InitCallback();
  void RegisterViewportListener();
  void UnregisterViewportListener();
  void DidChangeTextEditingValue(std::shared_ptr<TextInputView> text_input_view);

  void SetValue(const DomStyleMap& dom_style, TextStyle& text_style);
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
  void SetHorizontalAlign(const DomStyleMap& dom_style, std::shared_ptr<TextInputView>& text_input_view);
  void SetVerticalAlign(const DomStyleMap& dom_style, std::shared_ptr<TextInputView>& text_input_view);
  void SetTextShadowOffset(const DomStyleMap& dom_style);
  void SetTextShadowColor(const DomStyleMap& dom_style);
  void SetTextShadowRadius(const DomStyleMap& dom_style);
  void UpdateBlurAttr(const DomStyleMap& dom_style);
  void UpdateChangeTextAttr(const DomStyleMap& dom_style);
  void UpdateContentSizeChangeAttr(const DomStyleMap& dom_style);
  void UpdateEndEditingAttr(const DomStyleMap& dom_style);
  void UpdateFocusAttr(const DomStyleMap& dom_style);
  void UpdateSelectionChangeAttr(const DomStyleMap& dom_style);
  void UpdateKeyBoardWillShowAttr(const DomStyleMap& dom_style);

  void UpdateFontStyle(TextStyle& text_style);

  void SendKeyActionEvent(const std::shared_ptr<tdfcore::Event>& event);

  std::weak_ptr<TextInputView> text_input_view_;
  std::shared_ptr<tdfcore::TextEditingController> edit_controller_;
  std::shared_ptr<tdfcore::TextSelectionControl> selection_control_;
  std::map<std::string, InputEventCallBack> input_event_callback_map_;
  tdfcore::TextSelection text_selection_;
  std::u16string text_ = u"";
  std::string font_style_ = "";
  std::string font_weight_ = "";
  float font_size_ = kDefaultFontSize;
  float line_height_ = kDefaultLineHeight;
  bool has_shadow_ = true;
  std::string place_holder_;
  Color place_holder_color_ = tdfcore::Color::Gray();
  tdfcore::KeyboardAction keyboard_action_ = tdfcore::KeyboardAction::kDone;
  uint64_t viewport_listener_id_ = kViewportListenerInvalidID;
  EventCallback event_callback_;
  bool callback_inited_ = false;
};

}  // namespace tdf
}  // namespace render
}  // namespace hippy
