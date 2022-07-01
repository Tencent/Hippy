#pragma once

#include "base_timer.h"

namespace footstone {
inline namespace timer {

 class RepeatingTimer : public BaseTimer, public std::enable_shared_from_this<RepeatingTimer> {
 public:
  using TaskRunner = runner::TaskRunner;

  RepeatingTimer() = default;
  explicit RepeatingTimer(const std::shared_ptr<TaskRunner>& task_runner);
  virtual ~RepeatingTimer();

  void Start(std::unique_ptr<Task> user_task, TimeDelta delay);

  virtual std::shared_ptr<BaseTimer> GetWeakSelf() override;
 private:
  void OnStop() final;
  void RunUserTask() override;

  FOOTSTONE_DISALLOW_COPY_AND_ASSIGN(RepeatingTimer);
};

}  // namespace base
}  // namespace footstone
