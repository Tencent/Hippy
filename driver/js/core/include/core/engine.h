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

#include <memory>
#include <mutex>
#include <vector>

#include "footstone/logging.h"
#include "footstone/task_runner.h"
#include "core/base/common.h"
#include "core/napi/js_native_api_types.h"

class Scope;

class Engine {
 public:
  using RegisterMap = hippy::base::RegisterMap;
  using VM = hippy::napi::VM;
  using VMInitParam = hippy::napi::VMInitParam;
  using RegisterFunction = hippy::base::RegisterFunction;
  using TaskRunner = footstone::TaskRunner;

  Engine(
      std::shared_ptr<TaskRunner> js,
      std::shared_ptr<TaskRunner> worker,
      std::unique_ptr<RegisterMap> map = std::make_unique<RegisterMap>(),
      const std::shared_ptr<VMInitParam>& param = nullptr);
  virtual ~Engine();

  void Enter();
  void Exit();
  std::shared_ptr<Scope> CreateScope(
      const std::string& name = "",
      std::unique_ptr<RegisterMap> map = std::unique_ptr<RegisterMap>());
  inline std::shared_ptr<VM> GetVM() { return vm_; }

  void TerminateRunner();
  inline std::shared_ptr<TaskRunner> GetJSRunner() {
    std::lock_guard<std::mutex> lock(js_runner_mutex_);
    return js_runner_;
  }
  inline std::shared_ptr<TaskRunner> GetWorkerTaskRunner() {
    return worker_task_runner_;
  }

 private:
  void CreateVM(const std::shared_ptr<VMInitParam>& param);

 private:
  static const uint32_t kDefaultWorkerPoolSize;

  std::shared_ptr<TaskRunner> js_runner_;
  std::shared_ptr<TaskRunner> worker_task_runner_;
  std::shared_ptr<VM> vm_;
  std::unique_ptr<RegisterMap> map_;
  std::mutex cnt_mutex_;
  std::mutex js_runner_mutex_;
  uint32_t scope_cnt_;
};
