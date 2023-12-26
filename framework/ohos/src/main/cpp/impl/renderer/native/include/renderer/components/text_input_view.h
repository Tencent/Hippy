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

#include "renderer/components/base_view.h"
#include "renderer/arkui/stack_node.h"
#include "renderer/utils/hr_types.h"
#include "renderer/arkui/text_input_node.h"
#include "renderer/arkui/text_area_node.h"
#include <bits/alltypes.h>
#include <cstdint>
#include <memory>
#include <optional>

namespace hippy {
inline namespace render {
inline namespace native {
using HippyValue = footstone::HippyValue;

typedef enum TextInputPropFlag {
  TextInputPropCaretColor   = 1,
  TextInputPropColor        = 1 << 1,
  TextInputPropDefaultValue = 1 << 2,
  TextInputPropFontFamily   = 1 << 3,
  TextInputPropFontSize     = 1 << 4,
  TextInputPropFontStyle    = 1 << 5,
  TextInputPropFontWeight   = 1 << 6,
  TextInputPropMaxLength    = 1 << 7,
  TextInputPropMultiline    = 1 << 8,
  TextInputPropTextAlign    = 1 << 9,
  TextInputPropTextAlignVertical    = 1 << 10,
  TextInputPropPlaceholder          = 1 << 11,
  TextInputPropPlaceholderTextColor = 1 << 12,
  TextInputPropNumberOfLines        = 1 << 13,
  TextInputPropKeyboardType         = 1 << 14,
  TextInputPropReturnKeyType        = 1 << 15,
  TextInputPropValue                = 1 << 16,
} TextInputPropFlag;

class TextInputView : public BaseView, public TextInputNodeDelegate,public TextAreaNodeDelegate {
public:
  TextInputView(std::shared_ptr<NativeRenderContext> &ctx);
  ~TextInputView();

  StackNode *GetLocalRootArkUINode() override;
  TextInputBaseNode &GetTextNode();
  void CreateArkUINodeImpl() override;
  void DestroyArkUINodeImpl() override;
  bool RecycleArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) override;
  bool ReuseArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) override;
  bool SetPropImpl(const std::string &propKey, const HippyValue &propValue) override;
  void OnSetPropsEndImpl() override;
  void CallImpl(const std::string &method, const std::vector<HippyValue> params,
                   std::function<void(const HippyValue &result)> callback) override;
  void UpdateRenderViewFrameImpl(const HRRect &frame, const HRPadding &padding) override;

  void OnChange(std::string text) override;
  void OnBlur() override;
  void OnFocus() override;
  void OnSubmit() override;
  void OnPaste() override;
  void OnTextSelectionChange(int32_t location, int32_t length) override;

public:
  void InitNode();
  void SetFontWeight(const HippyValue &propValue);
  void SetTextAlign(const HippyValue &propValue);
  void SetTextAlignVertical(const HippyValue &propValue);
  void SetKeyBoardType(const HippyValue &propValue);
  void SetEntryKeyType(const HippyValue &propValue);

  void SetText(const HippyValueArrayType &param);
  void FocusTextInput(const HippyValueArrayType &param);
  void BlurTextInput(const HippyValueArrayType &param);
  void HideInputMethod(const HippyValueArrayType &param);
  void OnEventEndEditing(ArkUI_EnterKeyType enterKeyType);

private:
  void SetPropFlag(TextInputPropFlag flag) { propFlags_ |= flag; }
  void UnsetPropFlag(TextInputPropFlag flag) { propFlags_ &= ~flag; }
  bool IsPropFlag(TextInputPropFlag flag) { return (propFlags_ & flag) ? true : false; }
  
  void ClearProps();

  uint32_t propFlags_ = 0;

  std::optional<uint32_t> caretColor_;
  std::optional<uint32_t> color_;
  std::optional<std::string> value_;
  std::optional<std::string> fontFamily_;
  std::optional<float_t> fontSize_;
  std::optional<uint32_t> fontStyle_;
  std::optional<uint32_t> fontWeight_;
  std::optional<uint32_t> maxLength_;
  std::optional<std::string> placeholder_;
  std::optional<uint32_t> placeholderTextColor_;
  std::optional<int32_t> maxLines_;
  std::optional<uint32_t> keyboardType_;
  std::optional<uint32_t> returnKeyType_;
  bool multiline_ = false;
  std::optional<uint32_t> textAlign_;
  std::optional<uint32_t> textAlignVertical_;

private:
  std::shared_ptr<StackNode> stackNode_;
  std::shared_ptr<TextInputBaseNode> inputBaseNodePtr_ = nullptr;

  bool isListenChangeText_ = false;
  bool isListenSelectionChange_ = false;
  bool isListenEndEditing_ = false;
  bool isListenFocus_ = false;
  bool isListenBlur_ = false;
  bool isListenKeyboardWillShow_ = false; // TODO: 如果有业务需求，再评估鸿蒙上实现方案。
  bool isListenKeyboardWillHide_ = false;
  bool isListenContentSizeChange_ = false;

  bool focus_ = false;
  float_t previousContentWidth_ = 0;
  float_t previousContentHeight_ = 0;
};

} // namespace native
} // namespace render
} // namespace hippy
