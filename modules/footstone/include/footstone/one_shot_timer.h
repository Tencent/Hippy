#pragma once

#include "base_timer.h"

namespace footstone {
inline namespace timer {

class OneShotTimer : public BaseTimer {
 public:
  using Task = runner::Task;
  using TaskRunner = runner::TaskRunner;
  using TimeDelta = time::TimeDelta;

  OneShotTimer() = default;
  explicit OneShotTimer(std::shared_ptr<TaskRunner> task_runner);
  virtual ~OneShotTimer();

  virtual void Start(std::unique_ptr<Task> user_task, TimeDelta delay = TimeDelta::Zero());

  void FireNow();

 private:
  void OnStop() final;
  void RunUserTask() final;

  std::unique_ptr<Task> user_task_;

  FOOTSTONE_DISALLOW_COPY_AND_ASSIGN(OneShotTimer);
};

}  // namespace base
}  // namespace footstone
