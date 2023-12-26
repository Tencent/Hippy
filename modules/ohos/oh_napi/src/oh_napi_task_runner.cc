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

#include "oh_napi/oh_napi_task_runner.h"
#include <atomic>
#include <uv.h>
#include <napi/native_api.h>

namespace hippy {

OhNapiTaskRunner *OhNapiTaskRunner::Instance(napi_env env) {
  static OhNapiTaskRunner *sp = NULL;
  if (!sp) {
    sp = new OhNapiTaskRunner(env);
  }
  return sp;
}

OhNapiTaskRunner::OhNapiTaskRunner(napi_env env): env_(env) {
  auto loop = GetLoop();
  async_handle_.data = static_cast<void*>(this);
  uv_async_init(loop, &async_handle_, [](auto handle) {
    auto runner = static_cast<OhNapiTaskRunner *>(handle->data);

    napi_handle_scope scope;
    auto result = napi_open_handle_scope(runner->env_, &scope);
    if (result != napi_ok) {
      return;
    }

    std::queue<Task> tasksQueue;
    {
      std::unique_lock<std::mutex> lock(runner->tasks_mutex_);
      std::swap(tasksQueue, runner->tasks_queue_);
    }
    while (!tasksQueue.empty()) {
      auto task = std::move(tasksQueue.front());
      tasksQueue.pop();
      task();
    }

    result = napi_close_handle_scope(runner->env_, scope);
    if (result != napi_ok) {
      return;
    }
  });
}

OhNapiTaskRunner::~OhNapiTaskRunner() {
  uv_close(reinterpret_cast<uv_handle_t *>(&async_handle_), nullptr);
}

void OhNapiTaskRunner::RunAsyncTask(Task &&task) {
  std::unique_lock<std::mutex> lock(tasks_mutex_);
  tasks_queue_.push(task);
  uv_async_send(&async_handle_);
}

void OhNapiTaskRunner::RunSyncTask(Task &&task) {
  std::condition_variable cv;
  std::unique_lock<std::mutex> lock(tasks_mutex_);
  std::atomic_bool done{false};
  tasks_queue_.push([&cv, &done, task = std::move(task)]() {
    task();
    done = true;
    cv.notify_all();
  });
  uv_async_send(&async_handle_);
  cv.wait(lock, [&done] {
    return done.load();
  });
}

uv_loop_t *OhNapiTaskRunner::GetLoop() const {
  uv_loop_t *loop = nullptr;
  napi_get_uv_event_loop(env_, &loop);
  return loop;
}

}
