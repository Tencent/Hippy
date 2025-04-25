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

#include "renderer/arkui/arkui_node.h"
#include <algorithm>
#include "renderer/arkui/arkui_node_registry.h"
#include "renderer/arkui/native_gesture_api.h"
#include "renderer/arkui/native_node_api.h"
#include "renderer/utils/hr_convert_utils.h"
#include "renderer/utils/hr_pixel_utils.h"

namespace hippy {
inline namespace render {
inline namespace native {

ArkUINode::ArkUINode(ArkUI_NodeHandle nodeHandle) : nodeHandle_(nodeHandle) {
#if HIPPY_OHOS_MEM_CHECK
  static int sCount = 0;
  ++sCount;
  FOOTSTONE_DLOG(INFO) << "Hippy ohos mem check, ArkUINode handle, new: " << nodeHandle_ << ", count: " << sCount;
#endif

  SetDefaultAttributes();
  ArkUINodeRegistry::GetInstance().RegisterNode(this);
}

ArkUINode::~ArkUINode() {
#if HIPPY_OHOS_MEM_CHECK
  static int sCount = 0;
  ++sCount;
  FOOTSTONE_DLOG(INFO) << "Hippy ohos mem check, ArkUINode handle, del: " << nodeHandle_ << ", count: " << sCount;
#endif

  if (nodeHandle_ != nullptr) {
    UnregisterClickEvent();
    UnregisterTouchEvent();
    ArkUINodeRegistry::GetInstance().UnregisterNode(this);
    if (isReleaseHandle_) {
      NativeNodeApi::GetInstance()->disposeNode(nodeHandle_);
    }
  }
}

ArkUINode::ArkUINode(ArkUINode &&other) noexcept : nodeHandle_(std::move(other.nodeHandle_)) {
  other.nodeHandle_ = nullptr;
}

ArkUINode &ArkUINode::operator=(ArkUINode &&other) noexcept {
  std::swap(nodeHandle_, other.nodeHandle_);
  return *this;
}

ArkUI_NodeHandle ArkUINode::GetArkUINodeHandle() { return nodeHandle_; }

void ArkUINode::MarkDirty() {
  NativeNodeApi::GetInstance()->markDirty(GetArkUINodeHandle(), ArkUI_NodeDirtyFlag::NODE_NEED_RENDER);
  NativeNodeApi::GetInstance()->markDirty(GetArkUINodeHandle(), ArkUI_NodeDirtyFlag::NODE_NEED_LAYOUT);
  NativeNodeApi::GetInstance()->markDirty(GetArkUINodeHandle(), ArkUI_NodeDirtyFlag::NODE_NEED_MEASURE);
}

void ArkUINode::AddChild(ArkUINode *child) {
  if (!child) {
    return;
  }
  MaybeThrow(NativeNodeApi::GetInstance()->addChild(nodeHandle_, child->GetArkUINodeHandle()));
}

void ArkUINode::InsertChild(ArkUINode *child, int32_t index) {
  if (!child) {
    return;
  }
  MaybeThrow(
    NativeNodeApi::GetInstance()->insertChildAt(nodeHandle_, child->GetArkUINodeHandle(), static_cast<int32_t>(index)));
}

void ArkUINode::RemoveChild(ArkUINode *child) {
  if (!child) {
    return;
  }
  MaybeThrow(NativeNodeApi::GetInstance()->removeChild(nodeHandle_, child->GetArkUINodeHandle()));
}

void ArkUINode::RemoveSelfFromParent() {
  auto parentHandle = NativeNodeApi::GetInstance()->getParent(nodeHandle_);
  if (parentHandle) {
    MaybeThrow(NativeNodeApi::GetInstance()->removeChild(parentHandle, nodeHandle_));
  }
}

void ArkUINode::ReplaceSelfFromParent(ArkUINode *newNode) {
  auto parentHandle = NativeNodeApi::GetInstance()->getParent(nodeHandle_);
  if (parentHandle) {
    MaybeThrow(NativeNodeApi::GetInstance()->insertChildBefore(parentHandle, newNode->GetArkUINodeHandle(), nodeHandle_));
    MaybeThrow(NativeNodeApi::GetInstance()->removeChild(parentHandle, nodeHandle_));
  }
}

bool ArkUINode::HasParent() {
  auto parentHandle = NativeNodeApi::GetInstance()->getParent(nodeHandle_);
  if (parentHandle) {
    return true;
  }
  return false;
}

void ArkUINode::SetDefaultAttributes() {
  SetHitTestMode(ARKUI_HIT_TEST_MODE_TRANSPARENT);
  baseAttributesFlagValue_ = 0;
}

ArkUINode &ArkUINode::SetId(const std::string &id) {
  ArkUI_AttributeItem item;
  item = {.string = id.c_str()};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_ID, &item));
  SetBaseAttributeFlag(AttributeFlag::ID);
  return *this;
}

ArkUINode &ArkUINode::SetPosition(const HRPosition &position) {
  ArkUI_NumberValue value[] = {{position.x}, {position.y}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_POSITION, &item));
  SetBaseAttributeFlag(AttributeFlag::POSITION);
  return *this;
}

