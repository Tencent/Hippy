#include "repeating_timer.h"

#include "logging.h"

namespace footstone {
inline namespace timer {

RepeatingTimer::~RepeatingTimer() = default;

RepeatingTimer::RepeatingTimer(const std::shared_ptr<TaskRunner>& task_runner) : BaseTimer(task_runner) {}

void RepeatingTimer::Start(std::unique_ptr<Task> user_task, TimeDelta delay) {
  user_task_ = std::move(user_task);
  StartInternal(delay);
}

std::shared_ptr<BaseTimer> RepeatingTimer::GetWeakSelf() {
  return std::static_pointer_cast<BaseTimer>(shared_from_this());
}

void RepeatingTimer::OnStop() {}
void RepeatingTimer::RunUserTask() {
  std::unique_ptr<Task>& task = user_task_;
  ScheduleNewTask(delay_);
  task->Run();
}

} // namespace timer
} // namespace footstone
