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

#include <arkui/native_type.h>
#include <memory>
#include <functional>

namespace hippy {
inline namespace render {
inline namespace native {

class HRPosition {
public:
  float x;
  float y;
  HRPosition(float x, float y) : x(x), y(y) {}
};

class HRPoint {
public:
  float x;
  float y;
  HRPoint(float x, float y) : x(x), y(y) {}
};

class HRSize {
public:
  float width;
  float height;
  HRSize(float width, float height) : width(width), height(height) {}
};

class HRRect {
public:
  float x;
  float y;
  float width;
  float height;
  HRRect(float x, float y, float width, float height) : x(x), y(y), width(width), height(height) {}
};

class HRPadding {
public:
  float paddingLeft;
  float paddingTop;
  float paddingRight;
  float paddingBottom;
  HRPadding(float paddingLeft, float paddingTop, float paddingRight, float paddingBottom)
    : paddingLeft(paddingLeft), paddingTop(paddingTop), paddingRight(paddingRight), paddingBottom(paddingBottom) {}
};

class HRRotate {
public:
  float x = 0;
  float y = 0;
  float z = 0;
  float angle = 0;
  float perspective = 0;
};

class HRScale {
public:
  float x = 1;
  float y = 1;
};

class HRTranslate {
public:
  float x = 0;
  float y = 0;
  float z = 0;
};

class HRMatrix {
public:
  std::array<float, 16> m{{1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1}};
};

class HRTransform {
public:
  std::optional<HRPosition> anchor;
  std::optional<HRRotate> rotate;
  std::optional<HRScale> scale;
  std::optional<HRTranslate> translate;
  std::optional<HRMatrix> matrix;
};

class HRLinearGradient {
public:
  std::optional<float> angle;
  std::optional<ArkUI_LinearGradientDirection> direction;
  std::optional<bool> repeating;
  std::vector<uint32_t> colors;
  std::vector<float> stops;
};

enum class HRImageResizeMode {
  Contain,
  Cover,
  Center,
  Origin,
  Repeat,
  FitXY
};

enum class HRBorderStyle : uint8_t { Solid, Dotted, Dashed };

class HRShadow {
public:
  HRSize shadowOffset = {0, 0};
  float shadowRadius = 0;
  std::optional<uint32_t> shadowColor;
  std::optional<float> shadowOpacity;
};

using EndBatchCallback = std::function<void()>;

} // namespace native
} // namespace render
} // namespace hippy
