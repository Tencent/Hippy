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

#include "renderer/arkui/span_node.h"
#include "renderer/arkui/native_node_api.h"
#include "renderer/utils/hr_pixel_utils.h"

namespace hippy {
inline namespace render {
inline namespace native {

SpanNode::SpanNode()
    : ArkUINode(NativeNodeApi::GetInstance()->createNode(ArkUI_NodeType::ARKUI_NODE_SPAN)) {
}

SpanNode::~SpanNode() {}

SpanNode &SpanNode::SetSpanContent(const std::string &text) {
  ArkUI_AttributeItem item = {.string = text.c_str()};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_SPAN_CONTENT, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::SPAN_CONTENT);
  return *this;
}

SpanNode &SpanNode::SetFontColor(uint32_t color) {
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

SpanNode &SpanNode::SetFontSize(float fontSize) {
  ArkUI_NumberValue value[] = {{.f32 = HRPixelUtils::DpToVp(fontSize) * HRPixelUtils::GetFontSizeScale()}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_FONT_SIZE, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::FONT_SIZE);
  return *this;
}

SpanNode &SpanNode::SetFontStyle(int32_t fontStyle) {
  ArkUI_NumberValue value[] = {{.i32 = fontStyle}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_FONT_STYLE, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::FONT_STYLE);
  return *this;
}

SpanNode &SpanNode::SetFontWeight(int32_t fontWeight) {
  ArkUI_NumberValue value[] = {{.i32 = fontWeight}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_FONT_WEIGHT, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::FONT_WEIGHT);
  return *this;
}

SpanNode &SpanNode::SetTextLineHeight(float textLineHeight) {
  ArkUI_NumberValue value[] = {{.f32 = HRPixelUtils::DpToVp(textLineHeight) * HRPixelUtils::GetFontSizeScale()}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_TEXT_LINE_HEIGHT, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::TEXT_LINE_HEIGHT);
  return *this;
}

SpanNode &SpanNode::SetTextDecoration(ArkUI_TextDecorationType decorationType, uint32_t decorationColor, ArkUI_TextDecorationStyle decorationStyle) {
  ArkUI_NumberValue value[] = {{.i32 = decorationType}, {.u32 = decorationColor}, {.i32 = decorationStyle}};
  ArkUI_AttributeItem item = {.value = value, .size = sizeof(value) / sizeof(ArkUI_NumberValue)};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_TEXT_DECORATION, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::TEXT_DECORATION);
  return *this;
}

SpanNode &SpanNode::SetTextCase(int32_t textCase) {
  ArkUI_NumberValue value[] = {{.i32 = textCase}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_TEXT_CASE, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::TEXT_CASE);
  return *this;
}

SpanNode &SpanNode::SetTextLetterSpacing(float textLetterSpacing) {
  ArkUI_NumberValue value[] = {{.f32 = HRPixelUtils::DpToVp(textLetterSpacing) * HRPixelUtils::GetFontSizeScale()}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_TEXT_LETTER_SPACING, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::TEXT_LETTER_SPACING);
  return *this;
}

SpanNode &SpanNode::SetFontFamily(const std::string &fontFamily) {
  ArkUI_AttributeItem item = {.string = fontFamily.c_str()};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_FONT_FAMILY, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::FONT_FAMILY);
  return *this;
}

SpanNode &SpanNode::SetTextShadow(float textShadowRadius, ArkUI_ShadowType textShadowType, uint32_t textShadowColor,
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

SpanNode &SpanNode::SetSpanTextBackgroundStyle(uint32_t color) {
  ArkUI_NumberValue value[] = {{.u32 = color}, {.f32 = 0}};
  ArkUI_AttributeItem item = {.value = value, .size = sizeof(value) / sizeof(ArkUI_NumberValue)};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_SPAN_TEXT_BACKGROUND_STYLE, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::SPAN_TEXT_BACKGROUND_STYLE);
  return *this;
}

void SpanNode::ResetAllAttributes() {
  ArkUINode::ResetAllAttributes();
  if (!subAttributesFlagValue_) {
    return;
  }
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::SPAN_CONTENT, NODE_SPAN_CONTENT);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::FONT_COLOR, NODE_FONT_COLOR);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::FONT_SIZE, NODE_FONT_SIZE);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::FONT_STYLE, NODE_FONT_STYLE);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::FONT_WEIGHT, NODE_FONT_WEIGHT);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::TEXT_LINE_HEIGHT, NODE_TEXT_LINE_HEIGHT);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::TEXT_DECORATION, NODE_TEXT_DECORATION);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::TEXT_CASE, NODE_TEXT_CASE);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::TEXT_LETTER_SPACING, NODE_TEXT_LETTER_SPACING);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::FONT_FAMILY, NODE_FONT_FAMILY);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::TEXT_TEXT_SHADOW, NODE_TEXT_TEXT_SHADOW);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::SPAN_TEXT_BACKGROUND_STYLE, NODE_SPAN_TEXT_BACKGROUND_STYLE);
  subAttributesFlagValue_ = 0;
}

} // namespace native
} // namespace render
} // namespace hippy
