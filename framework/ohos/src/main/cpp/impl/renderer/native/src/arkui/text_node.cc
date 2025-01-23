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

#include "renderer/arkui/text_node.h"
#include "renderer/arkui/native_node_api.h"
#include "renderer/utils/hr_pixel_utils.h"

namespace hippy {

inline namespace render {
inline namespace native {

TextNode::TextNode() : ArkUINode(NativeNodeApi::GetInstance()->createNode(ArkUI_NodeType::ARKUI_NODE_TEXT)) {
}

TextNode::~TextNode() {}

TextNode &TextNode::SetTextContentWithStyledString(const ArkUI_StyledString *styledString) {
  ArkUI_AttributeItem item = {.object = (void*)styledString};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_TEXT_CONTENT_WITH_STYLED_STRING, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::TEXT_CONTENT_WITH_STYLED_STRING);
  hasStyledString_ = true;
  return *this;
}

TextNode &TextNode::SetTextContent(const std::string &text) {
  ArkUI_AttributeItem item = {.string = text.c_str()};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_TEXT_CONTENT, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::TEXT_CONTENT);
  return *this;
}

TextNode &TextNode::SetFontColor(uint32_t color) {
  uint32_t colorValue = color;
  if (colorValue >> 24 == 0) {
    colorValue |= ((uint32_t)0xff << 24);
  }
  ArkUI_NumberValue value[] = {{.u32 = colorValue}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_FONT_COLOR, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::FONT_COLOR);
  return *this;
}

TextNode &TextNode::ResetFontColor() {
  MaybeThrow(NativeNodeApi::GetInstance()->resetAttribute(nodeHandle_, NODE_FONT_COLOR));
  return *this;
}

TextNode &TextNode::SetFontSize(float fontSize) {
  ArkUI_NumberValue value[] = {{.f32 = HRPixelUtils::DpToVp(fontSize) * HRPixelUtils::GetFontSizeScale()}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_FONT_SIZE, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::FONT_SIZE);
  return *this;
}

TextNode &TextNode::SetFontStyle(int32_t fontStyle) {
  ArkUI_NumberValue value[] = {{.i32 = fontStyle}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_FONT_STYLE, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::FONT_STYLE);
  return *this;
}

TextNode &TextNode::SetFontWeight(ArkUI_FontWeight fontWeight) {
  ArkUI_NumberValue value[] = {{.i32 = fontWeight}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_FONT_WEIGHT, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::FONT_WEIGHT);
  return *this;
}

TextNode &TextNode::SetTextLineHeight(float textLineHeight) {
  ArkUI_NumberValue value[] = {{.f32 = HRPixelUtils::DpToVp(textLineHeight) * HRPixelUtils::GetFontSizeScale()}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_TEXT_LINE_HEIGHT, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::TEXT_LINE_HEIGHT);
  return *this;
}

TextNode &TextNode::SetTextHalfLeading(bool verticalCenter) {
  // Invalid prop, still need half_leading config in module.json5
  // ArkUI_NumberValue value[] = {{.i32 = verticalCenter}};
  // ArkUI_AttributeItem item = {.value = value, .size = 1};
  // MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_TEXT_HALF_LEADING, &item));
  // SetSubAttributeFlag((uint32_t)AttributeFlag::TEXT_HALF_LEADING);
  return *this;
}

TextNode &TextNode::SetTextDecoration(ArkUI_TextDecorationType decorationType, uint32_t decorationColor, ArkUI_TextDecorationStyle decorationStyle) {
  ArkUI_NumberValue value[] = {{.i32 = decorationType}, {.u32 = decorationColor}, {.i32 = decorationStyle}};
  ArkUI_AttributeItem item = {.value = value, .size = sizeof(value) / sizeof(ArkUI_NumberValue)};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_TEXT_DECORATION, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::TEXT_DECORATION);
  return *this;
}

TextNode &TextNode::SetTextCase(int32_t textCase) {
  ArkUI_NumberValue value[] = {{.i32 = textCase}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_TEXT_CASE, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::TEXT_CASE);
  return *this;
}

TextNode &TextNode::SetTextLetterSpacing(float textLetterSpacing) {
  ArkUI_NumberValue value[] = {{.f32 = HRPixelUtils::DpToVp(textLetterSpacing) * HRPixelUtils::GetFontSizeScale()}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_TEXT_LETTER_SPACING, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::TEXT_LETTER_SPACING);
  return *this;
}

TextNode &TextNode::SetTextMaxLines(int32_t textMaxLines) {
  ArkUI_NumberValue value[] = {{.i32 = textMaxLines}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_TEXT_MAX_LINES, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::TEXT_MAX_LINES);
  return *this;
}

TextNode &TextNode::ResetTextMaxLines() {
  MaybeThrow(NativeNodeApi::GetInstance()->resetAttribute(nodeHandle_, NODE_TEXT_MAX_LINES));
  return *this;
}

TextNode &TextNode::SetTextAlign(ArkUI_TextAlignment align) {
  ArkUI_NumberValue value[] = {{.i32 = align}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_TEXT_ALIGN, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::TEXT_ALIGN);
  return *this;
}

TextNode &TextNode::SetTextEllipsisMode(ArkUI_EllipsisMode ellipsisMode) {
  ArkUI_NumberValue value[] = {{.i32 = ellipsisMode}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_TEXT_ELLIPSIS_MODE, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::TEXT_ELLIPSIS_MODE);
  return *this;
}

