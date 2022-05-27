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

#include <condition_variable>
#include <functional>
#include <future>
#include <memory>
#include <mutex>
#include <queue>
#include <stdexcept>
#include <thread>
#include <utility>
#include <vector>

namespace dynamic_framework {
class ThreadPool {
 public:
  explicit ThreadPool(size_t);
  template <class F, class... Args>
  auto Enqueue(F&& f, Args&&... args) -> std::future<typename std::result_of<F(Args...)>::type>;
  ~ThreadPool();

 private:
  // 工作线程池
  std::vector<std::thread> workers_;
  // 任务池
  std::queue<std::function<void()>> tasks_;

  // synchronization
  std::mutex queue_mutex_;
  std::condition_variable condition_;
  bool stop_;
};

// the constructor just launches some amount of workers
inline ThreadPool::ThreadPool(size_t threads) : stop_(false) {
  for (size_t i = 0; i < threads; ++i)
    workers_.emplace_back([this] {
      for (;;) {
        std::function<void()> task;

        {
          std::unique_lock<std::mutex> lock(this->queue_mutex_);
          this->condition_.wait(lock, [this] { return this->stop_ || !this->tasks_.empty(); });
          if (this->stop_ && this->tasks_.empty()) return;
          task = std::move(this->tasks_.front());
          this->tasks_.pop();
        }

        task();
      }
    });
}

// add new work item to the pool
template <class F, class... Args>
auto ThreadPool::Enqueue(F&& f, Args&&... args) -> std::future<typename std::result_of<F(Args...)>::type> {
  using return_type = typename std::result_of<F(Args...)>::type;

  auto task =
      std::make_shared<std::packaged_task<return_type()>>(std::bind(std::forward<F>(f), std::forward<Args>(args)...));

  std::future<return_type> res = task->get_future();
  {
    std::unique_lock<std::mutex> lock(queue_mutex_);

    // don't allow enqueueing after stopping the pool
    if (stop_) throw std::runtime_error("enqueue on stopped ThreadPool");

    tasks_.emplace([task]() { (*task)(); });
  }
  condition_.notify_one();
  return res;
}

// the destructor joins all threads
inline ThreadPool::~ThreadPool() {
  {
    std::unique_lock<std::mutex> lock(queue_mutex_);
    stop_ = true;
  }
  condition_.notify_all();
  for (std::thread& worker : workers_) worker.join();
}

}  // namespace dynamic_framework
