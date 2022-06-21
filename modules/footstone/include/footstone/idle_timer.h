#pragma once

#include "base_timer.h"
#include "idle_task.h"

namespace footstone {
inline namespace timer {
class IdleTimer : public BaseTimer {
 public:
  using Task = runner::Task;
  using TaskRunner = runner::TaskRunner;
  using TimeDelta = time::TimeDelta;

  IdleTimer() = default;
  explicit IdleTimer(std::shared_ptr<TaskRunner> task_runner);
  virtual ~IdleTimer();

  virtual void Start(std::unique_ptr<IdleTask> idle_task, TimeDelta timeout);
  virtual void Start(std::unique_ptr<IdleTask> idle_task);

 private:
  void OnStop() final;
  void RunUserTask() final;

  std::shared_ptr<IdleTask> idle_task_ ;

  FOOTSTONE_DISALLOW_COPY_AND_ASSIGN(IdleTimer);
};

}
}