HRPosition ArkUINode::GetPostion() const {
  auto posValue = NativeNodeApi::GetInstance()->getAttribute(nodeHandle_, NODE_POSITION);
  if (posValue) {
    return HRPosition(posValue->value[0].f32, posValue->value[1].f32);
  }
  return HRPosition{0, 0};
}

HRPosition ArkUINode::GetAbsolutePosition() const {
  float x = 0;
  float y = 0;
  auto posValue = NativeNodeApi::GetInstance()->getAttribute(nodeHandle_, NODE_POSITION);
  if (posValue) {
    x = posValue->value[0].f32;
    y = posValue->value[1].f32;
  }
  auto parentHandle = NativeNodeApi::GetInstance()->getParent(nodeHandle_);
  while (parentHandle) {
    auto parentPosValue = NativeNodeApi::GetInstance()->getAttribute(parentHandle, NODE_POSITION);
    if (parentPosValue) {
      x += parentPosValue->value[0].f32;
      y += parentPosValue->value[1].f32;
    }
    parentHandle = NativeNodeApi::GetInstance()->getParent(parentHandle);
  }
  return HRPosition{x, y};
}

HRPosition ArkUINode::GetLayoutPositionInScreen() const {
  ArkUI_IntOffset offset;
  auto status = OH_ArkUI_NodeUtils_GetLayoutPositionInScreen(nodeHandle_, &offset);
  if (status == ARKUI_ERROR_CODE_NO_ERROR) {
    return HRPosition{ HRPixelUtils::PxToDp((float)offset.x), HRPixelUtils::PxToDp((float)offset.y) };
  }
  return HRPosition{0, 0};
}

HRPosition ArkUINode::GetLayoutPositionInWindow() const {
  ArkUI_IntOffset offset;
  auto status = OH_ArkUI_NodeUtils_GetLayoutPositionInWindow(nodeHandle_, &offset);
  if (status == ARKUI_ERROR_CODE_NO_ERROR) {
    return HRPosition{ HRPixelUtils::PxToDp((float)offset.x), HRPixelUtils::PxToDp((float)offset.y) };
  }
  return HRPosition{0, 0};
}

ArkUINode &ArkUINode::SetSize(const HRSize &size) {
  ArkUI_NumberValue widthValue[] = {{size.width}};
  ArkUI_AttributeItem widthItem = {widthValue, sizeof(widthValue) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_WIDTH, &widthItem));
  SetBaseAttributeFlag(AttributeFlag::WIDTH);

  ArkUI_NumberValue heightValue[] = {{size.height}};
  ArkUI_AttributeItem heightItem = {heightValue, sizeof(heightValue) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_HEIGHT, &heightItem));
  SetBaseAttributeFlag(AttributeFlag::HEIGHT);
  return *this;
}

ArkUINode &ArkUINode::SetWidth(float width) {
  ArkUI_NumberValue widthValue[] = {{width}};
  ArkUI_AttributeItem widthItem = {widthValue, sizeof(widthValue) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_WIDTH, &widthItem));
  SetBaseAttributeFlag(AttributeFlag::WIDTH);
  return *this;
}

ArkUINode &ArkUINode::SetHeight(float height) {
  ArkUI_NumberValue heightValue[] = {{height}};
  ArkUI_AttributeItem heightItem = {heightValue, sizeof(heightValue) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_HEIGHT, &heightItem));
  SetBaseAttributeFlag(AttributeFlag::HEIGHT);
  return *this;
}

HRSize ArkUINode::GetSize() const {
  float width = 0.0;
  float height = 0.0;
  auto widthValue = NativeNodeApi::GetInstance()->getAttribute(nodeHandle_, NODE_WIDTH);
  if (widthValue) {
    width = widthValue->value->f32;
  }
  auto heightValue = NativeNodeApi::GetInstance()->getAttribute(nodeHandle_, NODE_HEIGHT);
  if (heightValue) {
    height = heightValue->value->f32;
  }
  return HRSize{width, height};
}

uint32_t ArkUINode::GetTotalChildCount() const {
  return NativeNodeApi::GetInstance()->getTotalChildCount(nodeHandle_);
}

ArkUI_NodeHandle ArkUINode::GetFirstChild() const{
  return NativeNodeApi::GetInstance()->getFirstChild(nodeHandle_);
}

ArkUI_NodeHandle ArkUINode::GetLastChild() const{
  return NativeNodeApi::GetInstance()->getLastChild(nodeHandle_);
}

ArkUI_NodeHandle ArkUINode::GetChildAt(int32_t postion) const{
  return NativeNodeApi::GetInstance()->getChildAt(nodeHandle_,postion);
}

ArkUINode &ArkUINode::SetPadding(float top, float right, float bottom, float left){
  ArkUI_NumberValue value[] = {{.f32 = top}, {.f32 = right}, {.f32 = bottom}, {.f32 = left}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_PADDING, &item));
  SetBaseAttributeFlag(AttributeFlag::PADDING);
  return *this;
}

