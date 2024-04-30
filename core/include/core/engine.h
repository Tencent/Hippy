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

#include "base/logging.h"
#include "core/base/common.h"
#include "core/task/javascript_task_runner.h"
#include "core/task/worker_task_runner.h"
#include "core/vm/js_vm.h"

#if defined(JS_V8) && !defined(V8_WITHOUT_INSPECTOR)
#include "core/inspector/v8_inspector_client_impl.h"
#endif

class Scope;

class Engine: public std::enable_shared_from_this<Engine> {
 public:
  using RegisterMap = hippy::base::RegisterMap;
  using VM = hippy::vm::VM;
  using VMInitParam = hippy::vm::VMInitParam;
  using RegisterFunction = hippy::base::RegisterFunction;

  Engine();
  virtual ~Engine();

  void AsyncInit(const std::shared_ptr<VMInitParam>& param = nullptr,
                 std::unique_ptr<RegisterMap> map = std::make_unique<RegisterMap>());
  int32_t SyncInit(const std::shared_ptr<VM>& vm);
  void TerminateRunner();

  std::shared_ptr<Scope> AsyncCreateScope(
      const std::string& name = "",
      std::unordered_map<std::string, std::string> init_param = {},
      std::unique_ptr<RegisterMap> map = std::unique_ptr<RegisterMap>());

  std::shared_ptr<Scope> SyncCreateScope(std::unique_ptr<RegisterMap> map);

  std::shared_ptr<Scope> SyncCreateScope(
      const std::string& name = "",
      std::unordered_map<std::string, std::string> init_param = {},
      std::unique_ptr<RegisterMap> map = std::unique_ptr<RegisterMap>());

  inline std::shared_ptr<VM> GetVM() { return vm_; }
  inline std::shared_ptr<JavaScriptTaskRunner> GetJSRunner() {
    return js_runner_;
  }
  inline std::shared_ptr<WorkerTaskRunner> GetWorkerTaskRunner() {
    return worker_task_runner_;
  }
#if defined(JS_V8) && !defined(V8_WITHOUT_INSPECTOR)
  inline void SetInspectorClient(std::shared_ptr<hippy::inspector::V8InspectorClientImpl> inspector_client) {
    inspector_client_ = inspector_client;
  }
  inline std::shared_ptr<hippy::inspector::V8InspectorClientImpl> GetInspectorClient() {
    return inspector_client_;
  }
#endif

 private:
  void SetupThreads();
  void CreateVM(const std::shared_ptr<VMInitParam>& param);

 private:
  static const uint32_t kDefaultWorkerPoolSize;

  std::shared_ptr<JavaScriptTaskRunner> js_runner_;
  std::shared_ptr<WorkerTaskRunner> worker_task_runner_;
  std::shared_ptr<VM> vm_;
  std::unique_ptr<RegisterMap> map_;
#if defined(JS_V8) && !defined(V8_WITHOUT_INSPECTOR)
  std::shared_ptr<hippy::inspector::V8InspectorClientImpl> inspector_client_;
#endif
};
