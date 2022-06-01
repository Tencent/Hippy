#pragma once

#include <functional>
#include <string>
#include <vector>

#include "dom/animation/animation_math.h"

namespace hippy {

constexpr char kAnimationStartKey[] = "animationstart";
constexpr char kAnimationEndKey[] = "animationend";
constexpr char kAnimationCancelKey[] = "animationcancel";
constexpr char kAnimationRepeatKey[] = "animationrepeat";
constexpr char kAnimationTimingFunctionLinear[] = "linear";
constexpr char kAnimationTimingFunctionEaseIn[] = "ease-in";
constexpr char kAnimationTimingFunctionEaseOut[] = "ease-out";
constexpr char kAnimationTimingFunctionEaseInOut[] = "ease-in-out";
constexpr char kAnimationTimingFunctionCubicBezier[] = "cubic-bezier";
constexpr char kAnimationCubicBezierRegex[] = "^cubic-bezier\\(([^,]*),([^,]*),([^,]*),([^,]*)\\)$";
constexpr uint32_t kInvalidAnimationSetId = 0;

class Animation: public std::enable_shared_from_this<Animation> {
 public:

  enum class Mode {
    kTiming
  };

  enum class ValueType {
    kUndefined, kRad, kDeg, kColor
  };

  enum class Status {
    kCreated, kStart, kRunning, kPause, kResume, kEnd, kDestroy
  };

  using AnimationCb = std::function<void()>;
  using AnimationStartCb = std::function<void()>;
  using AnimationEndCb = std::function<void()>;
  using AnimationCancelCb = std::function<void()>;
  using AnimationRepeatCb = std::function<void()>;

 public:
  Animation(Mode mode,
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
            AnimationRepeatCb on_repeat);
  Animation(Mode mode,
            uint64_t delay,
            double start_value,
            double to_value,
            ValueType type,
            uint64_t duration,
            std::string func,
            int32_t cnt);
  Animation();
  ~Animation();

  inline uint32_t GetId() const {
    return id_;
  }

  inline uint64_t GetDelay() {
    return delay_;
  }

  inline uint64_t GetDuration() {
    return duration_;
  }

  inline double GetStartValue() const {
    return start_value_;
  }

  inline void SetStartValue(double start_value) {
    start_value = start_value_;
  }

  inline int32_t GetRepeatCnt() {
    return cnt_;
  }

  inline void SetRepeatCnt(int32_t cnt) {
    cnt_ = cnt;
  }

  inline uint32_t GetAnimationSetId() {
    return set_id_;
  }

  inline void SetAnimationSetId(uint32_t set_id) {
    set_id_ = set_id;
  }

  inline AnimationStartCb GetAnimationStartCb() {
    return on_start_;
  }

  inline AnimationEndCb GetAnimationEndCb() {
    return on_end_;
  }

  inline AnimationCancelCb GetAnimationCancelCb() {
    return on_cancel_;
  }

  inline AnimationRepeatCb GetAnimationRepeatCb() {
    return on_repeat_;
  }

  inline uint64_t GetLastBeginTime() {
    return last_begin_time_;
  }

  inline void SetLastBeginTime(uint64_t begin_time) {
    last_begin_time_ = begin_time;
  }

  inline double GetCurrentValue() {
    return current_value_;
  }

  inline Status GetStatus() {
    return status_;
  }

  inline void SetStatus(Status status) {
    status_ = status;
  }

  inline uint64_t GetExecTime() {
    return exec_time_;
  }

  inline void SetExecTime(uint64_t exec_time) {
    exec_time_ = exec_time;
  }

  double Calculate(uint64_t time);

  void Repeat(uint64_t now);

  void Update(Mode mode,
              uint64_t delay,
              double start_value,
              double to_value,
              ValueType type,
              uint64_t duration,
              std::string func,
              int32_t cnt);

  void AddEventListener(const std::string& event, AnimationCb cb);
  void RemoveEventListener(const std::string& event);

 private:
  CubicBezier ParseCubicBezierStr(std::string str);
  double CalculateColor(double start_color, double to_color, double scale);

  uint32_t id_;
  Mode mode_;
  uint64_t delay_;
  double start_value_;
  double to_value_;
  ValueType type_;
  uint64_t duration_;
  std::string func_;
  int32_t cnt_;
  uint32_t set_id_;
  AnimationStartCb on_start_;
  AnimationEndCb on_end_;
  AnimationCancelCb on_cancel_;
  AnimationRepeatCb on_repeat_;
  uint64_t last_begin_time_;
  CubicBezier cubic_bezier_{};
  double current_value_;
  Status status_;
  uint64_t exec_time_; // 包含 delay 和 实际运行时间
};

class AnimationSet: public std::enable_shared_from_this<AnimationSet> {
 public:
  struct AnimationSetChild {
    uint32_t animation_id;
    bool follow;
  };

  enum class Status {
    kCreated, kStart, kRunning, kPause, kResume, kEnd, kDestroy
  };

  using AnimationCb = std::function<void()>;
  using AnimationStartCb = std::function<void()>;
  using AnimationEndCb = std::function<void()>;
  using AnimationCancelCb = std::function<void()>;
  using AnimationRepeatCb = std::function<void()>;

  AnimationSet(std::vector<AnimationSetChild>&& children, int32_t cnt);
  AnimationSet();

  inline uint32_t GetId() {
    return id_;
  }

  inline const std::vector<AnimationSetChild>& GetChildren() {
    return children_;
  }

  inline const int32_t GetRepeatCnt() {
    return cnt_;
  }

  inline AnimationStartCb GetAnimationStartCb() {
    return on_start_;
  }

  inline AnimationEndCb GetAnimationEndCb() {
    return on_end_;
  }

  inline AnimationCancelCb GetAnimationCancelCb() {
    return on_cancel_;
  }

  inline AnimationRepeatCb GetAnimationRepeatCb() {
    return on_repeat_;
  }

  inline Status GetStatus() {
    return status_;
  }

  inline void SetStatus(Status status) {
    status_ = status;
  }

  inline double GetStartValue() {
    return start_value_;
  }

  inline void SetStartValue(double start_value) {
    start_value_ = start_value;
  }

  void Repeat();
  void AddEventListener(const std::string& event, AnimationCb cb);
  void RemoveEventListener(const std::string& event);

 private:
  uint32_t id_;
  std::vector<AnimationSetChild> children_;
  int32_t cnt_;
  AnimationStartCb on_start_;
  AnimationEndCb on_end_;
  AnimationCancelCb on_cancel_;
  AnimationRepeatCb on_repeat_;
  Status status_;
  double start_value_;
};

}

