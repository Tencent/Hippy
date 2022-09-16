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

#include "footstone/logging.h"
#include "footstone/string_view_utils.h"
#include "renderer/tdf/viewnode/text_view_node.h"

#include "renderer/tdf/viewnode/node_attributes_parser.h"

#define INVOKE_IF_VIEW_IS_VALIDATE(fn)         \
  do {                                         \
    auto input_view = text_input_view_.lock(); \
    if (input_view != nullptr) {               \
      fn(input_view);                          \
    }                                          \
  } while (false)

namespace hippy {
inline namespace render {
inline namespace tdf {

using tdfcore::CupertinoTextSelectionControl;
using tdfcore::TextAlign;
using tdfcore::ViewContext;
using tdfcore::ViewportEvent;
using unicode_string_view = footstone::stringview::string_view;
using footstone::stringview::StringViewUtils;

TextInputNode::TextInputNode(const RenderInfo info) : ViewNode(info), text_selection_(-1, -1) {
  InitCallBackMap();
  InitCallback();
}

TextInputNode::~TextInputNode() { UnregisterViewportListener(); }

void TextInputNode::HandleStyleUpdate(const DomStyleMap& dom_style) {
  auto text_input_view = text_input_view_.lock();
  if (!text_input_view) {
    return;
  }

  auto text_style = text_input_view->GetAttributes().text_style;
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
    // text_style.addShadow(text_shadow_);
  }
  auto unicode_str = unicode_string_view::new_from_utf8(place_holder_.c_str());
  auto utf16_string = StringViewUtils::ConvertEncoding(unicode_str, unicode_string_view::Encoding::Utf16).utf16_value();
  text_input_view->SetPlaceholder(utf16_string, place_holder_color_);
  text_input_view->SetTextStyle(text_style);
  text_input_view->SetKeyboardAction(keyboard_action_);
}

std::shared_ptr<View> TextInputNode::CreateView() {
  edit_controller_ = TDF_MAKE_SHARED(TextEditingController);
  selection_control_ = TDF_MAKE_SHARED(CupertinoTextSelectionControl);
  auto text_input_view = TDF_MAKE_SHARED(TextInputView, edit_controller_, selection_control_);
  edit_controller_->AddListener([&, text_input_view](const auto& v) { DidChangeTextEditingValue(text_input_view); });
  text_input_view_ = text_input_view;
  text_input_view->GetViewContext()->GetShell()->GetEventCenter()->AddListener(
      tdfcore::KeyboardActionEvent::ClassType(),
      [WEAK_THIS](const std::shared_ptr<tdfcore::Event>& event, uint64_t id) {
        DEFINE_SELF(TextInputNode)
        if (self) {
          self->SendKeyActionEvent(event);
        }
        return tdfcore::EventDispatchBehavior::kContinue;
      });
  return text_input_view;
}

void TextInputNode::SendKeyActionEvent(const std::shared_ptr<tdfcore::Event>& event) {
  auto keyboard_action_event = std::static_pointer_cast<tdfcore::KeyboardActionEvent>(event);
  auto key_action = keyboard_action_event->GetKeyboardAction();
  std::string action_name;
  switch (key_action) {
    case KeyboardAction::kDone:
      action_name = kKeyboardAction_Done;
      break;
    case KeyboardAction::kGo:
      action_name = kKeyboardAction_Go;
      break;
    case KeyboardAction::kNext:
      action_name = kKeyboardAction_Next;
      break;
    case KeyboardAction::kSearch:
      action_name = kKeyboardAction_Search;
      break;
    case KeyboardAction::kSend:
      action_name = kKeyboardAction_Send;
      break;
    case KeyboardAction::kNone:
      action_name = kKeyboardAction_None;
      break;
    case KeyboardAction::kPrevious:
      action_name = kKeyboardAction_Previous;
      break;
    default:
      action_name = kKeyboardAction_Unknown;
      break;
  }
  DomValueObjectType param;
  param[kKeyActionName] = action_name;
  SendUIDomEvent(kOnEditorAction, std::make_shared<footstone::HippyValue>(param));
}

void TextInputNode::DidChangeTextEditingValue(std::shared_ptr<TextInputView> text_input_view) {
  auto text_u16 = edit_controller_->GetText();
  if (edit_controller_->GetText() != text_u16) {
    text_input_view->SetText(text_u16);
    if (event_callback_.on_change_text_flag) {
      auto unicode_str =
          StringViewUtils::ConvertEncoding(text_u16.c_str(), unicode_string_view::Encoding::Utf8).utf8_value();
      event_callback_.on_change_text(StringViewUtils::ToStdString(unicode_str));
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
  auto func = input_event_callback_map_.find(function_name);
  FOOTSTONE_LOG(INFO) << "TextInputNode::CallFunction function_name = " << function_name;
  if (func != input_event_callback_map_.end()) {
    func->second(call_back_id, param);
  }
}

void TextInputNode::InitCallBackMap() {
  input_event_callback_map_[kBlurTextInput] = [this](const uint32_t callback_id, const DomArgument& param) {
    auto fn = [](std::shared_ptr<tdfcore::View> view) { std::static_pointer_cast<TextInputView>(view)->ClearFocus(); };
    INVOKE_IF_VIEW_IS_VALIDATE(fn);
  };
  input_event_callback_map_[kClear] = [this](const uint32_t callback_id, const DomArgument& param) {
    auto fn = [](std::shared_ptr<View> view) { std::static_pointer_cast<TextInputView>(view)->SetText(u""); };
    INVOKE_IF_VIEW_IS_VALIDATE(fn);
  };
  input_event_callback_map_[kFocusTextInput] = [this](const uint32_t callback_id, const DomArgument& param) {
    auto fn = [](std::shared_ptr<View> view) { std::static_pointer_cast<TextInputView>(view)->RequestFocus(); };
    INVOKE_IF_VIEW_IS_VALIDATE(fn);
  };
  input_event_callback_map_[kGetValue] = [](const uint32_t callback_id, const DomArgument& param) {};
  input_event_callback_map_[kHideInputMethod] = [this](const uint32_t callback_id, const DomArgument& param) {
    auto fn = [](std::shared_ptr<tdfcore::View> view) {
      std::static_pointer_cast<tdfcore::TextInputView>(view)->TryHidingInputMethod();
    };
    INVOKE_IF_VIEW_IS_VALIDATE(fn);
  };
  input_event_callback_map_[kShowInputMethod] = [this](const uint32_t callback_id, const DomArgument& param) {
    auto fn = [](std::shared_ptr<tdfcore::View> view) {
      std::static_pointer_cast<tdfcore::TextInputView>(view)->TryShowingInputMethod();
    };
    INVOKE_IF_VIEW_IS_VALIDATE(fn);
  };
}

void TextInputNode::InitCallback() {
  event_callback_.on_blur = [WEAK_THIS]() {
    DEFINE_AND_CHECK_SELF(TextInputNode)
    self->SendUIDomEvent(textinput::kOnBlur);
  };
  event_callback_.on_change_text = [WEAK_THIS](const std::string& value) {
    DEFINE_AND_CHECK_SELF(TextInputNode)
    DomValueObjectType param;
    param[kText] = value;
    self->SendUIDomEvent(textinput::kOnChangeText, std::make_shared<footstone::HippyValue>(param));
  };
  event_callback_.on_keyboard_height_change = [WEAK_THIS](float keyboard_height) {
    DEFINE_AND_CHECK_SELF(TextInputNode)
    auto function_name = keyboard_height < 1 ? kOnKeyBoardWillHide : kOnKeyBoardWillShow;
    DomValueObjectType param;
    param["keyboardHeight"] = keyboard_height;
    self->SendUIDomEvent(function_name, std::make_shared<footstone::HippyValue>(param));
  };
  event_callback_.on_end_editing = [WEAK_THIS](std::u16string final_text) {
    DEFINE_AND_CHECK_SELF(TextInputNode)
    DomValueObjectType param;
    param[kText] =
        StringViewUtils::ConvertEncoding(final_text.c_str(), unicode_string_view::Encoding::Utf8).utf8_value().c_str();
    self->SendUIDomEvent(textinput::kOnEndEditing, std::make_shared<footstone::HippyValue>(param));
  };
  event_callback_.on_selection_change = [WEAK_THIS](size_t start, size_t end) {
    DEFINE_AND_CHECK_SELF(TextInputNode)
    DomValueObjectType param;
    DomValueObjectType selection_param;
    selection_param["start"] = footstone::checked_numeric_cast<size_t, uint32_t>(start);
    ;
    selection_param["end"] = footstone::checked_numeric_cast<size_t, uint32_t>(end);
    param["selection"] = footstone::HippyValue(selection_param);
    self->SendUIDomEvent(textinput::kOnSelectionChange, std::make_shared<footstone::HippyValue>(param));
  };
}

void TextInputNode::RegisterViewportListener() {
  if (viewport_listener_id_ == kViewportListenerInvalidID) {
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
  if (viewport_listener_id_ != kViewportListenerInvalidID) {
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
    text_style.color = util::ConversionIntToColor(static_cast<uint32_t>(iter->second->ToDoubleChecked()));
  }
}

void TextInputNode::SetDefaultValue(const DomStyleMap& dom_style, std::shared_ptr<TextInputView>& text_input_view) {
  if (auto iter = dom_style.find(textinput::kDefaultValue); iter != dom_style.end()) {
    FOOTSTONE_LOG(INFO) << "TextInputNode::SetDefaultValue value = " << iter->second->ToStringChecked();
    auto unicode_str = footstone::string_view::new_from_utf8(iter->second->ToStringChecked().c_str());
    auto text_u16 = StringViewUtils::ConvertEncoding(unicode_str, unicode_string_view::Encoding::Utf16).utf16_value();
    text_input_view->SetText(text_u16);
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
    text_style.font_family = iter->second->ToStringChecked().c_str();
  }
}

void TextInputNode::SetFontSize(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(textinput::kFontSize); iter != dom_style.end()) {
    font_size_ = static_cast<float>(iter->second->ToDoubleChecked());
    FOOTSTONE_DCHECK(font_size_ != 0);
    text_style.font_size = font_size_;
  }
}

void TextInputNode::SetLineHeight(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(text::kLineHeight); iter != dom_style.end()) {
    line_height_ = static_cast<float>(iter->second->ToDoubleChecked());
  }
}

void TextInputNode::SetFontStyle(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(textinput::kFontStyle); iter != dom_style.end()) {
    auto font_style = iter->second->ToStringChecked();
    font_style_ = font_style;
    UpdateFontStyle(text_style);
  }
}

void TextInputNode::SetFontWeight(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto iter = dom_style.find(textinput::kFontWeight); iter != dom_style.end()) {
    auto weight = iter->second->ToStringChecked();
    if (font_weight_ == weight) {
      return;
    }
    font_weight_ = weight;
  }
  UpdateFontStyle(text_style);
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
    text_style.letter_spacing = static_cast<tdfcore::TScalar>(iter->second->ToDoubleChecked());
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
    auto number_of_lines = static_cast<int64_t>(iter->second->ToDoubleChecked());
    text_input_view->SetMaxLines(number_of_lines == 0 ? 1 : static_cast<size_t>(number_of_lines));
  }
}

