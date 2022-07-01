#pragma once

#include <functional>
#include <memory>

#include "task_runner.h"
#include "time_delta.h"
#include "time_point.h"

namespace footstone {
inline namespace timer {

class BaseTimer {
 public:
  using TaskRunner = runner::TaskRunner;
  using TimePoint = time::TimePoint;
  using TimeDelta = time::TimeDelta;

  BaseTimer() = default;
  explicit BaseTimer(const std::shared_ptr<TaskRunner>& task_runner);
  virtual ~BaseTimer();

  void Stop();
  void Reset();
  inline void BindTaskRunner(std::shared_ptr<TaskRunner> task_runner) {
    task_runner_ = task_runner;
  }
  inline bool IsRunning() { return is_running_; }

 protected:
  virtual void RunUserTask() = 0;
  virtual void OnStop() = 0;
  virtual std::shared_ptr<BaseTimer> GetWeakSelf() = 0;

  void ScheduleNewTask(TimeDelta delay);
  void StartInternal(TimeDelta delay);

  std::weak_ptr<TaskRunner> task_runner_;
  std::unique_ptr<Task> user_task_;
  TimeDelta delay_;

 private:
  void OnScheduledTaskInvoked();

  bool is_running_;
  TimePoint desired_run_time_;
  TimePoint scheduled_run_time_;

  FOOTSTONE_DISALLOW_COPY_AND_ASSIGN(BaseTimer);
};

}  // namespace timer
}  // namespace footstone
