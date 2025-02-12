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

#include "renderer/arkui/image_node.h"
#include "renderer/arkui/native_node_api.h"
#include "renderer/utils/hr_pixel_utils.h"
#include <native_drawing/drawing_types.h>

namespace hippy {
inline namespace render {
inline namespace native {

static constexpr ArkUI_NodeEventType IMAGE_NODE_EVENT_TYPES[] = {NODE_IMAGE_ON_COMPLETE, NODE_IMAGE_ON_ERROR};

using namespace std::literals;

ImageNode::ImageNode()
    : ArkUINode(NativeNodeApi::GetInstance()->createNode(ArkUI_NodeType::ARKUI_NODE_IMAGE)) {
  for (auto eventType : IMAGE_NODE_EVENT_TYPES) {
    MaybeThrow(NativeNodeApi::GetInstance()->registerNodeEvent(nodeHandle_, eventType, 0, nullptr));
  }
}

ImageNode::~ImageNode() {
  for (auto eventType : IMAGE_NODE_EVENT_TYPES) {
    NativeNodeApi::GetInstance()->unregisterNodeEvent(nodeHandle_, eventType);
  }
}

void ImageNode::SetNodeDelegate(ImageNodeDelegate *imageNodeDelegate) { imageNodeDelegate_ = imageNodeDelegate; }

void ImageNode::OnNodeEvent(ArkUI_NodeEvent *event) {
  ArkUINode::OnNodeEvent(event);
  if (imageNodeDelegate_ == nullptr) {
    return;
  }

  auto eventType = OH_ArkUI_NodeEvent_GetEventType(event);
  auto nodeComponentEvent = OH_ArkUI_NodeEvent_GetNodeComponentEvent(event);
  if (eventType == ArkUI_NodeEventType::NODE_IMAGE_ON_COMPLETE) {
    if (nodeComponentEvent->data[0].i32 == 1) {
      imageNodeDelegate_->OnComplete(nodeComponentEvent->data[1].f32, nodeComponentEvent->data[2].f32);
    }
  } else if (eventType == ArkUI_NodeEventType::NODE_IMAGE_ON_ERROR) {
    imageNodeDelegate_->OnError(nodeComponentEvent->data[0].i32);
  }
}

ImageNode &ImageNode::SetSources(std::string const &src) {
  ArkUI_AttributeItem item;
  uri_ = src;
  item = {.string = uri_.c_str()};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_IMAGE_SRC, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::IMAGE_SRC);
  return *this;
}

ImageNode &ImageNode::SetResizeMode(HRImageResizeMode const &mode) {
  int32_t val = ARKUI_OBJECT_FIT_FILL;
  if (mode == HRImageResizeMode::Cover) {
    val = ARKUI_OBJECT_FIT_COVER;
  } else if (mode == HRImageResizeMode::Contain) {
    val = ARKUI_OBJECT_FIT_CONTAIN;
  } else if (mode == HRImageResizeMode::Center) {
    val = ARKUI_OBJECT_FIT_SCALE_DOWN;
  } else if (mode == HRImageResizeMode::Origin) {
    val = ARKUI_OBJECT_FIT_NONE;
  } else if (mode == HRImageResizeMode::FitXY) {
    val = ARKUI_OBJECT_FIT_FILL;
  } else if (mode == HRImageResizeMode::Repeat) {
    val = ARKUI_OBJECT_FIT_SCALE_DOWN;
    SetObjectRepeat(mode);
  }

  ArkUI_NumberValue value[] = {{.i32 = val}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_IMAGE_OBJECT_FIT, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::IMAGE_OBJECT_FIT);
  return *this;
}

ImageNode &ImageNode::SetResizeable(float left, float top, float right, float bottom) {
  ArkUI_NumberValue value[] = {{.f32 = HRPixelUtils::DpToVp(left)}, {.f32 = HRPixelUtils::DpToVp(top)}, {.f32 = HRPixelUtils::DpToVp(right)}, {.f32 = HRPixelUtils::DpToVp(bottom)}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_IMAGE_RESIZABLE, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::IMAGE_RESIZABLE);
  return *this;
}

ImageNode &ImageNode::SetTintColorBlendMode(int32_t blendMode) {
  SetTintColorBlendModePrivate(blendMode);
  if (cssTintColorBlendMode_ != cssPreTintColorBlendMode_) {
    SetColorFilterMatrix();
  }
  return *this;
}

void ImageNode::SetTintColorBlendModePrivate(int32_t blendMode) {
  cssPreTintColorBlendMode_ = cssTintColorBlendMode_;
  if (blendMode == 0) {
    cssTintColorBlendMode_ = ImageTintColorBlendMode::CLEAR;
    return;
	} else if (blendMode == 1) {
		cssTintColorBlendMode_ = ImageTintColorBlendMode::SRC;
    return;
	} else if (blendMode == 2) {
		cssTintColorBlendMode_ = ImageTintColorBlendMode::DST;
	} else if (blendMode == 3) {
		cssTintColorBlendMode_ = ImageTintColorBlendMode::SRC_OVER;
    return;
	} else if (blendMode == 4) {
		cssTintColorBlendMode_ = ImageTintColorBlendMode::DST_OVER;
    return;
	} else if (blendMode == 5) {
		cssTintColorBlendMode_ = ImageTintColorBlendMode::SRC_IN;
    return;
	} else if (blendMode == 6) {
		cssTintColorBlendMode_ = ImageTintColorBlendMode::DST_IN;
    return;
	} else if (blendMode == 7) {
		cssTintColorBlendMode_ = ImageTintColorBlendMode::SRC_OUT;
    return;
	} else if (blendMode == 8) {
		cssTintColorBlendMode_ = ImageTintColorBlendMode::DST_OUT;
    return;
	} else if (blendMode == 10) {
		cssTintColorBlendMode_ = ImageTintColorBlendMode::DST_ATOP;
    return;
	} else if (blendMode == 11) {
		cssTintColorBlendMode_ = ImageTintColorBlendMode::XOR;
    return;
	} else if (blendMode == 12) {
		cssTintColorBlendMode_ = ImageTintColorBlendMode::ADD;
    return;
	} else if (blendMode == 13) {
		cssTintColorBlendMode_ = ImageTintColorBlendMode::MULTIPLY;
    return;
	} else if (blendMode == 14) {
		cssTintColorBlendMode_ = ImageTintColorBlendMode::SCREEN;
    return;
	} else if (blendMode == 15) {
		cssTintColorBlendMode_ = ImageTintColorBlendMode::OVERLAY;
    return;
	} else if (blendMode == 16) {
		cssTintColorBlendMode_ = ImageTintColorBlendMode::DARKEN;
    return;
	} else if (blendMode == 17) {
		cssTintColorBlendMode_ = ImageTintColorBlendMode::LIGHTEN;
    return;
	}
  cssTintColorBlendMode_ = ImageTintColorBlendMode::SRC_ATOP;
}

void ImageNode::SetColorFilter(ArkUI_NumberValue value[kColorFilterMatrixArrayCount]) {
  ArkUI_AttributeItem item = {value, kColorFilterMatrixArrayCount, nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_IMAGE_COLOR_FILTER, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::IMAGE_COLOR_FILTER);
}

void ImageNode::SetColorFilterMatrix() {
  if (cssTintColor_.size() == 4) {
    float matrixColor[4] = {(float)(cssTintColor_[0] / 255.0), (float)(cssTintColor_[1] / 255.0), (float)(cssTintColor_[2] / 255.0), (float)(cssTintColor_[3] / 255.0)};
    if (cssTintColorBlendMode_ == ImageTintColorBlendMode::CLEAR) {
      ArkUI_NumberValue value[] = { {.f32 = 0}, {.f32 = 0}, {.f32 = 0}, {.f32 = 0}, {.f32 = 0},
                                    {.f32 = 0}, {.f32 = 0}, {.f32 = 0}, {.f32 = 0}, {.f32 = 0},
                                    {.f32 = 0}, {.f32 = 0}, {.f32 = 0}, {.f32 = 0}, {.f32 = 0},
                                    {.f32 = 0}, {.f32 = 0}, {.f32 = 0}, {.f32 = 0}, {.f32 = 0} };
      SetColorFilter(value);
      return;
    }  else if (cssTintColorBlendMode_ == ImageTintColorBlendMode::SRC) {
      ArkUI_NumberValue value[] = { {.f32 = 0}, {.f32 = 0}, {.f32 = 0}, {.f32 = 0}, {.f32 = matrixColor[0]},
                                    {.f32 = 0}, {.f32 = 0}, {.f32 = 0}, {.f32 = 0}, {.f32 = matrixColor[1]},
                                    {.f32 = 0}, {.f32 = 0}, {.f32 = 0}, {.f32 = 0}, {.f32 = matrixColor[2]},
                                    {.f32 = 0}, {.f32 = 0}, {.f32 = 0}, {.f32 = 0}, {.f32 = matrixColor[3]} };
      SetColorFilter(value);
      return;
		} else if (cssTintColorBlendMode_ == ImageTintColorBlendMode::DST) {
      ArkUI_NumberValue value[] = { {.f32 = 1}, {.f32 = 0}, {.f32 = 0}, {.f32 = 0}, {.f32 = 0},
                                    {.f32 = 0}, {.f32 = 1}, {.f32 = 0}, {.f32 = 0}, {.f32 = 0},
                                    {.f32 = 0}, {.f32 = 0}, {.f32 = 1}, {.f32 = 0}, {.f32 = 0},
                                    {.f32 = 0}, {.f32 = 0}, {.f32 = 0}, {.f32 = 1}, {.f32 = 0} };
      SetColorFilter(value);
      return;
		} else if (cssTintColorBlendMode_ == ImageTintColorBlendMode::SRC_ATOP) {
      ArkUI_NumberValue value[] = { {.f32 = 1 - matrixColor[3]}, {.f32 = 0}, {.f32 = 0}, {.f32 = 0}, {.f32 = matrixColor[0] * matrixColor[3]},
                                    {.f32 = 0}, {.f32 = 1 - matrixColor[3]}, {.f32 = 0}, {.f32 = 0}, {.f32 = matrixColor[1] * matrixColor[3]},
                                    {.f32 = 0}, {.f32 = 0}, {.f32 = 1 - matrixColor[3]}, {.f32 = 0}, {.f32 = matrixColor[2] * matrixColor[3]},
                                    {.f32 = 0}, {.f32 = 0}, {.f32 = 0}, {.f32 = 1}, {.f32 = 0} };
      SetColorFilter(value);
      return;
		}
	}
}

ImageNode &ImageNode::SetTintColor(uint32_t sharedColor) {
  if (!sharedColor) { // restore default value
    MaybeThrow(NativeNodeApi::GetInstance()->resetAttribute(nodeHandle_, NODE_IMAGE_COLOR_FILTER));
    return *this;
  }
  cssTintColor_.clear();
  uint32_t colorValue = sharedColor;
  if (colorValue >> 24 == 0) {
    colorValue |= ((uint32_t)0xff << 24);
  }

  int32_t blue = colorValue & 0xff;
  int32_t green = (colorValue >> 8) & 0xff;
  int32_t red = (colorValue >> 16) & 0xff;
  int32_t alpha = (colorValue >> 24) &0xff;
  cssTintColor_.push_back(red);
  cssTintColor_.push_back(green);
  cssTintColor_.push_back(blue);
  cssTintColor_.push_back(alpha);
  SetColorFilterMatrix();
  return *this;
}

ImageNode &ImageNode::SetObjectRepeat(HRImageResizeMode const &resizeMode) {
  int32_t val = ARKUI_IMAGE_REPEAT_NONE;
  if (resizeMode == HRImageResizeMode::Repeat) {
    val = ARKUI_IMAGE_REPEAT_XY;
  }

  ArkUI_NumberValue value[] = {{.i32 = val}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_IMAGE_OBJECT_REPEAT, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::IMAGE_OBJECT_REPEAT);
  return *this;
}

ImageNode &ImageNode::SetInterpolation(int32_t interpolation) {
  ArkUI_NumberValue value[] = {{.i32 = interpolation}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_IMAGE_INTERPOLATION, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::IMAGE_INTERPOLATION);
  return *this;
}

ImageNode &ImageNode::SetDraggable(bool draggable) {
  ArkUI_NumberValue value[] = {{.i32 = static_cast<int32_t>(draggable)}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_IMAGE_DRAGGABLE, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::IMAGE_DRAGGABLE);
  return *this;
}

ImageNode &ImageNode::SetResizeMethod(std::string const &resizeMethod) {
  auto autoResize = (resizeMethod != "scale") ? 1 : 0;
  ArkUI_NumberValue value[] = {{.i32 = autoResize}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue), nullptr, nullptr};
  MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_IMAGE_AUTO_RESIZE, &item));
  SetSubAttributeFlag((uint32_t)AttributeFlag::IMAGE_AUTO_RESIZE);
  return *this;
}