void TextInputNode::UpdateBlurAttr(const DomStyleMap& dom_style) {
  if (auto iter = dom_style.find(textinput::kOnBlur); iter != dom_style.end()) { }
}

void TextInputNode::UpdateChangeTextAttr(const DomStyleMap& dom_style) {
  if (auto iter = dom_style.find(textinput::kOnChangeText); iter != dom_style.end()) { }
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
  if (auto iter = dom_style.find(kOnKeyBoardWillShow); iter != dom_style.end()) { }
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
  if (auto iter = dom_style.find(textinput::kReturnKeyType); iter != dom_style.end()) {
    auto action_name = iter->second->ToStringChecked();
    if (action_name == kKeyboardAction_Done) {
      text_input_view->SetKeyboardAction(KeyboardAction::kDone);
    } else if (action_name == kKeyboardAction_Go) {
      text_input_view->SetKeyboardAction(KeyboardAction::kGo);
    } else if (action_name == kKeyboardAction_Next) {
      text_input_view->SetKeyboardAction(KeyboardAction::kNext);
    } else if (action_name == kKeyboardAction_Search) {
      text_input_view->SetKeyboardAction(KeyboardAction::kSearch);
    } else if (action_name == kKeyboardAction_Send) {
      text_input_view->SetKeyboardAction(KeyboardAction::kSend);
    } else if (action_name == kKeyboardAction_None) {
      text_input_view->SetKeyboardAction(KeyboardAction::kNone);
    } else if (action_name == kKeyboardAction_Previous) {
      text_input_view->SetKeyboardAction(KeyboardAction::kPrevious);
    } else {
      FOOTSTONE_LOG(INFO) << "TextInputNode::SetKeyBoardAction action_name = " << action_name;
    }
  }
}

