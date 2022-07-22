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

#include "renderer/tdf/viewnode/text_input_node.h"
#include "footstone/string_view_utils.h"

#include "core/tdfi/view/text/cupertino_text_selection_control.h"
#include "core/tdfi/view/view_context.h"
#include "renderer/tdf/viewnode/node_props.h"
#include "renderer/tdf/viewnode/node_utils.h"
#include "src/core/SkBlurMask.h"

#define INVOKE_IF_VIEW_IS_VALIDATE(fn)         \
  do {                                         \
    auto input_view = text_input_view_.lock(); \
    if (input_view != nullptr) {               \
      fn(input_view);                          \
    }                                          \
  } while (false)

namespace tdfrender {

using tdfcore::CupertinoTextSelectionControl;
using tdfcore::ViewContext;
using tdfcore::ViewportEvent;
using tdfcore::textlayout::TextAlign;

const auto kCaretColor = "caret-color";

const auto kBlurTextInput = "blurTextInput";
const auto kClear = "clear";
const auto kFocusTextInput = "focusTextInput";
const auto kGetValue = "getValue";
const auto kHideInputMethod = "hideInputMethod";
const auto kShowInputMethod = "showInputMethod";

const auto kKeyboardType_Default = "default";
const auto kKeyboardType_Numeric = "numeric";
const auto kKeyboardType_Password = "password";
const auto kKeyboardType_Email = "email";
const auto kKeyboardType_PhonePad = "phone-pad";

const auto kKeyboardAction_Done = "done";
const auto kKeyboardAction_Go = "go";
const auto kKeyboardAction_Next = "next";
const auto kKeyboardAction_Search = "search";
const auto kKeyboardAction_Send = "send";

const auto kOnKeyBoardWillShow = "onKeyboardWillShow";
const auto kOnKeyBoardWillHide = "keyboardWillHide";

TextInputNode::TextInputNode(const RenderInfo info) : ViewNode(info), text_selection_(-1, -1) {
  text_shadow_.fColor = tdfcore::Color::Transparent();
  text_shadow_.fOffset = tdfcore::TPoint::Make(0, 0);
  InitJsCall();
  InitCallback();
}

TextInputNode::~TextInputNode() { UnregisterViewportListener(); }

node_creator TextInputNode::GetCreator() {
  return [](RenderInfo info) { return std::make_shared<TextInputNode>(info); };
}

void TextInputNode::HandleStyleUpdate(const DomStyleMap& dom_style) {
  auto text_input_view = text_input_view_.lock();
  if (!text_input_view) {
    return;
  }

  auto text_style = text_input_view->GetAttributes().paragraph_style->getTextStyle();
  auto attributes = text_input_view->GetAttributes();

  SetCaretColor(dom_style, text_style);
  SetColor(dom_style, text_style);
  SetDefaultValue(dom_style, text_input_view);
  SetEditable(dom_style, text_input_view);
  SetFontFamily(dom_style, text_style);
  SetFontSize(dom_style, text_style);
  SetLineHeight(dom_style, text_style);
  SetFontStyle(dom_style, text_style);
  SetFontWeight(dom_style, text_style);
  SetKeyBoardType(dom_style, text_input_view);
  SetLetterSpacing(dom_style, text_style);
  SetMaxLength(dom_style, attributes);
  SetMultiline(dom_style, attributes);
  SetNumberOfLines(dom_style, text_input_view);
  SetPlaceHolder(dom_style);
  SetPlaceHolderTextColor(dom_style);
  SetKeyBoardAction(dom_style, text_input_view);
  SetTextAlign(dom_style, text_input_view);
  SetTextAlignVertical(dom_style, text_style);
  SetTextShadowColor(dom_style);
  SetTextShadowOffset(dom_style);
  SetTextShadowRadius(dom_style);

  UpdateBlurAttr(dom_style);
  UpdateChangeTextAttr(dom_style);
  UpdateContentSizeChangeAttr(dom_style);
  UpdateEndEditingAttr(dom_style);
  UpdateFocusAttr(dom_style);
  UpdateSelectionChangeAttr(dom_style);
  UpdateKeyBoardWillShowAttr(dom_style);

  if (has_shadow_) {
    text_style.addShadow(text_shadow_);
  }
  auto utf8_string = footstone::unicode_string_view::new_from_utf8(place_holder_.c_str());
  auto utf16_string =
      hippy::base::StringViewUtils::CovertToUtf16(utf8_string, footstone::unicode_string_view::Encoding::Utf8);
  text_input_view->SetPlaceholder(utf16_string.utf16_value(), place_holder_color_);
  text_input_view->SetTextStyle(text_style);
  text_input_view->SetKeyboardAction(keyboard_action_);
}

std::shared_ptr<View> TextInputNode::CreateView() {
  edit_controller_ = TDF_MAKE_SHARED(TextEditingController);
  selection_control_ = TDF_MAKE_SHARED(CupertinoTextSelectionControl);
  auto text_input_view = TDF_MAKE_SHARED(TextInputView, edit_controller_, selection_control_);
  edit_controller_->AddListener([&, text_input_view](const auto& v) { DidChangeTextEditingValue(text_input_view); });
  auto text_style = text_input_view->GetAttributes().paragraph_style->getTextStyle();
  text_style.setColor(tdfcore::Color::Black());
  text_input_view->GetAttributes().paragraph_style->setTextStyle(text_style);
  text_input_view_ = text_input_view;
  return text_input_view;
}

void TextInputNode::DidChangeTextEditingValue(std::shared_ptr<TextInputView> text_input_view) {
  auto text = edit_controller_->GetText();
  if (edit_controller_->GetText() != text) {
    text_input_view->SetText(text);
    if (event_callback_.on_change_text_flag) {
      event_callback_.on_change_text(
          std::wstring_convert<std::codecvt_utf8_utf16<char16_t>, char16_t>{}.to_bytes(text));
    }
  }
  auto selection = edit_controller_->GetSelection();
  if (selection.IsValid() && !(text_selection_ == selection) && event_callback_.on_selection_change_flag) {
    text_selection_ = selection;
    event_callback_.on_selection_change(static_cast<size_t>(text_selection_.GetStart()),
                                        static_cast<size_t>(text_selection_.GetEnd()));
  }
}

void TextInputNode::CallFunction(const std::string& function_name, const DomArgument& param,
                                 const uint32_t call_back_id) {
  ViewNode::CallFunction(function_name, param, call_back_id);
  auto func = js_function_map_.find(function_name);
  FOOTSTONE_LOG(INFO) << "TextInputNode::CallFunction function_name = " << function_name;
  if (func != js_function_map_.end()) {
    func->second(call_back_id, param);
  }
}

void TextInputNode::InitJsCall() {
  js_function_map_[kBlurTextInput] = [this](const uint32_t callback_id, const DomArgument& param) {
    auto fn = [](std::shared_ptr<tdfcore::View> view) { std::static_pointer_cast<TextInputView>(view)->ClearFocus(); };
    INVOKE_IF_VIEW_IS_VALIDATE(fn);
  };
  js_function_map_[kClear] = [this](const uint32_t callback_id, const DomArgument& param) {
    auto fn = [](std::shared_ptr<View> view) { std::static_pointer_cast<TextInputView>(view)->SetText(u""); };
    INVOKE_IF_VIEW_IS_VALIDATE(fn);
  };
  js_function_map_[kFocusTextInput] = [this](const uint32_t callback_id, const DomArgument& param) {
    auto fn = [](std::shared_ptr<View> view) { std::static_pointer_cast<TextInputView>(view)->RequestFocus(); };
    INVOKE_IF_VIEW_IS_VALIDATE(fn);
  };
  js_function_map_[kGetValue] = [](const uint32_t callback_id, const DomArgument& param) {
    // TODO(kloudwang)
  };
  js_function_map_[kHideInputMethod] = [this](const uint32_t callback_id, const DomArgument& param) {
    auto fn = [](std::shared_ptr<tdfcore::View> view) {
      std::static_pointer_cast<tdfcore::TextInputView>(view)->TryHidingInputMethod();
    };
    INVOKE_IF_VIEW_IS_VALIDATE(fn);
  };
  js_function_map_[kShowInputMethod] = [this](const uint32_t callback_id, const DomArgument& param) {
    auto fn = [](std::shared_ptr<tdfcore::View> view) {
      std::static_pointer_cast<tdfcore::TextInputView>(view)->TryShowingInputMethod();
    };
    INVOKE_IF_VIEW_IS_VALIDATE(fn);
  };
}

void TextInputNode::InitCallback() {
  event_callback_.on_blur = [this]() { SendUIDomEvent(textinput::kOnBlur); };
  event_callback_.on_change_text = [this](const std::string& value) {
    DomValueObjectType param;
    param["text"] = value;
    SendUIDomEvent(textinput::kOnChangeText, std::make_shared<footstone::HippyValue>(param));
  };
  event_callback_.on_keyboard_height_change = [this](float keyboard_height) {
    auto function_name = keyboard_height < 1 ? kOnKeyBoardWillHide : kOnKeyBoardWillShow;
    DomValueObjectType param;
    param["keyboardHeight"] = keyboard_height;
    SendUIDomEvent(function_name, std::make_shared<footstone::HippyValue>(param));
  };
  event_callback_.on_end_editing = [this](std::u16string final_text) {
    DomValueObjectType param;
    param["text"] = std::wstring_convert<std::codecvt_utf8_utf16<char16_t>, char16_t>{}.to_bytes(final_text);
    SendUIDomEvent(textinput::kOnEndEditing, std::make_shared<footstone::HippyValue>(param));
  };
  event_callback_.on_selection_change = [this](size_t start, size_t end) {
    DomValueObjectType param;
    DomValueObjectType selection_param;
    selection_param["start"] = footstone::HippyValue(static_cast<uint32_t>(start));
    selection_param["end"] = footstone::HippyValue(static_cast<uint32_t>(end));
    param["selection"] = footstone::HippyValue(selection_param);
    SendUIDomEvent(textinput::kOnSelectionChange, std::make_shared<footstone::HippyValue>(param));
  };
}

void TextInputNode::RegisterViewportListener() {
  if (viewport_listener_id_ == 0) {
    auto listener = [this](const std::shared_ptr<tdfcore::Event>& event, uint64_t id) {
      auto viewport_event = std::static_pointer_cast<tdfcore::ViewportEvent>(event);
      event_callback_.on_keyboard_height_change(
          static_cast<float>(viewport_event->GetViewportMetrics().view_inset_bottom));
      return tdfcore::EventDispatchBehavior::kContinue;
    };
    viewport_listener_id_ =
        ViewContext::GetCurrent()->GetShell()->GetEventCenter()->AddListener(ViewportEvent::ClassType(), listener);
  }
}

void TextInputNode::UnregisterViewportListener() {
  if (viewport_listener_id_ != 0) {
    ViewContext::GetCurrent()->GetShell()->GetEventCenter()->RemoveListener(ViewportEvent::ClassType(),
                                                                            viewport_listener_id_);
  }
}

void TextInputNode::SetCaretColor(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(kCaretColor); iter != dom_style.end()) {
    if (auto text_input_view = text_input_view_.lock()) {
      text_input_view->SetCursorColor(ViewNode::ParseToColor(iter->second));
    }
  }
}

