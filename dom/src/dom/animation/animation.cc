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

#include "dom/animation/animation.h"

#include <cmath>
#include <utility>
#include <regex>

#include "core/base/base_time.h"


namespace hippy {

static std::atomic<uint32_t> global_animation_key{1};

CubicBezier Animation::ParseCubicBezierStr(std::string str) {
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

double Animation::CalculateColor(double start_color, double to_color, double scale) {
  uint32_t start_value = static_cast<uint32_t>(start_color);
  auto start_red = static_cast<uint8_t>(((start_value >> 24) & 0xff));
  auto start_green = static_cast<uint8_t>(((start_value >> 16) & 0xff));
  auto start_blue = static_cast<uint8_t>(((start_value >> 8)  & 0xff));
  auto start_alpha = static_cast<uint8_t>((start_value & 0xff));

  uint32_t to_value = static_cast<uint32_t>(to_color);
  auto to_red = static_cast<uint8_t>(((to_value >> 24) & 0xff));
  auto to_green = static_cast<uint8_t>(((to_value >> 16) & 0xff));
  auto to_blue = static_cast<uint8_t>(((to_value >> 8)  & 0xff));
  auto to_alpha = static_cast<uint8_t>((to_value & 0xff));

  auto red = static_cast<uint8_t>(start_red + (to_red - start_red) * scale);
  auto green = static_cast<uint8_t>(start_green + (to_green - start_green) * scale);
  auto blue = static_cast<uint8_t>(start_blue + (to_blue - start_blue) * scale);
  auto alpha = static_cast<uint8_t>(start_alpha + (to_alpha - start_alpha) * scale);
  uint32_t ret = (red << 24) + (green << 16) + (blue << 8) + alpha;
  return static_cast<double>(ret);
}

Animation::Animation(Mode mode,
                     uint64_t delay,
                     double start_value,
                     double to_value,
                     ValueType type,
                     uint64_t duration,
                     std::string func,
                     int32_t cnt,
                     AnimationStartCb on_start,
                     AnimationEndCb on_end,
                     AnimationCancelCb on_cancel,
                     AnimationRepeatCb on_repeat)
    : mode_(mode), delay_(delay), start_value_(start_value), to_value_(to_value), type_(type),
      duration_(duration), func_(std::move(func)), cnt_(cnt), set_id_(hippy::kInvalidAnimationSetId),
      on_start_(std::move(on_start)), on_end_(std::move(on_end)), on_cancel_(std::move(on_cancel)),
      on_repeat_(std::move(on_repeat)), last_begin_time_(0), cubic_bezier_(),
      current_value_(start_value), status_(Status::kCreated), exec_time_(0) {
  id_ = global_animation_key.fetch_add(1);

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

Animation::Animation(Mode mode,
                     uint64_t delay,
                     double start_value,
                     double to_value,
                     ValueType type,
                     uint64_t duration,
                     std::string func,
                     int32_t cnt) : Animation(mode, delay, start_value, to_value, type, duration,
                                              func, cnt, nullptr, nullptr,
                                              nullptr, nullptr) {
}

Animation::Animation() : Animation(Mode::kTiming,
                                   0,
                                   0,
                                   0,
                                   ValueType::kRad,
                                   0,
                                   kAnimationTimingFunctionLinear,
                                   0) {}

Animation::~Animation() = default;

double Animation::Calculate(uint64_t now) {
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

void Animation::Repeat(uint64_t now) {
  last_begin_time_ = now;
  exec_time_ = 0;
  status_ = Animation::Status::kCreated;
  if (cnt_ != -1 && cnt_ > 0) {
    cnt_ -= 1;
  }
  if (on_repeat_) {
    on_repeat_();
  }
}

void Animation::Update(Mode mode,
                       uint64_t delay,
                       double start_value,
                       double to_value,
                       ValueType type,
                       uint64_t duration,
                       std::string func,
                       int32_t cnt) {
  mode_ = mode;
  delay_ = delay;
  start_value_ = start_value;
  to_value_ = to_value;
  type_ = type;
  duration_ = duration;
  func_ = std::move(func);
  cubic_bezier_ = std::move(ParseCubicBezierStr(func_));
  cnt_ = cnt;
}

void Animation::AddEventListener(const std::string& event, AnimationCb cb) {
  if (event == kAnimationStartKey) {
    on_start_ = std::move(cb);
  } else if (event == kAnimationEndKey) {
    on_end_ = std::move(cb);
  } else if (event == kAnimationCancelKey) {
    on_cancel_ = std::move(cb);
  } else if (event == kAnimationRepeatKey) {
    on_repeat_ = std::move(cb);
  }
}

void Animation::RemoveEventListener(const std::string& event) {
  if (event == kAnimationStartKey) {
    on_start_ = nullptr;
  } else if (event == kAnimationEndKey) {
    on_end_ = nullptr;
  } else if (event == kAnimationCancelKey) {
    on_cancel_ = nullptr;
  } else if (event == kAnimationRepeatKey) {
    on_repeat_ = nullptr;
  }
}

AnimationSet::AnimationSet(std::vector<AnimationSetChild>&& children, int32_t cnt)
    : children_(std::move(children)), cnt_(cnt), status_(AnimationSet::Status::kCreated),
    start_value_(0) {
  id_ = global_animation_key.fetch_add(1);
}

AnimationSet::AnimationSet(): AnimationSet(std::vector<AnimationSetChild>{}, 0) {}

void AnimationSet::Repeat() {
  if (cnt_ == 0) {
    return;
  }
  status_ = AnimationSet::Status::kCreated;
  if (cnt_ != -1) {
    cnt_ -= 1;
  }
  if (on_repeat_) {
    on_repeat_();
  }
}

void AnimationSet::AddEventListener(const std::string& event, AnimationCb cb) {
  if (event == kAnimationStartKey) {
    on_start_ = std::move(cb);
  } else if (event == kAnimationEndKey) {
    on_end_ = std::move(cb);
  } else if (event == kAnimationCancelKey) {
    on_cancel_ = std::move(cb);
  } else if (event == kAnimationRepeatKey) {
    on_repeat_ = std::move(cb);
  }
}

void AnimationSet::RemoveEventListener(const std::string& event) {
  if (event == kAnimationStartKey) {
    on_start_ = nullptr;
  } else if (event == kAnimationEndKey) {
    on_end_ = nullptr;
  } else if (event == kAnimationCancelKey) {
    on_cancel_ = nullptr;
  } else if (event == kAnimationRepeatKey) {
    on_repeat_ = nullptr;
  }
}

}


