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

#include "devtools_base/common/worker.h"

#include <algorithm>
#include <array>
#include <atomic>
#include <map>

#include "devtools_base/logging.h"
#include "devtools_base/common/worker_pool.h"

namespace hippy {
namespace devtools {
inline namespace runner {
std::atomic<int32_t> global_worker_id{0};
thread_local int32_t local_worker_id;
thread_local bool is_task_running = false;
thread_local std::shared_ptr<TaskRunner> local_runner;

Worker::Worker(const std::string& name) : Thread(name), name_(name), is_terminated_(false), is_stacking_mode_(false) {
  cv_ = std::make_shared<std::condition_variable>();
}

Worker::~Worker() { Worker::WorkerDestroySpecifics(); }

int32_t Worker::GetCurrentWorkerId() { return local_worker_id; }
std::shared_ptr<TaskRunner> Worker::GetCurrentTaskRunner() {
  if (is_task_running) {
    return local_runner;
  }
  return nullptr;
}

void Worker::Balance() {
  // running_mutex_ has locked before balance
  std::lock_guard<std::mutex> lock(balance_mutex_);

  if (pending_groups_.empty()) {
    return;
  }

  TimeDelta time;  // default 0
  if (!running_groups_.empty()) {
    // Sort is executed before balance
    time = running_groups_.front().at(0)->GetTime();
  }
  for (auto it = pending_groups_.begin(); it != pending_groups_.end(); ++it) {
    auto group = *it;
    for (auto group_it = it->begin(); group_it != it->end(); ++group_it) {
      (*group_it)->SetTime(time);
    }
  }
  running_groups_.splice(running_groups_.end(), pending_groups_);
  // The first taskrunner still has the highest priority
}

void Worker::RunTask() {
  auto task = GetNextTask();
  if (task) {
    TimePoint begin = TimePoint::Now();
    is_task_running = true;
    task->Run();
    is_task_running = false;
    for (auto it = curr_group_.begin(); it != curr_group_.end(); ++it) {
      (*it)->AddTime(TimePoint::Now() - begin);
    }
  }
}

void Worker::Run() {
  local_worker_id = global_worker_id.fetch_add(1);
  BACKEND_LOGE(TDF_BACKEND, "local_worker_id = %d", local_worker_id);
  while (!is_terminated_) {
    RunTask();
  }
}

void Worker::Sort() {
  if (!running_groups_.empty()) {
    running_groups_.sort([](const auto& lhs, const auto& rhs) {
//      TDF_BASE_DCHECK(!lhs.empty() && !rhs.empty());
      int64_t left = lhs[0]->GetPriority() * lhs[0]->GetTime().ToNanoseconds();
      int64_t right = rhs[0]->GetPriority() * rhs[0]->GetTime().ToNanoseconds();
      if (left < right) {
        return true;
      }
      return false;
    });
  }
}

void Worker::Terminate() {
  is_terminated_ = true;
  cv_->notify_one();
  Join();
}

void Worker::BindGroup(int father_id, std::shared_ptr<TaskRunner> child) {
  std::lock_guard<std::mutex> lock(running_mutex_);
  std::list<std::vector<std::shared_ptr<TaskRunner>>>::iterator group_it;
  bool has_found = false;
  for (group_it = running_groups_.begin(); group_it != running_groups_.end(); ++group_it) {
    for (auto runner_it = group_it->begin(); runner_it != group_it->end(); ++runner_it) {
      if ((*runner_it)->GetId() == father_id) {
        has_found = true;
        break;
      }
    }
    if (has_found) {
      break;
    }
  }
  if (!has_found) {
    std::lock_guard<std::mutex> lock(balance_mutex_);
    for (group_it = pending_groups_.begin(); group_it != pending_groups_.end(); ++group_it) {
      for (auto runner_it = group_it->begin(); runner_it != group_it->end(); ++runner_it) {
        if ((*runner_it)->GetId() == father_id) {
          has_found = true;
          break;
        }
      }
      if (has_found) {
        break;
      }
    }
  }
  group_it->push_back(child);
}

void Worker::Bind(std::vector<std::shared_ptr<TaskRunner>> runner) {
  std::lock_guard<std::mutex> lock(balance_mutex_);

  std::vector<std::shared_ptr<TaskRunner>> group{runner};
  pending_groups_.insert(pending_groups_.end(), group);
  need_balance_ = true;
  cv_->notify_one();
}

void Worker::Bind(std::list<std::vector<std::shared_ptr<TaskRunner>>> list) {
  std::lock_guard<std::mutex> lock(balance_mutex_);
  pending_groups_.splice(pending_groups_.end(), list);
  need_balance_ = true;
  cv_->notify_one();
}

void Worker::UnBind(std::shared_ptr<TaskRunner> runner) {
  std::lock_guard<std::mutex> lock(running_mutex_);

  std::vector<std::shared_ptr<TaskRunner>> group;
  bool has_found = false;
  for (auto group_it = running_groups_.begin(); group_it != running_groups_.end(); ++group_it) {
    for (auto runner_it = group_it->begin(); runner_it != group_it->end(); ++runner_it) {
      if ((*runner_it)->GetId() == runner->GetId()) {
        group_it->erase(runner_it);
        has_found = true;
        break;
      }
    }
    if (has_found) {
      break;
    }
  }
  if (!has_found) {
    std::lock_guard<std::mutex> lock(balance_mutex_);
    for (auto group_it = pending_groups_.begin(); group_it != pending_groups_.end(); ++group_it) {
      for (auto runner_it = group_it->begin(); runner_it != group_it->end(); ++runner_it) {
        if ((*runner_it)->GetId() == runner->GetId()) {
          group_it->erase(runner_it);
          has_found = true;
          break;
        }
      }
      if (has_found) {
        break;
      }
    }
  }
}

std::list<std::vector<std::shared_ptr<TaskRunner>>> Worker::UnBind() {
  std::list<std::vector<std::shared_ptr<TaskRunner>>> ret;
  {
    std::lock_guard<std::mutex> lock(running_mutex_);
    ret.splice(ret.end(), running_groups_);
  }
  {
    std::lock_guard<std::mutex> lock(balance_mutex_);
    ret.splice(ret.end(), pending_groups_);
  }

  return ret;
}

std::list<std::vector<std::shared_ptr<TaskRunner>>> Worker::ReleasePending() {
  std::lock_guard<std::mutex> lock(balance_mutex_);

  std::list<std::vector<std::shared_ptr<TaskRunner>>> ret(std::move(pending_groups_));
  pending_groups_ = std::list<std::vector<std::shared_ptr<TaskRunner>>>{};
  return ret;
}

std::list<std::vector<std::shared_ptr<TaskRunner>>> Worker::RetainActive() {
  std::lock_guard<std::mutex> lock(running_mutex_);
  std::list<std::vector<std::shared_ptr<TaskRunner>>> ret;
  auto group_it = running_groups_.begin();
  if (group_it != running_groups_.end()) {
    ++group_it;
    ret.splice(ret.end(), running_groups_, group_it, running_groups_.end());
  }

  ret.splice(ret.end(), pending_groups_);
  return ret;
}

std::list<std::vector<std::shared_ptr<TaskRunner>>> Worker::Retain(std::shared_ptr<TaskRunner> runner) {
  std::lock_guard<std::mutex> lock(running_mutex_);

  std::vector<std::shared_ptr<TaskRunner>> group;
  for (auto group_it = running_groups_.begin(); group_it != running_groups_.end(); ++group_it) {
    for (auto runner_it = group_it->begin(); runner_it != group_it->end(); ++runner_it) {
      if ((*runner_it)->GetId() == runner->GetId()) {
        group = *group_it;
        running_groups_.erase(group_it);
        break;
      }
    }
  }

  std::list<std::vector<std::shared_ptr<TaskRunner>>> ret(std::move(running_groups_));
  running_groups_ = std::list<std::vector<std::shared_ptr<TaskRunner>>>{group};
  return ret;
}

std::unique_ptr<Task> Worker::GetNextTask() {
  if (is_terminated_) {
    return nullptr;
  }

  std::unique_lock<std::mutex> lock(running_mutex_);

  Sort();
  if (need_balance_) {
    Balance();
    need_balance_ = false;
  }

  TimeDelta min_time, time;
  TimePoint now;
  for (auto it = running_groups_.begin(); it != running_groups_.end(); ++it) {
    std::shared_ptr<TaskRunner> runner = it->back();
    auto task = runner->GetNext();
    if (task) {
      curr_group_ = *it;
      local_runner = runner;
      return task;
    } else {
      if (now == TimePoint()) {  // uninitialized
        now = TimePoint::Now();
        min_time = TimeDelta::Max();
        time = min_time;
      }
      time = it->front()->GetNextTimeDelta(now);
      if (min_time > time) {
        min_time = time;
      }
    }
  }

  if (min_time != TimeDelta::Max() && min_time != TimeDelta::Zero()) {
    cv_->wait_for(lock, std::chrono::nanoseconds(min_time.ToNanoseconds()));
  } else {
    cv_->wait(lock);
  }
  return nullptr;
}

bool Worker::IsTaskRunning() { return is_task_running; }

// 返回值小于0表示失败
int32_t Worker::WorkerKeyCreate(int32_t task_runner_id, std::function<void(void*)> destruct) {
  std::lock_guard<std::mutex> lock(specific_mutex_);

  auto map_it = worker_key_map_.find(task_runner_id);
  if (map_it == worker_key_map_.end()) {
    return -1;
  }
  auto array = map_it->second;
  for (auto i = 0; i < array.size(); ++i) {
    if (!array[i].is_used) {
      array[i].is_used = true;
      array[i].destruct = destruct;
      return i;
    }
  }
  return -1;
}

bool Worker::WorkerKeyDelete(int32_t task_runner_id, int32_t key) {
  std::lock_guard<std::mutex> lock(specific_mutex_);

  auto map_it = worker_key_map_.find(task_runner_id);
  if (map_it == worker_key_map_.end()) {
    return false;
  }
  auto array = map_it->second;
  if (key >= array.size() || !array[key].is_used) {
    return false;
  }
  array[key].is_used = false;
  array[key].destruct = nullptr;
  return true;
}

bool Worker::WorkerSetSpecific(int32_t task_runner_id, int32_t key, void* p) {
  std::lock_guard<std::mutex> lock(specific_mutex_);

  auto map_it = specific_map_.find(task_runner_id);
  if (map_it == specific_map_.end()) {
    return false;
  }
  auto array = map_it->second;
  if (key >= array.size()) {
    return false;
  }
  array[key] = p;
  return true;
}

void* Worker::WorkerGetSpecific(int32_t task_runner_id, int32_t key) {
  std::lock_guard<std::mutex> lock(specific_mutex_);

  auto map_it = specific_map_.find(task_runner_id);
  if (map_it == specific_map_.end()) {
    return nullptr;
  }
  auto array = map_it->second;
  if (key >= array.size()) {
    return nullptr;
  }
  return array[key];
}

void Worker::WorkerDestroySpecific(int32_t task_runner_id) {
  std::lock_guard<std::mutex> lock(specific_mutex_);

  WorkerDestroySpecificNoLock(task_runner_id);
}

void Worker::WorkerDestroySpecificNoLock(int32_t task_runner_id) {
  auto key_array_it = worker_key_map_.find(task_runner_id);
  auto specific_it = specific_map_.find(task_runner_id);
  if (key_array_it == worker_key_map_.end() || specific_it == specific_map_.end()) {
    return;
  }
  auto key_array = key_array_it->second;
  auto specific_array = specific_it->second;
  for (auto i = 0; i < specific_array.size(); ++i) {
    auto destruct = key_array[i].destruct;
    void* data = specific_array[i];
    if (destruct != nullptr && data != nullptr) {
      destruct(data);
    }
  }
  worker_key_map_.erase(key_array_it);
  specific_map_.erase(specific_it);
}

void Worker::WorkerDestroySpecifics() {
  std::lock_guard<std::mutex> lock(specific_mutex_);

  for (auto map_it = specific_map_.begin(); map_it != specific_map_.end();) {
    auto next = ++map_it;
    Worker::WorkerDestroySpecificNoLock(map_it->first);
    map_it = next;
  }
}

std::array<Worker::WorkerKey, Worker::kWorkerKeysMax> Worker::GetMovedSpecificKeys(int32_t task_runner_id) {
  std::lock_guard<std::mutex> lock(specific_mutex_);

  auto it = worker_key_map_.find(task_runner_id);
  if (it != worker_key_map_.end()) {
    auto ret = std::move(it->second);
    worker_key_map_.erase(it);
    return ret;
  }
  return std::array<Worker::WorkerKey, Worker::kWorkerKeysMax>();
}

void Worker::UpdateSpecificKeys(int32_t task_runner_id, std::array<WorkerKey, Worker::kWorkerKeysMax> array) {
  std::lock_guard<std::mutex> lock(specific_mutex_);

  worker_key_map_[task_runner_id] = std::move(array);  // insert or update
}

std::array<void*, Worker::kWorkerKeysMax> Worker::GetMovedSpecific(int32_t task_runner_id) {
  std::lock_guard<std::mutex> lock(specific_mutex_);

  auto it = specific_map_.find(task_runner_id);
  if (it != specific_map_.end()) {
    auto ret = it->second;
    specific_map_.erase(it);
    return ret;
  }
  return std::array<void*, Worker::kWorkerKeysMax>();
}

void Worker::UpdateSpecific(int32_t task_runner_id, std::array<void*, Worker::kWorkerKeysMax> array) {
  std::lock_guard<std::mutex> lock(specific_mutex_);

  specific_map_[task_runner_id] = array;  // insert or update
}
}  // namespace runner
}  // namespace devtools
}  // namespace hippy