void TextInputNode::SetColor(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(textinput::kColor); iter != dom_style.end()) {
    text_style.setColor(util::ConversionIntToColor(static_cast<uint32_t>(iter->second->ToDoubleChecked())));
  }
}

void TextInputNode::SetDefaultValue(const DomStyleMap& dom_style, std::shared_ptr<TextInputView>& text_input_view) {
  if (auto iter = dom_style.find(textinput::kDefaultValue); iter != dom_style.end()) {
    FOOTSTONE_LOG(INFO) << "TextInputNode::SetDefaultValue value = " << iter->second->ToStringChecked();
    text_input_view->SetText(std::wstring_convert<std::codecvt_utf8_utf16<char16_t>, char16_t>{}.from_bytes(
        iter->second->ToStringChecked()));
  }
}

void TextInputNode::SetEditable(const DomStyleMap& dom_style, std::shared_ptr<TextInputView>& text_input_view) {
  if (auto iter = dom_style.find(textinput::kEditable); iter != dom_style.end()) {
    auto editable = iter->second->ToBooleanChecked();
    text_input_view->SetEditable(editable);
  }
}

void TextInputNode::SetFontFamily(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(textinput::kFontFamily); iter != dom_style.end()) {
    text_style.setFontFamilies({SkString(iter->second->ToStringChecked().c_str())});
  }
}

