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

#include "driver/runtime/v8/interrupt_queue.h"

namespace hippy {
inline namespace driver {
inline namespace runtime {

std::atomic<uint32_t> InterruptQueue::g_id = 1;

InterruptQueue::PersistentObjectMap InterruptQueue::persistent_map_;

InterruptQueue::InterruptQueue(v8::Isolate* isolate): isolate_(isolate), task_queue_(), queue_mutex_() {
  id_ = g_id.fetch_add(1);
}

void InterruptQueue::PostTask(std::unique_ptr<Task> task) {
  {
    std::lock_guard<std::mutex> lock_guard(queue_mutex_);
    task_queue_.push(std::move(task));
  }

  if (task_runner_) {
    auto weak_self = weak_from_this();
    task_runner_->PostTask([weak_self]() {
      auto self = weak_self.lock();
      if (self) {
        self->Run();
      }
    });
  }
  isolate_->RequestInterrupt([](v8::Isolate* isolate, void* data) {
    auto& map = InterruptQueue::GetPersistentMap();
    auto index = static_cast<uint32_t>(reinterpret_cast<size_t>(data));
    std::shared_ptr<InterruptQueue> queue;
    auto flag = map.Find(index, queue);
    if (flag && queue) {
      queue->Run();
    }
  }, reinterpret_cast<void*>(id_));
}

void InterruptQueue::Run() {
  std::queue<std::unique_ptr<Task>> queue;
  {
    std::lock_guard<std::mutex> lock_guard(queue_mutex_);

    if (task_queue_.empty()) {
      return;
    }
    std::swap(queue, task_queue_);
  }
  while (!queue.empty()) {
    auto task = std::move(queue.front());
    queue.pop();
    task->Run();
  }
}

}
}
}
