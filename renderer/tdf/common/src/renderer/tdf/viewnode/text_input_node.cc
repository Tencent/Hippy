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
using tdfcore::HorizontalAlign;
using tdfcore::VerticalAlign;
using tdfcore::ViewContext;
using tdfcore::ViewportEvent;
using unicode_string_view = footstone::stringview::string_view;
using footstone::stringview::StringViewUtils;

TextInputNode::TextInputNode(const std::shared_ptr<hippy::dom::DomNode> &dom_node, const RenderInfo info)
    : ViewNode(dom_node, info), text_selection_(-1, -1) {
}

TextInputNode::~TextInputNode() { UnregisterViewportListener(); }

void TextInputNode::HandleStyleUpdate(const DomStyleMap& dom_style, const DomDeleteProps& dom_delete_props) {
  if (!callback_inited_) {
    callback_inited_ = true;
    InitCallBackMap();
    InitCallback();
  }

  auto text_input_view = text_input_view_.lock();
  if (!text_input_view) {
    return;
  }

  auto text_style = text_input_view->GetAttributes().paragraph_style.default_text_style;
  auto attributes = text_input_view->GetAttributes();

  SetValue(dom_style, text_style);
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
  SetHorizontalAlign(dom_style, text_input_view);
  SetVerticalAlign(dom_style, text_input_view);
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

std::shared_ptr<View> TextInputNode::CreateView(const std::shared_ptr<ViewContext> &context) {
  edit_controller_ = TDF_MAKE_SHARED(TextEditingController, context);
  selection_control_ = TDF_MAKE_SHARED(CupertinoTextSelectionControl);
  auto text_input_view = TDF_MAKE_SHARED(TextInputView, context, edit_controller_, selection_control_);
  text_input_view->SetVerticalAlign(tdfcore::VerticalAlign::kCenter);
  edit_controller_->AddValueChangeListener([&, text_input_view](const auto& v) { DidChangeTextEditingValue(text_input_view); });
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
  if (key_action != KeyboardAction::kNewLine) {
    return;
  }
  std::string action_name;
  switch (keyboard_action_) {
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

  DomValueObjectType param2;
  auto u16text = GetView<tdfcore::TextInputView>()->GetTextEditingValue().text;
  auto u8text = std::wstring_convert<std::codecvt_utf8_utf16<char16_t>, char16_t >{}.to_bytes(u16text);
  param2[kText] = u8text;
  SendUIDomEvent(kOnEndEditing, std::make_shared<footstone::HippyValue>(param2));
}

void TextInputNode::DidChangeTextEditingValue(std::shared_ptr<TextInputView> text_input_view) {
  if (edit_controller_->GetText() != text_) {
    text_ = edit_controller_->GetText();
    auto unicode_str =
        StringViewUtils::ConvertEncoding(text_.c_str(), unicode_string_view::Encoding::Utf8).utf8_value();
    if (event_callback_.on_change_text) {
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
    func->second(function_name, call_back_id, param);
  }
}

void TextInputNode::InitCallBackMap() {
  input_event_callback_map_[kBlurTextInput] = [this](const std::string &function_name,
                                                     const uint32_t callback_id,
                                                     const DomArgument &param) {
    auto fn = [](std::shared_ptr<tdfcore::View> view) {
      std::static_pointer_cast<TextInputView>(view)->ClearFocus();
    };
    INVOKE_IF_VIEW_IS_VALIDATE(fn);
  };

  input_event_callback_map_[kClear] = [this](const std::string &function_name,
                                             const uint32_t callback_id,
                                             const DomArgument &param) {
    auto fn = [](std::shared_ptr<View> view) {
      std::static_pointer_cast<TextInputView>(view)->SetText(u"");
    };
    INVOKE_IF_VIEW_IS_VALIDATE(fn);
  };
  input_event_callback_map_[kFocusTextInput] = [this](const std::string &function_name,
                                                      const uint32_t callback_id,
                                                      const DomArgument &param) {
    auto fn = [](std::shared_ptr<View> view) {
      std::static_pointer_cast<TextInputView>(view)->RequestFocus();
    };
    INVOKE_IF_VIEW_IS_VALIDATE(fn);
  };

  input_event_callback_map_[kGetValue] = [this](const std::string &function_name,
                                                const uint32_t callback_id,
                                                const DomArgument &param) {
    auto fn = [this, function_name, callback_id](std::shared_ptr<tdfcore::View> view) {
      auto u16text = std::static_pointer_cast<TextInputView>(view)->GetTextEditingValue().text;
      auto text = std::wstring_convert<std::codecvt_utf8_utf16<char16_t>, char16_t>{}.to_bytes(u16text);
      DomValueObjectType param;
      param["text"] = footstone::HippyValue(text);
      DoCallback(function_name, callback_id, std::make_shared<footstone::HippyValue>(param));
    };
    INVOKE_IF_VIEW_IS_VALIDATE(fn);
  };

  input_event_callback_map_[kSetValue] = [this](const std::string &function_name,
                                                const uint32_t callback_id,
                                                const DomArgument &param) {

    auto fn = [param] (std::shared_ptr<View> view) {
      footstone::HippyValue value;
      param.ToObject(value);
      footstone::value::HippyValue::HippyValueArrayType hippy_value_array;
      auto result = value.ToArray(hippy_value_array);
      FOOTSTONE_CHECK(result);
      if (!result) {
        return;
      }
      auto unicode_str = footstone::string_view::new_from_utf8(hippy_value_array.at(0).ToStringChecked().c_str());
      auto text_u16 = StringViewUtils::ConvertEncoding(unicode_str, unicode_string_view::Encoding::Utf16).utf16_value();
      std::static_pointer_cast<TextInputView>(view)->SetText(text_u16);
    };
    INVOKE_IF_VIEW_IS_VALIDATE(fn);
  };

  input_event_callback_map_[kHideInputMethod] = [this](const std::string &function_name,
                                                       const uint32_t callback_id,
                                                       const DomArgument &param) {
    auto fn = [](std::shared_ptr<tdfcore::View> view) {
      std::static_pointer_cast<tdfcore::TextInputView>(view)->ClearFocus();
    };
    INVOKE_IF_VIEW_IS_VALIDATE(fn);
  };

  input_event_callback_map_[kShowInputMethod] = [this](const std::string &function_name,
                                                       const uint32_t callback_id,
                                                       const DomArgument &param) {
    auto fn = [](std::shared_ptr<tdfcore::View> view) {
      std::static_pointer_cast<tdfcore::TextInputView>(view)->RequestFocus();
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
    param[kText] = footstone::HippyValue(value);
    self->SendUIDomEvent(kOnChangeText, std::make_shared<footstone::HippyValue>(param));
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
        GetView()->GetViewContext()->GetShell()->GetEventCenter()->AddListener(ViewportEvent::ClassType(), listener);
  }
}

void TextInputNode::UnregisterViewportListener() {
  if (viewport_listener_id_ != kViewportListenerInvalidID) {
    GetView()->GetViewContext()->GetShell()->GetEventCenter()->RemoveListener(ViewportEvent::ClassType(),
                                                                            viewport_listener_id_);
  }
}

void TextInputNode::SetValue(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto it = dom_style.find(kValue); it != dom_style.end() && it->second != nullptr) {
    if (auto text_input_view = text_input_view_.lock()) {
      auto unicode_str = footstone::string_view::new_from_utf8(it->second->ToStringChecked().c_str());
      auto text_u16 = StringViewUtils::ConvertEncoding(unicode_str, unicode_string_view::Encoding::Utf16).utf16_value();
      text_input_view->SetText(text_u16);
    }
  }
}

void TextInputNode::SetCaretColor(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto it = dom_style.find(kCaretColor); it != dom_style.end() && it->second != nullptr) {
    if (auto text_input_view = text_input_view_.lock()) {
      text_input_view->SetCursorColor(ViewNode::ParseToColor(it->second));
    }
  }
}

void TextInputNode::SetColor(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto it = dom_style.find(textinput::kColor); it != dom_style.end() && it->second != nullptr) {
    text_style.color = util::ConversionIntToColor(static_cast<uint32_t>(it->second->ToDoubleChecked()));
  }
}

void TextInputNode::SetDefaultValue(const DomStyleMap& dom_style, std::shared_ptr<TextInputView>& text_input_view) {
  if (auto it = dom_style.find(textinput::kDefaultValue);
      it != dom_style.end() && it->second != nullptr && it->second->IsString()) {
    FOOTSTONE_LOG(INFO) << "TextInputNode::SetDefaultValue value = " << it->second->ToStringChecked();
    auto unicode_str = footstone::string_view::new_from_utf8(it->second->ToStringChecked().c_str());
    auto text_u16 = StringViewUtils::ConvertEncoding(unicode_str, unicode_string_view::Encoding::Utf16).utf16_value();
    text_input_view->SetText(text_u16);
  }
}

void TextInputNode::SetEditable(const DomStyleMap& dom_style, std::shared_ptr<TextInputView>& text_input_view) {
  if (auto it = dom_style.find(textinput::kEditable); it != dom_style.end() && it->second != nullptr) {
    auto editable = it->second->ToBooleanChecked();
    text_input_view->SetEditable(editable);
  }
}

void TextInputNode::SetFontFamily(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto it = dom_style.find(textinput::kFontFamily); it != dom_style.end() && it->second != nullptr) {
    std::vector<std::string> families;
    families.push_back(it->second->ToStringChecked());
    text_style.font_families = families;
  }
}