void TextInputNode::SetFontSize(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(textinput::kFontSize); iter != dom_style.end()) {
    font_size_ = static_cast<float>(iter->second->ToDoubleChecked());
    FOOTSTONE_DCHECK(font_size_ != 0);
    text_style.setFontSize(font_size_);
    text_style.setHeight(line_height_ / font_size_);
    text_style.setHeightOverride(true);
  }
}

void TextInputNode::SetLineHeight(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(text::kLineHeight); iter != dom_style.end()) {
    line_height_ = static_cast<float>(iter->second->ToDoubleChecked());
    text_style.setHeight(line_height_ / font_size_);
    text_style.setHeightOverride(true);
  }
}

void TextInputNode::SetFontStyle(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(textinput::kFontStyle); iter != dom_style.end()) {
    auto font_style = iter->second->ToStringChecked();
    if (font_style_ == font_style) {
      return;
    }
    font_style_ = font_style;
    UpdateFontStyle(text_style);
  }
}

void TextInputNode::SetFontWeight(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(textinput::kFontWeight); iter != dom_style.end()) {
    auto dom_value = iter->second;
    if (dom_value->IsString()) {
      auto weight = dom_value->ToStringChecked();
      if (font_weight_ == weight) {
        return;
      }
      font_weight_ = weight;
    } else {
      // 具体数值
      auto font_weight = dom_value->ToDoubleChecked();
      if (font_weight > SkFontStyle::Weight::kMedium_Weight) {
        font_weight_ = "bold";
      }
      auto font_style =
          SkFontStyle(static_cast<int>(font_weight), SkFontStyle::kNormal_Width, SkFontStyle::kUpright_Slant);
      // 如果同时设置了fontStyle属性这里设置的值可能会被覆盖
      text_style.setFontStyle(font_style);
    }
    UpdateFontStyle(text_style);
  }
}

