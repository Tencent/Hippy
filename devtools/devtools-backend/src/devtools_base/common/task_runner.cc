/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include "devtools_base/common/task_runner.h"

#include <array>
#include <atomic>

#include "devtools_base/logging.h"
#include "devtools_base/common/worker.h"

namespace hippy {
namespace devtools {
inline namespace runner {
std::atomic<int32_t> global_task_runner_id{0};

TaskRunner::TaskRunner(bool is_excl, int32_t priority, const std::string& name)
    : is_terminated_(false),
      is_excl_(is_excl),
      name_(name),
      has_sub_runner_(false),
      priority_(priority),
      time_(TimeDelta::Zero()),
      cv_(nullptr) {
  id_ = global_task_runner_id.fetch_add(1);
}

TaskRunner::~TaskRunner() {
  std::shared_ptr<Worker> worker = worker_.lock();
  if (worker) {
    worker->WorkerDestroySpecific(id_);
  }
}

void TaskRunner::Clear() {
  std::unique_lock<std::mutex> lock(mutex_);

  while (!task_queue_.empty()) {
    task_queue_.pop();
  }

  while (!delayed_task_queue_.empty()) {
    delayed_task_queue_.pop();
  }
}

void TaskRunner::AddSubTaskRunner(std::shared_ptr<TaskRunner> sub_runner, bool is_task_running) {
  std::shared_ptr<Worker> worker = worker_.lock();
  if (worker) {
    worker->BindGroup(id_, sub_runner);
    has_sub_runner_ = true;
    if (is_task_running) {
      worker->SetStackingMode(true);
      while (has_sub_runner_) {
        BACKEND_LOGW(TDF_BACKEND, "run task begin, has_sub_runner_ = %b",has_sub_runner_);
        worker->RunTask();
        BACKEND_LOGW(TDF_BACKEND, "run task end");
      }
      BACKEND_LOGW(TDF_BACKEND, "exit");
    }
  }
}

void TaskRunner::RemoveSubTaskRunner(std::shared_ptr<TaskRunner> sub_runner) {
  std::shared_ptr<Worker> worker = worker_.lock();
  BACKEND_LOGW(TDF_BACKEND, "has_sub_runner_ = %b", has_sub_runner_);
  if (worker && sub_runner) {
    worker->UnBind(sub_runner);
    if (has_sub_runner_) {
      BACKEND_LOGW(TDF_BACKEND, "exit sub");
      has_sub_runner_ = false;
    }
    if (cv_) {  // 通知父Runner执行
      cv_->notify_one();
    }
  }
}

void TaskRunner::Terminate() { is_terminated_ = true; }

void TaskRunner::PostTask(std::unique_ptr<Task> task) {
  std::lock_guard<std::mutex> lock(mutex_);

  task_queue_.push(std::move(task));
  if (cv_) {  // cv未初始化时要等cv初始化后立刻处理
    cv_->notify_one();
  }
}

void TaskRunner::PostDelayedTask(std::unique_ptr<Task> task, TimeDelta delay) {
  std::lock_guard<std::mutex> lock(mutex_);

  if (is_terminated_) {
    return;
  }

  TimePoint deadline = TimePoint::Now() + delay;
  delayed_task_queue_.push(std::make_pair(deadline, std::move(task)));

  cv_->notify_one();
}

std::unique_ptr<Task> TaskRunner::PopTask() {
  std::lock_guard<std::mutex> lock(mutex_);

  if (!task_queue_.empty()) {
    std::unique_ptr<Task> result = std::move(task_queue_.front());
    task_queue_.pop();
    return result;
  }

  return nullptr;
}

std::unique_ptr<Task> TaskRunner::GetTopDelayTask() {
  std::lock_guard<std::mutex> lock(mutex_);

  if (task_queue_.empty() && !delayed_task_queue_.empty()) {
    std::unique_ptr<Task> result = std::move(const_cast<DelayedEntry&>(delayed_task_queue_.top()).second);
    return result;
  }
  return nullptr;
}

std::unique_ptr<Task> TaskRunner::GetNext() {
  std::unique_lock<std::mutex> lock(mutex_);

  if (is_terminated_) {
    return nullptr;
  }

  TimePoint now = TimePoint::Now();
  std::unique_ptr<Task> task = popTaskFromDelayedQueueNoLock(now);
  while (task) {
    task_queue_.push(std::move(task));
    task = popTaskFromDelayedQueueNoLock(now);
  }

  if (!task_queue_.empty()) {
    std::unique_ptr<Task> result = std::move(task_queue_.front());
    task_queue_.pop();
    return result;
  }
  return nullptr;
}

void TaskRunner::SetCv(std::shared_ptr<std::condition_variable> cv) { cv_ = cv; }

TimeDelta TaskRunner::GetNextTimeDelta(TimePoint now) {
  std::unique_lock<std::mutex> lock(mutex_);
  if (task_queue_.empty() && !delayed_task_queue_.empty()) {
    const DelayedEntry& delayed_task = delayed_task_queue_.top();
    return delayed_task.first - now;
  } else {
    return TimeDelta::Max();
  }
}

std::unique_ptr<Task> TaskRunner::popTaskFromDelayedQueueNoLock(TimePoint now) {
  if (delayed_task_queue_.empty()) {
    return nullptr;
  }

  const DelayedEntry& deadline_and_task = delayed_task_queue_.top();
  if (deadline_and_task.first > now) {
    return nullptr;
  }

  std::unique_ptr<Task> result = std::move(const_cast<DelayedEntry&>(deadline_and_task).second);
  delayed_task_queue_.pop();
  return result;
}

std::shared_ptr<TaskRunner> TaskRunner::GetCurrentTaskRunner() { return Worker::GetCurrentTaskRunner(); }

int32_t TaskRunner::RunnerKeyCreate(std::function<void(void*)> destruct) {
  if (Worker::IsTaskRunning()) {
    auto task_runner_id = Worker::GetCurrentTaskRunner()->GetId();
    std::shared_ptr<Worker> worker = worker_.lock();
    if (worker) {
      return worker->WorkerKeyCreate(task_runner_id, std::move(destruct));
    }
  }
  return -1;
}

bool TaskRunner::RunnerKeyDelete(int32_t key) {
  if (Worker::IsTaskRunning()) {
    auto task_runner_id = Worker::GetCurrentTaskRunner()->GetId();
    std::shared_ptr<Worker> worker = worker_.lock();
    if (worker) {
      return worker->WorkerKeyDelete(task_runner_id, key);
    }
  }
  return false;
}

bool TaskRunner::RunnerSetSpecific(int32_t key, void* p) {
  if (Worker::IsTaskRunning()) {
    auto task_runner_id = Worker::GetCurrentTaskRunner()->GetId();
    std::shared_ptr<Worker> worker = worker_.lock();
    if (worker) {
      return worker->WorkerSetSpecific(task_runner_id, key, p);
    }
  }
  return false;
}

void* TaskRunner::RunnerGetSpecific(int32_t key) {
  if (Worker::IsTaskRunning()) {
    auto task_runner_id = Worker::GetCurrentTaskRunner()->GetId();
    std::shared_ptr<Worker> worker = worker_.lock();
    if (worker) {
      return worker->WorkerGetSpecific(task_runner_id, key);
    }
  }
  return nullptr;
}

void TaskRunner::RunnerDestroySpecifics() {
  if (Worker::IsTaskRunning()) {
    auto task_runner_id = Worker::GetCurrentTaskRunner()->GetId();
    std::shared_ptr<Worker> worker = worker_.lock();
    if (worker) {
      return worker->WorkerDestroySpecific(task_runner_id);
    }
  }
}
}  // namespace runner
}  // namespace devtools
}  // namespace hippy
