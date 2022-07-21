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

#pragma once

#include <mutex>

#include "src/task_runner.h"
#include "src/worker.h"

namespace footstone {
inline namespace runner {

class WorkerManager {
 public:
  explicit WorkerManager(uint32_t size);
  ~WorkerManager();

  WorkerManager(WorkerManager&) = delete;
  WorkerManager& operator=(WorkerManager&) = delete;

  void Terminate();
  void Resize(uint32_t size);
  void AddWorker(const std::shared_ptr<Worker>& worker);
  std::shared_ptr<TaskRunner> CreateTaskRunner(const std::string &name = "");
  std::shared_ptr<TaskRunner> CreateTaskRunner(uint32_t group_id = 0, uint32_t priority = 1,
                                               bool is_schedulable = true, const std::string &name = "");
  void AddTaskRunner(std::shared_ptr<TaskRunner> runner);
  void RemoveTaskRunner(const std::shared_ptr<TaskRunner>& runner);

 private:
  friend class Profile;
  static void MoveTaskRunnerSpecificNoLock(uint32_t runner_id,
                                           const std::shared_ptr<Worker>& from,
                                           const std::shared_ptr<Worker>& to);

  void CreateWorkers(uint32_t size);
  static void UpdateWorkerSpecific(const std::shared_ptr<Worker>& worker,
                            const std::vector<std::shared_ptr<TaskRunner>>& group);
  void Balance(int32_t increase_worker_count);

  std::vector<std::shared_ptr<Worker>> workers_;
  std::vector<std::shared_ptr<TaskRunner>> runners_;

  int32_t index_;
  uint32_t size_;
  std::mutex mutex_;
};

}  // namespace runner
}  // namespace footstone