void TextInputNode::SetKeyBoardType(const DomStyleMap& dom_style, std::shared_ptr<TextInputView>& text_input_view) {
  static std::map<std::string, KeyboardInputType> type_map = {{kKeyboardType_Default, KeyboardInputType::Text()},
                                                              {kKeyboardType_Numeric, KeyboardInputType::Number()},
                                                              {kKeyboardType_Password, KeyboardInputType::Password()},
                                                              {kKeyboardType_Email, KeyboardInputType::EmailAddress()},
                                                              {kKeyboardType_PhonePad, KeyboardInputType::Phone()}};

  if (auto iter = dom_style.find(textinput::kKeyboardType); iter != dom_style.end()) {
    auto key_board_type = iter->second->ToStringChecked();
    if (type_map.find(key_board_type) != type_map.end()) {
      text_input_view->SetInputType(type_map.at(key_board_type));
    }
  }
}

void TextInputNode::SetLetterSpacing(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(textinput::kLetterSpacing); iter != dom_style.end()) {
    text_style.setLetterSpacing(static_cast<SkScalar>(iter->second->ToDoubleChecked()));
  }
}

void TextInputNode::SetMaxLength(const DomStyleMap& dom_style, TextInputView::Attributes& attributes) {
  if (auto iter = dom_style.find(textinput::kMaxLength); iter != dom_style.end()) {
    attributes.max_length = static_cast<size_t>(iter->second->ToDoubleChecked());
  }
}