void TextInputNode::SetTextAlign(const DomStyleMap& dom_style, std::shared_ptr<TextInputView>& text_input_view) {
  if (auto iter = dom_style.find(textinput::kTextAlign); iter != dom_style.end()) {
    std::string text_align;
    auto result = iter->second->ToString(text_align);
    FOOTSTONE_CHECK(result);
    if (!result) {
      return;
    }
    if (text_align == kAlignAuto || text_align == kAlignLeft) {
      text_input_view->SetTextAlign(TextAlign::kLeft);
    } else if (text_align == kAlignRight) {
      text_input_view->SetTextAlign(TextAlign::kRight);
    } else if (text_align == kAlignCenter) {
      text_input_view->SetTextAlign(TextAlign::kCenter);
    } else if (text_align == kAlignJustify) {
      FOOTSTONE_UNREACHABLE();
    } else {
      FOOTSTONE_UNREACHABLE();
    }
  }
}

void TextInputNode::SetTextShadowColor(const DomStyleMap& dom_style) {
  if (auto iter = dom_style.find(text::kTextShadowColor); iter != dom_style.end()) {
    has_shadow_ = true;
  }
}

void TextInputNode::SetTextShadowOffset(const DomStyleMap& dom_style) {
  if (auto iter = dom_style.find(text::kTextShadowOffset); iter != dom_style.end()) {
    auto value_object = iter->second->ToObjectChecked();
    has_shadow_ = true;
  }
}

void TextInputNode::SetTextShadowRadius(const DomStyleMap& dom_style) {
  if (auto iter = dom_style.find(text::kTextShadowRadius); iter != dom_style.end()) {
    has_shadow_ = true;
  }
}

void TextInputNode::SetTextAlignVertical(const DomStyleMap& dom_style, TextStyle& text_style) {
  // todo(kloudwang) 看着像android特有属性
}

void TextInputNode::UpdateFontStyle(TextStyle& text_style) {
  text_style.bold = font_weight_ == "bold";
  text_style.italic = font_style_ == "italic";
}

}  // namespace tdf
}  // namespace render
}  // namespace hippy
