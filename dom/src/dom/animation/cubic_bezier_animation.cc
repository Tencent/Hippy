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

#include "dom/animation/cubic_bezier_animation.h"

#include <cmath>
#include <utility>
#include <regex>

#include "core/base/base_time.h"
#include "dom/animation/animation_manager.h"

namespace hippy {
inline namespace animation {

CubicBezier CubicBezierAnimation::ParseCubicBezierStr(std::string str) {
  // "cubic-bezier(.45,2.84,.38,.5)"
  std::smatch match;
  if (std::regex_match(str, match, std::regex(kAnimationCubicBezierRegex))) {
    if (match.size() != 5) {
      return CubicBezier(CubicBezier::kDefaultP1, CubicBezier::kDefaultP2);
    }
    auto point1_x = std::stod(match[1]);
    auto point1_y = std::stod(match[2]);
    auto point2_x = std::stod(match[3]);
    auto point2_y = std::stod(match[4]);
    return CubicBezier({point1_x, point1_y}, {point2_x, point2_y});
  }

  return CubicBezier(CubicBezier::kDefaultP1, CubicBezier::kDefaultP2);
}

double CubicBezierAnimation::CalculateColor(double start_color, double to_color, double scale) {
  auto start_value = static_cast<uint32_t>(start_color);
  auto start_red = static_cast<uint8_t>(((start_value >> 24) & 0xff));
  auto start_green = static_cast<uint8_t>(((start_value >> 16) & 0xff));
  auto start_blue = static_cast<uint8_t>(((start_value >> 8) & 0xff));
  auto start_alpha = static_cast<uint8_t>((start_value & 0xff));

  auto to_value = static_cast<uint32_t>(to_color);
  auto to_red = static_cast<uint8_t>(((to_value >> 24) & 0xff));
  auto to_green = static_cast<uint8_t>(((to_value >> 16) & 0xff));
  auto to_blue = static_cast<uint8_t>(((to_value >> 8) & 0xff));
  auto to_alpha = static_cast<uint8_t>((to_value & 0xff));

  auto red = static_cast<uint8_t>(start_red + (to_red - start_red) * scale);
  auto green = static_cast<uint8_t>(start_green + (to_green - start_green) * scale);
  auto blue = static_cast<uint8_t>(start_blue + (to_blue - start_blue) * scale);
  auto alpha = static_cast<uint8_t>(start_alpha + (to_alpha - start_alpha) * scale);
  auto ret = (static_cast<uint32_t>(red) << 24) + (static_cast<uint32_t>(green) << 16) + (static_cast<uint32_t>(blue) << 8) + alpha;
  return static_cast<double>(ret);
}

CubicBezierAnimation::CubicBezierAnimation(Mode mode,
                                           uint64_t delay,
                                           double start_value,
                                           double to_value,
                                           ValueType type,
                                           uint64_t duration,
                                           std::string func,
                                           int32_t cnt,
                                           uint32_t related_id)
    : Animation(cnt, delay, duration, start_value),
      mode_(mode),
      to_value_(to_value),
      current_value_(start_value),
      type_(type),
      func_(std::move(func)),
      related_id_(related_id) {
  if (func_ == kAnimationTimingFunctionLinear) {
    cubic_bezier_ = CubicBezier(CubicBezier::kLinearP1, CubicBezier::kLinearP2);
  } else if (func_ == kAnimationTimingFunctionEaseIn) {
    cubic_bezier_ = CubicBezier(CubicBezier::kEaseInP1, CubicBezier::kEaseInP2);;
  } else if (func_ == kAnimationTimingFunctionEaseOut) {
    cubic_bezier_ = CubicBezier(CubicBezier::kEaseOutP1, CubicBezier::kEaseOutP2);
  } else if (func_ == kAnimationTimingFunctionEaseInOut) {
    cubic_bezier_ = CubicBezier(CubicBezier::kEaseInEaseOutP1, CubicBezier::kEaseInEaseOutP2);
  } else if (func_ == kAnimationTimingFunctionCubicBezier) {
    cubic_bezier_ = CubicBezier(CubicBezier::kDefaultP1, CubicBezier::kDefaultP2);
  } else {
    cubic_bezier_ = std::move(ParseCubicBezierStr(func_));
  }
}

CubicBezierAnimation::CubicBezierAnimation() : CubicBezierAnimation(Mode::kTiming,
                                                                    0,
                                                                    0,
                                                                    0,
                                                                    ValueType::kRad,
                                                                    0,
                                                                    kAnimationTimingFunctionLinear,
                                                                    0) {}

CubicBezierAnimation::~CubicBezierAnimation() = default;

void CubicBezierAnimation::Init() {
  /**
  * startValue : The value at the start of the animation, which can be of type Number or
  * an Animation object, in the format of { animationId: xxx }
  * If specified as an Animation, the initial value of the animation represents the animation
  * value after the specified animation ends or is canceled in the middle;
  */
  if (related_id_ != kInvalidAnimationId) {
    auto animation_manager = animation_manager_.lock();
    if (!animation_manager) {
      return;
    }
    auto related_animation = animation_manager->GetAnimation(related_id_);
    if (!related_animation) {
      return;
    }
    if (related_animation->HasChildren()) {
      return;
    }
    auto animation = std::static_pointer_cast<CubicBezierAnimation>(related_animation);
    start_value_ = animation->GetCurrentValue();
  }
}

double CubicBezierAnimation::Calculate(uint64_t now) {
  exec_time_ += (now - last_begin_time_);
  auto epsilon = cubic_bezier_.SolveEpsilon(duration_);
  auto x = cubic_bezier_.SolveCurveX(
      static_cast<double>(exec_time_ - delay_) / static_cast<double>(duration_), epsilon);
  auto y = cubic_bezier_.SampleCurveY(x);
  if (type_ == ValueType::kColor) {
    current_value_ = CalculateColor(start_value_, to_value_, y);
  } else {
    current_value_ = start_value_ + y * (to_value_ - start_value_);
  }
  last_begin_time_ = now;
  return current_value_;
}

void CubicBezierAnimation::Update(Mode mode,
                                  uint64_t delay,
                                  double start_value,
                                  double to_value,
                                  ValueType type,
                                  uint64_t duration,
                                  std::string func,
                                  int32_t cnt,
                                  uint32_t related_id) {
  mode_ = mode;
  delay_ = delay;
  start_value_ = start_value;
  to_value_ = to_value;
  type_ = type;
  duration_ = duration;
  func_ = std::move(func);
  cubic_bezier_ = std::move(ParseCubicBezierStr(func_));
  cnt_ = cnt;
  related_id_ = related_id;
  exec_time_ = 0;
  status_ = Animation::Status::kCreated;

  auto animation_manager = animation_manager_.lock();
  if (!animation_manager) {
    return;
  }
  if (animation_manager->IsActive(id_)) {
    return;
  }
  animation_manager->RemoveActiveAnimation(id_);
  animation_manager->CancelDelayedAnimation(id_);
  animation_manager->RemoveDelayedAnimationRecord(id_);
  Init();
}

}
}


