/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#include "core/base/task_runner.h"

#include <memory>
#include <utility>

#include "core/base/base_time.h"
#include "core/base/logging.h"
#include "core/base/macros.h"
#include "core/base/task.h"
#include "core/base/thread_id.h"
#include "core/napi/js_native_api.h"

namespace hippy {
namespace base {

TaskRunner::TaskRunner() : Thread(Options("Task Runner")) {
  is_terminated_ = false;
}

TaskRunner::~TaskRunner() {}

// when update this code, please update
// JavaScriptTaskRunner::PauseThreadForInspector at the same time
void TaskRunner::Run() {
  while (true) {
    std::shared_ptr<Task> task = GetNext();
    if (task == nullptr) {
      return;
    }
    // HIPPY_DLOG(hippy::Debug, "run task, id = %d", task->id_);

    bool is_cancel = false;
    {
      std::lock_guard<std::mutex> lock(mutex_);
      is_cancel = task->canceled_;
    }
    if (is_cancel == false) {
      task->Run();
    }
  }
}

void TaskRunner::Terminate() {
  {
    std::unique_lock<std::mutex> lock(mutex_);
    HIPPY_DLOG(hippy::Debug, "TaskRunner::Terminate task_queue_ size = %d",
               task_queue_.size());
    if (is_terminated_) {
      HIPPY_DLOG(hippy::Debug, "TaskRunner has been terminated");
      return;
    }
    is_terminated_ = true;
    if (this->Id() == hippy::base::ThreadId::GetCurrent()) {
      HIPPY_LOG(hippy::Error, "terminate in task");
      return;
    }
  }
  cv_.notify_one();
  HIPPY_DLOG(hippy::Debug, "TaskRunner Terminate join begin");
  Join();
  HIPPY_DLOG(hippy::Debug, "TaskRunner Terminate join end");
}

void TaskRunner::PostTask(std::shared_ptr<Task> task) {
  HIPPY_DLOG(hippy::Debug, "TaskRunner::PostTask task id = %d", task->id_);
  std::lock_guard<std::mutex> lock(mutex_);

  PostTaskNoLock(std::move(task));

  cv_.notify_one();
}

void TaskRunner::PostDelayedTask(
    std::shared_ptr<Task> task,
    TaskRunner::DelayedTimeInMs delay_in_mseconds) {
  std::lock_guard<std::mutex> lock(mutex_);

  if (is_terminated_) {
    return;
  }

  DelayedTimeInMs deadline = MonotonicallyIncreasingTime() + delay_in_mseconds;
  delayed_task_queue_.push(std::make_pair(deadline, std::move(task)));

  cv_.notify_one();
}

void TaskRunner::CancelTask(std::shared_ptr<Task> task) {
  std::lock_guard<std::mutex> lock(mutex_);

  if (!task) {
    return;
  }
  task->canceled_ = true;
}

void TaskRunner::PostTaskNoLock(std::shared_ptr<Task> task) {
  if (is_terminated_) {
    return;
  }

  task_queue_.push(std::move(task));
}

std::shared_ptr<Task> TaskRunner::GetNext() {
  std::unique_lock<std::mutex> lock(mutex_);

  for (;;) {
    DelayedTimeInMs now = MonotonicallyIncreasingTime();
    std::shared_ptr<Task> task = popTaskFromDelayedQueueNoLock(now);
    while (task) {
      PostTaskNoLock(std::move(task));
      task = popTaskFromDelayedQueueNoLock(now);
    }

    if (!task_queue_.empty()) {
      std::shared_ptr<Task> result = std::move(task_queue_.front());
      task_queue_.pop();
      return result;
    }

    if (is_terminated_) {
      hippy::napi::DetachThread();
      HIPPY_DLOG(hippy::Debug, "TaskRunner terminate");
      return nullptr;
    }

    if (task_queue_.empty() && !delayed_task_queue_.empty()) {
      const DelayedEntry& delayed_task = delayed_task_queue_.top();
      DelayedTimeInMs wait_in_msseconds = delayed_task.first - now;
      bool notified =
          cv_.wait_for(lock, std::chrono::milliseconds(wait_in_msseconds)) ==
          std::cv_status::timeout;
      HIPPY_USE(notified);
    } else {
      cv_.wait(lock);
    }
  }
}

std::shared_ptr<Task> TaskRunner::popTaskFromDelayedQueueNoLock(
    TaskRunner::DelayedTimeInMs now) {
  if (delayed_task_queue_.empty())
    return {};

  const DelayedEntry& deadline_and_task = delayed_task_queue_.top();
  if (deadline_and_task.first > now)
    return {};

  std::shared_ptr<Task> result =
      std::move(const_cast<DelayedEntry&>(deadline_and_task).second);
  delayed_task_queue_.pop();
  return result;
}

}  // namespace base
}  // namespace hippy
