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

#include "renderer/arkui/text_input_base_node.h"
#include "renderer/arkui/native_node_api.h"
#include "renderer/utils/hr_pixel_utils.h"

namespace hippy {
inline namespace render {
inline namespace native {

TextInputBaseNode::TextInputBaseNode(ArkUI_NodeType nodeType)
    : ArkUINode(NativeNodeApi::GetInstance()->createNode(nodeType)) {}

TextInputBaseNode::~TextInputBaseNode() {}

void TextInputBaseNode::SetResponseRegion(HRPosition const &position, HRSize const &size) {
  ArkUI_NumberValue value[] = {{0.0f}, {0.0f}, {size.width}, {size.height}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_RESPONSE_REGION, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::RESPONSE_REGION);
}

void TextInputBaseNode::SetFontColor(uint32_t const &color) {
  uint32_t colorValue = color;
  if (colorValue >> 24 == 0) {
    colorValue |= ((uint32_t)0xff << 24);
  }
  ArkUI_NumberValue preparedColorValue[] = {{.u32 = colorValue}};
  ArkUI_AttributeItem colorItem = {preparedColorValue, sizeof(preparedColorValue) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_FONT_COLOR, &colorItem));
  SetSubAttributeFlag((uint32_t)AttributeFlag::FONT_COLOR);
}

void TextInputBaseNode::SetTextAlign(ArkUI_TextAlignment const &textAlign){
  ArkUI_NumberValue value[] = {{.i32 = textAlign}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_TEXT_ALIGN, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::TEXT_ALIGN);
}

void TextInputBaseNode::SetTextAlignVertical(ArkUI_Alignment const &alignment){
  ArkUI_NumberValue value[] = {{.i32 = alignment}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_ALIGNMENT, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::ALIGNMENT);
}

void TextInputBaseNode::SetFontWeight(ArkUI_FontWeight const &weight){
  ArkUI_NumberValue value[] = {{.i32 = weight}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_FONT_WEIGHT, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::FONT_WEIGHT);
}

void TextInputBaseNode::SetFontStyle(ArkUI_FontStyle const &style){
  ArkUI_NumberValue value[] = {{.i32 = style}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_FONT_STYLE, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::FONT_STYLE);
}

void TextInputBaseNode::SetFontSize(float_t const &size){
  ArkUI_NumberValue value[] = {{.f32 = HRPixelUtils::DpToVp(size) * HRPixelUtils::GetFontSizeScale()}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_FONT_SIZE, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::FONT_SIZE);
  
  ArkUI_NumberValue value2[] = {{.f32 = HRPixelUtils::DpToVp(size) * HRPixelUtils::GetFontSizeScale()}};
  ArkUI_AttributeItem item2 = {.value = value2, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_TEXT_INPUT_PLACEHOLDER_FONT, &item2));
}

void TextInputBaseNode::SetFontFamily(std::string const &family){
  ArkUI_AttributeItem textItem = {.string = family.c_str()};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_FONT_FAMILY, &textItem));
  SetSubAttributeFlag((uint32_t)AttributeFlag::FONT_FAMILY);
}

void TextInputBaseNode::SetMaxLines(int32_t const &lines){
  ArkUI_NumberValue value[] = {{.i32 = lines}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_TEXT_MAX_LINES, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::TEXT_MAX_LINES);
}

void TextInputBaseNode::ResetAllAttributes() {
  ArkUINode::ResetAllAttributes();
  if (!subAttributesFlagValue_) {
    return;
  }
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::RESPONSE_REGION, NODE_RESPONSE_REGION);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::FONT_COLOR, NODE_FONT_COLOR);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::TEXT_ALIGN, NODE_TEXT_ALIGN);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::ALIGNMENT, NODE_ALIGNMENT);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::FONT_WEIGHT, NODE_FONT_WEIGHT);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::FONT_STYLE, NODE_FONT_STYLE);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::FONT_SIZE, NODE_FONT_SIZE);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::FONT_FAMILY, NODE_FONT_FAMILY);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::TEXT_MAX_LINES, NODE_TEXT_MAX_LINES);
  subAttributesFlagValue_ = 0;
}

} // namespace native
} // namespace render
} // namespace hippy
