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

#include <memory>
#include <mutex>
#include <string>
#include <vector>

#include "devtools_base/common/task_runner.h"
#include "devtools_base/common/thread.h"
#include "devtools_base/common/worker.h"

namespace hippy::devtools {
inline namespace runner {
class WorkerPool {
 public:
  static std::shared_ptr<WorkerPool> GetInstance(int size);
  explicit WorkerPool(int size);
  ~WorkerPool();
  void Terminate();
  void Resize(int size);
  std::shared_ptr<TaskRunner> CreateTaskRunner(bool is_excl = false, int priority = 1, const std::string& name = "");
  void RemoveTaskRunner(std::shared_ptr<TaskRunner> runner);

 private:
  friend class Profile;
  void CreateWorker(int size, bool is_excl = false);
  void BindWorker(std::shared_ptr<Worker> worker, std::vector<std::shared_ptr<TaskRunner>> group);
  void AddTaskRunner(std::shared_ptr<TaskRunner> runner);

  static std::mutex creation_mutex_;
  static std::shared_ptr<WorkerPool> instance_;

  std::vector<std::shared_ptr<Worker>> excl_workers_;
  std::vector<std::shared_ptr<Worker>> workers_;
  std::vector<std::shared_ptr<TaskRunner>> runners_;

  int index_;
  int size_;
  std::mutex mutex_;

  TDF_BASE_DISALLOW_COPY_AND_ASSIGN(WorkerPool);
};
}  // namespace runner
}  // namespace hippy::devtools