void TextInputNode::SetFontSize(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto it = dom_style.find(textinput::kFontSize); it != dom_style.end() && it->second != nullptr) {
    font_size_ = static_cast<float>(it->second->ToDoubleChecked());
    FOOTSTONE_DCHECK(font_size_ != 0);
    text_style.font_size = font_size_;
  }
}

void TextInputNode::SetLineHeight(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto it = dom_style.find(text::kLineHeight); it != dom_style.end() && it->second != nullptr) {
    line_height_ = static_cast<float>(it->second->ToDoubleChecked());
  }
}

void TextInputNode::SetFontStyle(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto it = dom_style.find(textinput::kFontStyle); it != dom_style.end() && it->second != nullptr) {
    auto font_style = it->second->ToStringChecked();
    font_style_ = font_style;
    UpdateFontStyle(text_style);
  }
}

void TextInputNode::SetFontWeight(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto it = dom_style.find(textinput::kFontWeight); it != dom_style.end() && it->second != nullptr) {
    auto weight = it->second->ToStringChecked();
    if (font_weight_ == weight) {
      return;
    }
    font_weight_ = weight;
  }
  UpdateFontStyle(text_style);
}

void TextInputNode::SetKeyBoardType(const DomStyleMap& dom_style, std::shared_ptr<TextInputView>& text_input_view) {
  static std::map<std::string, tdfcore::KeyboardType> type_map = {{kKeyboardType_Default, tdfcore::KeyboardType::kText},
                                                                  {kKeyboardType_Numeric, tdfcore::KeyboardType::kNumbers},
                                                                  {kKeyboardType_Password, tdfcore::KeyboardType::kPassword},
                                                                  {kKeyboardType_Email, tdfcore::KeyboardType::kEmailAddress},
                                                                  {kKeyboardType_PhonePad, tdfcore::KeyboardType::kPhone}};

  if (auto it = dom_style.find(textinput::kKeyboardType); it != dom_style.end() && it->second != nullptr) {
    auto key_board_type = it->second->ToStringChecked();
    if (type_map.find(key_board_type) != type_map.end()) {
      text_input_view->SetKeyboardType(type_map.at(key_board_type));
    }
  }
}

