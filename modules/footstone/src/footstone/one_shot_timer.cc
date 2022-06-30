#include "footstone/one_shot_timer.h"

#include <utility>

#include "footstone/logging.h"

namespace footstone {
inline namespace timer {

OneShotTimer::OneShotTimer(std::shared_ptr<TaskRunner> task_runner)
    :BaseTimer(std::move(task_runner)) {}

OneShotTimer::~OneShotTimer() = default;

void OneShotTimer::Start(std::unique_ptr<Task> user_task, TimeDelta delay) {
  user_task_ = std::move(user_task);
  StartInternal(delay);
}

void OneShotTimer::FireNow() {
  FOOTSTONE_DCHECK(IsRunning());

  RunUserTask();
}

void OneShotTimer::OnStop() { user_task_.reset(); }

void OneShotTimer::RunUserTask() {
  std::unique_ptr<Task> task = std::move(user_task_);
  Stop();
  FOOTSTONE_DCHECK(task);
  task->Run();
}

} // namespace timer
} // namespace footstone
