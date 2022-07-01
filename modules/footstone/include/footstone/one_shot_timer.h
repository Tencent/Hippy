#pragma once

#include "base_timer.h"

namespace footstone {
inline namespace timer {

 class OneShotTimer : public BaseTimer, public std::enable_shared_from_this<OneShotTimer> {
 public:
  using Task = runner::Task;
  using TaskRunner = runner::TaskRunner;
  using TimeDelta = time::TimeDelta;

  OneShotTimer() = default;
  explicit OneShotTimer(const std::shared_ptr<TaskRunner>& task_runner);
  virtual ~OneShotTimer();

  void Start(std::unique_ptr<Task> user_task, TimeDelta delay);
  void FireNow();

  virtual std::shared_ptr<BaseTimer> GetWeakSelf() override;

 private:
  void OnStop() final;
  void RunUserTask() final;

  std::unique_ptr<Task> user_task_;

  FOOTSTONE_DISALLOW_COPY_AND_ASSIGN(OneShotTimer);
};

}  // namespace base
}  // namespace footstone
