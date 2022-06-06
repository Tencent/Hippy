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
constexpr char kAnimationCubicBezierRegex[] = "^cubic-bezier\\(([^,]*),([^,]*),([^,]*),([^,]*)\\)$";
constexpr uint32_t kInvalidAnimationId = 0;
constexpr uint32_t kInvalidAnimationSetId = 0;

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

  inline void SetAnimationSetId(uint32_t id) {
    set_id_ = id;
  }

  inline uint32_t GetAnimationSetId() {
    return set_id_;
  }

  void Init();

  double Calculate(uint64_t time);

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
  uint32_t set_id_;
};

}
}

