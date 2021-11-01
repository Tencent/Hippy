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

#include "core/task/worker_task_runner.h"

#include "base/logging.h"
#include "core/napi/js_native_api.h"

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
      hippy::napi::DetachThread();
      cv_.notify_all();
      TDF_BASE_DLOG(INFO) << "WorkerTaskRunner Terminate";
      return nullptr;
    }

    cv_.wait(lock);
  }
}

void WorkerTaskRunner::Terminate() {
  TDF_BASE_DLOG(INFO) << "WorkerTaskRunner::Terminate begin";
  {
    std::lock_guard<std::mutex> lock(mutex_);
    terminated_ = true;
  }
  cv_.notify_all();
  thread_pool_.clear();
  TDF_BASE_DLOG(INFO) << "WorkerTaskRunner::Terminate end";
}

WorkerTaskRunner::WorkerThread::WorkerThread(WorkerTaskRunner* runner)
    : Thread(Options("Hippy WorkerTaskRunner WorkerThread")), runner_(runner) {
  TDF_BASE_DLOG(INFO) << "WorkerThread create";
  Start();
}

WorkerTaskRunner::WorkerThread::~WorkerThread() {
  TDF_BASE_DLOG(INFO) << "WorkerThread Join begin";
  Join();
  TDF_BASE_DLOG(INFO) << "WorkerThread Join end";
}

void WorkerTaskRunner::WorkerThread::Run() {
  while (std::unique_ptr<CommonTask> task = runner_->GetNext()) {
    task->Run();
  }
  TDF_BASE_DLOG(INFO) << "WorkerThread Run Terminate";
}
