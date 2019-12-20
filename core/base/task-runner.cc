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

#include "core/base/task-runner.h"

#include <memory>
#include <utility>

#include "core/base/logging.h"
#include "core/base/macros.h"
#include "core/base/task.h"

namespace {

using hippy::base::TaskRunner;

TaskRunner::DelayedTimeInMs MonotonicallyIncreasingTime() {
  auto now = std::chrono::steady_clock::now();
  auto now_ms = std::chrono::time_point_cast<std::chrono::milliseconds>(now)
                    .time_since_epoch();
  TaskRunner::DelayedTimeInMs count =
      std::chrono::duration_cast<std::chrono::milliseconds>(now_ms).count();

  return count;
}

}  // namespace

namespace hippy {
namespace base {

TaskRunner::TaskRunner() : Thread(Options("Task Runner")) {
  is_terminated_ = false;
}

TaskRunner::~TaskRunner() {
  std::lock_guard<std::mutex> lock(m_mutex);

  HIPPY_CHECK(is_terminated_);
  HIPPY_CHECK(task_queue_.empty());
  HIPPY_CHECK(delayed_task_queue_.empty());
}

// when update this code, please update
// JavaScriptTaskRunner::pauseThreadForInspector at the same time
void TaskRunner::Run() {
  while (true) {
    std::shared_ptr<Task> task = GetNext();
    if (task == nullptr) {
      return;
    }

    bool is_cancel = false;
    {
      std::lock_guard<std::mutex> lock(m_mutex);
      is_cancel = task->canceled_;
    }
    if (is_cancel == false) {
      task->Run();
    }
  }
}

void TaskRunner::Terminate() {
  {
    std::lock_guard<std::mutex> lock(m_mutex);
    is_terminated_ = true;
  }

  m_cv.notify_one();
  Join();

  std::lock_guard<std::mutex> lock(m_mutex);
  while (!task_queue_.empty())
    task_queue_.pop();
  while (!delayed_task_queue_.empty())
    delayed_task_queue_.pop();
}

void TaskRunner::postTask(std::shared_ptr<Task> task) {
  std::lock_guard<std::mutex> lock(m_mutex);

  postTaskNoLock(std::move(task));

  m_cv.notify_one();
}

void TaskRunner::postDelayedTask(
    std::shared_ptr<Task> task,
    TaskRunner::DelayedTimeInMs delay_in_mseconds) {
  std::lock_guard<std::mutex> lock(m_mutex);

  if (is_terminated_) {
    return;
  }

  DelayedTimeInMs deadline = MonotonicallyIncreasingTime() + delay_in_mseconds;
  delayed_task_queue_.push(std::make_pair(deadline, std::move(task)));

  m_cv.notify_one();
}

void TaskRunner::cancelTask(std::shared_ptr<Task> task) {
  std::lock_guard<std::mutex> lock(m_mutex);

  if (!task) {
    return;
  }
  task->canceled_ = true;
}

void TaskRunner::postTaskNoLock(std::shared_ptr<Task> task) {
  if (is_terminated_) {
    return;
  }

  task_queue_.push(std::move(task));
}

std::shared_ptr<Task> TaskRunner::GetNext() {
  std::unique_lock<std::mutex> lock(m_mutex);

  for (;;) {
    DelayedTimeInMs now = MonotonicallyIncreasingTime();
    std::shared_ptr<Task> task = popTaskFromDelayedQueueNoLock(now);
    while (task) {
      postTaskNoLock(std::move(task));
      task = popTaskFromDelayedQueueNoLock(now);
    }

    if (!task_queue_.empty()) {
      std::shared_ptr<Task> result = std::move(task_queue_.front());
      task_queue_.pop();
      return result;
    }

    if (is_terminated_) {
      m_cv.notify_all();
      return nullptr;
    }

    if (task_queue_.empty() && !delayed_task_queue_.empty()) {
      const DelayedEntry& delayed_task = delayed_task_queue_.top();
      DelayedTimeInMs wait_in_msseconds = delayed_task.first - now;
      bool notified =
          m_cv.wait_for(lock, std::chrono::milliseconds(wait_in_msseconds)) ==
          std::cv_status::timeout;
      HIPPY_USE(notified);
    } else {
      m_cv.wait(lock);
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
