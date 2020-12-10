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

#ifndef CORE_BASE_LOCK_QUEUE_H_
#define CORE_BASE_LOCK_QUEUE_H_

#include <stdio.h>
#include <condition_variable>  // NOLINT(build/c++11)
#include <mutex>               // NOLINT(build/c++11)
#include <queue>
#include <utility>

namespace hippy {
namespace base {

template <typename T>
class LockQueue {
 public:
  LockQueue() = default;
  ~LockQueue() = default;

 public:
  void push(T item) {
    std::lock_guard<std::mutex> lock(m_mutex);
    m_queue.push(std::move(item));
    m_cv.notify_one();
  }

  T pop() {
    std::unique_lock<std::mutex> lock(m_mutex);
    m_cv.wait(lock, [this]() { return !m_queue.empty(); });

    T item = std::move(m_queue.front());
    m_queue.pop();
    return item;
  }

  bool empty() {
    std::lock_guard<std::mutex> lock(m_mutex);
    return m_queue.empty();
  }

  void clear() {
    std::lock_guard<std::mutex> lock(m_mutex);

    std::queue<T> empty;
    std::swap(m_queue, empty);
  }

 private:
  std::queue<T> m_queue;
  std::mutex m_mutex;
  std::condition_variable m_cv;
};

}  // namespace base
}  // namespace hippy

#endif  // CORE_BASE_LOCK_QUEUE_H_
