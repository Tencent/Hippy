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

#include "include/footstone/worker.h"

#include <algorithm>
#include <array>
#include <atomic>
#include <map>
#include <utility>

#include "include/footstone/check.h"
#include "include/footstone/cv_driver.h"
#include "include/footstone/logging.h"
#include "include/footstone/worker_manager.h"

#ifdef ANDROID
#include "include/footstone/platform/adr/looper_driver.h"
#elif defined __APPLE__
#include "include/footstone/platform/ios/looper_driver.h"
#endif

namespace footstone {
inline namespace runner {

std::atomic<uint32_t> global_worker_id{1};
thread_local uint32_t local_worker_id;
thread_local bool is_task_running = false;
thread_local std::shared_ptr<TaskRunner> local_runner;
thread_local std::vector<std::shared_ptr<TaskRunner>> curr_group;

Worker::Worker(std::string name, bool is_schedulable, std::unique_ptr<Driver> driver)
    : thread_(),
      name_(std::move(name)),
      min_wait_time_(TimeDelta::Max()),
      next_task_time_(TimePoint::Max()),
      need_balance_(false),
      is_stacking_mode_(false),
      has_migration_data_(false),
      is_schedulable_(is_schedulable),
      group_id_(0),
      driver_(std::move(driver)) {
}

Worker::~Worker() {
  FOOTSTONE_CHECK(!driver_->IsTerminated()) << "Terminate function must be called before destruction";
  Worker::WorkerDestroySpecifics();
}

uint32_t Worker::GetCurrentWorkerId() { return local_worker_id; }
std::shared_ptr<TaskRunner> Worker::GetCurrentTaskRunner() {
  FOOTSTONE_CHECK(is_task_running) << "GetCurrentTaskRunner cannot be run outside of the task ";

  return local_runner;
}

bool Worker::HasUnschedulableRunner() {
  std::lock_guard<std::mutex> lock(running_mutex_);
  for (const auto &group: running_group_list_) {
    for (const auto &runner: group) {
      if (!runner->IsSchedulable()) {
        return true;
      }
    }
  }
  return false;
}

void Worker::BalanceNoLock() {
  if (pending_group_list_.empty()) {
    return;
  }

  TimeDelta time;  // default 0
  auto running_it = running_group_list_.begin();
  if (running_it != running_group_list_.end()) {
    time = running_it->front()->GetTime();
  }
  // 等待队列初始化为当前优先级最高taskRunner运行时间
  for (auto &group : pending_group_list_) {
    for (auto &runner : group) {
      runner->SetTime(time);
    }
  }
  // 新的taskRunner插入到最高优先级之后，既可以保证原有队列执行顺序不变，又可以使得未执行的TaskRunner优先级高
  running_group_list_.splice(running_it, pending_group_list_);
}

bool Worker::RunTask() {
  auto task = GetNextTask();
  if (task) {
    TimePoint begin = TimePoint::Now();
    is_task_running = true;
    task->Run();
    is_task_running = false;
    for (auto &it : curr_group) {
      it->AddTime(TimePoint::Now() - begin);
    }
  } else if (driver_->IsTerminated()) {
    return false;
  }
  return true;
}

void Worker::Start(bool in_new_thread) {
  driver_->SetUnit([weak_self = GetSelf()]() -> bool {
    auto self = weak_self.lock();
    if (self) {
      return self->RunTask();
    }
    return false;
  });
  if (in_new_thread) {
    thread_ = std::thread([this]() -> void {
      SetName(name_);
      driver_->Start();
    });
  } else {
    driver_->Start();
  }
}

void Worker::SortNoLock() { // sort后优先级越高的TaskRunner分组距离队列头部越近
  if (!running_group_list_.empty()) {
    running_group_list_.sort([](const auto &lhs, const auto &rhs) {
      FOOTSTONE_CHECK(!lhs.empty() && !rhs.empty());
      // 运行时间越短优先级越高，priority越小优先级越高
      int64_t left = lhs[0]->GetPriority() * lhs[0]->GetTime().ToNanoseconds();
      int64_t right = rhs[0]->GetPriority() * rhs[0]->GetTime().ToNanoseconds();
      if (left < right) {
        return true;
      }
      return false;
    });
  }
}

void Worker::Notify() {
  driver_->Notify();
}

void Worker::Terminate() {
  driver_->Terminate();
}

void Worker::BindGroup(uint32_t father_id, const std::shared_ptr<TaskRunner> &child) {
  std::lock_guard<std::mutex> running_lock(running_mutex_);
  std::list<std::vector<std::shared_ptr<TaskRunner>>>::iterator group_it;
  bool has_found = false;
  for (group_it = running_group_list_.begin(); group_it != running_group_list_.end(); ++group_it) {
    for (auto &runner_it : *group_it) {
      if (runner_it->GetId() == father_id) {
        has_found = true;
        break;
      }
    }
    if (has_found) {
      break;
    }
  }
  if (!has_found) {
    std::lock_guard<std::mutex> balance_lock(pending_mutex_);
    for (group_it = pending_group_list_.begin(); group_it != pending_group_list_.end(); ++group_it) {
      for (auto &runner_it : *group_it) {
        if (runner_it->GetId() == father_id) {
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

void Worker::Bind(std::vector<std::shared_ptr<TaskRunner>> group) {
  {
    std::lock_guard<std::mutex> lock(pending_mutex_);

    auto group_id = group[0]->GetGroupId();
    if (group_id != kDefaultGroupId) {
      group_id_ = group_id;
    }
    pending_group_list_.insert(pending_group_list_.end(), std::move(group));
  }
  need_balance_ = true;
  driver_->Notify();
}

void Worker::Bind(std::list<std::vector<std::shared_ptr<TaskRunner>>> list) {
  {
    std::lock_guard<std::mutex> lock(pending_mutex_);
    pending_group_list_.splice(pending_group_list_.end(), list);
  }
  need_balance_ = true;
  driver_->Notify();
}

bool EraseRunnerNoLock(std::list<std::vector<std::shared_ptr<TaskRunner>>>& list,
                       const std::shared_ptr<TaskRunner> &runner) {
  for (auto group_it = list.begin(); group_it != list.end(); ++group_it) {
    for (auto runner_it = group_it->begin(); runner_it != group_it->end(); ++runner_it) {
      if ((*runner_it)->GetId() == runner->GetId()) {
        group_it->erase(runner_it);
        if (group_it->empty()) {
          list.erase(group_it);
        }
        return true;
      }
    }
  }
  return false;
}

void Worker::UnBind(const std::shared_ptr<TaskRunner> &runner) {
  std::vector<std::shared_ptr<TaskRunner>> group;
  bool has_found;
  {
    std::lock_guard<std::mutex> running_lock(running_mutex_);
    has_found = EraseRunnerNoLock(running_group_list_, runner);
  }

  if (!has_found) {
    {
      std::lock_guard<std::mutex> balance_lock(pending_mutex_);
      EraseRunnerNoLock(pending_group_list_, runner);
    }
  }
}

uint32_t Worker::GetRunningGroupSize() {
  std::lock_guard<std::mutex> lock(running_mutex_);
  return checked_numeric_cast<size_t, uint32_t>(running_group_list_.size());
}

std::list<std::vector<std::shared_ptr<TaskRunner>>> Worker::UnBind() {
  std::list<std::vector<std::shared_ptr<TaskRunner>>> ret;
  {
    std::lock_guard<std::mutex> lock(running_mutex_);
    ret.splice(ret.end(), running_group_list_);
  }
  {
    std::lock_guard<std::mutex> lock(pending_mutex_);
    ret.splice(ret.end(), pending_group_list_);
  }

  return ret;
}

std::list<std::vector<std::shared_ptr<TaskRunner>>> Worker::ReleasePending() {
  std::lock_guard<std::mutex> lock(pending_mutex_);

  std::list<std::vector<std::shared_ptr<TaskRunner>>> ret(std::move(pending_group_list_));
  pending_group_list_ = {};
  return ret;
}

std::list<std::vector<std::shared_ptr<TaskRunner>>> Worker::RetainActiveAndUnschedulable() {
  std::list<std::vector<std::shared_ptr<TaskRunner>>> ret;
  {
    std::lock_guard<std::mutex> lock(running_mutex_);
    for (auto group_it = running_group_list_.begin(); group_it != running_group_list_.end(); ++group_it) {
      if (group_it == running_group_list_.begin()) {
        continue;
      }
      bool has_unschedulable = false;
      for (auto &runner : *group_it) {
        if (runner->IsSchedulable()) {
          has_unschedulable = true;
          break;
        }
      }
      if (has_unschedulable) {
        continue;
      }
      ret.splice(ret.end(), running_group_list_, group_it);
    }
  }
  {
    std::lock_guard<std::mutex> lock(pending_mutex_);
    ret.splice(ret.end(), pending_group_list_);
  }

  return ret;
}

std::list<std::vector<std::shared_ptr<TaskRunner>>> Worker::Retain(
    const std::shared_ptr<TaskRunner> &runner) {
  std::lock_guard<std::mutex> lock(running_mutex_);

  std::vector<std::shared_ptr<TaskRunner>> group;
  for (auto group_it = running_group_list_.begin(); group_it != running_group_list_.end(); ++group_it) {
    for (auto runner_it = group_it->begin(); runner_it != group_it->end(); ++runner_it) {
      if ((*runner_it)->GetId() == runner->GetId()) {
        group = *group_it;
        running_group_list_.erase(group_it);
        break;
      }
    }
  }

  std::list<std::vector<std::shared_ptr<TaskRunner>>> ret(std::move(running_group_list_));
  running_group_list_ = {group};
  return ret;
}

void Worker::AddImmediateTask(std::unique_ptr<Task> task) {
  std::lock_guard<std::mutex> lock(running_mutex_);

  immediate_task_queue_.push(std::move(task));
}

template <class F>
auto MakeCopyable(F&& f) {
  auto s = std::make_shared<std::decay_t<F>>(std::forward<F>(f));
  return [s](auto&&... args) -> decltype(auto) {
    return (*s)(decltype(args)(args)...);
  };
}

std::unique_ptr<Task> Worker::GetNextTask() {
  if (driver_->IsTerminated()) {
    return nullptr;
  }
  {
    std::lock_guard<std::mutex> lock(running_mutex_);
    if (!immediate_task_queue_.empty()) {
      std::unique_ptr<Task> task = std::move(immediate_task_queue_.front());
      immediate_task_queue_.pop();
      return task;
    }
    if (running_group_list_.size() > 1) {
      SortNoLock();
    }
  }

  if (need_balance_) {
    {
      std::scoped_lock lock(running_mutex_, pending_mutex_);
      BalanceNoLock();
    }
    need_balance_ = false;
  }

  TimeDelta last_wait_time;
  TimePoint now = TimePoint::Now();
  std::unique_ptr<IdleTask> idle_task;
  for (auto &running_group : running_group_list_) {
    auto runner = running_group.back(); // group栈顶会阻塞下面的taskRunner执行
    auto task = runner->GetNext();
    if (task) {
      curr_group = running_group; // curr_group只会在当前线程获取，因此不需要加锁
      local_runner = runner;
      return task;
    } else {
      if (!idle_task) {
        idle_task = running_group.front()->PopIdleTask();
      }
      last_wait_time = running_group.front()->GetNextTimeDelta(now);
      if (min_wait_time_ > last_wait_time) {
        min_wait_time_ = last_wait_time;
        next_task_time_ = now + min_wait_time_;
      }
    }
  }
  if (idle_task) {
    auto wrapper_idle_task = std::make_unique<Task>(
        MakeCopyable([task = std::move(idle_task), time = min_wait_time_]() {
          IdleTask::IdleCbParam param = {
              .did_time_out =  false,
              .res_time =  time
          };
          task->Run(param);
        }));
    return wrapper_idle_task;
  }
  driver_->WaitFor(min_wait_time_);
  return nullptr;
}

bool Worker::IsTaskRunning() { return is_task_running; }

// 返回值小于0表示失败
int32_t Worker::WorkerKeyCreate(uint32_t task_runner_id,
                                const std::function<void(void *)> &destruct) {
  auto map_it = worker_key_map_.find(task_runner_id);
  if (map_it == worker_key_map_.end()) {
    return -1;
  }
  auto array = map_it->second;
  for (size_t i = 0; i < array.size(); ++i) {
    if (!array[i].is_used) {
      array[i].is_used = true;
      array[i].destruct = destruct;

      return checked_numeric_cast<size_t, int32_t>(i);
    }
  }
  return -1;
}

bool Worker::WorkerKeyDelete(uint32_t task_runner_id, int32_t key) {
  auto map_it = worker_key_map_.find(task_runner_id);
  if (map_it == worker_key_map_.end()) {
    return false;
  }
  auto array = map_it->second;
  if (key < 0 || static_cast<size_t>(key) >= array.size() || !array[static_cast<size_t>(key)].is_used) {
    return false;
  }
  array[static_cast<size_t>(key)].is_used = false;
  array[static_cast<size_t>(key)].destruct = nullptr;
  return true;
}

bool Worker::WorkerSetSpecific(uint32_t task_runner_id, int32_t key, void *p) {
  auto map_it = specific_map_.find(task_runner_id);
  if (map_it == specific_map_.end()) {
    return false;
  }
  auto array = map_it->second;
  if (key < 0 || static_cast<size_t>(key) >= array.size()) {
    return false;
  }
  array[static_cast<size_t>(key)] = p;
  return true;
}

void *Worker::WorkerGetSpecific(uint32_t task_runner_id, int32_t key) {
  auto map_it = specific_map_.find(task_runner_id);
  if (map_it == specific_map_.end()) {
    return nullptr;
  }
  auto array = map_it->second;
  if (key < 0 || static_cast<size_t>(key) >= array.size()) {
    return nullptr;
  }
  return array[static_cast<size_t>(key)];
}

void Worker::WorkerDestroySpecific(uint32_t task_runner_id) {
  WorkerDestroySpecificNoLock(task_runner_id);
}

void Worker::WorkerDestroySpecificNoLock(uint32_t task_runner_id) {
  auto key_array_it = worker_key_map_.find(task_runner_id);
  auto specific_it = specific_map_.find(task_runner_id);
  if (key_array_it == worker_key_map_.end() || specific_it == specific_map_.end()) {
    return;
  }
  auto key_array = key_array_it->second;
  auto specific_array = specific_it->second;
  for (size_t i = 0; i < specific_array.size(); ++i) {
    auto destruct = key_array[i].destruct;
    void *data = specific_array[i];
    if (destruct != nullptr && data != nullptr) {
      destruct(data);
    }
  }
  worker_key_map_.erase(key_array_it);
  specific_map_.erase(specific_it);
}

void Worker::WorkerDestroySpecifics() {
  for (auto map_it = specific_map_.begin(); map_it != specific_map_.end();) {
    auto next = ++map_it;
    Worker::WorkerDestroySpecificNoLock(map_it->first);
    map_it = next;
  }
}

std::array<Worker::WorkerKey, Worker::kWorkerKeysMax> Worker::GetMovedSpecificKeys(
    uint32_t task_runner_id) {
  auto it = worker_key_map_.find(task_runner_id);
  if (it != worker_key_map_.end()) {
    auto ret = std::move(it->second);
    worker_key_map_.erase(it);
    return ret;
  }
  return std::array<Worker::WorkerKey, Worker::kWorkerKeysMax>();
}

void Worker::UpdateSpecificKeys(uint32_t task_runner_id,
                                std::array<WorkerKey, Worker::kWorkerKeysMax> array) {
  worker_key_map_[task_runner_id] = std::move(array);  // insert or update
}

std::array<void *, Worker::kWorkerKeysMax> Worker::GetMovedSpecific(uint32_t task_runner_id) {
  auto it = specific_map_.find(task_runner_id);
  if (it != specific_map_.end()) {
    auto ret = it->second;
    specific_map_.erase(it);
    return ret;
  }
  return std::array<void *, Worker::kWorkerKeysMax>();
}

void Worker::UpdateSpecific(uint32_t task_runner_id,
                            std::array<void *, Worker::kWorkerKeysMax> array) {
  specific_map_[task_runner_id] = array;  // insert or update
}

} // namespace runner
} // namespace footstone
