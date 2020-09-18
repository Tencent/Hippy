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

#include "core/task/worker-task-runner.h"

#include "core/base/logging.h"

namespace hippy {
namespace base {

const uint32_t WorkerTaskRunner::kDefaultTaskPriority = 10000;
const uint32_t WorkerTaskRunner::kHighPriorityTaskPriority = 5000;
const uint32_t WorkerTaskRunner::kLowPriorityTaskPriority = 15000;

WorkerTaskRunner::WorkerTaskRunner(uint32_t pool_size) : pool_size_(pool_size) {
  for (uint32_t i = 0; i < pool_size_; ++i) {
    thread_pool_.push_back(std::make_unique<WorkerThread>(this));
  }
}

void WorkerTaskRunner::PostTask(std::unique_ptr<CommonTask> task,
                                uint32_t priority) {
  std::lock_guard<std::mutex> lock(mutex_);
  if (terminated_) {
    return;
  }
  task_queue_.push(std::make_pair(priority, std::move(task)));
  cv_.notify_one();
}

std::unique_ptr<CommonTask> WorkerTaskRunner::GetNext() {
  std::unique_lock<std::mutex> lock(mutex_);
  while (true) {
    if (!task_queue_.empty()) {
      const Entry& entry = task_queue_.top();
      std::unique_ptr<CommonTask> result =
          std::move(const_cast<Entry&>(entry).second);

      task_queue_.pop();
      return result;
    }

    if (terminated_) {
      cv_.notify_all();
      HIPPY_DLOG(hippy::Debug, "WorkerTaskRunner Terminate");
      return nullptr;
    }

    cv_.wait(lock);
  }
}

void WorkerTaskRunner::Terminate() {
  HIPPY_DLOG(hippy::Debug, "WorkerTaskRunner::Terminate begin");
  {
    std::lock_guard<std::mutex> lock(mutex_);
    terminated_ = true;
  }
  cv_.notify_all();
  thread_pool_.clear();
  HIPPY_DLOG(hippy::Debug, "WorkerTaskRunner::Terminate end");
}

WorkerTaskRunner::WorkerThread::WorkerThread(WorkerTaskRunner* runner)
    : Thread(Options("Hippy WorkerTaskRunner WorkerThread")), runner_(runner) {
  HIPPY_DLOG(hippy::Debug, "WorkerThread create");
  Start();
}

WorkerTaskRunner::WorkerThread::~WorkerThread() {
  HIPPY_DLOG(hippy::Debug, "WorkerThread Join begin");
  Join();
  HIPPY_DLOG(hippy::Debug, "WorkerThread Join end");
}

void WorkerTaskRunner::WorkerThread::Run() {
  while (std::unique_ptr<CommonTask> task = runner_->GetNext()) {
    task->Run();
  }
  HIPPY_DLOG(hippy::Debug, "WorkerThread Run Terminate");
}
}  // namespace base
}  // namespace hippy