ArkUINode &ArkUINode::SetBlur(float blur) {
  ArkUI_NumberValue value[] = {{.f32 = static_cast<float>(blur)}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_BLUR, &item));
  SetBaseAttributeFlag(AttributeFlag::BLUR);
  return *this;
}

ArkUINode &ArkUINode::SetSizePercent(const HRSize &size) {
  ArkUI_NumberValue widthValue[] = {{size.width}};
  ArkUI_AttributeItem widthItem = {widthValue, sizeof(widthValue) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_WIDTH_PERCENT, &widthItem));
  SetBaseAttributeFlag(AttributeFlag::WIDTH_PERCENT);

  ArkUI_NumberValue heightValue[] = {{size.height}};
  ArkUI_AttributeItem heightItem = {heightValue, sizeof(heightValue) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_HEIGHT_PERCENT, &heightItem));
  SetBaseAttributeFlag(AttributeFlag::HEIGHT_PERCENT);
  return *this;
}

ArkUINode &ArkUINode::SetWidthPercent(float percent) {
  ArkUI_NumberValue value[] = {{.f32 = percent}};
  ArkUI_AttributeItem item = {value, 1, nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_WIDTH_PERCENT, &item));
  SetBaseAttributeFlag(AttributeFlag::WIDTH_PERCENT);
  return *this;
}

ArkUINode &ArkUINode::SetHeightPercent(float percent) {
  ArkUI_NumberValue value[] = {{.f32 = percent}};
  ArkUI_AttributeItem item = {value, 1, nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_HEIGHT_PERCENT, &item));
  SetBaseAttributeFlag(AttributeFlag::HEIGHT_PERCENT);
  return *this;
}

ArkUINode &ArkUINode::SetVisibility(bool visibility) {
  ArkUI_NumberValue value[] = {{.i32 = visibility ? ARKUI_VISIBILITY_VISIBLE : ARKUI_VISIBILITY_HIDDEN}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(value), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_VISIBILITY, &item));
  SetBaseAttributeFlag(AttributeFlag::VISIBILITY);
  return *this;
}

ArkUINode &ArkUINode::SetBackgroundColor(uint32_t color) {
  ArkUI_NumberValue preparedColorValue[] = {{.u32 = color}};
  ArkUI_AttributeItem colorItem = {preparedColorValue, sizeof(preparedColorValue) / sizeof(ArkUI_NumberValue), nullptr,
                                   nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_BACKGROUND_COLOR, &colorItem));
  SetBaseAttributeFlag(AttributeFlag::BACKGROUND_COLOR);
  return *this;
}

ArkUINode &ArkUINode::SetTransform(const HRTransform &transform, float pointScaleFactor) {
  if (transform.rotate.has_value()) {
    SetRotate(transform.rotate.value());
  }
  if (transform.scale.has_value()) {
    SetScale(transform.scale.value());
  }
  if (transform.translate.has_value()) {
    SetTranslate(transform.translate.value(), pointScaleFactor);
  }
  if (transform.matrix.has_value()) {
    SetMatrix(transform.matrix.value(), pointScaleFactor);
  }
  return *this;
}

ArkUINode &ArkUINode::SetOpacity(float opacity) {
  ArkUI_NumberValue opacityValue[] = {{.f32 = (float)opacity}};
  ArkUI_AttributeItem opacityItem = {opacityValue, sizeof(opacityValue) / sizeof(ArkUI_NumberValue), nullptr, nullptr};

  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_OPACITY, &opacityItem));
  SetBaseAttributeFlag(AttributeFlag::OPACITY);
  return *this;
}

ArkUINode &ArkUINode::SetMatrix(const HRMatrix &transformMatrix, float pointScaleFactor) {
  ArkUI_NumberValue transformCenterValue[] = {{0}, {0}, {0}, {0.5f}, {0.5f}};
  ArkUI_AttributeItem transformCenterItem = {transformCenterValue,
                                             sizeof(transformCenterValue) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_TRANSFORM_CENTER, &transformCenterItem));
  SetBaseAttributeFlag(AttributeFlag::TRANSFORM_CENTER);

  // NOTE: ArkUI translation is in `px` units
  auto matrix = transformMatrix.m;
  matrix[12] *= pointScaleFactor;
  matrix[13] *= pointScaleFactor;
  matrix[14] *= pointScaleFactor;

  std::array<ArkUI_NumberValue, 16> transformValue;
  for (uint32_t i = 0; i < 16; i++) {
    transformValue[i] = {.f32 = static_cast<float>(matrix[i])};
  }

  ArkUI_AttributeItem transformItem = {transformValue.data(), transformValue.size(), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_TRANSFORM, &transformItem));
  SetBaseAttributeFlag(AttributeFlag::TRANSFORM);
  return *this;
}

ArkUINode &ArkUINode::SetRotate(const HRRotate &rotate) {
  ArkUI_NumberValue value[] = {{.f32 = rotate.x}, {.f32 = rotate.y}, {.f32 = rotate.z}, {.f32 = rotate.angle}, {.f32 = rotate.perspective}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_ROTATE, &item));
  SetBaseAttributeFlag(AttributeFlag::ROTATE);
  return *this;
}