TextNode &TextNode::SetTextOverflow(ArkUI_TextOverflow textOverflow) {
  ArkUI_NumberValue value[] = {{.i32 = textOverflow}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_TEXT_OVERFLOW, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::TEXT_OVERFLOW);
  return *this;
}

TextNode &TextNode::SetWordBreak(ArkUI_WordBreak workBreak) {
  ArkUI_NumberValue value[] = {{.i32 = workBreak}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_TEXT_WORD_BREAK, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::TEXT_WORD_BREAK);
  return *this;
}

TextNode &TextNode::SetFontFamily(const std::string &fontFamily) {
  ArkUI_AttributeItem item = {.string = fontFamily.c_str()};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_FONT_FAMILY, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::FONT_FAMILY);
  return *this;
}

TextNode &TextNode::SetTextBaselineOffset(float textBaselineOffset) {
  ArkUI_NumberValue value[] = {{.f32 = textBaselineOffset}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_TEXT_BASELINE_OFFSET, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::TEXT_BASELINE_OFFSET);
  return *this;
}

TextNode &TextNode::SetTextShadow(float textShadowRadius, ArkUI_ShadowType textShadowType, uint32_t textShadowColor,
                                  float textShadowOffsetX, float textShadowOffsetY) {
  ArkUI_NumberValue value[] = {{.f32 = HRPixelUtils::DpToVp(textShadowRadius)},
                               {.i32 = textShadowType},
                               {.u32 = textShadowColor},
                               {.f32 = HRPixelUtils::DpToVp(textShadowOffsetX)},
                               {.f32 = HRPixelUtils::DpToVp(textShadowOffsetY)}};
  ArkUI_AttributeItem item = {.value = value, .size = sizeof(value) / sizeof(ArkUI_NumberValue)};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_TEXT_TEXT_SHADOW, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::TEXT_TEXT_SHADOW);
  return *this;
}

TextNode &TextNode::SetTextFont(float fontSize, int32_t fontWeight /*= ARKUI_FONT_WEIGHT_NORMAL*/,
                                int32_t fontStyle /*= ARKUI_FONT_STYLE_NORMAL*/,
                                const std::string &fontFamily /*= std::string()*/) {
  ArkUI_NumberValue value[] = {{.f32 = HRPixelUtils::DpToVp(fontSize) * HRPixelUtils::GetFontSizeScale()}, {.i32 = fontWeight}, {.i32 = fontStyle}};
  ArkUI_AttributeItem item = {.value = value, .size = sizeof(value) / sizeof(ArkUI_NumberValue)};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_TEXT_FONT, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::TEXT_FONT);
  return *this;
}

TextNode &TextNode::SetTextHeightAdaptivePolicy(int32_t policyType) {
  ArkUI_NumberValue value[] = {{.i32 = policyType}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_TEXT_HEIGHT_ADAPTIVE_POLICY, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::TEXT_HEIGHT_ADAPTIVE_POLICY);
  return *this;
}

TextNode &TextNode::SetTextIndent(float textIndent) {
  ArkUI_NumberValue value[] = {{.f32 = textIndent}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_TEXT_INDENT, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::TEXT_INDENT);
  return *this;
}

void TextNode::ResetTextContentWithStyledStringAttribute() {
  if (hasStyledString_) {
    MaybeThrow(NativeNodeApi::GetInstance()->resetAttribute(nodeHandle_, NODE_TEXT_CONTENT_WITH_STYLED_STRING));
    hasStyledString_ = false;
  }
}

void TextNode::ResetAllAttributes() {
  ArkUINode::ResetAllAttributes();
  if (!subAttributesFlagValue_) {
    return;
  }
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::TEXT_CONTENT_WITH_STYLED_STRING, NODE_TEXT_CONTENT_WITH_STYLED_STRING);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::TEXT_CONTENT, NODE_TEXT_CONTENT);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::FONT_COLOR, NODE_FONT_COLOR);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::FONT_SIZE, NODE_FONT_SIZE);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::FONT_STYLE, NODE_FONT_STYLE);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::FONT_WEIGHT, NODE_FONT_WEIGHT);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::TEXT_LINE_HEIGHT, NODE_TEXT_LINE_HEIGHT);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::TEXT_HALF_LEADING, NODE_TEXT_HALF_LEADING);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::TEXT_DECORATION, NODE_TEXT_DECORATION);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::TEXT_CASE, NODE_TEXT_CASE);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::TEXT_LETTER_SPACING, NODE_TEXT_LETTER_SPACING);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::TEXT_MAX_LINES, NODE_TEXT_MAX_LINES);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::TEXT_ALIGN, NODE_TEXT_ALIGN);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::TEXT_ELLIPSIS_MODE, NODE_TEXT_ELLIPSIS_MODE);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::TEXT_OVERFLOW, NODE_TEXT_OVERFLOW);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::TEXT_WORD_BREAK, NODE_TEXT_WORD_BREAK);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::FONT_FAMILY, NODE_FONT_FAMILY);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::TEXT_BASELINE_OFFSET, NODE_TEXT_BASELINE_OFFSET);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::TEXT_TEXT_SHADOW, NODE_TEXT_TEXT_SHADOW);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::TEXT_FONT, NODE_TEXT_FONT);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::TEXT_HEIGHT_ADAPTIVE_POLICY, NODE_TEXT_HEIGHT_ADAPTIVE_POLICY);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::TEXT_INDENT, NODE_TEXT_INDENT);
  subAttributesFlagValue_ = 0;
  hasStyledString_ = false;
}

} // namespace native
} // namespace render
} // namespace hippy
