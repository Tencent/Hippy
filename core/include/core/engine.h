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

#ifndef HIPPY_CORE_ENGINE_H_
#define HIPPY_CORE_ENGINE_H_

#include <memory>
#include <mutex>  // NOLINT(build/c++11)
#include <vector>

#include "core/base/common.h"
#include "core/napi/js_native_api_types.h"
#include "core/task/javascript_task_runner.h"
#include "core/task/worker_task_runner.h"

class Scope;

class Engine {
 public:
  using RegisterMap = hippy::base::RegisterMap;
  using VM = hippy::napi::VM;
  using RegisterFunction = hippy::base::RegisterFunction;

  explicit Engine(
      std::unique_ptr<RegisterMap> map = std::make_unique<RegisterMap>());
  virtual ~Engine();

  void Enter();
  void Exit();
  std::shared_ptr<Scope> CreateScope(
      const std::string& name = "",
      std::unique_ptr<RegisterMap> map = std::unique_ptr<RegisterMap>());
  inline const std::shared_ptr<VM> GetVM() { return vm_; }

  void TerminateRunner();
  inline std::shared_ptr<JavaScriptTaskRunner> GetJSRunner() {
    return js_runner_;
  }
  inline std::shared_ptr<WorkerTaskRunner> GetWorkerTaskRunner() {
    return worker_task_runner_;
  }

 private:
  void SetupThreads();
  void CreateVM();

 private:
  static const uint32_t kDefaultWorkerPoolSize;

  std::shared_ptr<JavaScriptTaskRunner> js_runner_;
  std::shared_ptr<WorkerTaskRunner> worker_task_runner_;
  std::shared_ptr<VM> vm_;
  std::unique_ptr<RegisterMap> map_;
  std::mutex cnt_mutex_;
  std::mutex runner_mutex_;
  uint32_t scope_cnt_;
};

#endif  // HIPPY_CORE_ENGINE_H_