ArkUINode &ArkUINode::SetScale(const HRScale &scale) {
  ArkUI_NumberValue value[] = {{.f32 = scale.x}, {.f32 = scale.y}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_SCALE, &item));
  SetBaseAttributeFlag(AttributeFlag::SCALE);
  return *this;
}

ArkUINode &ArkUINode::SetTranslate(const HRTranslate &translate, float pointScaleFactor) {
  ArkUI_NumberValue value[] = {{.f32 = translate.x * pointScaleFactor},
                               {.f32 = translate.y * pointScaleFactor},
                               {.f32 = translate.z * pointScaleFactor}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_TRANSLATE, &item));
  SetBaseAttributeFlag(AttributeFlag::TRANSLATE);
  return *this;
}

ArkUINode &ArkUINode::SetClip(bool clip) {
  uint32_t isClip = static_cast<uint32_t>(clip);
  ArkUI_NumberValue clipValue[] = {{.u32 = isClip}};
  ArkUI_AttributeItem clipItem = {clipValue, sizeof(clipValue) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_CLIP, &clipItem));
  SetBaseAttributeFlag(AttributeFlag::CLIP);
  return *this;
}

ArkUINode &ArkUINode::SetZIndex(int32_t zIndex) {
  ArkUI_NumberValue value[] = {{.f32 = (float)zIndex}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_Z_INDEX, &item));
  SetBaseAttributeFlag(AttributeFlag::Z_INDEX);
  return *this;
}

ArkUINode &ArkUINode::SetAccessibilityText(const std::string &accessibilityLabel) {
  ArkUI_AttributeItem textItem = {.string = accessibilityLabel.c_str()};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_ACCESSIBILITY_TEXT, &textItem));
  SetBaseAttributeFlag(AttributeFlag::ACCESSIBILITY_TEXT);
  return *this;
}

ArkUINode &ArkUINode::SetFocusable(bool focusable) {
  ArkUI_NumberValue value[] = {{.i32 = focusable ? 1 : 0}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_FOCUSABLE, &item));
  SetBaseAttributeFlag(AttributeFlag::FOCUSABLE);
  return *this;
}

ArkUINode &ArkUINode::SetFocusStatus(int32_t focus) {
  ArkUI_NumberValue value[] = {{.i32 = focus}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_FOCUS_STATUS, &item));
  SetBaseAttributeFlag(AttributeFlag::FOCUS_STATUS);
  return *this;
}

ArkUINode &ArkUINode::SetLinearGradient(const HRLinearGradient &linearGradient) {
  ArkUI_NumberValue value[] = {
    {.f32 = linearGradient.angle.has_value() ? linearGradient.angle.value() : NAN},
    {.i32 = linearGradient.direction.has_value() ? linearGradient.direction.value()
                                                 : ARKUI_LINEAR_GRADIENT_DIRECTION_CUSTOM},
    {.i32 = linearGradient.repeating.has_value() ? linearGradient.repeating.value() : false}};
  ArkUI_ColorStop colorStop = {.colors = linearGradient.colors.data(),
                               .stops = (float *)(linearGradient.stops.data()),
                               .size = (int)linearGradient.colors.size()};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, &colorStop};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_LINEAR_GRADIENT, &item));
  SetBaseAttributeFlag(AttributeFlag::LINEAR_GRADIENT);
  return *this;
}

ArkUINode &ArkUINode::SetHitTestMode(const ArkUI_HitTestMode mode) {
  ArkUI_NumberValue hitTestModeValue[] = {{.i32 = static_cast<int32_t>(mode)}};
  ArkUI_AttributeItem hitTestModeItem = {.value = hitTestModeValue,
                                         .size = sizeof(hitTestModeValue) / sizeof(ArkUI_NumberValue)};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_HIT_TEST_BEHAVIOR, &hitTestModeItem));
  SetBaseAttributeFlag(AttributeFlag::HIT_TEST_BEHAVIOR);
  return *this;
}

ArkUINode &ArkUINode::SetEnabled(bool enabled) {
  ArkUI_NumberValue value = {.i32 = int32_t(enabled)};
  ArkUI_AttributeItem item = {&value, 1, nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_ENABLED, &item));
  SetBaseAttributeFlag(AttributeFlag::ENABLED);
  return *this;
}

ArkUINode &ArkUINode::SetBackgroundImage(const std::string &uri) {
  ArkUI_AttributeItem item = {.string = uri.c_str()};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_BACKGROUND_IMAGE, &item));
  SetBaseAttributeFlag(AttributeFlag::BACKGROUND_IMAGE);
  return *this;
}

ArkUINode &ArkUINode::SetBackgroundImagePosition(const HRPosition &position) {
  ArkUI_NumberValue value[] = {{.f32 = position.x}, {.f32 = position.y}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_BACKGROUND_IMAGE_POSITION, &item));
  SetBaseAttributeFlag(AttributeFlag::BACKGROUND_IMAGE_POSITION);
  return *this;
}

