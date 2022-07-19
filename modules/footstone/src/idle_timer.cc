#include "idle_timer.h"

#include <utility>

#include "logging.h"

namespace footstone {
inline namespace timer {

using IdleCbParam = footstone::IdleTask::IdleCbParam;

IdleTimer::IdleTimer(std::shared_ptr<TaskRunner> task_runner) : BaseTimer(std::move(task_runner)) {}

IdleTimer::~IdleTimer() = default;

void IdleTimer::Start(std::unique_ptr<IdleTask> idle_task, TimeDelta timeout) {
  FOOTSTONE_DCHECK(timeout > TimeDelta::Zero());
  auto task_runner = task_runner_.lock();
  FOOTSTONE_DCHECK(task_runner);
  idle_task_ = std::make_shared<IdleTask>(idle_task->GetUnit());
  std::weak_ptr<IdleTask> weak_task = idle_task_;
  task_runner->PostIdleTask(std::make_unique<IdleTask>([weak_task](const IdleCbParam& param) {
    auto shared_task = weak_task.lock();
    if (!shared_task) {
      return;
    }
    shared_task->Run(param);
    shared_task.reset();
  }));
  StartInternal(timeout);
}

void IdleTimer::Start(std::unique_ptr<IdleTask> idle_task) {
  auto task_runner = task_runner_.lock();
  FOOTSTONE_DCHECK(task_runner);
  idle_task_ = std::make_shared<IdleTask>(idle_task->GetUnit());
  std::weak_ptr<IdleTask> weak_task = idle_task_;
  task_runner->PostIdleTask(std::move(idle_task));
}

void IdleTimer::OnStop() { idle_task_.reset(); }

void IdleTimer::RunUserTask() {
  if (!idle_task_) {
    return;
  }
  IdleCbParam param = {
      .did_time_out = true,
      .res_time = TimeDelta::Zero()
  };
  idle_task_->Run(param);
  Stop();
}

} // namespace timer
} // namespace footstone