void TextInputNode::SetLetterSpacing(const DomStyleMap& dom_style, TextStyle& text_style) {
  if (auto it = dom_style.find(textinput::kLetterSpacing); it != dom_style.end() && it->second != nullptr) {
    text_style.letter_spacing = static_cast<tdfcore::TScalar>(it->second->ToDoubleChecked());
  }
}

void TextInputNode::SetMaxLength(const DomStyleMap& dom_style, TextInputView::Attributes& attributes) {
  if (auto it = dom_style.find(textinput::kMaxLength); it != dom_style.end() && it->second != nullptr) {
    attributes.max_length = static_cast<size_t>(it->second->ToDoubleChecked());
  }
}

void TextInputNode::SetMultiline(const DomStyleMap& dom_style, TextInputView::Attributes& attributes) {
  if (auto it = dom_style.find(textinput::kMultiline); it != dom_style.end() && it->second != nullptr) {
    // todo(kloudwang)
  }
}

void TextInputNode::SetNumberOfLines(const DomStyleMap& dom_style, std::shared_ptr<TextInputView>& text_input_view) {
  if (auto it = dom_style.find(textinput::kNumberOfLines); it != dom_style.end() && it->second != nullptr) {
    if (it->second->IsString()) {
      auto number_of_lines = atoi(it->second->ToStringChecked().c_str());
      text_input_view->SetMaxLines(number_of_lines == 0 ? 1 : static_cast<size_t>(number_of_lines));
    } else if (it->second->IsNumber()) {
      auto number_of_lines = static_cast<int64_t>(it->second->ToDoubleChecked());
      text_input_view->SetMaxLines(number_of_lines == 0 ? 1 : static_cast<size_t>(number_of_lines));
    }
  }
}

