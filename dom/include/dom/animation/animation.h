#pragma once

#include <atomic>
#include <functional>
#include <string>


namespace hippy {

inline namespace dom {
class AnimationManager;
class DomManager;
}

inline namespace animation {

constexpr char kAnimationStartKey[] = "animationstart";
constexpr char kAnimationEndKey[] = "animationend";
constexpr char kAnimationCancelKey[] = "animationcancel";
constexpr char kAnimationRepeatKey[] = "animationrepeat";

class Animation {
 public:
  enum class Status {
    kCreated, kStart, kRunning, kPause, kResume, kEnd, kDestroy
  };

  using AnimationCb = std::function<void()>;
  using AnimationStartCb = std::function<void()>;
  using AnimationEndCb = std::function<void()>;
  using AnimationCancelCb = std::function<void()>;
  using AnimationRepeatCb = std::function<void()>;

 public:
  Animation(int32_t cnt,
            uint64_t delay,
            uint64_t last_begin_time,
            uint64_t duration,
            uint64_t exec_time,
            double start_value,
            AnimationStartCb on_start,
            AnimationEndCb on_end,
            AnimationCancelCb on_cancel,
            AnimationRepeatCb on_repeat,
            bool is_set,
            Status status,
            std::weak_ptr<hippy::AnimationManager> animation_manager);
  Animation(
      int32_t cnt,
      uint64_t delay,
      uint64_t duration,
      double start_value);
  Animation(int32_t cnt);
  Animation();
  ~Animation();

  inline uint32_t GetId() {
    return id_;
  }

  inline int32_t GetRepeatCnt() {
    return cnt_;
  }

  inline uint64_t GetDelay() {
    return delay_;
  }

  inline void SetDelay(uint64_t delay) {
    delay_ = delay;
  }

  inline uint64_t GetLastBeginTime() {
    return last_begin_time_;
  }

  inline void SetLastBeginTime(uint64_t begin_time) {
    last_begin_time_ = begin_time;
  }

  inline uint64_t GetDuration() {
    return duration_;
  }

  inline uint64_t GetExecTime() {
    return exec_time_;
  }

  inline void SetExecTime(uint64_t exec_time) {
    exec_time_ = exec_time;
  }

  inline double GetStartValue() const {
    return start_value_;
  }

  inline void SetStartValue(double start_value) {
    start_value = start_value_;
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

  inline bool IsSet() {
    return is_set_;
  }

  inline Status GetStatus() {
    return status_;
  }

  inline void SetStatus(Status status) {
    status_ = status;
  }

  inline std::weak_ptr<hippy::AnimationManager> GetAnimationManager() {
    return animation_manager_;
  }

  inline void SetAnimationManager(std::weak_ptr<hippy::AnimationManager> animation_manager) {
    animation_manager_ = animation_manager;
  }

  void AddEventListener(const std::string& event, AnimationCb cb);
  void RemoveEventListener(const std::string& event);
  void Start();
  void Run(uint64_t now);
  void Destroy();
  void Pause();
  void Resume();
  void Repeat(uint64_t now);

 protected:
  uint32_t id_;
  int32_t cnt_;
  uint64_t delay_;
  uint64_t last_begin_time_;
  uint64_t duration_;
  uint64_t exec_time_; // Contains delay and actual running time
  double start_value_;
  AnimationStartCb on_start_;
  AnimationEndCb on_end_;
  AnimationCancelCb on_cancel_;
  AnimationRepeatCb on_repeat_;
  bool is_set_;
  Status status_;
  std::weak_ptr<hippy::AnimationManager> animation_manager_{};

 private:
  static std::atomic<uint32_t> animation_id_;
};

}
}