ArkUINode &ArkUINode::SetBackgroundImageSize(const ArkUI_ImageSize sizeStyle) {
  ArkUI_NumberValue value[] = {{.i32 = sizeStyle}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_BACKGROUND_IMAGE_SIZE_WITH_STYLE, &item));
  SetBaseAttributeFlag(AttributeFlag::BACKGROUND_IMAGE_SIZE_WITH_STYLE);
  return *this;
}

ArkUINode &ArkUINode::SetBorderWidth(float top, float right, float bottom, float left) {
  top = std::max(top, 0.0f);
  right = std::max(right, 0.0f);
  bottom = std::max(bottom, 0.0f);
  left = std::max(left, 0.0f);
  ArkUI_NumberValue borderWidthValue[] = {{HRPixelUtils::DpToVp(top)}, {HRPixelUtils::DpToVp(right)}, {HRPixelUtils::DpToVp(bottom)}, {HRPixelUtils::DpToVp(left)}};
  ArkUI_AttributeItem borderWidthItem = {borderWidthValue, sizeof(borderWidthValue) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_BORDER_WIDTH, &borderWidthItem));
  SetBaseAttributeFlag(AttributeFlag::BORDER_WIDTH);
  return *this;
}

ArkUINode &ArkUINode::SetBorderColor(uint32_t top, uint32_t right, uint32_t bottom, uint32_t left) {
  // Support border color 0, for support color 'transparent'
  uint32_t borderTopColor = top;
  uint32_t bordeRightColor = right;
  uint32_t borderBottomColor = bottom;
  uint32_t borderLeftColor = left;
  ArkUI_NumberValue borderColorValue[] = {
    {.u32 = borderTopColor}, {.u32 = bordeRightColor}, {.u32 = borderBottomColor}, {.u32 = borderLeftColor}};
  ArkUI_AttributeItem borderColorItem = {borderColorValue, sizeof(borderColorValue) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_BORDER_COLOR, &borderColorItem));
  SetBaseAttributeFlag(AttributeFlag::BORDER_COLOR);
  return *this;
}

ArkUINode &ArkUINode::SetBorderRadius(float topLeft, float topRight, float bottomLeft, float bottomRight) {
  ArkUI_NumberValue borderRadiusValue[] = {
    {HRPixelUtils::DpToVp(topLeft)}, {HRPixelUtils::DpToVp(topRight)},
    {HRPixelUtils::DpToVp(bottomLeft)}, {HRPixelUtils::DpToVp(bottomRight)}
  };

  ArkUI_AttributeItem borderRadiusItem = {borderRadiusValue, sizeof(borderRadiusValue) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_BORDER_RADIUS, &borderRadiusItem));
  SetBaseAttributeFlag(AttributeFlag::BORDER_RADIUS);
  return *this;
}

ArkUINode &ArkUINode::SetBorderStyle(ArkUI_BorderStyle top, ArkUI_BorderStyle right, ArkUI_BorderStyle bottom, ArkUI_BorderStyle left) {
  ArkUI_NumberValue borderStyleValue[] = {
    {.i32 = static_cast<int32_t>(top)},
    {.i32 = static_cast<int32_t>(right)},
    {.i32 = static_cast<int32_t>(bottom)},
    {.i32 = static_cast<int32_t>(left)}
  };
  ArkUI_AttributeItem borderStyleItem = {borderStyleValue, sizeof(borderStyleValue) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_BORDER_STYLE, &borderStyleItem));
  SetBaseAttributeFlag(AttributeFlag::BORDER_STYLE);
  return *this;
}

ArkUINode &ArkUINode::SetShadow(const HRShadow &shadow) {
  float shadowOpacity = 1.f;
  if (shadow.shadowOpacity.has_value() && shadow.shadowOpacity.value() > 0 && shadow.shadowOpacity.value() < 1.f) {
    shadowOpacity = shadow.shadowOpacity.value();
  }
  uint32_t shadowColorValue = 0xff000000;
  if (shadow.shadowColor.has_value()) {
    shadowColorValue = shadow.shadowColor.value();
  }
  uint32_t alpha = static_cast<uint32_t>((float)((shadowColorValue >> 24) & (0xff)) * shadowOpacity);
  shadowColorValue = (alpha << 24) + (shadowColorValue & 0xffffff);
  ArkUI_NumberValue shadowValue[] = {{.f32 = HRPixelUtils::DpToVp(shadow.shadowRadius)},
                                     {.i32 = 0},
                                     {.f32 = static_cast<float>(HRPixelUtils::DpToVp(shadow.shadowOffset.width))},
                                     {.f32 = static_cast<float>(HRPixelUtils::DpToVp(shadow.shadowOffset.height))},
                                     {.i32 = 0},
                                     {.u32 = shadowColorValue},
                                     {.u32 = 0}};
  ArkUI_AttributeItem shadowItem = {.value = shadowValue, .size = sizeof(shadowValue) / sizeof(ArkUI_NumberValue)};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_CUSTOM_SHADOW, &shadowItem));
  SetBaseAttributeFlag(AttributeFlag::CUSTOM_SHADOW);
  return *this;
}

