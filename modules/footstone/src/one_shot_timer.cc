#include "one_shot_timer.h"

#include <utility>

#include "logging.h"

namespace footstone {
inline namespace timer {

OneShotTimer::OneShotTimer(const std::shared_ptr<TaskRunner>& task_runner)
    :BaseTimer(task_runner) {}

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

std::shared_ptr<BaseTimer> OneShotTimer::GetWeakSelf() {
  return std::static_pointer_cast<BaseTimer>(shared_from_this());
}

void OneShotTimer::RunUserTask() {
  std::unique_ptr<Task> task = std::move(user_task_);
  Stop();
  FOOTSTONE_DCHECK(task);
  task->Run();
}

} // namespace timer
} // namespace footstone