ImageNode &ImageNode::SetAlt(std::string const &src) {
  if (!src.empty()) {
    ArkUI_AttributeItem item = {.string = src.c_str()};
    MaybeThrow(NativeNodeApi::GetInstance()->setAttribute(nodeHandle_, NODE_IMAGE_ALT, &item));
    SetSubAttributeFlag((uint32_t)AttributeFlag::IMAGE_ALT);
  }
  return *this;
}

void ImageNode::ResetAllAttributes() {
  ArkUINode::ResetAllAttributes();
  if (!subAttributesFlagValue_) {
    return;
  }
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::IMAGE_ALT, NODE_IMAGE_ALT);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::IMAGE_SRC, NODE_IMAGE_SRC);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::IMAGE_OBJECT_FIT, NODE_IMAGE_OBJECT_FIT);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::IMAGE_RESIZABLE, NODE_IMAGE_RESIZABLE);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::IMAGE_COLOR_FILTER, NODE_IMAGE_COLOR_FILTER);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::IMAGE_OBJECT_REPEAT, NODE_IMAGE_OBJECT_REPEAT);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::IMAGE_INTERPOLATION, NODE_IMAGE_INTERPOLATION);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::IMAGE_DRAGGABLE, NODE_IMAGE_DRAGGABLE);
  ARK_UI_NODE_RESET_SUB_ATTRIBUTE(AttributeFlag::IMAGE_AUTO_RESIZE, NODE_IMAGE_AUTO_RESIZE);
  subAttributesFlagValue_ = 0;
}

std::string ImageNode::GetUri() { return uri_; }

} // namespace native
} // namespace render
} // namespace hippy