ArkUINode &ArkUINode::SetMargin(float left, float top, float right, float bottom) {
  ArkUI_NumberValue value[] = {{.f32 = HRPixelUtils::DpToVp(top)}, {.f32 = HRPixelUtils::DpToVp(right)}, {.f32 = HRPixelUtils::DpToVp(bottom)}, {.f32 = HRPixelUtils::DpToVp(left)}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_MARGIN, &item));
  SetBaseAttributeFlag(AttributeFlag::MARGIN);
  return *this;
}

ArkUINode &ArkUINode::SetAlignment(ArkUI_Alignment align) {
  ArkUI_NumberValue value[] = {{.i32 = align}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_ALIGNMENT, &item));
  SetBaseAttributeFlag(AttributeFlag::ALIGNMENT);
  return *this;
}

ArkUINode &ArkUINode::SetExpandSafeArea() {
//TODO  NODE_EXPAND_SAFE_AREA not define in devEco 5.0.0.400 will add in later
//  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_EXPAND_SAFE_AREA,nullptr ));
//  SetBaseAttributeFlag(AttributeFlag::EXPAND_SAFE_AREA);
  return *this;
}

ArkUINode &ArkUINode::SetTransitionMove(const ArkUI_TransitionEdge edgeType,int32_t duration,ArkUI_AnimationCurve curveType) {
  ArkUI_NumberValue value[] = {{.i32 = edgeType}, {.i32 = duration}, {.i32 = curveType}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_MOVE_TRANSITION, &item));
  SetBaseAttributeFlag(AttributeFlag::MOVE_TRANSITION);
  return *this;
}

ArkUINode &ArkUINode::SetTransitionOpacity(const ArkUI_AnimationCurve curveType,int32_t duration) {
  ArkUI_NumberValue value[] = {{.f32 = 0},{.i32 = duration},{.i32 = curveType}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_OPACITY_TRANSITION, &item));
  SetBaseAttributeFlag(AttributeFlag::OPACITY_TRANSITION);
  return *this;
}

ArkUINode &ArkUINode::SetTransitionTranslate(float distanceX,float distanceY,float distanceZ,ArkUI_AnimationCurve curveType,int32_t duration) {
  ArkUI_NumberValue value[] = {{.f32 = distanceX},{.f32 = distanceY},{.f32 = distanceZ},{.i32 = duration},{.i32 = curveType}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_TRANSLATE_TRANSITION, &item));
  SetBaseAttributeFlag(AttributeFlag::TRANSLATE_TRANSITION);
  return *this;
}

void ArkUINode::ResetNodeAttribute(ArkUI_NodeAttributeType type) {
  MaybeThrow(NativeNodeApi::GetInstance()->resetAttribute(nodeHandle_, type));
}

void ArkUINode::ResetAllAttributes() {
  if (!baseAttributesFlagValue_) {
    return;
  }
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::ID, NODE_ID);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::POSITION, NODE_POSITION);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::WIDTH, NODE_WIDTH);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::HEIGHT, NODE_HEIGHT);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::PADDING, NODE_PADDING);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::BLUR, NODE_BLUR);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::WIDTH_PERCENT, NODE_WIDTH_PERCENT);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::HEIGHT_PERCENT, NODE_HEIGHT_PERCENT);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::VISIBILITY, NODE_VISIBILITY);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::BACKGROUND_COLOR, NODE_BACKGROUND_COLOR);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::OPACITY, NODE_OPACITY);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::TRANSFORM_CENTER, NODE_TRANSFORM_CENTER);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::TRANSFORM, NODE_TRANSFORM);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::ROTATE, NODE_ROTATE);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::SCALE, NODE_SCALE);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::TRANSLATE, NODE_TRANSLATE);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::CLIP, NODE_CLIP);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::Z_INDEX, NODE_Z_INDEX);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::ACCESSIBILITY_TEXT, NODE_ACCESSIBILITY_TEXT);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::FOCUSABLE, NODE_FOCUSABLE);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::FOCUS_STATUS, NODE_FOCUS_STATUS);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::LINEAR_GRADIENT, NODE_LINEAR_GRADIENT);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::HIT_TEST_BEHAVIOR, NODE_HIT_TEST_BEHAVIOR);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::ENABLED, NODE_ENABLED);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::BACKGROUND_IMAGE, NODE_BACKGROUND_IMAGE);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::BACKGROUND_IMAGE_POSITION, NODE_BACKGROUND_IMAGE_POSITION);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::BACKGROUND_IMAGE_SIZE_WITH_STYLE, NODE_BACKGROUND_IMAGE_SIZE_WITH_STYLE);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::BORDER_WIDTH, NODE_BORDER_WIDTH);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::BORDER_COLOR, NODE_BORDER_COLOR);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::BORDER_RADIUS, NODE_BORDER_RADIUS);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::BORDER_STYLE, NODE_BORDER_STYLE);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::CUSTOM_SHADOW, NODE_CUSTOM_SHADOW);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::MARGIN, NODE_MARGIN);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::ALIGNMENT, NODE_ALIGNMENT);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::EXPAND_SAFE_AREA, NODE_EXPAND_SAFE_AREA);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::MOVE_TRANSITION, NODE_MOVE_TRANSITION);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::OPACITY_TRANSITION, NODE_OPACITY_TRANSITION);
  ARK_UI_NODE_RESET_BASE_ATTRIBUTE(AttributeFlag::TRANSLATE_TRANSITION, NODE_TRANSLATE_TRANSITION);
  SetDefaultAttributes();
}

