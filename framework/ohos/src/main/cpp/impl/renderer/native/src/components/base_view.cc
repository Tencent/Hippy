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

#include <arkui/native_node_napi.h>
#include "renderer/components/base_view.h"
#include "oh_napi/ark_ts.h"
#include "oh_napi/oh_napi_object.h"
#include "oh_napi/oh_napi_object_builder.h"
#include "oh_napi/oh_napi_utils.h"
#include "renderer/components/hippy_render_view_creator.h"
#include "renderer/dom_node/hr_node_props.h"
#include "renderer/native_render_params.h"
#include "renderer/utils/hr_pixel_utils.h"
#include "renderer/utils/hr_url_utils.h"
#include "renderer/utils/hr_value_utils.h"
#include "renderer/utils/hr_convert_utils.h"
#include "renderer/uimanager/hr_gesture_dispatcher.h"

#define HIPPY_COMPONENT_KEY_PREFIX "HippyKey"

namespace hippy {
inline namespace render {
inline namespace native {

std::shared_ptr<footstone::value::Serializer> BaseView::serializer_ = nullptr;

BaseView::BaseView(std::shared_ptr<NativeRenderContext> &ctx) : ctx_(ctx), tag_(0) {
#if HIPPY_OHOS_MEM_CHECK
  static int sCount = 0;
  ++sCount;
  FOOTSTONE_DLOG(INFO) << "Hippy ohos mem check, view, new: " << this << ", type: " << view_type_ << ", count: " << sCount;
#endif
}

BaseView::~BaseView() {
#if HIPPY_OHOS_MEM_CHECK
  static int sCount = 0;
  ++sCount;
  FOOTSTONE_DLOG(INFO) << "Hippy ohos mem check, view, del: " << this << ", type: " << view_type_ << ", count: " << sCount;
#endif
}

void BaseView::Init() {
}

void BaseView::SetTag(uint32_t tag) {
  tag_ = tag;
}

void BaseView::SetViewType(const std::string &type) {
  view_type_ = type;
  
  if (HippyIsLazyCreateView(type)) {
    isLazyCreate_ = true;
  }
}

void BaseView::SetParent(std::shared_ptr<BaseView> parent) {
  parent_ = parent; 
  
  if (parent && parent->IsLazyCreate()) {
    isLazyCreate_ = true;
  }
}

void BaseView::CreateArkUINode(bool isFromLazy, int index) {
  if (GetLocalRootArkUINode()) {
    // For move view
    auto parent = parent_.lock();
    if (parent) {
      if (!parent->GetLocalRootArkUINode()) {
        return;
      }
      auto child_index = index < 0 ? parent->IndexOfChild(shared_from_this()) : index;
      parent->OnChildInsertedImpl(shared_from_this(), child_index);
    }
    return;
  }
  
  auto parent = parent_.lock();
  if (parent && !parent->GetLocalRootArkUINode()) {
    return;
  }
  
  CreateArkUINodeImpl();
  if (!GetLocalRootArkUINode()) {
    UpdateLazyProps();
    return;
  }
  isLazyCreate_ = false;
  
  if (parent) {
    auto child_index = index < 0 ? parent->IndexOfChild(shared_from_this()) : index;
    parent->OnChildInsertedImpl(shared_from_this(), child_index);
  }
  
  UpdateLazyAll();
  
  if (isFromLazy) {
    for (int32_t i = 0; i < (int32_t)children_.size(); i++) {
      auto subView = children_[(uint32_t)i];
      if (!HippyIsLazyCreateView(subView->GetViewType())) {
        subView->CreateArkUINode(true, i);
      }
    }
  }
}

void BaseView::DestroyArkUINode() {
  auto node = GetLocalRootArkUINode();
  if (!node) {
    return;
  }
  
  GetLocalRootArkUINode()->RemoveSelfFromParent();
  DestroyArkUINodeImpl();
  isLazyCreate_ = true;
  for (int32_t i = 0; i < (int32_t)children_.size(); i++) {
    auto subView = children_[(uint32_t)i];
    subView->DestroyArkUINode();
  }
}

std::shared_ptr<RecycleView> BaseView::RecycleArkUINode() {
  if (!HippyIsRecycledView(GetViewType())) {
    DestroyArkUINode();
    return nullptr;
  }
  
  auto recycleView = std::make_shared<RecycleView>();
  recycleView->cachedViewType_ = GetViewType();
  bool result = RecycleArkUINodeImpl(recycleView);
  if (!result) {
    DestroyArkUINode();
    return nullptr;
  }
  
  isLazyCreate_ = true;
  
  for (int32_t i = 0; i < (int32_t)children_.size(); i++) {
    auto subView = children_[(uint32_t)i];
    auto subRecycleView = subView->RecycleArkUINode();
    if (!subRecycleView) {
      for (int32_t j = i + 1; j < (int32_t)children_.size(); j++) {
        auto subView2 = children_[(uint32_t)j];
        subView2->DestroyArkUINode();
      }
      break;
    }
    recycleView->children_.emplace_back(subRecycleView);
  }
  
  return recycleView;
}

bool BaseView::ReuseArkUINode(std::shared_ptr<RecycleView> &recycleView, int32_t index) {
  if (recycleView->cachedViewType_ != GetViewType()) {
    CreateArkUINode(true, index);
    return false;
  }
  
  bool result = ReuseArkUINodeImpl(recycleView);
  if (!result) {
    CreateArkUINode(true, index);
    return false;
  }
  
  isLazyCreate_ = false;
  
  auto parent = parent_.lock();
  if (parent) {
    parent->OnChildReusedImpl(shared_from_this(), index);
  }
  
  UpdateLazyAll();
  
  if (recycleView->children_.size() > children_.size()) {
    for (int32_t k = (int32_t)recycleView->children_.size() - 1; k >= (int32_t)children_.size() ; k--) {
      recycleView->RemoveSubView(k);
    }
  }
  
  for (int32_t i = 0; i < (int32_t)children_.size(); i++) {
    auto subView = children_[(uint32_t)i];
    if ((int32_t)recycleView->children_.size() > i) {
      auto subRecycleView = recycleView->children_[(uint32_t)i];
      bool subResult = subView->ReuseArkUINode(subRecycleView, i);
      if (!subResult) {
        for (int32_t j = (int32_t)recycleView->children_.size() - 1; j >= i ; j--) {
          recycleView->RemoveSubView(j);
        }
      }
    } else {
      subView->CreateArkUINode(true, i);
    }
  }
  return true;
}

void BaseView::UpdateLazyProps() {
  if (lazyProps_.size() > 0) {
    for (auto it = lazyProps_.begin(); it != lazyProps_.end(); it++) {
      // value maybe empty string / false / 0
      auto &key = it->first;
      if (key.length() > 0) {
        SetPropImpl(key, it->second);
      }
    }
    OnSetPropsEndImpl();
  }
}

void BaseView::UpdateLazyAll() {
  GetLocalRootArkUINode()->SetArkUINodeDelegate(this);
  std::string id_str = "HippyId" + std::to_string(tag_);
  GetLocalRootArkUINode()->SetId(id_str);
  
  UpdateLazyProps();

  if (lazyFrame_.has_value() && lazyPadding_.has_value()) {
    UpdateRenderViewFrameImpl(lazyFrame_.value(), lazyPadding_.value());
  }
}

bool BaseView::SetProp(const std::string &propKey, const HippyValue &propValue) {
  bool handled = SetViewProp(propKey, propValue);
  if (handled) {
    return true;
  }
  
  lazyProps_[propKey] = propValue;
  
  if (GetLocalRootArkUINode()) {
    return SetPropImpl(propKey, propValue);
  }
  
  return true;
}

void BaseView::OnSetPropsEnd() {
  if (GetLocalRootArkUINode()) {
    OnSetPropsEndImpl();
  }
}

bool BaseView::SetPropImpl(const std::string &propKey, const HippyValue &propValue) {
  if (propKey == HRNodeProps::VISIBILITY) {
    auto& value = HRValueUtils::GetString(propValue);
    GetLocalRootArkUINode()->SetVisibility(value != HRNodeProps::HIDDEN ? true : false);
    return true;
  } else if (propKey == HRNodeProps::BACKGROUND_COLOR) {
    uint32_t value = HRValueUtils::GetUint32(propValue);
    GetLocalRootArkUINode()->SetBackgroundColor(value);
    return true;
  } else if (propKey == HRNodeProps::OPACITY) {
    auto value = HRValueUtils::GetFloat(propValue, 1.f);
    GetLocalRootArkUINode()->SetOpacity(value);
    return true;
  } else if (propKey == HRNodeProps::TRANSFORM) {
    if (propValue.IsArray()) {
      auto& valueArray = propValue.ToArrayChecked();
      HRTransform transform;
      HRConvertUtils::TransformToArk(valueArray, transform);
      GetLocalRootArkUINode()->SetTransform(transform, 1.0f / HRPixelUtils::GetDensityScale());
    }
    return true;
  } else if (propKey == HRNodeProps::OVERFLOW) {
    auto& value = HRValueUtils::GetString(propValue);
    if (value == HRNodeProps::VISIBLE) {
      GetLocalRootArkUINode()->SetClip(false);
    } else if (value == HRNodeProps::HIDDEN) {
      GetLocalRootArkUINode()->SetClip(true);
    }
    return true;
  } else if (propKey == HRNodeProps::Z_INDEX) {
    auto value = HRValueUtils::GetInt32(propValue);
    GetLocalRootArkUINode()->SetZIndex(value);
    return true;
  } else if (propKey == HRNodeProps::PROP_ACCESSIBILITY_LABEL) {
    auto& value = HRValueUtils::GetString(propValue);
    GetLocalRootArkUINode()->SetAccessibilityText(value);
    return true;
  } else if (propKey == HRNodeProps::FOCUSABLE) {
    auto value = HRValueUtils::GetBool(propValue, false);
    GetLocalRootArkUINode()->SetFocusable(value);
    return true;
  } else if (propKey == HRNodeProps::REQUEST_FOCUS) {
    auto value = HRValueUtils::GetBool(propValue, false);
    if (value) {
      GetLocalRootArkUINode()->SetFocusStatus(1);
    }
    return true;
  } else if (propKey == HRNodeProps::LINEAR_GRADIENT) {
    SetLinearGradientProp(propKey, propValue);
    return true;
  } else {
    bool handled = SetBackgroundImageProp(propKey, propValue);
    if (!handled) {
      handled = SetBorderProp(propKey, propValue);
    }
    if (!handled) {
      handled = SetShadowProp(propKey, propValue);
    }
    if (!handled) {
      handled = SetEventProp(propKey, propValue);
    }
    return handled;
  }
}

bool BaseView::SetLinearGradientProp(const std::string &propKey, const HippyValue &propValue) {
  if (!propValue.IsObject()) {
    return false;
  }
  auto& m = propValue.ToObjectChecked();
  auto angleIt = m.find("angle");
  if (angleIt == m.end()) {
    return false;
  }
  auto& angle = angleIt->second.ToStringSafe();
  if (angle.length() == 0) {
    return false;
  }

  auto colorStopListIt = m.find("colorStopList");
  if (colorStopListIt == m.end()) {
    return false;
  }
  if (!colorStopListIt->second.IsArray()) {
    return false;
  }
  auto& colorStopList = colorStopListIt->second.ToArrayChecked();
  if (colorStopList.size() == 0) {
    return false;
  }

  HRLinearGradient linearGradient;

  auto size = colorStopList.size();
  for (uint32_t i = 0; i < size; i++) {
    if (!colorStopList[i].IsObject()) {
      continue;
    }
    auto& colorStop = colorStopList[i].ToObjectChecked();
    auto colorId = colorStop.find("color");
    auto color = colorId != colorStop.end() ? HRValueUtils::GetUint32(colorId->second) : 0;
    float ratio = 0.f;
    auto ratioId = colorStop.find("ratio");
    if (ratioId != colorStop.end()) {
      ratio = HRValueUtils::GetFloat(ratioId->second);
    } else if (i == size - 1) {
      ratio = 1.f;
    }
    linearGradient.colors.push_back(color);
    linearGradient.stops.push_back(ratio);
  }

  if (angle == "totopright") {
    linearGradient.direction = ARKUI_LINEAR_GRADIENT_DIRECTION_RIGHT_TOP;
  } else if (angle == "tobottomright") {
    linearGradient.direction = ARKUI_LINEAR_GRADIENT_DIRECTION_RIGHT_BOTTOM;
  } else if (angle == "tobottomleft") {
    linearGradient.direction = ARKUI_LINEAR_GRADIENT_DIRECTION_LEFT_BOTTOM;
  } else if (angle == "totopleft") {
    linearGradient.direction = ARKUI_LINEAR_GRADIENT_DIRECTION_LEFT_TOP;
  } else {
    int32_t value = static_cast<int32_t>(std::stof(angle)) % 360;
    linearGradient.angle = value;
  }

  GetLocalRootArkUINode()->SetLinearGradient(linearGradient);

  return true;
}

bool BaseView::SetBackgroundImageProp(const std::string &propKey, const HippyValue &propValue) {
  if (propKey == HRNodeProps::BACKGROUND_IMAGE) {
    auto& value = propValue.ToStringSafe();
    if (value.length() > 0) {
      auto bundlePath = ctx_->GetNativeRender().lock()->GetBundlePath();
      auto url = HRUrlUtils::ConvertImageUrl(bundlePath, ctx_->IsRawFile(), ctx_->GetResModuleName(), value);
      GetLocalRootArkUINode()->SetBackgroundImage(url);
    }
    return true;
  } else if (propKey == HRNodeProps::BACKGROUND_POSITION_X) {
    backgroundImagePosition_.x = HRValueUtils::GetFloat(propValue);
    toSetBackgroundImagePosition_ = true;
    return true;
  } else if (propKey == HRNodeProps::BACKGROUND_POSITION_Y) {
    backgroundImagePosition_.y = HRValueUtils::GetFloat(propValue);
    toSetBackgroundImagePosition_ = true;
    return true;
  } else if (propKey == HRNodeProps::BACKGROUND_SIZE) {
    auto& value = HRValueUtils::GetString(propValue);
    auto imageSize = HRConvertUtils::BackgroundImageSizeToArk(value);
    GetLocalRootArkUINode()->SetBackgroundImageSize(imageSize);
    return true;
  }
  return false;
}

bool BaseView::SetBorderProp(const std::string &propKey, const HippyValue &propValue) {
  if (propKey == HRNodeProps::BORDER_RADIUS) {
    float value = HRValueUtils::GetFloat(propValue);
    borderTopLeftRadius_ = value;
    borderTopRightRadius_ = value;
    borderBottomRightRadius_ = value;
    borderBottomLeftRadius_ = value;
    toSetBorderRadius_ = true;
    return true;
  } else if (propKey == HRNodeProps::BORDER_TOP_LEFT_RADIUS) {
    float value = HRValueUtils::GetFloat(propValue);
    borderTopLeftRadius_ = value;
    toSetBorderRadius_ = true;
    return true;
  } else if (propKey == HRNodeProps::BORDER_TOP_RIGHT_RADIUS) {
    float value = HRValueUtils::GetFloat(propValue);
    borderTopRightRadius_ = value;
    toSetBorderRadius_ = true;
    return true;
  } else if (propKey == HRNodeProps::BORDER_BOTTOM_RIGHT_RADIUS) {
    float value = HRValueUtils::GetFloat(propValue);
    borderBottomRightRadius_ = value;
    toSetBorderRadius_ = true;
    return true;
  } else if (propKey == HRNodeProps::BORDER_BOTTOM_LEFT_RADIUS) {
    float value = HRValueUtils::GetFloat(propValue);
    borderBottomLeftRadius_ = value;
    toSetBorderRadius_ = true;
    return true;
  } else if (propKey == HRNodeProps::BORDER_WIDTH) {
    float value = HRValueUtils::GetFloat(propValue);
    borderTopWidth_ = value;
    borderRightWidth_ = value;
    borderBottomWidth_ = value;
    borderLeftWidth_ = value;
    toSetBorderWidth_ = true;
    return true;
  } else if (propKey == HRNodeProps::BORDER_TOP_WIDTH) {
    float value = HRValueUtils::GetFloat(propValue);
    borderTopWidth_ = value;
    toSetBorderWidth_ = true;
    return true;
  } else if (propKey == HRNodeProps::BORDER_RIGHT_WIDTH) {
    float value = HRValueUtils::GetFloat(propValue);
    borderRightWidth_ = value;
    toSetBorderWidth_ = true;
    return true;
  } else if (propKey == HRNodeProps::BORDER_BOTTOM_WIDTH) {
    float value = HRValueUtils::GetFloat(propValue);
    borderBottomWidth_ = value;
    toSetBorderWidth_ = true;
    return true;
  } else if (propKey == HRNodeProps::BORDER_LEFT_WIDTH) {
    float value = HRValueUtils::GetFloat(propValue);
    borderLeftWidth_ = value;
    toSetBorderWidth_ = true;
    return true;
  } else if (propKey == HRNodeProps::BORDER_STYLE) {
    auto& value = HRValueUtils::GetString(propValue);
    borderTopStyle_ = value;
    borderRightStyle_ = value;
    borderBottomStyle_ = value;
    borderLeftStyle_ = value;
    toSetBorderStyle_ = true;
    return true;
  } else if (propKey == HRNodeProps::BORDER_TOP_STYLE) {
    auto& value = HRValueUtils::GetString(propValue);
    borderTopStyle_ = value;
    toSetBorderStyle_ = true;
    return true;
  } else if (propKey == HRNodeProps::BORDER_RIGHT_STYLE) {
    auto& value = HRValueUtils::GetString(propValue);
    borderRightStyle_ = value;
    toSetBorderStyle_ = true;
    return true;
  } else if (propKey == HRNodeProps::BORDER_BOTTOM_STYLE) {
    auto& value = HRValueUtils::GetString(propValue);
    borderBottomStyle_ = value;
    toSetBorderStyle_ = true;
    return true;
  } else if (propKey == HRNodeProps::BORDER_LEFT_STYLE) {
    auto& value = HRValueUtils::GetString(propValue);
    borderLeftStyle_ = value;
    toSetBorderStyle_ = true;
    return true;
  } else if (propKey == HRNodeProps::BORDER_COLOR) {
    uint32_t value = HRValueUtils::GetUint32(propValue);
    borderTopColor_ = value;
    borderRightColor_ = value;
    borderBottomColor_ = value;
    borderLeftColor_ = value;
    toSetBorderColor_ = true;
    return true;
  } else if (propKey == HRNodeProps::BORDER_TOP_COLOR) {
    uint32_t value = HRValueUtils::GetUint32(propValue);
    borderTopColor_ = value;
    toSetBorderColor_ = true;
    return true;
  } else if (propKey == HRNodeProps::BORDER_RIGHT_COLOR) {
    uint32_t value = HRValueUtils::GetUint32(propValue);
    borderRightColor_ = value;
    toSetBorderColor_ = true;
    return true;
  } else if (propKey == HRNodeProps::BORDER_BOTTOM_COLOR) {
    uint32_t value = HRValueUtils::GetUint32(propValue);
    borderBottomColor_ = value;
    toSetBorderColor_ = true;
    return true;
  } else if (propKey == HRNodeProps::BORDER_LEFT_COLOR) {
    uint32_t value = HRValueUtils::GetUint32(propValue);
    borderLeftColor_ = value;
    toSetBorderColor_ = true;
    return true;
  }
  return false;
}

bool BaseView::SetShadowProp(const std::string &propKey, const HippyValue &propValue) {
  if (propKey == HRNodeProps::SHADOW_OFFSET) {
    if (propValue.IsObject()) {
      auto& m = propValue.ToObjectChecked();
      auto xIt = m.find("x");
      auto yIt = m.find("y");
      auto x = xIt != m.end() ? HRPixelUtils::DpToPx(HRValueUtils::GetFloat(xIt->second)) : 0;
      auto y = yIt != m.end() ? HRPixelUtils::DpToPx(HRValueUtils::GetFloat(yIt->second)) : 0;
      shadow_.shadowOffset.width = x;
      shadow_.shadowOffset.height = y;
    }
    toSetShadow = true;
    return true;
  } else if (propKey == HRNodeProps::SHADOW_OFFSET_X) {
    shadow_.shadowOffset.width = HRPixelUtils::DpToPx(HRValueUtils::GetFloat(propValue));
    toSetShadow = true;
    return true;
  } else if (propKey == HRNodeProps::SHADOW_OFFSET_Y) {
    shadow_.shadowOffset.height = HRPixelUtils::DpToPx(HRValueUtils::GetFloat(propValue));
    toSetShadow = true;
    return true;
  } else if (propKey == HRNodeProps::SHADOW_OPACITY) {
    shadow_.shadowOpacity = HRValueUtils::GetFloat(propValue);
    toSetShadow = true;
    return true;
  } else if (propKey == HRNodeProps::SHADOW_RADIUS) {
    shadow_.shadowRadius = HRPixelUtils::DpToPx(HRValueUtils::GetFloat(propValue));
    toSetShadow = true;
    return true;
  } else if (propKey == HRNodeProps::SHADOW_COLOR) {
    shadow_.shadowColor = HRValueUtils::GetUint32(propValue);
    toSetShadow = true;
    return true;
  } else if (propKey == HRNodeProps::SHADOW_SPREAD) {
    // ohos not support
    return true;
  }
  return false;
}

#define SET_EVENT_PROP_CASE(keyName, method) \
  if (propKey == keyName) { \
    bool value = false; \
    bool isBool = propValue.ToBoolean(value); \
    if (isBool) { \
      method(value); \
    } \
    return true; \
  }

bool BaseView::SetEventProp(const std::string &propKey, const HippyValue &propValue) {
  SET_EVENT_PROP_CASE("click", SetClickable)
  SET_EVENT_PROP_CASE("longclick", SetLongClickable)
  SET_EVENT_PROP_CASE("pressin", SetPressIn)
  SET_EVENT_PROP_CASE("pressout", SetPressOut)
  SET_EVENT_PROP_CASE("touchstart", SetTouchDownHandle)
  SET_EVENT_PROP_CASE("touchmove", SetTouchMoveHandle)
  SET_EVENT_PROP_CASE("touchend", SetTouchEndHandle)
  SET_EVENT_PROP_CASE("touchcancel", SetTouchCancelHandle)
  SET_EVENT_PROP_CASE("onInterceptTouchEvent", SetInterceptTouch)
  SET_EVENT_PROP_CASE("onInterceptPullUpEvent", SetInterceptPullUp)
  SET_EVENT_PROP_CASE("attachedtowindow", SetAttachedToWindowHandle)
  SET_EVENT_PROP_CASE("detachedfromwindow", SetDetachedFromWindowHandle)
  return false;
}

#undef SET_EVENT_PROP_CASE

void BaseView::SetClickable(bool flag) {
  if (HandleGestureBySelf()) {
    return;
  }
  if (flag) {
    GetLocalRootArkUINode()->RegisterClickEvent();
    auto weak_view = weak_from_this();
    eventClick_ = [weak_view]() {
      auto view = weak_view.lock();
      if (view) {
        HRGestureDispatcher::HandleClickEvent(view->ctx_, view->tag_, HRNodeProps::ON_CLICK);
      }
    };
  } else {
    GetLocalRootArkUINode()->UnregisterClickEvent();
    eventClick_ = nullptr;
  }
}

void BaseView::SetLongClickable(bool flag) {
  if (HandleGestureBySelf()) {
    return;
  }
  if (flag) {
    GetLocalRootArkUINode()->RegisterLongClickEvent();
    auto weak_view = weak_from_this();
    eventLongClick_ = [weak_view]() {
      auto view = weak_view.lock();
      if (view) {
        HRGestureDispatcher::HandleClickEvent(view->ctx_, view->tag_, HRNodeProps::ON_LONG_CLICK);
      }
    };
  } else {
    GetLocalRootArkUINode()->UnregisterLongClickEvent();
    eventLongClick_ = nullptr;
  }
}

void BaseView::SetPressIn(bool flag) {
  if (HandleGestureBySelf()) {
    return;
  }
  if (flag) {
    auto weak_view = weak_from_this();
    eventPressIn_ = [weak_view]() {
      auto view = weak_view.lock();
      if (view) {
        HRGestureDispatcher::HandleClickEvent(view->ctx_, view->tag_, HRNodeProps::ON_PRESS_IN);
      }
    };
  } else {
    eventPressIn_ = nullptr;
  }
}

void BaseView::SetPressOut(bool flag) {
  if (HandleGestureBySelf()) {
    return;
  }
  if (flag) {
    auto weak_view = weak_from_this();
    eventPressOut_ = [weak_view]() {
      auto view = weak_view.lock();
      if (view) {
        HRGestureDispatcher::HandleClickEvent(view->ctx_, view->tag_, HRNodeProps::ON_PRESS_OUT);
      }
    };
  } else {
    eventPressOut_ = nullptr;
  }
}

void BaseView::SetTouchDownHandle(bool flag) {
  if (HandleGestureBySelf()) {
    return;
  }
  if (flag) {
    GetLocalRootArkUINode()->RegisterTouchEvent();
    auto weak_view = weak_from_this();
    eventTouchDown_ = [weak_view](const HRPosition &screenPosition) {
      auto view = weak_view.lock();
      if (view) {
        float touchX = screenPosition.x;
        float touchY = screenPosition.y;
        HRGestureDispatcher::HandleTouchEvent(view->ctx_, view->tag_, touchX, touchY, HRNodeProps::ON_TOUCH_DOWN);
      }
    };
  } else {
    eventTouchDown_ = nullptr;
  }
}

void BaseView::SetTouchMoveHandle(bool flag) {
  if (HandleGestureBySelf()) {
    return;
  }
  if (flag) {
    GetLocalRootArkUINode()->RegisterTouchEvent();
    auto weak_view = weak_from_this();
    eventTouchMove_ = [weak_view](const HRPosition &screenPosition) {
      auto view = weak_view.lock();
      if (view) {
        float touchX = screenPosition.x;
        float touchY = screenPosition.y;
        HRGestureDispatcher::HandleTouchEvent(view->ctx_, view->tag_, touchX, touchY, HRNodeProps::ON_TOUCH_MOVE);
      }
    };
  } else {
    eventTouchMove_ = nullptr;
  }
}

void BaseView::SetTouchEndHandle(bool flag) {
  if (HandleGestureBySelf()) {
    return;
  }
  if (flag) {
    GetLocalRootArkUINode()->RegisterTouchEvent();
    auto weak_view = weak_from_this();
    eventTouchUp_ = [weak_view](const HRPosition &screenPosition) {
      auto view = weak_view.lock();
      if (view) {
        float touchX = screenPosition.x;
        float touchY = screenPosition.y;
        HRGestureDispatcher::HandleTouchEvent(view->ctx_, view->tag_, touchX, touchY, HRNodeProps::ON_TOUCH_END);
      }
    };
  } else {
    eventTouchUp_ = nullptr;
  }
}

void BaseView::SetTouchCancelHandle(bool flag) {
  if (HandleGestureBySelf()) {
    return;
  }
  if (flag) {
    GetLocalRootArkUINode()->RegisterTouchEvent();
    auto weak_view = weak_from_this();
    eventTouchCancel_ = [weak_view](const HRPosition &screenPosition) {
      auto view = weak_view.lock();
      if (view) {
        float touchX = screenPosition.x;
        float touchY = screenPosition.y;
        HRGestureDispatcher::HandleTouchEvent(view->ctx_, view->tag_, touchX, touchY, HRNodeProps::ON_TOUCH_CANCEL);
      }
    };
  } else {
    eventTouchCancel_ = nullptr;
  }
}

void BaseView::SetInterceptTouch(bool flag) {
  if (HandleGestureBySelf()) {
    return;
  }
  GetLocalRootArkUINode()->SetHitTestMode(flag ? ARKUI_HIT_TEST_MODE_BLOCK : ARKUI_HIT_TEST_MODE_TRANSPARENT);
}

void BaseView::SetInterceptPullUp(bool flag) {
  if (HandleGestureBySelf()) {
    return;
  }
  flagInterceptPullUp_ = flag;
}

void BaseView::HandleInterceptPullUp() {
  // TODO: 如果有业务需求，再评估鸿蒙上实现方案。
}

void BaseView::SetAttachedToWindowHandle(bool flag) {
  if (flag) {
    auto weak_view = weak_from_this();
    eventAttachedToWindow_ = [weak_view]() {
      auto view = weak_view.lock();
      if (view) {
        HRGestureDispatcher::HandleAttachedToWindow(view->ctx_, view->tag_);
      }
    };
  } else {
    eventAttachedToWindow_ = nullptr;
  }
}

void BaseView::SetDetachedFromWindowHandle(bool flag) {
  if (flag) {
    auto weak_view = weak_from_this();
    eventDetachedFromWindow_ = [weak_view]() {
      auto view = weak_view.lock();
      if (view) {
        HRGestureDispatcher::HandleDetachedFromWindow(view->ctx_, view->tag_);
      }
    };
  } else {
    eventDetachedFromWindow_ = nullptr;
  }
}

void BaseView::OnSetPropsEndImpl() {
  if (toSetBackgroundImagePosition_) {
    toSetBackgroundImagePosition_ = false;
    GetLocalRootArkUINode()->SetBackgroundImagePosition(backgroundImagePosition_);
  }
  if (toSetBorderRadius_) {
    toSetBorderRadius_ = false;
    GetLocalRootArkUINode()->SetBorderRadius(borderTopLeftRadius_, borderTopRightRadius_, borderBottomLeftRadius_, borderBottomRightRadius_);
  }
  if (toSetBorderWidth_) {
    toSetBorderWidth_ = false;
    GetLocalRootArkUINode()->SetBorderWidth(borderTopWidth_, borderRightWidth_, borderBottomWidth_, borderLeftWidth_);
  }
  if (toSetBorderStyle_) {
    toSetBorderStyle_ = false;
    ArkUI_BorderStyle topStyle = HRConvertUtils::BorderStyleToArk(borderTopStyle_);
    ArkUI_BorderStyle rightStyle = HRConvertUtils::BorderStyleToArk(borderRightStyle_);
    ArkUI_BorderStyle bottomStyle = HRConvertUtils::BorderStyleToArk(borderBottomStyle_);
    ArkUI_BorderStyle leftStyle = HRConvertUtils::BorderStyleToArk(borderLeftStyle_);
    GetLocalRootArkUINode()->SetBorderStyle(topStyle, rightStyle, bottomStyle, leftStyle);
  }
  if (toSetBorderColor_) {
    toSetBorderColor_ = false;
    GetLocalRootArkUINode()->SetBorderColor(borderTopColor_, borderRightColor_, borderBottomColor_, borderLeftColor_);
  }
  if (toSetShadow) {
    toSetShadow = false;
    GetLocalRootArkUINode()->SetShadow(shadow_);
  }
}

void BaseView::Call(const std::string &method, const std::vector<HippyValue> params,
                    std::function<void(const HippyValue &result)> callback) {
  if (!GetLocalRootArkUINode()) {
    return;
  }
  CallImpl(method, params, callback);
}

void BaseView::CallImpl(const std::string &method, const std::vector<HippyValue> params,
                    std::function<void(const HippyValue &result)> callback) {
  FOOTSTONE_DLOG(INFO) << "BaseView call: method " << method << ", params: " << params.size();
  if (method == "measureInWindow") {
    if (!callback) {
      return;
    }

    float statusBarHeight = NativeRenderParams::StatusBarHeight();
    HRPosition viewPosition = GetLocalRootArkUINode()->GetLayoutPositionInScreen();
    HRSize viewSize = GetLocalRootArkUINode()->GetSize();

    HippyValueObjectType result;
    result["x"] = HippyValue(HRPixelUtils::VpToDp(viewPosition.x));
    result["y"] = HippyValue(HRPixelUtils::VpToDp(viewPosition.y - statusBarHeight));
    result["width"] = HippyValue(HRPixelUtils::VpToDp(viewSize.width));
    result["height"] = HippyValue(HRPixelUtils::VpToDp(viewSize.height));
    result["statusBarHeight"] = HippyValue(HRPixelUtils::VpToDp(statusBarHeight));
    callback(HippyValue(result));
  } else if (method == "getBoundingClientRect") {
    if (!callback) {
      return;
    }

    bool relToContainer = false;
    if (!params.empty()) {
      if (params[0].IsObject()) {
        auto& param = params[0].ToObjectChecked();
        auto it = param.find("relToContainer");
        relToContainer = it != param.end() ? HRValueUtils::GetBool(it->second, false) : false;
      }
    }
    float x = 0;
    float y = 0;
    HRSize viewSize = GetLocalRootArkUINode()->GetSize();
    if (relToContainer) {
      HRPosition viewPosition = GetLocalRootArkUINode()->GetLayoutPositionInWindow();
      x = viewPosition.x;
      y = viewPosition.y;
      auto render = ctx_->GetNativeRender().lock();
      if (render) {
        HRPosition rootViewPosition = render->GetRootViewtPositionInWindow(ctx_->GetRootId());
        x -= rootViewPosition.x;
        y -= rootViewPosition.y;
      }
    } else {
      HRPosition viewPosition = GetLocalRootArkUINode()->GetLayoutPositionInScreen();
      x = viewPosition.x;
      y = viewPosition.y;
    }

    HippyValueObjectType result;
    result["x"] = HippyValue(HRPixelUtils::VpToDp(x));
    result["y"] = HippyValue(HRPixelUtils::VpToDp(y));
    result["width"] = HippyValue(HRPixelUtils::VpToDp(viewSize.width));
    result["height"] = HippyValue(HRPixelUtils::VpToDp(viewSize.height));
    callback(HippyValue(result));
  } else if (method == "getScreenShot") {
    HippyValueObjectType snapshotResult = CallNativeRenderProviderMethod(ts_env_, ts_render_provider_ref_, ctx_->GetRootId(), "getComponentSnapshot");
    callback(HippyValue(snapshotResult));
  } else if (method == "addFrameCallback") {
    // empty
  } else if (method == "removeFrameCallback") {
    auto resultMap = HippyValue();
    callback(resultMap);
  } else if (method == "getLocationOnScreen") {
    auto resultMap = CallNativeRenderProviderMethod(ts_env_, ts_render_provider_ref_, ctx_->GetRootId(), "getLocationOnScreen");
    callback(HippyValue(resultMap));
  } else {
    FOOTSTONE_DLOG(INFO) << "Unsupported method called: " << method;
  }
}

void BaseView::AddSubRenderView(std::shared_ptr<BaseView> &subView, int32_t index) {
  if (index < 0 || index > (int32_t)children_.size()) {
    index = (int32_t)children_.size();
  }
  auto it = children_.begin() + index;
  subView->SetParent(shared_from_this());
  children_.insert(it, subView);
  OnChildInserted(subView, index);
  
  // if (subView->GetViewType() == "ListViewItem") {
  //   FOOTSTONE_LOG(INFO) << "hippy, list child inserted: " << index << ", count: " << children_.size() << ", parent: " << this << ", view: " << subView;
  // }
}

void BaseView::RemoveSubView(std::shared_ptr<BaseView> &subView) {
  auto it = std::find(children_.begin(), children_.end(), subView);
  if (it != children_.end()) {
    auto view = std::move(*it);
    int32_t index = static_cast<int32_t>(it - children_.begin());
    children_.erase(it);
    OnChildRemoved(view, index);
    
    // if (view->GetViewType() == "ListViewItem") {
    //   FOOTSTONE_LOG(INFO) << "hippy, list child removed: " << index << ", count: " << children_.size() << ", parent: " << this << ", view: " << view;
    // }
  }
}

void BaseView::RemoveFromParentView() {
  auto parentView = parent_.lock();
  if (parentView) {
    auto thisView = shared_from_this();
    parentView->RemoveSubView(thisView);
    SetParent(nullptr);
  }
}

void BaseView::OnChildInserted(std::shared_ptr<BaseView> const &childView, int index) {
  if (!childView->IsLazyCreate()) {
    childView->CreateArkUINode(false, index);
  }
}

void BaseView::OnChildRemoved(std::shared_ptr<BaseView> const &childView, int32_t index) {
  if (childView->GetLocalRootArkUINode()) {
    OnChildRemovedImpl(childView, index);
  }
}

void BaseView::SetRenderViewFrame(const HRRect &frame, const HRPadding &padding) {
  UpdateRenderViewFrame(frame, padding);
}

void BaseView::UpdateRenderViewFrame(const HRRect &frame, const HRPadding &padding) {
  if (IsValidFrame(frame)) {
    lazyFrame_ = frame;
    lazyPadding_ = padding;
  }

  if (GetLocalRootArkUINode()) {
    UpdateRenderViewFrameImpl(frame, padding);
  }
}

void BaseView::UpdateRenderViewFrameImpl(const HRRect &frame, const HRPadding &padding) {
  GetLocalRootArkUINode()->SetPosition(HRPosition(frame.x, frame.y));
  GetLocalRootArkUINode()->SetSize(HRSize(frame.width, frame.height));
}

void BaseView::UpdateEventListener(HippyValueObjectType &newEvents) {
  for (auto it = newEvents.begin(); it != newEvents.end(); it++) {
    if (it->second.IsBoolean()) {
      bool add = it->second.ToBooleanChecked();
      if (add) {
        events_[it->first] = it->second;
      } else {
        events_.erase(it->first);
      }
    }
  }
}

bool BaseView::CheckRegisteredEvent(std::string &eventName) {
  std::string name = eventName;
  std::transform(name.begin(), name.end(), name.begin(), ::tolower);
  if (events_.size() > 0 && events_.find(name) != events_.end()) {
    auto value = events_[name];
    bool boolValue = false;
    bool isBool = value.ToBoolean(boolValue);
    if (isBool) {
      return boolValue;
    }
  }
  return false;
}

void BaseView::SetTsRenderProvider(napi_env ts_env, napi_ref ts_render_provider_ref) {
  ts_env_ = ts_env;
  ts_render_provider_ref_ = ts_render_provider_ref;
}

void BaseView::SetTsEventCallback(napi_ref ts_event_callback_ref) {
  ts_event_callback_ref_ = ts_event_callback_ref;
}

void BaseView::SetPosition(const HRPosition &position) {
  auto node = GetLocalRootArkUINode();
  if (node) {
    node->SetPosition(position);
  }
}

void BaseView::OnClick(const HRPosition &position) {
  if (eventClick_) {
    eventClick_();
  }
}

void BaseView::OnLongClick(const HRPosition &position) {
  if (eventLongClick_) {
    eventLongClick_();
  }
}

void BaseView::OnTouch(int32_t actionType, const HRPosition &screenPosition) {
  if (actionType == UI_TOUCH_EVENT_ACTION_DOWN) {
    if (eventTouchDown_) {
      eventTouchDown_(screenPosition);
    }
  } else if(actionType == UI_TOUCH_EVENT_ACTION_MOVE) {
    if (eventTouchMove_) {
      eventTouchMove_(screenPosition);
    }
  } else if (actionType == UI_TOUCH_EVENT_ACTION_UP) {
    if (eventTouchUp_) {
      eventTouchUp_(screenPosition);
    }
  } else if (actionType == UI_TOUCH_EVENT_ACTION_CANCEL) {
    if (eventTouchCancel_) {
      eventTouchCancel_(screenPosition);
    }
  }
}

void BaseView::OnAppear() {
  if (eventAttachedToWindow_) {
    eventAttachedToWindow_();
  }
}

void BaseView::OnDisappear() {
  if (eventDetachedFromWindow_) {
    eventDetachedFromWindow_();
  }
}

void BaseView::OnAreaChange(ArkUI_NumberValue* data) {

}

int64_t BaseView::GetTimeMilliSeconds() {
  auto now = std::chrono::system_clock::now();
  auto duration = now.time_since_epoch();
  auto millis = std::chrono::duration_cast<std::chrono::milliseconds>(duration).count();
  return millis;
}

int32_t BaseView::IndexOfChild(const std::shared_ptr<BaseView> child) {
  auto it = std::find(children_.begin(), children_.end(), child);
  if (it != children_.end()) {
    int32_t index = static_cast<int32_t>(it - children_.begin());
    return index;
  }
  return -1;
}

std::shared_ptr<footstone::value::Serializer> &BaseView::GetSerializer() {
  if (!serializer_) {
    serializer_ = std::make_shared<footstone::value::Serializer>();
  }
  return serializer_;
}

void BaseView::OnViewComponentEvent(const std::string &event_name, const HippyValueObjectType &hippy_object) {
  if (!ts_event_callback_ref_) {
    return;
  }

  ArkTS arkTs(ts_env_);
  auto ts_params = OhNapiUtils::HippyValue2NapiValue(ts_env_, HippyValue(hippy_object));

  std::vector<napi_value> args = {
    arkTs.CreateString(event_name),
    ts_params
  };

  auto callback = arkTs.GetReferenceValue(ts_event_callback_ref_);
  arkTs.Call(callback, args);
}

HippyValueObjectType BaseView::CallNativeRenderProviderMethod(napi_env env, napi_ref render_provider_ref, uint32_t component_id, const std::string &method) {
  HippyValue futHippyValue;
  ArkTS arkTs(env);
  std::vector<napi_value> args = {arkTs.CreateUint32(component_id)};
  auto delegateObject = arkTs.GetObject(render_provider_ref);
  auto napiValue = delegateObject.Call(method.c_str(), args);

  HippyValueObjectType map;
  OhNapiObject napiObj = arkTs.GetObject(napiValue);
  std::vector<std::pair<napi_value, napi_value>> pairs = napiObj.GetKeyValuePairs();
  for (auto it = pairs.begin(); it != pairs.end(); it++) {
      auto &pair = *it;
      auto &pairItem1 = pair.first;
      auto objKey = arkTs.GetString(pairItem1);
      if (objKey.length() > 0) {
        auto &pairItem2 = pair.second;
        auto objValue = OhNapiUtils::NapiValue2HippyValue(env, pairItem2);
        map[objKey] = objValue;
      }
  }
  return map;
}

} // namespace native
} // namespace render
} // namespace hippy
