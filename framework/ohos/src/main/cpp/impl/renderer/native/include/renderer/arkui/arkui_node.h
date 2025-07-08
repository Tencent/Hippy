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

#include <arkui/native_gesture.h>
#include <arkui/native_node.h>
#include <arkui/native_type.h>
#include <memory>
#include <string>
#include <sys/stat.h>
#include "footstone/logging.h"
#include "renderer/utils/hr_types.h"

#define HIPPY_OHOS_MEM_CHECK 0

namespace hippy {
inline namespace render {
inline namespace native {

// ArkUI_NativeModule API ref:
// https://gitee.com/openharmony/docs/blob/master/zh-cn/application-dev/reference/apis-arkui/_ark_u_i___native_module.md#arkui_nodeattributetype

class ArkUINodeDelegate {
public:
  virtual ~ArkUINodeDelegate() = default;
  virtual void OnClick(const HRPosition &position) {}
  virtual void OnLongClick(const HRPosition &position) {}
  virtual void OnTouch(int32_t actionType, const HRPosition &screenPosition) {}
  virtual void OnAppear() {}
  virtual void OnDisappear() {}
  virtual void OnAreaChange(ArkUI_NumberValue* data) {}
};

class ArkUINode {
protected:
  ArkUINode(const ArkUINode &other) = delete;
  ArkUINode &operator=(const ArkUINode &other) = delete;

  ArkUINode &operator=(ArkUINode &&other) noexcept;
  ArkUINode(ArkUINode &&other) noexcept;

public:
  ArkUINode(ArkUI_NodeHandle nodeHandle);
  virtual ~ArkUINode();

  ArkUI_NodeHandle GetArkUINodeHandle();
  
  void MarkReleaseHandle(bool isRelease) { isReleaseHandle_ = isRelease; }

  void MarkDirty();
  void MarkDirty(ArkUI_NodeDirtyFlag flag);

  void AddChild(ArkUINode *child);
  void InsertChild(ArkUINode *child, int32_t index);
  void RemoveChild(ArkUINode *child);
  void RemoveAllChildren();
  void RemoveSelfFromParent();
  void ReplaceSelfFromParent(ArkUINode *newNode);
  bool HasParent();
  
  void SetDefaultAttributes();

  virtual ArkUINode &SetId(const std::string &id);
  virtual ArkUINode &SetPosition(const HRPosition &position);
  virtual ArkUINode &SetSize(const HRSize &size);
  virtual ArkUINode &SetWidth(float width);
  virtual ArkUINode &SetHeight(float height);
  virtual ArkUINode &SetSizePercent(const HRSize &size);
  virtual ArkUINode &SetWidthPercent(float percent);
  virtual ArkUINode &SetHeightPercent(float percent);
  virtual ArkUINode &SetVisibility(bool visibility);
  virtual ArkUINode &SetBackgroundColor(uint32_t color);
  virtual ArkUINode &SetOpacity(float opacity);
  virtual ArkUINode &SetTransform(const HRTransform &transform, float pointScaleFactor);
  virtual ArkUINode &SetMatrix(const HRMatrix &transformMatrix, float pointScaleFactor);
  virtual ArkUINode &SetRotate(const HRRotate &rotate);
  virtual ArkUINode &SetScale(const HRScale &scale);
  virtual ArkUINode &SetTranslate(const HRTranslate &translate, float pointScaleFactor);
  virtual ArkUINode &SetClip(bool clip);
  virtual ArkUINode &SetZIndex(int32_t zIndex);
  virtual ArkUINode &SetAccessibilityText(const std::string &accessibilityLabel);
  virtual ArkUINode &SetFocusable(bool focusable);
  virtual ArkUINode &SetFocusStatus(int32_t focus);
  virtual ArkUINode &SetLinearGradient(const HRLinearGradient &linearGradient);
  virtual ArkUINode &SetHitTestMode(const ArkUI_HitTestMode mode);
  virtual ArkUINode &SetEnabled(bool enabled);
  virtual ArkUINode &SetBackgroundImage(const std::string &uri);
  virtual ArkUINode &SetBackgroundImagePosition(const HRPosition &position);
  virtual ArkUINode &SetBackgroundImageSize(const ArkUI_ImageSize sizeStyle);
  virtual ArkUINode &SetBorderWidth(float top, float right, float bottom, float left);
  virtual ArkUINode &SetBorderColor(uint32_t top, uint32_t right, uint32_t bottom, uint32_t left);
  virtual ArkUINode &SetBorderRadius(float topLeft, float topRight, float bottomLeft, float bottomRight);
  virtual ArkUINode &SetBorderStyle(ArkUI_BorderStyle top, ArkUI_BorderStyle right, ArkUI_BorderStyle bottom, ArkUI_BorderStyle left);
  virtual ArkUINode &SetShadow(const HRShadow &shadow);
  virtual ArkUINode &SetMargin(float left, float top, float right, float bottom);
  virtual ArkUINode &SetAlignment(ArkUI_Alignment align);
  virtual ArkUINode &SetExpandSafeArea();//TODO will update when NODE_EXPAND_SAFE_AREA add in sdk
  virtual ArkUINode &SetTransitionMove(const ArkUI_TransitionEdge edgeType,int32_t duration,ArkUI_AnimationCurve curveType = ARKUI_CURVE_EASE);
  virtual ArkUINode &SetTransitionOpacity(const ArkUI_AnimationCurve curveType,int32_t duration);
  virtual ArkUINode &SetTransitionTranslate(float distanceX,float distanceY,float distanceZ,ArkUI_AnimationCurve curveType,int32_t duration);
  virtual ArkUINode &SetPadding(float top, float right, float bottom, float left);
  virtual ArkUINode &SetBlur(float blur);
  virtual void ResetNodeAttribute(ArkUI_NodeAttributeType type);
  virtual void ResetAllAttributes();
  virtual HRSize GetSize() const;
  virtual uint32_t GetTotalChildCount() const;
  virtual HRPosition GetPostion() const;
  virtual HRPosition GetAbsolutePosition() const;
  virtual HRSize GetLayoutSize() const;
  virtual HRPosition GetLayoutPosition() const;
  virtual HRPosition GetLayoutPositionInScreen() const;
  virtual HRPosition GetLayoutPositionInWindow() const;

  void SetArkUINodeDelegate(ArkUINodeDelegate *arkUINodeDelegate);
  virtual void OnNodeEvent(ArkUI_NodeEvent *event);

  virtual ArkUI_NodeHandle GetFirstChild() const;
  virtual ArkUI_NodeHandle GetLastChild() const;
  virtual ArkUI_NodeHandle GetChildAt(int32_t postion) const;
  void RegisterClickEvent();
  void UnregisterClickEvent();
  void RegisterLongClickEvent();
  void UnregisterLongClickEvent();
  void RegisterTouchEvent();
  void UnregisterTouchEvent();
  void RegisterAppearEvent();
  void UnregisterAppearEvent();
  void RegisterDisappearEvent();
  void UnregisterDisappearEvent();
  void RegisterAreaChangeEvent();
  void UnregisterAreaChangeEvent();
protected:

#define ARKUI_NODE_CHECK_AND_LOG_ERROR \
  static int count = 0; \
  ++count; \
  CheckAndLogError(message, count);

  void MaybeThrow(int32_t status) {
    if (status != 0) {
      auto message = std::string("ArkUINode operation failed with status: ") + std::to_string(status);
      if (status == ARKUI_ERROR_CODE_PARAM_INVALID) {
        ARKUI_NODE_CHECK_AND_LOG_ERROR;
      } else if (status == ARKUI_ERROR_CODE_ATTRIBUTE_OR_EVENT_NOT_SUPPORTED) {
        ARKUI_NODE_CHECK_AND_LOG_ERROR;
      } else if (status == ARKUI_ERROR_CODE_ARKTS_NODE_NOT_SUPPORTED) {
        ARKUI_NODE_CHECK_AND_LOG_ERROR;
      } else if (status == ARKUI_ERROR_CODE_ADAPTER_NOT_BOUND) {
        ARKUI_NODE_CHECK_AND_LOG_ERROR;
      } else if (status == ARKUI_ERROR_CODE_ADAPTER_EXIST) {
        ARKUI_NODE_CHECK_AND_LOG_ERROR;
      }
    }
  }

#undef ARKUI_NODE_CHECK_AND_LOG_ERROR

  void CheckAndLogError(const std::string& message, int count);

  enum class AttributeFlag {
    ID = 0,
    POSITION,
    WIDTH,
    HEIGHT,
    PADDING,
    BLUR,
    WIDTH_PERCENT,
    HEIGHT_PERCENT,
    VISIBILITY,
    BACKGROUND_COLOR,
    OPACITY,
    TRANSFORM_CENTER,
    TRANSFORM,
    ROTATE,
    SCALE,
    TRANSLATE,
    CLIP,
    Z_INDEX,
    ACCESSIBILITY_TEXT,
    FOCUSABLE,
    FOCUS_STATUS,
    LINEAR_GRADIENT,
    HIT_TEST_BEHAVIOR,
    ENABLED,
    BACKGROUND_IMAGE,
    BACKGROUND_IMAGE_POSITION,
    BACKGROUND_IMAGE_SIZE_WITH_STYLE,
    BORDER_WIDTH,
    BORDER_COLOR,
    BORDER_RADIUS,
    BORDER_STYLE,
    CUSTOM_SHADOW,
    MARGIN,
    ALIGNMENT,
    EXPAND_SAFE_AREA,
    MOVE_TRANSITION,
    OPACITY_TRANSITION,
    TRANSLATE_TRANSITION,
  };
  
  void SetBaseAttributeFlag(AttributeFlag flag);
  void UnsetBaseAttributeFlag(AttributeFlag flag);
  bool IsBaseAttributeFlag(AttributeFlag flag);
  
  void SetSubAttributeFlag(uint32_t flag);
  void UnsetSubAttributeFlag(uint32_t flag);
  bool IsSubAttributeFlag(uint32_t flag);

  ArkUI_NodeHandle nodeHandle_;
  bool isReleaseHandle_ = true;
  
  bool isSpanNode_ = false;
  
  ArkUINodeDelegate *arkUINodeDelegate_ = nullptr;

  ArkUI_GestureRecognizer *tapGesture_ = nullptr;
  ArkUI_GestureRecognizer *longPressGesture_ = nullptr;
  bool hasTouchEvent_ = false;
  bool hasAppearEvent_ = false;
  bool hasDisappearEvent_ = false;
  bool hasAreaChangeEvent_ = false;
  
  uint64_t baseAttributesFlagValue_ = 0;
  uint64_t subAttributesFlagValue_ = 0;
};

#define ARK_UI_NODE_RESET_BASE_ATTRIBUTE(flag, type) \
  if (IsBaseAttributeFlag(flag)) { \
    MaybeThrow(NativeNodeApi::GetInstance()->resetAttribute(nodeHandle_, type)); \
  }

#define ARK_UI_NODE_RESET_SUB_ATTRIBUTE(flag, type) \
  if (IsSubAttributeFlag((uint32_t)flag)) { \
    MaybeThrow(NativeNodeApi::GetInstance()->resetAttribute(nodeHandle_, type)); \
  }

} // namespace native
} // namespace render
} // namespace hippy