void ArkUINode::SetArkUINodeDelegate(ArkUINodeDelegate *arkUINodeDelegate) {
  arkUINodeDelegate_ = arkUINodeDelegate;
}

void ArkUINode::OnNodeEvent(ArkUI_NodeEvent *event) {
  if (arkUINodeDelegate_ == nullptr) {
    return;
  }

  auto eventType = OH_ArkUI_NodeEvent_GetEventType(event);
  if (eventType == ArkUI_NodeEventType::NODE_TOUCH_EVENT) {
    ArkUI_UIInputEvent *inputEvent = OH_ArkUI_NodeEvent_GetInputEvent(event);
    auto type = OH_ArkUI_UIInputEvent_GetType(inputEvent);
    if (type == ARKUI_UIINPUTEVENT_TYPE_TOUCH) {
      auto action = OH_ArkUI_UIInputEvent_GetAction(inputEvent);
      float x = OH_ArkUI_PointerEvent_GetDisplayX(inputEvent);
      float y = OH_ArkUI_PointerEvent_GetDisplayY(inputEvent);
      arkUINodeDelegate_->OnTouch(action, HRPosition(x, y));
    }
  } else if (eventType == ArkUI_NodeEventType::NODE_EVENT_ON_APPEAR) {
    arkUINodeDelegate_->OnAppear();
  } else if (eventType == ArkUI_NodeEventType::NODE_EVENT_ON_DISAPPEAR) {
    arkUINodeDelegate_->OnDisappear();
  } else if (eventType == ArkUI_NodeEventType::NODE_EVENT_ON_AREA_CHANGE) {
    auto nodeComponentEvent = OH_ArkUI_NodeEvent_GetNodeComponentEvent(event);
    ArkUI_NumberValue* data = nodeComponentEvent->data;
    arkUINodeDelegate_->OnAreaChange(data);
  }
}

void ArkUINode::RegisterClickEvent() {
  // SpanNode调用addGestureToNode API会crash
  if (isSpanNode_) {
    return;
  }
  if (!tapGesture_) {
    tapGesture_ = NativeGestureApi::GetInstance()->createTapGesture(1, 1);
    if (tapGesture_) {
      auto onActionCallBack = [](ArkUI_GestureEvent *event, void *extraParam) {
        ArkUINode *node = static_cast<ArkUINode*>(extraParam);
        if (!node || !node->arkUINodeDelegate_) {
          return;
        }
        ArkUI_GestureEventActionType actionType = OH_ArkUI_GestureEvent_GetActionType(event);
        if (actionType == GESTURE_EVENT_ACTION_ACCEPT) {
          auto inputEvent = OH_ArkUI_GestureEvent_GetRawInputEvent(event);
          float offsetX = OH_ArkUI_PointerEvent_GetX(inputEvent);
          float offsetY = OH_ArkUI_PointerEvent_GetY(inputEvent);
          float x = HRPixelUtils::PxToDp(offsetX);
          float y = HRPixelUtils::PxToDp(offsetY);
          node->arkUINodeDelegate_->OnClick(HRPosition(x, y));
        }
      };
      NativeGestureApi::GetInstance()->setGestureEventTarget(tapGesture_, 
        GESTURE_EVENT_ACTION_ACCEPT | GESTURE_EVENT_ACTION_UPDATE | GESTURE_EVENT_ACTION_END,
        this, onActionCallBack);
      NativeGestureApi::GetInstance()->addGestureToNode(nodeHandle_, tapGesture_, NORMAL, NORMAL_GESTURE_MASK);
    }
  }
}

void ArkUINode::UnregisterClickEvent() {
  if (tapGesture_) {
    NativeGestureApi::GetInstance()->removeGestureFromNode(nodeHandle_, tapGesture_);
    NativeGestureApi::GetInstance()->dispose(tapGesture_);
    tapGesture_ = nullptr;
  }
}

void ArkUINode::RegisterLongClickEvent() {
  if (isSpanNode_) {
    return;
  }
  if (!longPressGesture_) {
    longPressGesture_ = NativeGestureApi::GetInstance()->createLongPressGesture(1, false, 1000);
    if (longPressGesture_) {
      auto onActionCallBack = [](ArkUI_GestureEvent *event, void *extraParam) {
        ArkUINode *node = static_cast<ArkUINode*>(extraParam);
        if (!node || !node->arkUINodeDelegate_) {
          return;
        }
        ArkUI_GestureEventActionType actionType = OH_ArkUI_GestureEvent_GetActionType(event);
        if (actionType == GESTURE_EVENT_ACTION_ACCEPT) {
          auto inputEvent = OH_ArkUI_GestureEvent_GetRawInputEvent(event);
          float offsetX = OH_ArkUI_PointerEvent_GetX(inputEvent);
          float offsetY = OH_ArkUI_PointerEvent_GetY(inputEvent);
          float x = HRPixelUtils::PxToDp(offsetX);
          float y = HRPixelUtils::PxToDp(offsetY);
          node->arkUINodeDelegate_->OnLongClick(HRPosition(x, y));
        }
      };
      NativeGestureApi::GetInstance()->setGestureEventTarget(longPressGesture_, 
        GESTURE_EVENT_ACTION_ACCEPT | GESTURE_EVENT_ACTION_UPDATE | GESTURE_EVENT_ACTION_END,
        this, onActionCallBack);
      NativeGestureApi::GetInstance()->addGestureToNode(nodeHandle_, longPressGesture_, NORMAL, NORMAL_GESTURE_MASK);
    }
  }
}