void TextInputNode::SetMultiline(const DomStyleMap& dom_style, TextInputView::Attributes& attributes) {
  if (auto iter = dom_style.find(textinput::kMultiline); iter != dom_style.end()) {
    // todo(kloudwang)
  }
}

void TextInputNode::SetNumberOfLines(const DomStyleMap& dom_style, std::shared_ptr<TextInputView>& text_input_view) {
  if (auto iter = dom_style.find(textinput::kNumberOfLines); iter != dom_style.end()) {
    auto number_of_lines = iter->second->ToUint32Checked();
    text_input_view->SetMaxLines(number_of_lines == 0 ? 1 : static_cast<size_t>(number_of_lines));
  }
}

void TextInputNode::UpdateBlurAttr(const DomStyleMap& dom_style) {
  if (auto iter = dom_style.find(textinput::kOnBlur); iter != dom_style.end()) {
    // TODO: value is Object type
    // event_callback_.on_blur_flag = iter->second->ToBooleanChecked();
  }
}

void TextInputNode::UpdateChangeTextAttr(const DomStyleMap& dom_style) {
  if (auto iter = dom_style.find(textinput::kOnChangeText); iter != dom_style.end()) {
    // TODO: value is Object type
    // event_callback_.on_change_text_flag = iter->second->ToBooleanChecked();
  }
}

void TextInputNode::UpdateEndEditingAttr(const DomStyleMap& dom_style) {
  if (auto iter = dom_style.find(textinput::kOnEndEditing); iter != dom_style.end()) {
    auto has_change = iter->second->ToBooleanChecked();
    auto text_input_view = text_input_view_.lock();
    if (has_change && text_input_view) {
      text_input_view->SetEndEditingCallback(has_change ? event_callback_.on_end_editing : nullptr);
    }
  }
}

void TextInputNode::UpdateContentSizeChangeAttr(const DomStyleMap& dom_style) {
  if (auto iter = dom_style.find(textinput::kOnContentSizeChange); iter != dom_style.end()) {
    // todo(kloudwang)
  }
}

void TextInputNode::UpdateFocusAttr(const DomStyleMap& dom_style) {
  if (auto iter = dom_style.find(textinput::kOnFocus); iter != dom_style.end()) {
    // todo(kloudwang)
  }
}

void TextInputNode::UpdateKeyBoardWillShowAttr(const DomStyleMap& dom_style) {
  if (auto iter = dom_style.find(kOnKeyBoardWillShow); iter != dom_style.end()) {
    // TODO: type unmatch
    //    if (iter->second->ToBooleanChecked()) {
    //      RegisterViewportListener();
    //    } else {
    //      UnregisterViewportListener();
    //    }
  }
}

void TextInputNode::UpdateSelectionChangeAttr(const DomStyleMap& dom_style) {
  if (auto iter = dom_style.find(textinput::kOnSelectionChange); iter != dom_style.end()) {
    event_callback_.on_selection_change_flag = iter->second->ToBooleanChecked();
  }
}

void TextInputNode::SetPlaceHolder(const DomStyleMap& dom_style) {
  if (auto iter = dom_style.find(textinput::kPlaceholder); iter != dom_style.end()) {
    place_holder_ = iter->second->ToStringChecked();
  }
}

