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

#pragma once

#include <list>
#include <map>
#include <memory>
#include <string>
#include <vector>

#include "devtools_base/common/task.h"
#include "devtools_base/common/thread.h"

namespace hippy::devtools {
inline namespace runner {
class WorkerPool;
class TaskRunner;

class Worker : public Thread {
 public:
  static const int32_t kWorkerKeysMax = 32;
  struct WorkerKey {
    bool is_used = false;
    std::function<void(void *)> destruct = nullptr;
  };

  explicit Worker(const std::string &name = "");
  ~Worker();

  void Run();
  void Terminate();
  void BindGroup(int father_id, std::shared_ptr<TaskRunner> child);
  void Bind(std::vector<std::shared_ptr<TaskRunner>> runner);
  void Bind(std::list<std::vector<std::shared_ptr<TaskRunner>>> list);
  void UnBind(std::shared_ptr<TaskRunner> runner);
  std::list<std::vector<std::shared_ptr<TaskRunner>>> UnBind();
  std::list<std::vector<std::shared_ptr<TaskRunner>>> ReleasePending();
  std::list<std::vector<std::shared_ptr<TaskRunner>>> RetainActive();
  std::list<std::vector<std::shared_ptr<TaskRunner>>> Retain(std::shared_ptr<TaskRunner> runner);

  inline bool GetStackingMode() { return is_stacking_mode_; }
  inline void SetStackingMode(bool is_stacking_mode) { is_stacking_mode_ = is_stacking_mode; }

 private:
  friend class WorkerPool;
  friend class TaskRunner;

  void Balance();
  void Sort();
  void RunTask();
  std::unique_ptr<Task> GetNextTask();

  static int32_t GetCurrentWorkerId();
  static std::shared_ptr<TaskRunner> GetCurrentTaskRunner();
  static bool IsTaskRunning();
  int32_t WorkerKeyCreate(int32_t task_runner_id, std::function<void(void *)> destruct);
  bool WorkerKeyDelete(int32_t task_runner_id, int32_t key);
  bool WorkerSetSpecific(int32_t task_runner_id, int32_t key, void *p);
  void *WorkerGetSpecific(int32_t task_runner_id, int32_t key);
  void WorkerDestroySpecific(int32_t task_runner_id);
  void WorkerDestroySpecificNoLock(int32_t task_runner_id);
  void WorkerDestroySpecifics();
  std::array<WorkerKey, kWorkerKeysMax> GetMovedSpecificKeys(int32_t task_runner_id);
  void UpdateSpecificKeys(int32_t task_runner_id, std::array<WorkerKey, kWorkerKeysMax> array);
  std::array<void *, Worker::kWorkerKeysMax> GetMovedSpecific(int32_t task_runner_id);
  void UpdateSpecific(int32_t task_runner_id, std::array<void *, kWorkerKeysMax> array);

  std::vector<std::shared_ptr<TaskRunner>> curr_group_;
  std::list<std::vector<std::shared_ptr<TaskRunner>>> running_groups_;
  std::list<std::vector<std::shared_ptr<TaskRunner>>> pending_groups_;
  std::mutex running_mutex_;
  std::mutex balance_mutex_;
  std::mutex specific_mutex_;
  std::shared_ptr<std::condition_variable> cv_;

  std::map<int32_t, std::array<Worker::WorkerKey, Worker::kWorkerKeysMax>> worker_key_map_;
  std::map<int32_t, std::array<void *, Worker::kWorkerKeysMax>> specific_map_;
  bool need_balance_;
  bool is_terminated_;
  bool is_stacking_mode_;
  bool has_migration_data_;
  // debug
  std::string name_;
};
}  // namespace runner
}  // namespace devtools::devtools