void ArkUINode::UnregisterLongClickEvent() {
  if (longPressGesture_) {
    NativeGestureApi::GetInstance()->removeGestureFromNode(nodeHandle_, longPressGesture_);
    NativeGestureApi::GetInstance()->dispose(longPressGesture_);
    longPressGesture_ = nullptr;
  }
}

void ArkUINode::RegisterTouchEvent() {
  if (!hasTouchEvent_) {
    MaybeThrow(NativeNodeApi::GetInstance()->registerNodeEvent(nodeHandle_, NODE_TOUCH_EVENT, 0, nullptr));
    hasTouchEvent_ = true;
  }
}

void ArkUINode::UnregisterTouchEvent() {
  if (hasTouchEvent_) {
    NativeNodeApi::GetInstance()->unregisterNodeEvent(nodeHandle_, NODE_TOUCH_EVENT);
    hasTouchEvent_ = false;
  }
}

void ArkUINode::RegisterAppearEvent() {
    if (!hasAppearEvent_) {
    MaybeThrow(NativeNodeApi::GetInstance()->registerNodeEvent(nodeHandle_, NODE_EVENT_ON_APPEAR, 0, nullptr));
    hasAppearEvent_ = true;
  }
}

void ArkUINode::UnregisterAppearEvent() {
  if (hasAppearEvent_) {
    NativeNodeApi::GetInstance()->unregisterNodeEvent(nodeHandle_, NODE_EVENT_ON_APPEAR);
    hasAppearEvent_ = false;
  }
}

void ArkUINode::RegisterDisappearEvent() {
    if (!hasDisappearEvent_) {
    MaybeThrow(NativeNodeApi::GetInstance()->registerNodeEvent(nodeHandle_, NODE_EVENT_ON_DISAPPEAR, 0, nullptr));
    hasDisappearEvent_ = true;
  }
}

void ArkUINode::UnregisterDisappearEvent() {
  if (hasDisappearEvent_) {
    NativeNodeApi::GetInstance()->unregisterNodeEvent(nodeHandle_, NODE_EVENT_ON_DISAPPEAR);
    hasDisappearEvent_ = false;
  }
}

void ArkUINode::RegisterAreaChangeEvent(){
  if (!hasAreaChangeEvent_){
    MaybeThrow(NativeNodeApi::GetInstance()->registerNodeEvent(nodeHandle_, NODE_EVENT_ON_AREA_CHANGE, 0, nullptr));
    hasAreaChangeEvent_ = true ;
  }
}

void ArkUINode::UnregisterAreaChangeEvent(){
  if (hasAreaChangeEvent_){
    NativeNodeApi::GetInstance()->unregisterNodeEvent(nodeHandle_, NODE_EVENT_ON_AREA_CHANGE);
    hasAreaChangeEvent_ = false ;
  }
}

void ArkUINode::CheckAndLogError(const std::string& message, int count) {
  if (count < 10 || (count < 1000 && (count % 100 == 0)) || (count % 1000 == 0)) {
    FOOTSTONE_LOG(ERROR) << message << ", count: " << count;
  }
}

void ArkUINode::SetBaseAttributeFlag(AttributeFlag flag) {
  baseAttributesFlagValue_ |= ((uint64_t)1 << (uint32_t)flag);
}

void ArkUINode::UnsetBaseAttributeFlag(AttributeFlag flag) {
  baseAttributesFlagValue_ &= ~((uint64_t)1 << (uint32_t)flag);
}

bool ArkUINode::IsBaseAttributeFlag(AttributeFlag flag) {
  if (baseAttributesFlagValue_ & ((uint64_t)1 << (uint32_t)flag)) {
    return true;
  }
  return false;
}

void ArkUINode::SetSubAttributeFlag(uint32_t flag) {
  subAttributesFlagValue_ |= ((uint64_t)1 << (uint32_t)flag);
}

void ArkUINode::UnsetSubAttributeFlag(uint32_t flag) {
  subAttributesFlagValue_ &= ~((uint64_t)1 << (uint32_t)flag);
}

bool ArkUINode::IsSubAttributeFlag(uint32_t flag) {
  if (subAttributesFlagValue_ & ((uint64_t)1 << (uint32_t)flag)) {
    return true;
  }
  return false;
}

} // namespace native
} // namespace render
} // namespace hippy
