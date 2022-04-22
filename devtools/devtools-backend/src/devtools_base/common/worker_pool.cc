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

#include "devtools_base/common/worker_pool.h"

#include <array>
#include <map>

#include "devtools_base/common/logging.h"

namespace tdf::devtools {
inline namespace runner {
std::mutex WorkerPool::creation_mutex_;

std::shared_ptr<WorkerPool> WorkerPool::instance_ = nullptr;

WorkerPool::WorkerPool(int size) : size_(size), index_(0) { CreateWorker(size); }

WorkerPool::~WorkerPool() {}

void WorkerPool::Terminate() {
  for (auto it = excl_workers_.begin(); it != excl_workers_.end(); ++it) {
    (*it)->Terminate();
  }
  for (auto it = workers_.begin(); it != workers_.end(); ++it) {
    (*it)->Terminate();
  }
}

std::shared_ptr<WorkerPool> WorkerPool::GetInstance(int size) {
  std::scoped_lock creation(creation_mutex_);
  if (!instance_) {
    instance_ = std::make_shared<WorkerPool>(size);
  }
  return instance_;
}

void WorkerPool::CreateWorker(int size, bool is_excl) {
  for (int i = 0; i < size; ++i) {
    auto worker = std::make_shared<Worker>();
    if (is_excl) {
      excl_workers_.push_back(worker);
    } else {
      workers_.push_back(worker);
    }
    worker->Start();
  }
}

void WorkerPool::Resize(int size) {
  std::lock_guard<std::mutex> lock(mutex_);

  if (size == size_) {
    return;
  } else if (size > size_) {  // increase the number of threads
    CreateWorker(size - size_);

    // save all runners that need to be reallocated
    std::list<std::vector<std::shared_ptr<TaskRunner>>> groups;
    for (int i = 0; i < size_; ++i) {
      groups.splice(groups.end(), workers_[i]->RetainActive());
    }

    index_ = size_;
    auto it = groups.begin();
    std::map<int32_t, std::array<Worker::WorkerKey, Worker::kWorkerKeysMax>> migration_key_map;
    std::map<int32_t, std::array<void*, Worker::kWorkerKeysMax>> migration_specific_map;
    while (it != groups.end()) {
      auto group = *it;
      auto new_worker = workers_[index_];
      new_worker->Bind(group);
      for (auto vec_it = group.begin(); vec_it != group.end(); ++vec_it) {
        auto runner = (*vec_it);
        auto id = runner->GetId();
        auto orig_worker = runner->worker_.lock();
        if (orig_worker) {
          new_worker->UpdateSpecificKeys(id, std::move(orig_worker->GetMovedSpecificKeys(id)));
          new_worker->UpdateSpecific(id, std::move(orig_worker->GetMovedSpecific(id)));
        }
      }
      // use rr
      index_ == size - 1 ? 0 : ++index_;
      ++it;
    }
    size_ = size;
  } else {
    // reduce the number of threads
    // size < size_
    if (index_ > size - 1) {
      index_ = 0;  // make sure index_ is valid
    }

    std::list<std::vector<std::shared_ptr<TaskRunner>>> groups;
    for (int i = size_ - 1; i > size - 1; --i) {
      // handle running runner on thread
      groups.splice(groups.end(), workers_[i]->UnBind());
    }
    for (int i = 0; i < size; ++i) {
      groups.splice(groups.end(), workers_[i]->RetainActive());
    }

    if (index_ >= size) {
      index_ = 0;
    }

    auto it = groups.begin();
    while (it != groups.end()) {
      auto group = *it;
      auto new_worker = workers_[index_];
      new_worker->Bind(*it);
      for (auto vec_it = group.begin(); vec_it != group.end(); ++vec_it) {
        auto runner = (*vec_it);
        auto id = runner->GetId();
        auto orig_worker = runner->worker_.lock();
        if (orig_worker) {
          new_worker->UpdateSpecificKeys(id, std::move(orig_worker->GetMovedSpecificKeys(id)));
          new_worker->UpdateSpecific(id, orig_worker->GetMovedSpecific(id));
        }
      }
      index_ == size - 1 ? 0 : ++index_;
      ++it;
    }
    size_ = size;

    for (int i = size_ - 1; i > size - 1; --i) {
      // handle running runner on thread
      workers_[i]->Terminate();
      workers_.pop_back();
    }
  }
}

std::shared_ptr<TaskRunner> WorkerPool::CreateTaskRunner(bool is_excl, int priority, const std::string& name) {
  auto ret = std::make_shared<TaskRunner>(is_excl, priority, name);
  AddTaskRunner(ret);
  return ret;
}

void WorkerPool::RemoveTaskRunner(std::shared_ptr<TaskRunner> runner) {
  if (runner->GetExclusive()) {
    for (auto it = excl_workers_.begin(); it != excl_workers_.end(); ++it) {
      (*it)->UnBind(runner);
      runner->Terminate();
    }
  }
}

void WorkerPool::AddTaskRunner(std::shared_ptr<TaskRunner> runner) {
  std::vector<std::shared_ptr<TaskRunner>> group{runner};
  {
    std::lock_guard<std::mutex> lock(mutex_);
    if (runner->GetExclusive()) {
      CreateWorker(1, true);
      auto it = excl_workers_.rbegin();
      (*it)->Bind(group);
      BindWorker(*it, group);
      runner->SetCv((*it)->cv_);
    } else {
      workers_[index_]->Bind(group);
      BindWorker(workers_[index_], group);
      runner->SetCv(workers_[index_]->cv_);
      index_ == (size_ - 1) ? 0 : ++index_;
    }
  }
}

void WorkerPool::BindWorker(std::shared_ptr<Worker> worker, std::vector<std::shared_ptr<TaskRunner>> group) {
  for (auto it = group.begin(); it != group.end(); ++it) {
    (*it)->worker_ = worker;
    std::array<Worker::WorkerKey, Worker::kWorkerKeysMax> keys_array;
    worker->UpdateSpecificKeys((*it)->GetId(), std::move(keys_array));
    std::array<void*, Worker::kWorkerKeysMax> specific_array{};
    worker->UpdateSpecific((*it)->GetId(), specific_array);
  }
}
}  // namespace runner
}  // namespace tdf::devtools