void TextInputNode::SetPlaceHolderTextColor(const DomStyleMap& dom_style) {
  if (auto iter = dom_style.find(textinput::kPlaceholderTextColor); iter != dom_style.end()) {
    place_holder_color_ = ViewNode::ParseToColor(iter->second);
  }
}

void TextInputNode::SetKeyBoardAction(const DomStyleMap& dom_style, std::shared_ptr<TextInputView>& text_input_view) {
  static std::map<std::string, KeyboardAction> action_map = {{kKeyboardAction_Done, KeyboardAction::kDone},
                                                             {kKeyboardAction_Go, KeyboardAction::kGo},
                                                             {kKeyboardAction_Next, KeyboardAction::kNext},
                                                             {kKeyboardAction_Search, KeyboardAction::kSearch},
                                                             {kKeyboardAction_Send, KeyboardAction::kSend}};
  if (auto iter = dom_style.find(textinput::kPlaceholderTextColor); iter != dom_style.end()) {
    //    auto action = iter->second->ToStringChecked();
    //    auto action_iterator = action_map.find(action);
    //    if (action_iterator != action_map.end()) {
    //      text_input_view->SetKeyboardAction(action_iterator->second);
    //    }
  }
}

void TextInputNode::SetTextAlign(const DomStyleMap& dom_style, std::shared_ptr<TextInputView>& text_input_view) {
  static std::map<std::string, TextAlign> align_map = {{"auto", TextAlign::kLeft},
                                                       {"left", TextAlign::kLeft},
                                                       {"right", TextAlign::kRight},
                                                       {"center", TextAlign::kCenter},
                                                       {"justify", TextAlign::kJustify}};
  if (auto iter = dom_style.find(textinput::kTextAlign); iter != dom_style.end()) {
    auto text_align = iter->second->ToStringChecked();
    if (align_map.find(text_align) != align_map.end()) {
      text_input_view->SetTextAlign(align_map.at(text_align));
    }
  }
}

void TextInputNode::SetTextShadowColor(const DomStyleMap& dom_style) {
  if (auto iter = dom_style.find(text::kTextShadowColor); iter != dom_style.end()) {
    text_shadow_.fColor = util::ConversionIntToColor(static_cast<uint32_t>(iter->second->ToDoubleChecked()));
    has_shadow_ = true;
  }
}

void TextInputNode::SetTextShadowOffset(const DomStyleMap& dom_style) {
  if (auto iter = dom_style.find(text::kTextShadowOffset); iter != dom_style.end()) {
    auto value_object = iter->second->ToObjectChecked();
    auto width_value = value_object.find(kWidth)->second.ToDoubleChecked();
    auto height_value = value_object.find(kHeight)->second.ToDoubleChecked();
    text_shadow_.fOffset =
        tdfcore::TPoint::Make(static_cast<SkScalar>(width_value), static_cast<SkScalar>(height_value));
    has_shadow_ = true;
  }
}

void TextInputNode::SetTextShadowRadius(const DomStyleMap& dom_style) {
  if (auto iter = dom_style.find(text::kTextShadowRadius); iter != dom_style.end()) {
    auto text_shadow_radius = iter->second->ToDoubleChecked();
    /// TODO(kloudwang) 这里SkBlurMask的计算应该要在tdfcore加一层包装，这里不应该直接依赖skia,后期tdf core
    /// 去skia，直接依赖skia就会有问题
    text_shadow_.fBlurSigma = SkBlurMask::ConvertRadiusToSigma(static_cast<SkScalar>(text_shadow_radius));
    has_shadow_ = true;
  }
}

void TextInputNode::SetTextAlignVertical(const DomStyleMap& dom_style, TextStyle& text_style) {
  // todo(kloudwang) 看着像android特有属性
}

void TextInputNode::UpdateFontStyle(TextStyle& text_style) {
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

}  // namespace tdfrender
