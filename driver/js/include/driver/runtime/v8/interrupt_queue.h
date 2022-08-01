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

#pragma once

#include <atomic>
#include <memory>
#include <mutex>
#include <queue>

#include "footstone/task.h"
#include "footstone/task_runner.h"
#include "footstone/persistent_object_map.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wconversion"
#include "v8/v8.h"
#pragma clang diagnostic pop

namespace hippy {
inline namespace runtime {

class InterruptQueue: public std::enable_shared_from_this<InterruptQueue> {
 public:
  using Task = footstone::Task;
  using TaskRunner = footstone::TaskRunner;
  using PersistentObjectMap = footstone::PersistentObjectMap<uint32_t, std::shared_ptr<InterruptQueue>>;

  InterruptQueue(v8::Isolate* isolate_);
  ~InterruptQueue() = default;

  inline uint32_t GetId() { return id_; }

  inline void SetTaskRunner(std::shared_ptr<TaskRunner> task_runner) {
    task_runner_ = task_runner;
  }

  void PostTask(std::unique_ptr<Task> task);
  template<typename F, typename... Args>
  void PostTask(F &&f, Args... args) {
    auto packaged_task = std::make_shared<std::packaged_task<std::invoke_result_t<F, Args...>()>>(
        std::bind(std::forward<F>(f), std::forward<Args>(args)...));
    auto task = std::make_unique<Task>([packaged_task]() { (*packaged_task)(); });
    PostTask(std::move(task));
  }
  void Run();

  static inline PersistentObjectMap& GetPersistentMap() {
    return persistent_map_;
  }

 private:
  uint32_t id_;
  v8::Isolate* isolate_;
  std::queue<std::unique_ptr<Task>> task_queue_;
  std::mutex queue_mutex_;
  std::shared_ptr<TaskRunner> task_runner_;

  static std::atomic<uint32_t> g_id;
  static PersistentObjectMap persistent_map_;
};

}
}
