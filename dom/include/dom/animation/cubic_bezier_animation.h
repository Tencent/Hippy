/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#pragma once

#include <string>
#include <cstdint>

#include "dom/animation/animation.h"
#include "dom/animation/animation_math.h"

namespace hippy {
inline namespace animation {

constexpr char kAnimationTimingFunctionLinear[] = "linear";
constexpr char kAnimationTimingFunctionEaseIn[] = "ease-in";
constexpr char kAnimationTimingFunctionEaseOut[] = "ease-out";
constexpr char kAnimationTimingFunctionEaseInOut[] = "ease-in-out";
constexpr char kAnimationTimingFunctionCubicBezier[] = "cubic-bezier";
constexpr char kAnimationCubicBezierRegex[] = \
    "^cubic-bezier\\((\\d*.\\d+|\\d+),(\\d*.\\d+|\\d+),(\\d*.\\d+|\\d+),(\\d*.\\d+|\\d+)\\)$";

class CubicBezierAnimation : public Animation {
 public:

  enum class Mode {
    kTiming
  };

  enum class ValueType {
    kUndefined, kRad, kDeg, kColor
  };

 public:
  CubicBezierAnimation(Mode mode,
                       uint64_t delay,
                       double start_value,
                       double to_value,
                       ValueType type,
                       uint64_t duration,
                       std::string func,
                       int32_t cnt,
                       uint32_t related_id = kInvalidAnimationId);
  CubicBezierAnimation();
  ~CubicBezierAnimation();

  inline double GetCurrentValue() {
    return current_value_;
  }

  inline uint32_t GetRelatedId() {
    return related_id_;
  }

  void Init();

  virtual double Calculate(uint64_t time) override;

  void Update(Mode mode,
              uint64_t delay,
              double start_value,
              double to_value,
              ValueType type,
              uint64_t duration,
              std::string func,
              int32_t cnt,
              uint32_t related_id = kInvalidAnimationId);

 private:
  CubicBezier ParseCubicBezierStr(std::string str);
  double CalculateColor(double start_color, double to_color, double scale);

  Mode mode_;
  double to_value_;
  double current_value_;
  ValueType type_;
  std::string func_;
  CubicBezier cubic_bezier_{};
  uint32_t related_id_;
};

}
}

