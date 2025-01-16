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

#include "renderer/components/text_input_view.h"
#include "renderer/utils/hr_event_utils.h"
#include "renderer/utils/hr_pixel_utils.h"
#include "renderer/utils/hr_value_utils.h"
#include "renderer/utils/hr_text_convert_utils.h"
#include "footstone/logging.h"
#include <memory>


namespace hippy {
inline namespace render {
inline namespace native {

TextInputView::TextInputView(std::shared_ptr<NativeRenderContext> &ctx) : BaseView(ctx) {}

TextInputView::~TextInputView() {}

StackNode *TextInputView::GetLocalRootArkUINode() { return stackNode_.get(); }

TextInputBaseNode &TextInputView::GetTextNode() {
  return *inputBaseNodePtr_.get();
}

void TextInputView::InitNode() {
  if (inputBaseNodePtr_) {
    return;
  }

  if (multiline_ == false) {
    auto textInputNodePtr = std::make_shared<TextInputNode>();
    textInputNodePtr->SetTextInputNodeDelegate(this);
    inputBaseNodePtr_ = textInputNodePtr;
  } else {
    auto textAreaNodePtr = std::make_shared<TextAreaNode>();
    textAreaNodePtr->SetTextAreaNodeDelegate(this);
    inputBaseNodePtr_ = textAreaNodePtr;
  }
  stackNode_->AddChild(&GetTextNode());

  GetTextNode().SetBorderRadius(0, 0, 0, 0);
  GetTextNode().SetBackgroundColor(0x00000000);
}

void TextInputView::CreateArkUINodeImpl() {
  stackNode_ = std::make_shared<StackNode>();
}

void TextInputView::DestroyArkUINodeImpl() {
  stackNode_ = nullptr;
  inputBaseNodePtr_ = nullptr;
  ClearProps();
}

bool TextInputView::RecycleArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) {
  stackNode_->ResetAllAttributes();
  inputBaseNodePtr_->ResetAllAttributes();
  recycleView->cachedNodes_.resize(2);
  recycleView->cachedNodes_[0] = stackNode_;
  recycleView->cachedNodes_[1] = inputBaseNodePtr_;
  stackNode_ = nullptr;
  inputBaseNodePtr_ = nullptr;
  ClearProps();
  return true;
}

bool TextInputView::ReuseArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) {
  if (recycleView->cachedNodes_.size() < 2) {
    return false;
  }
  stackNode_ = std::static_pointer_cast<StackNode>(recycleView->cachedNodes_[0]);
  inputBaseNodePtr_ = std::static_pointer_cast<TextInputBaseNode>(recycleView->cachedNodes_[1]);
  return true;
}

bool TextInputView::SetPropImpl(const std::string &propKey, const HippyValue &propValue) {
  // FOOTSTONE_DLOG(INFO)<<__FUNCTION__<<" propkey = "<<propKey;
  if (propKey == "caret-color") {
    auto value = HRValueUtils::GetUint32(propValue);
    if (!caretColor_.has_value() || value != caretColor_) {
      caretColor_ = value;
      SetPropFlag(TextInputPropCaretColor);
    }
    return true;
  } else if (propKey == "color") {
    auto value = HRValueUtils::GetUint32(propValue);
    if (!color_.has_value() || value != color_) {
      color_ = value;
      SetPropFlag(TextInputPropColor);
    }
    return true;
  } else if (propKey == "defaultValue" || propKey == "value") {
    auto value = HRValueUtils::GetString(propValue);
    if (!value_.has_value() || value != value_) {
      value_ = value;
      SetPropFlag(TextInputPropValue);
    }
    return true;
  } else if (propKey == "fontFamily") {
    auto value = HRValueUtils::GetString(propValue);
    if (!fontFamily_.has_value() || value != fontFamily_) {
      fontFamily_ = value;
      SetPropFlag(TextInputPropFontFamily);
    }
    return true;
  } else if (propKey == "fontSize") {
    auto value = HRValueUtils::GetFloat(propValue);
    if (!fontSize_.has_value() || value != fontSize_) {
      fontSize_ = value;
      SetPropFlag(TextInputPropFontSize);
    }
    return true;
  } else if (propKey == "fontStyle") {
    std::string style = HRValueUtils::GetString(propValue);
    auto fontStyle = ArkUI_FontStyle::ARKUI_FONT_STYLE_NORMAL;
    if(style == "italic") {
      fontStyle = ArkUI_FontStyle::ARKUI_FONT_STYLE_ITALIC;
    }
    if (!fontStyle_.has_value() || fontStyle != fontStyle_) {
      fontStyle_ = fontStyle;
      SetPropFlag(TextInputPropFontStyle);
    }
    return true;
  } else if (propKey == "fontWeight") {
    SetFontWeight(propValue);
    return true;
  } else if (propKey == "maxLength") {
    auto value = HRValueUtils::GetUint32(propValue);
    if (!maxLength_.has_value() || value != maxLength_) {
      maxLength_ = value;
      SetPropFlag(TextInputPropMaxLength);
    }
    return true;
  } else if (propKey == "multiline") {
    multiline_ = HRValueUtils::GetBool(propValue, false);
    if(multiline_) {
      textAlignVertical_ = ArkUI_Alignment::ARKUI_ALIGNMENT_TOP;
      SetPropFlag(TextInputPropTextAlignVertical);
    }
    return true;
  } else if (propKey == "textAlign") {
    SetTextAlign(propValue);
    return true;
  } else if (propKey == "textAlignVertical") {
    SetTextAlignVertical(propValue);
    return true;
  } else if (propKey == "placeholder") {
    auto value = HRValueUtils::GetString(propValue);
    if (!placeholder_.has_value() || value != placeholder_) {
      placeholder_ = value;
      SetPropFlag(TextInputPropPlaceholder);
    }
    return true;
  } else if (propKey == "placeholderTextColor") {
    auto value = HRValueUtils::GetUint32(propValue);
    if (!placeholderTextColor_.has_value() || value != placeholderTextColor_) {
      placeholderTextColor_ = value;
      SetPropFlag(TextInputPropPlaceholderTextColor);
    }
    return true;
  } else if (propKey == "numberOfLines") {
    auto value = HRValueUtils::GetInt32(propValue);
    if (!maxLines_.has_value() || value != maxLines_) {
      maxLines_ = value;
      SetPropFlag(TextInputPropNumberOfLines);
    }
    return true;
  } else if (propKey == "keyboardType") {
    SetKeyBoardType(propValue);
    return true;
  } else if (propKey == "returnKeyType") {
    SetEntryKeyType(propValue);
    return true;
  } else if (propKey == "changetext") {
    isListenChangeText_ = HRValueUtils::GetBool(propValue, false);
    return true;
  } else if (propKey == "selectionchange") {
    isListenSelectionChange_ = HRValueUtils::GetBool(propValue, false);
    return true;
  } else if (propKey == "endediting") {
    isListenEndEditing_ = HRValueUtils::GetBool(propValue, false);
    return true;
  } else if (propKey == "focus") {
    isListenFocus_ = HRValueUtils::GetBool(propValue, false);
    return true;
  } else if (propKey == "blur") {
    isListenBlur_ = HRValueUtils::GetBool(propValue, false);
    return true;
  } else if (propKey == "keyboardwillshow") {
    isListenKeyboardWillShow_ = HRValueUtils::GetBool(propValue, false);
    return true;
  } else if (propKey == "keyboardwillhide") {
    isListenKeyboardWillHide_ = HRValueUtils::GetBool(propValue, false);
    return true;
  } else if (propKey == "contentSizeChange") {
    isListenContentSizeChange_ = HRValueUtils::GetBool(propValue, false);
    return true;
  }
  return BaseView::SetPropImpl(propKey, propValue);
}

void TextInputView::OnSetPropsEndImpl(){
  InitNode();

  // default prop values
  if (!value_.has_value()) {
    value_ = "";
  }
  if (!fontFamily_.has_value()) {
    fontFamily_ = "HarmonyOS Sans";
    SetPropFlag(TextInputPropFontFamily);
  }
  if (!fontSize_.has_value()) {
    fontSize_ = 18;
    SetPropFlag(TextInputPropFontSize);
  }
  if (!fontStyle_.has_value()) {
    fontStyle_ = ArkUI_FontStyle::ARKUI_FONT_STYLE_NORMAL;
    SetPropFlag(TextInputPropFontStyle);
  }
  if (!fontWeight_.has_value()) {
    fontWeight_ = ArkUI_FontWeight::ARKUI_FONT_WEIGHT_NORMAL;
    SetPropFlag(TextInputPropFontWeight);
  }
  if (!textAlign_.has_value()) {
    textAlign_ = ArkUI_TextAlignment::ARKUI_TEXT_ALIGNMENT_START;
    SetPropFlag(TextInputPropTextAlign);
  }
  if (!textAlignVertical_.has_value()) {
    textAlignVertical_ = ArkUI_Alignment::ARKUI_ALIGNMENT_CENTER;
    SetPropFlag(TextInputPropTextAlignVertical);
  }
  if (!keyboardType_.has_value()) {
    keyboardType_ = ArkUI_TextInputType::ARKUI_TEXTINPUT_TYPE_NORMAL;
    SetPropFlag(TextInputPropKeyboardType);
  }
  if (!returnKeyType_.has_value()) {
    returnKeyType_ = ArkUI_EnterKeyType::ARKUI_ENTER_KEY_TYPE_DONE;
    SetPropFlag(TextInputPropReturnKeyType);
  }

  // set props
  if (IsPropFlag(TextInputPropCaretColor)) {
    GetTextNode().SetCaretColor(caretColor_.value());
    UnsetPropFlag(TextInputPropCaretColor);
  }
  if (IsPropFlag(TextInputPropColor)) {
    GetTextNode().SetFontColor(color_.value());
    UnsetPropFlag(TextInputPropColor);
  }
  if (IsPropFlag(TextInputPropValue)) {
    GetTextNode().SetTextContent(value_.value());
    UnsetPropFlag(TextInputPropValue);
  }
  if (IsPropFlag(TextInputPropFontFamily)) {
    GetTextNode().SetFontFamily(fontFamily_.value());
    UnsetPropFlag(TextInputPropFontFamily);
  }
  if (IsPropFlag(TextInputPropFontSize)) {
    GetTextNode().SetFontSize(fontSize_.value());
    UnsetPropFlag(TextInputPropFontSize);
  }
  if (IsPropFlag(TextInputPropFontStyle)) {
    GetTextNode().SetFontStyle((ArkUI_FontStyle)fontStyle_.value());
    UnsetPropFlag(TextInputPropFontStyle);
  }
  if (IsPropFlag(TextInputPropFontWeight)) {
    GetTextNode().SetFontWeight((ArkUI_FontWeight)fontWeight_.value());
    UnsetPropFlag(TextInputPropFontWeight);
  }
  if (IsPropFlag(TextInputPropMaxLength)) {
    GetTextNode().SetMaxLength((int32_t)maxLength_.value());
    UnsetPropFlag(TextInputPropMaxLength);
  }
  if (IsPropFlag(TextInputPropTextAlign)) {
    GetTextNode().SetTextAlign((ArkUI_TextAlignment)textAlign_.value());
    UnsetPropFlag(TextInputPropTextAlign);
  }
  if (IsPropFlag(TextInputPropTextAlignVertical)) {
    GetTextNode().SetTextAlignVertical((ArkUI_Alignment)textAlignVertical_.value());
    UnsetPropFlag(TextInputPropTextAlignVertical);
  }
  if (IsPropFlag(TextInputPropPlaceholder)) {
    GetTextNode().SetPlaceholder(placeholder_.value());
    UnsetPropFlag(TextInputPropPlaceholder);
  }
  if (IsPropFlag(TextInputPropPlaceholderTextColor)) {
    GetTextNode().SetPlaceholderColor(placeholderTextColor_.value());
    UnsetPropFlag(TextInputPropPlaceholderTextColor);
  }
  if (IsPropFlag(TextInputPropNumberOfLines)) {
    if(multiline_) {
      GetTextNode().SetMaxLines(maxLines_.value());
    }
    UnsetPropFlag(TextInputPropNumberOfLines);
  }
  if (IsPropFlag(TextInputPropKeyboardType)) {
    GetTextNode().SetInputType((ArkUI_TextInputType)keyboardType_.value());
    UnsetPropFlag(TextInputPropKeyboardType);
  }
  if (IsPropFlag(TextInputPropReturnKeyType)) {
    GetTextNode().SetEnterKeyType((ArkUI_EnterKeyType)returnKeyType_.value());
    UnsetPropFlag(TextInputPropReturnKeyType);
  }

  return BaseView::OnSetPropsEndImpl();
}

void TextInputView::SetFontWeight(const HippyValue &propValue) {
  std::string weight = HRValueUtils::GetString(propValue);
  auto fontWeight = HRTextConvertUtils::FontWeightToArk(weight);
  if (!fontWeight_.has_value() || fontWeight != fontWeight_) {
    fontWeight_ = fontWeight;
    SetPropFlag(TextInputPropFontWeight);
  }
}

void TextInputView::SetTextAlign(const HippyValue &propValue) {
  auto textAlign = ArkUI_TextAlignment::ARKUI_TEXT_ALIGNMENT_START;
  std::string align = HRValueUtils::GetString(propValue);
  if(align == "center") {
    textAlign = ArkUI_TextAlignment::ARKUI_TEXT_ALIGNMENT_CENTER;
  } else if (align == "right") {
    textAlign = ArkUI_TextAlignment::ARKUI_TEXT_ALIGNMENT_END;
  }
  if (!textAlign_.has_value() || textAlign != textAlign_) {
    textAlign_ = textAlign;
    SetPropFlag(TextInputPropTextAlign);
  }
}

void TextInputView::SetTextAlignVertical(const HippyValue &propValue) {
  auto textAlignVertical = ArkUI_Alignment::ARKUI_ALIGNMENT_CENTER;
  std::string align = HRValueUtils::GetString(propValue);
  if (align == "top") {
    textAlignVertical = ArkUI_Alignment::ARKUI_ALIGNMENT_TOP;
  } else if (align == "bottom") {
    textAlignVertical = ArkUI_Alignment::ARKUI_ALIGNMENT_BOTTOM;
  }
  if (!textAlignVertical_.has_value() || textAlignVertical != textAlignVertical_) {
    textAlignVertical_ = textAlignVertical;
    SetPropFlag(TextInputPropTextAlignVertical);
  }
}

void TextInputView::SetKeyBoardType(const HippyValue &propValue){
  auto keyboardType = ArkUI_TextInputType::ARKUI_TEXTINPUT_TYPE_NORMAL;
  std::string type = HRValueUtils::GetString(propValue);
  if(type == "numeric") {
    keyboardType = ArkUI_TextInputType::ARKUI_TEXTINPUT_TYPE_NUMBER;
  } else if (type == "password") {
    keyboardType = ArkUI_TextInputType::ARKUI_TEXTINPUT_TYPE_PASSWORD;
  } else if (type == "email") {
    keyboardType = ArkUI_TextInputType::ARKUI_TEXTINPUT_TYPE_EMAIL;
  } else if (type == "phone-pad") {
    keyboardType = ArkUI_TextInputType::ARKUI_TEXTINPUT_TYPE_PHONE_NUMBER;
  }
  if (!keyboardType_.has_value() || keyboardType != keyboardType_) {
    keyboardType_ = keyboardType;
    SetPropFlag(TextInputPropKeyboardType);
  }
}

void TextInputView::SetEntryKeyType(const HippyValue &propValue){
  auto returnKeyType = ArkUI_EnterKeyType::ARKUI_ENTER_KEY_TYPE_DONE;
  std::string type = HRValueUtils::GetString(propValue);
  if (type == "go") {
    returnKeyType = ArkUI_EnterKeyType::ARKUI_ENTER_KEY_TYPE_GO;
  } else if (type == "next") {
    returnKeyType = ArkUI_EnterKeyType::ARKUI_ENTER_KEY_TYPE_NEXT;
  } else if (type == "search") {
    returnKeyType = ArkUI_EnterKeyType::ARKUI_ENTER_KEY_TYPE_SEARCH;
  } else if (type == "send") {
    returnKeyType = ArkUI_EnterKeyType::ARKUI_ENTER_KEY_TYPE_SEND;
  } else if (type == "previous") {
    returnKeyType = ArkUI_EnterKeyType::ARKUI_ENTER_KEY_TYPE_PREVIOUS;
  }
  if (!returnKeyType_.has_value() || returnKeyType != returnKeyType_) {
    returnKeyType_ = returnKeyType;
    SetPropFlag(TextInputPropReturnKeyType);
  }
}

void TextInputView::CallImpl(const std::string &method, const std::vector<HippyValue> params,
                   std::function<void(const HippyValue &result)> callback){
  // FOOTSTONE_DLOG(INFO)<<__FUNCTION__<<" method = "<<method;
  if (method == "focusTextInput") {
    FocusTextInput(params);
  } else if (method == "blurTextInput") {
    BlurTextInput(params);
  } else if (method == "hideInputMethod") {
    HideInputMethod(params);
  } else if (method == "clear") {
    HippyValueArrayType array;
    SetText(array);
  } else if (method == "setValue") {
    SetText(params);
  } else if (method == "getValue" && callback) {
    HippyValueObjectType result;
    result["text"] = HippyValue(value_.value());
    const HippyValue obj = HippyValue(result);
    callback(obj);
  } else if (method == "isFocused" && callback) {
    HippyValueObjectType result;
    result["value"] = HippyValue(focus_);
    const HippyValue obj = HippyValue(result);
    callback(obj);
  } else {
    BaseView::Call(method, params, callback);
  }
}

void TextInputView::SetText(const HippyValueArrayType &params){
  if(params.size() == 0) {
    value_ = "";
    GetTextNode().SetTextContent(value_.value());
  } else {
    std::string str = HRValueUtils::GetString(params[0]);
    value_ = str;
    GetTextNode().SetTextContent(value_.value());
    
    // 注释 SetTextSelection 原因：
    // 设置了也没效果，还偶现 OHOS::Ace::NG::UINode::MountToParent 里空指针 crash。
    // int32_t len = (int32_t)str.length();
    // int32_t pos = params.size() < 2 ? len: HRValueUtils::GetInt32(params[1], len);
    // GetTextNode().SetTextSelection(pos, pos);
  }
}

void TextInputView::FocusTextInput(const HippyValueArrayType &param){
  GetTextNode().SetFocusStatus(true);
}

void TextInputView::BlurTextInput(const HippyValueArrayType &param){
  GetTextNode().SetTextEditing(false);
}

void TextInputView::HideInputMethod(const HippyValueArrayType &param){
  GetTextNode().SetTextEditing(false);
}

void TextInputView::UpdateRenderViewFrameImpl(const HRRect &frame, const HRPadding &padding){
  BaseView::UpdateRenderViewFrameImpl(frame, padding);
  GetTextNode().SetPadding(padding.paddingTop, padding.paddingRight, padding.paddingBottom, padding.paddingLeft);
  HRSize size(frame.width, frame.height);
  GetTextNode().SetSize(size);
}

void TextInputView::OnChange(std::string text) {
  if(value_ == text) {
    return;
  }

  value_ = text;
  if(isListenChangeText_) {
    HippyValueObjectType params;
    params["text"] = HippyValue(text);
    const std::shared_ptr<HippyValue> obj = std::make_shared<HippyValue>(params);
    HREventUtils::SendComponentEvent(ctx_, tag_, "changetext", obj);
  }
  if(isListenContentSizeChange_) {
     HRRect rect = GetTextNode().GetTextContentRect();
     if(previousContentWidth_ != rect.width || previousContentHeight_ != rect.height){
        previousContentWidth_ = rect.width;
        previousContentHeight_ = rect.height;
        HippyValueObjectType contentSize;
        contentSize["width"] = HRPixelUtils::VpToDp(rect.width);
        contentSize["height"] = HRPixelUtils::VpToDp(rect.height);
        HippyValueObjectType eventData;
        eventData["contentSize"] = contentSize;
        const std::shared_ptr<HippyValue> obj = std::make_shared<HippyValue>(eventData);
        HREventUtils::SendComponentEvent(ctx_, tag_, "onContentSizeChange", obj);
     }
  }
}

void TextInputView::OnBlur() {
  focus_ = false;
  if (!isListenBlur_) {
    return;
  }

  HippyValueObjectType params;
  params["text"] = HippyValue(value_.value());
  const std::shared_ptr<HippyValue> obj = std::make_shared<HippyValue>(params);
  HREventUtils::SendComponentEvent(ctx_, tag_, "blur", obj);
}

void TextInputView::OnFocus() {
  focus_ = true;
  if(!isListenFocus_) {
    return;
  }

  HippyValueObjectType params;
  params["text"] = HippyValue(value_.value());
  const std::shared_ptr<HippyValue> obj = std::make_shared<HippyValue>(params);
  HREventUtils::SendComponentEvent(ctx_, tag_, "focus", obj);
}

void TextInputView::OnSubmit() {
  OnEventEndEditing((ArkUI_EnterKeyType)returnKeyType_.value());
}

void TextInputView::OnPaste() {

}

void TextInputView::OnTextSelectionChange(int32_t location, int32_t length) {
  if(!isListenSelectionChange_) {
    return;
  }

  HippyValueObjectType selection;
  selection["start"] = HippyValue(location);
  selection["end"] = HippyValue(location + length);
  HippyValueObjectType params;
  params["selection"] = HippyValue(selection);
  const std::shared_ptr<HippyValue> obj = std::make_shared<HippyValue>(params);
  HREventUtils::SendComponentEvent(ctx_, tag_, "selectionchange", obj);
}

void TextInputView::OnEventEndEditing(ArkUI_EnterKeyType enterKeyType) {
  if(!isListenEndEditing_) {
    return;
  }

  HippyValueObjectType params;
  params["text"] = value_.value();
  const std::shared_ptr<HippyValue> obj = std::make_shared<HippyValue>(params);
  HREventUtils::SendComponentEvent(ctx_, tag_, "endediting", obj);

  params["actionCode"] = enterKeyType;
  switch (enterKeyType) {
    case ArkUI_EnterKeyType::ARKUI_ENTER_KEY_TYPE_GO:
      params["actionName"] = "go";
      break;
    case ArkUI_EnterKeyType::ARKUI_ENTER_KEY_TYPE_NEXT:
      params["actionName"] = "next";
      break;
    case ArkUI_EnterKeyType::ARKUI_ENTER_KEY_TYPE_PREVIOUS:
      params["actionName"] = "previous";
      break;
    case ArkUI_EnterKeyType::ARKUI_ENTER_KEY_TYPE_SEARCH:
      params["actionName"] = "search";
      break;
    case ArkUI_EnterKeyType::ARKUI_ENTER_KEY_TYPE_SEND:
      params["actionName"] = "send";
      break;
    case ArkUI_EnterKeyType::ARKUI_ENTER_KEY_TYPE_DONE:
      params["actionName"] = "done";
      break;
    default:
      params["actionName"] = "done";
      break;
  }
  const std::shared_ptr<HippyValue> objAction = std::make_shared<HippyValue>(params);
  HREventUtils::SendComponentEvent(ctx_, tag_, "onEditorAction", objAction);
}

void TextInputView::ClearProps() {
  caretColor_.reset();
  color_.reset();
  value_.reset();
  fontFamily_.reset();
  fontSize_.reset();
  fontStyle_.reset();
  fontWeight_.reset();
  maxLength_.reset();
  placeholder_.reset();
  placeholderTextColor_.reset();
  maxLines_.reset();
  keyboardType_.reset();
  returnKeyType_.reset();
  textAlign_.reset();
  textAlignVertical_.reset();
}

} // namespace native
} // namespace render
} // namespace hippy