void TextInputNode::UpdateBlurAttr(const DomStyleMap& dom_style) {
  if (auto it = dom_style.find(textinput::kOnBlur); it != dom_style.end() && it->second != nullptr) { }
}

void TextInputNode::UpdateChangeTextAttr(const DomStyleMap& dom_style) {
  if (auto it = dom_style.find(textinput::kOnChangeText); it != dom_style.end() && it->second != nullptr) { }
}

void TextInputNode::UpdateEndEditingAttr(const DomStyleMap& dom_style) {
  if (auto it = dom_style.find(textinput::kOnEndEditing); it != dom_style.end() && it->second != nullptr) {
    auto has_change = it->second->ToBooleanChecked();
    auto text_input_view = text_input_view_.lock();
    if (has_change && text_input_view) {
      text_input_view->SetEndEditingCallback(has_change ? event_callback_.on_end_editing : nullptr);
    }
  }
}

void TextInputNode::UpdateContentSizeChangeAttr(const DomStyleMap& dom_style) {
  if (auto it = dom_style.find(textinput::kOnContentSizeChange); it != dom_style.end() && it->second != nullptr) {
    // todo(kloudwang)
  }
}

void TextInputNode::UpdateFocusAttr(const DomStyleMap& dom_style) {
  if (auto it = dom_style.find(textinput::kOnFocus); it != dom_style.end() && it->second != nullptr) {
    // todo(kloudwang)
  }
}

void TextInputNode::UpdateKeyBoardWillShowAttr(const DomStyleMap& dom_style) {
  if (auto it = dom_style.find(kOnKeyBoardWillShow); it != dom_style.end() && it->second != nullptr) { }
}

void TextInputNode::UpdateSelectionChangeAttr(const DomStyleMap& dom_style) {
  if (auto it = dom_style.find(textinput::kOnSelectionChange); it != dom_style.end() && it->second != nullptr) {
    event_callback_.on_selection_change_flag = it->second->ToBooleanChecked();
  }
}

void TextInputNode::SetPlaceHolder(const DomStyleMap& dom_style) {
  if (auto it = dom_style.find(textinput::kPlaceholder); it != dom_style.end() && it->second != nullptr) {
    place_holder_ = it->second->ToStringChecked();
  }
}

void TextInputNode::SetPlaceHolderTextColor(const DomStyleMap& dom_style) {
  if (auto it = dom_style.find(textinput::kPlaceholderTextColor); it != dom_style.end() && it->second != nullptr) {
    place_holder_color_ = ViewNode::ParseToColor(it->second);
  }
}

