#include "footstone/repeating_timer.h"

#include "footstone/logging.h"

namespace footstone {
inline namespace timer {

RepeatingTimer::~RepeatingTimer() = default;

RepeatingTimer::RepeatingTimer(const std::shared_ptr<TaskRunner>& task_runner) : BaseTimer(task_runner) {}

void RepeatingTimer::Start(std::unique_ptr<Task> user_task, TimeDelta delay) {
  user_task_ = std::move(user_task);
  StartInternal(delay);
}

void RepeatingTimer::OnStop() {}
void RepeatingTimer::RunUserTask() {
  std::unique_ptr<Task>& task = user_task_;
  ScheduleNewTask(delay_);
  task->Run();
}

} // namespace timer
} // namespace footstone
