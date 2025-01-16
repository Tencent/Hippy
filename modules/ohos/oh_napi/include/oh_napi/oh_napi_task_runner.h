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
#include <thread>
#include <queue>
#include <mutex>
#include <functional>
#include <napi/native_api.h>
#include <js_native_api.h>
#include <js_native_api_types.h>
#include <uv.h>
#include "abstract_task_runner.h"

namespace hippy {

class OhNapiTaskRunner : public AbstractTaskRunner  {
 public:

  static OhNapiTaskRunner *Instance(napi_env env);

  OhNapiTaskRunner(napi_env env);
  ~OhNapiTaskRunner() override;

  void RunAsyncTask(Task &&task) override;
  void RunSyncTask(Task &&task) override;

 private:
  napi_env env_;
  uv_loop_t *GetLoop() const;

  uv_async_t async_handle_;
  std::mutex tasks_mutex_;
  std::queue<Task> tasks_queue_;
};

}