void TextInputNode::SetKeyBoardAction(const DomStyleMap& dom_style, std::shared_ptr<TextInputView>& text_input_view) {
  if (auto it = dom_style.find(textinput::kReturnKeyType); it != dom_style.end() && it->second != nullptr) {
    auto action_name = it->second->ToStringChecked();
    if (action_name == kKeyboardAction_Done) {
      keyboard_action_ = KeyboardAction::kDone;
    } else if (action_name == kKeyboardAction_Go) {
      keyboard_action_ = KeyboardAction::kGo;
    } else if (action_name == kKeyboardAction_Next) {
      keyboard_action_ = KeyboardAction::kNext;
    } else if (action_name == kKeyboardAction_Search) {
      keyboard_action_ = KeyboardAction::kSearch;
    } else if (action_name == kKeyboardAction_Send) {
      keyboard_action_ = KeyboardAction::kSend;
    } else if (action_name == kKeyboardAction_None) {
      keyboard_action_ = KeyboardAction::kNone;
    } else if (action_name == kKeyboardAction_Previous) {
      keyboard_action_ = KeyboardAction::kPrevious;
    } else {
      FOOTSTONE_LOG(INFO) << "TextInputNode::SetKeyBoardAction action_name = " << action_name;
    }
  }
}

void TextInputNode::SetHorizontalAlign(const DomStyleMap& dom_style, std::shared_ptr<TextInputView>& text_input_view) {
  if (auto it = dom_style.find(textinput::kTextAlign); it != dom_style.end() && it->second != nullptr) {
    std::string text_align;
    auto result = it->second->ToString(text_align);
    FOOTSTONE_CHECK(result);
    if (!result) {
      return;
    }
    if (text_align == kAlignAuto || text_align == kAlignLeft) {
      text_input_view->SetHorizontalAlign(HorizontalAlign::kLeft);
    } else if (text_align == kAlignRight) {
      text_input_view->SetHorizontalAlign(HorizontalAlign::kRight);
    } else if (text_align == kAlignCenter) {
      text_input_view->SetHorizontalAlign(HorizontalAlign::kCenter);
    } else if (text_align == kAlignJustify) {
      FOOTSTONE_UNREACHABLE();
    } else {
      FOOTSTONE_UNREACHABLE();
    }
  }
}

void TextInputNode::SetVerticalAlign(const DomStyleMap& dom_style, std::shared_ptr<TextInputView>& text_input_view) {
  if (auto it = dom_style.find(textinput::kTextAlignVertical); it != dom_style.end() && it->second != nullptr) {
    std::string text_align;
    auto result = it->second->ToString(text_align);
    FOOTSTONE_CHECK(result);
    if (!result) {
      return;
    }
    if (text_align == kAlignAuto || text_align == kAlignCenter) {
      text_input_view->SetVerticalAlign(VerticalAlign::kCenter);
    } else if (text_align == kAlignTop) {
      text_input_view->SetVerticalAlign(VerticalAlign::kTop);
    } else if (text_align == kAlignBottom) {
      text_input_view->SetVerticalAlign(VerticalAlign::kBottom);
    } else {
      FOOTSTONE_UNREACHABLE();
    }
  }
}

void TextInputNode::SetTextShadowColor(const DomStyleMap& dom_style) {
  if (auto it = dom_style.find(text::kTextShadowColor); it != dom_style.end() && it->second != nullptr) {
    has_shadow_ = true;
  }
}

void TextInputNode::SetTextShadowOffset(const DomStyleMap& dom_style) {
  if (auto it = dom_style.find(text::kTextShadowOffset); it != dom_style.end() && it->second != nullptr) {
    auto value_object = it->second->ToObjectChecked();
    has_shadow_ = true;
  }
}

void TextInputNode::SetTextShadowRadius(const DomStyleMap& dom_style) {
  if (auto it = dom_style.find(text::kTextShadowRadius); it != dom_style.end() && it->second != nullptr) {
    has_shadow_ = true;
  }
}

void TextInputNode::UpdateFontStyle(TextStyle& text_style) {
  text_style.bold = font_weight_ == "bold";
  text_style.italic = font_style_ == "italic";
}

}  // namespace tdf
}  // namespace render
}  // namespace hippy
