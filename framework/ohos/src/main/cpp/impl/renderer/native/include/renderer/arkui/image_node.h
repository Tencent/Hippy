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

#include "renderer/arkui/arkui_node.h"
#include "renderer/utils/hr_types.h"

namespace hippy {
inline namespace render {
inline namespace native {

enum class ImageTintColorBlendMode : int32_t {
  CLEAR,
  SRC,
  DST,
  SRC_OVER,
  DST_OVER,
  SRC_IN,
  DST_IN,
  SRC_OUT,
  DST_OUT,
  DST_ATOP = 10,
  XOR,
  ADD,
  MULTIPLY,
  SCREEN,
  OVERLAY,
  DARKEN,
  LIGHTEN,
  SRC_ATOP,
};

class ImageNodeDelegate {
public:
  virtual ~ImageNodeDelegate() = default;
  virtual void OnComplete(float width, float height) {}
  virtual void OnError(int32_t errorCode) {}
};

static constexpr int32_t kColorFilterMatrixArrayCount = 20; 

class ImageNode : public ArkUINode {
protected:
  enum class AttributeFlag {
    IMAGE_ALT = 0,
    IMAGE_SRC,
    IMAGE_OBJECT_FIT,
    IMAGE_RESIZABLE,
    IMAGE_COLOR_FILTER,
    IMAGE_OBJECT_REPEAT,
    IMAGE_INTERPOLATION,
    IMAGE_DRAGGABLE,
    IMAGE_AUTO_RESIZE,
  };
  
  ImageNodeDelegate *imageNodeDelegate_ = nullptr;
  std::string uri_;
  ImageTintColorBlendMode cssTintColorBlendMode_ = ImageTintColorBlendMode::SRC_ATOP;
  ImageTintColorBlendMode cssPreTintColorBlendMode_ = ImageTintColorBlendMode::SRC_ATOP;
  std::vector<int32_t> cssTintColor_;
  
  void SetTintColorBlendModePrivate(int32_t blendMode);
  void SetColorFilterMatrix();
  void SetColorFilter(ArkUI_NumberValue value[kColorFilterMatrixArrayCount]);
  
  
public:
  ImageNode();
  ~ImageNode();
  ImageNode &SetSources(std::string const &src);
  ImageNode &SetResizeMode(HRImageResizeMode const &mode);
  ImageNode &SetTintColor(uint32_t sharedColor);
  ImageNode &SetTintColorBlendMode(int32_t blendMode);
  ImageNode &SetObjectRepeat(HRImageResizeMode const &resizeMode);
  ImageNode &SetResizeable(float left, float top, float right, float bottom);

  ImageNode &SetInterpolation(int32_t interpolation);
  ImageNode &SetDraggable(bool draggable);
  ImageNode &SetResizeMethod(std::string const &resizeMethod);
  ImageNode &SetAlt(std::string const &src);
  
  void ResetAllAttributes() override;

  void OnNodeEvent(ArkUI_NodeEvent *event) override;
  void SetNodeDelegate(ImageNodeDelegate *imageNodeDelegate);

  std::string GetUri();
};

} // namespace native
} // namespace render
} // namespace hippy
