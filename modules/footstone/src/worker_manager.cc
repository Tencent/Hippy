/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

#include "include/footstone/worker_manager.h"

#include <array>
#include <cmath>
#include <map>
#include <utility>

#include "include/footstone/logging.h"
#include "include/footstone/worker_impl.h"

namespace footstone {
inline namespace runner {

WorkerManager::WorkerManager(uint32_t size) : index_(0), size_(size) { CreateWorkers(size); }

WorkerManager::~WorkerManager() = default;

void WorkerManager::Terminate() {
  for (auto &worker : workers_) {
    worker->Terminate();
  }
}

void WorkerManager::CreateWorkers(uint32_t size) {
  std::shared_ptr<Worker> worker;
  for (uint32_t i = 0; i < size; ++i) {
    worker = std::make_shared<WorkerImpl>();
    worker->Start();
    workers_.push_back(worker);
  }
}

void WorkerManager::MoveTaskRunnerSpecificNoLock(uint32_t runner_id,
                                                 const std::shared_ptr<Worker> &from,
                                                 const std::shared_ptr<Worker> &to) {
  FOOTSTONE_CHECK(from);
  FOOTSTONE_CHECK(to);
  // 使用task机制避免加锁
  std::weak_ptr<Worker> weak_to = to;
  std::weak_ptr<Worker> weak_from = from;
  from->AddImmediateTask(std::make_unique<Task>([weak_from, weak_to, runner_id] {
    auto from = weak_from.lock();
    FOOTSTONE_CHECK(from);
    auto specific_keys = from->GetMovedSpecificKeys(runner_id);
    auto specific = from->GetMovedSpecific(runner_id);
    auto to = weak_to.lock();
    if (to) {
      to->AddImmediateTask(std::make_unique<Task>(
          [runner_id, weak_to,
              moved_specific_keys = std::move(specific_keys),
              moved_specific = specific] {
            auto to = weak_to.lock();
            if (to) {
              to->UpdateSpecificKeys(runner_id, moved_specific_keys);
              to->UpdateSpecific(runner_id, moved_specific);
            }
          }));
    }
  }));
}

void WorkerManager::Resize(uint32_t size) {
  std::lock_guard<std::mutex> lock(mutex_);

  FOOTSTONE_CHECK(size > 0);

  if (size == size_) {
    return;
  }
  if (size > size_) {  // increase the number of workers
    CreateWorkers(static_cast<uint32_t>(size - size_));
  }
  Balance(static_cast<int32_t>(size - size_));
}

void WorkerManager::AddWorker(const std::shared_ptr<Worker>& worker) {
  workers_.push_back(worker);
  Balance(1);
}

void WorkerManager::Balance(int32_t increase_worker_count) {
  if (increase_worker_count > 0) {
    auto size = static_cast<int32_t>(size_) + increase_worker_count;
    // save all runners that need to be reallocated
    std::list<std::vector<std::shared_ptr<TaskRunner>>> groups;
    std::vector<uint32_t> cur_worker_group(static_cast<size_t>(size)); // 记录每个worker包含groups数量
    uint32_t groups_size = 0; // 所有worker含有的groups总大小
    for (uint32_t i = 0; i < size_; ++i) {
      groups_size += workers_[i]->GetRunningGroupSize();
      groups.splice(groups.end(), workers_[i]->RetainActiveAndUnschedulable());
      cur_worker_group[i] = workers_[i]->GetRunningGroupSize();
    }

    auto resize_group_size = static_cast<uint32_t>(std::ceil(groups_size / static_cast<uint32_t>(size)));
    // 调整后每个worker拥有的groups数量
    index_ = static_cast<int32_t>(size_);
    auto groups_it = groups.begin();
    // 从新增的worker开始，此时其上没有groups，可以让任务尽快运行
    for (auto i = index_; i < index_ + size; ++i) {
      auto index = i;
      if (i >= size) {
        index = i % size;
      }
      auto worker = workers_[static_cast<size_t>(index)];
      auto cnt = resize_group_size - cur_worker_group[static_cast<size_t>(index)]; // 该worker还能增加的groups数量
      std::list<std::vector<std::shared_ptr<TaskRunner>>> list;
      if (cnt >= 0 && static_cast<size_t>(cnt) < groups.size()) {
        auto end_it = groups.begin();
        std::advance(end_it, static_cast<int32_t>(cnt));
        list.splice(list.begin(), groups, groups_it, end_it);
      } else {
        list.splice(list.begin(), groups, groups_it, groups.end());
      }

      for (auto &item : list) {
        for (auto &runner: item) {
          auto id = runner->GetId();
          auto orig_worker = runner->worker_.lock();
          FOOTSTONE_CHECK(orig_worker);
          WorkerManager::MoveTaskRunnerSpecificNoLock(id, orig_worker, worker);
        }
      }
      worker->Bind(list);
      groups_it = groups.begin();
    }
    size_ = static_cast<uint32_t>(size);
  } else if (increase_worker_count < 0) {
    auto size = static_cast<int32_t>(size_) + increase_worker_count;
    FOOTSTONE_DCHECK(size > 0);
    if (size <= 0) {
      return;
    }
    std::list<std::vector<std::shared_ptr<TaskRunner>>> groups;
    int32_t reduce_size = 0 - increase_worker_count; // 需要删减的线程数
    for (auto i = size_ - 1; i > 0 || reduce_size > 0; --i) {
      // 如果线程有不可调度TaskRunner则该线程不能终止
      if (workers_[static_cast<size_t>(i)]->HasUnschedulableRunner()) {
        continue;
      }
      groups.splice(groups.end(), workers_[static_cast<size_t>(i)]->UnBind());
      --reduce_size;
    }
    FOOTSTONE_DCHECK(!reduce_size) << "resize failed, The thread has too many unschedulable runners";
    if (reduce_size > 0) {
      return;
    }
    for (auto i = 0; i < size; ++i) {
      groups.splice(groups.end(), workers_[static_cast<uint32_t>(i)]->RetainActiveAndUnschedulable());
    }

    if (index_ >= size || index_ < 0) {
      index_ = 0;
    }

    auto it = groups.begin();
    while (it != groups.end()) {
      auto group = *it;
      auto new_worker = workers_[static_cast<size_t>(index_)];
      new_worker->Bind(*it);
      for (auto &vec_it : group) {
        const auto &runner = vec_it;
        auto id = runner->GetId();
        auto orig_worker = runner->worker_.lock();
        if (orig_worker) {
          new_worker->UpdateSpecificKeys(id, orig_worker->GetMovedSpecificKeys(id));
          new_worker->UpdateSpecific(id, orig_worker->GetMovedSpecific(id));
        }
        runner->worker_ = new_worker;
      }
      index_ = (index_ == size - 1) ? 0 : (1 + index_);
      ++it;
    }
    for (auto i = size_ - 1; static_cast<int32_t>(i) > size - 1; --i) {
      // handle running runner on thread
      workers_[i]->Terminate();
      workers_.pop_back();
    }
    size_ = static_cast<uint32_t>(size);
  } else { // increase_worker_count = 0
    std::list<std::vector<std::shared_ptr<TaskRunner>>> groups;
    std::vector<uint32_t> cur_worker_group(size_); // 记录每个worker包含groups数量
    uint32_t groups_size = 0; // 所有worker含有的groups总大小
    for (uint32_t i = 0; i < size_; ++i) {
      groups_size += workers_[i]->GetRunningGroupSize();
      groups.splice(groups.end(), workers_[i]->RetainActiveAndUnschedulable());
      cur_worker_group[i] = workers_[i]->GetRunningGroupSize();
    }
    auto resize_group_size = static_cast<uint32_t>(std::ceil(groups_size / size_)); // 调整后每个worker拥有的groups数量
    auto groups_it = groups.begin();
    for (uint32_t i = 0; i < size_; ++i) {
      auto worker = workers_[i];
      auto cnt = static_cast<int32_t>(resize_group_size - cur_worker_group[i]); // 该worker还能增加的groups数量
      if (cnt <= 0) {
        continue;
      }
      std::list<std::vector<std::shared_ptr<TaskRunner>>> list;
      if (static_cast<uint32_t>(cnt) < groups.size()) {
        auto end_it = groups.begin();
        std::advance(end_it, cnt);
        list.splice(list.begin(), groups, groups_it, end_it);
      } else {
        list.splice(list.begin(), groups, groups_it, groups.end());
      }

      for (auto &item : list) {
        for (auto &runner: item) {
          auto id = runner->GetId();
          auto orig_worker = runner->worker_.lock();
          FOOTSTONE_CHECK(orig_worker);
          WorkerManager::MoveTaskRunnerSpecificNoLock(id, orig_worker, worker);
        }
      }
      worker->Bind(list);
      if (groups.empty()) {
        return;
      }
      groups_it = groups.begin();
    }
  }
}

std::shared_ptr<TaskRunner> WorkerManager::CreateTaskRunner(const std::string& name) {
  return CreateTaskRunner(kDefaultGroupId, kDefaultPriority, true, name);
}

std::shared_ptr<TaskRunner> WorkerManager::CreateTaskRunner(uint32_t group_id,
                                                            uint32_t priority,
                                                            bool is_schedulable,
                                                            const std::string &name) {
  auto task_runner = std::make_shared<TaskRunner>(group_id, priority, is_schedulable, name);
  if (is_schedulable) {
    if (group_id != kDefaultGroupId) {
      for (const auto &worker: workers_) {
        if (worker->GetGroupId() == group_id) {
          task_runner->worker_ = worker;
          worker->Bind(std::vector<std::shared_ptr<TaskRunner>>{task_runner});
          return task_runner;
        }
      }
      std::shared_ptr<Worker> worker;
      {
        std::lock_guard<std::mutex> lock(mutex_);
        worker = workers_[static_cast<size_t>(index_)];
        index_ = (index_ == static_cast<int32_t>(size_ - 1)) ? 0 : (1 + index_);
      }
      task_runner->worker_ = worker;
      worker->Bind(std::vector<std::shared_ptr<TaskRunner>>{task_runner});
    } else {
      AddTaskRunner(task_runner);
    }
  }
  return task_runner;
}

void WorkerManager::RemoveTaskRunner(const std::shared_ptr<TaskRunner> &runner) {
  std::lock_guard<std::mutex> lock(mutex_);
  for (auto &worker : workers_) {
    worker->UnBind(runner);
  }
}

void WorkerManager::AddTaskRunner(std::shared_ptr<TaskRunner> runner) {
  std::vector<std::shared_ptr<TaskRunner>> group{std::move(runner)};

  std::lock_guard<std::mutex> lock(mutex_);
  auto worker = workers_[static_cast<size_t>(index_)];
  for (auto &r : group) {
    r->worker_ = worker;
  }
  worker->Bind(group);
  UpdateWorkerSpecific(worker, group);
  index_ = (index_ == static_cast<int32_t>(size_ - 1)) ? 0 : (1 + index_);
}

void WorkerManager::UpdateWorkerSpecific(const std::shared_ptr<Worker> &worker,
                                         const std::vector<std::shared_ptr<TaskRunner>> &group) {
  for (auto &it : group) {
    it->worker_ = worker;
    std::array<Worker::WorkerKey, Worker::kWorkerKeysMax> keys_array;
    worker->UpdateSpecificKeys(it->GetId(), std::move(keys_array));
    std::array<void *, Worker::kWorkerKeysMax> specific_array{};
    worker->UpdateSpecific(it->GetId(), specific_array);
  }
}

} // namespace runner
} // namespace footstone
