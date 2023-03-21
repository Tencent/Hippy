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

#include "driver/base/common.h"
#include "driver/vm/js_vm.h"
#include "footstone/logging.h"
#include "footstone/task_runner.h"

#if defined(ENABLE_INSPECTOR) && defined(JS_V8) && !defined(V8_WITHOUT_INSPECTOR)
#include "driver/runtime/v8/inspector/v8_inspector_client_impl.h"
#endif

namespace hippy {
inline namespace driver {

class Scope;

class Engine: public std::enable_shared_from_this<Engine> {
 public:
  using RegisterMap = hippy::base::RegisterMap;
  using VM = hippy::VM;
  using VMInitParam = hippy::VMInitParam;
  using RegisterFunction = hippy::base::RegisterFunction;
  using TaskRunner = footstone::TaskRunner;
  using string_view = footstone::string_view;

  Engine();
  virtual ~Engine();

  void AsyncInit(
      std::shared_ptr<TaskRunner> js,
      std::shared_ptr<TaskRunner> worker,
      std::unique_ptr<RegisterMap> map = std::make_unique<RegisterMap>(),
      const std::shared_ptr<VMInitParam>& param = nullptr);

  std::shared_ptr<Scope> AsyncCreateScope(
      const std::string& name = "",
      std::unique_ptr<RegisterMap> map = std::unique_ptr<RegisterMap>());
  std::any GetClassTemplate(void* key, const string_view& name);
  bool HasClassTemplate(void* key, const string_view& name);
  void SaveClassTemplate(void* key, const string_view& name, std::any&& class_template);
  void ClearClassTemplate(void* key);
  void SaveFunctionWrapper(void* key, std::unique_ptr<FunctionWrapper> wrapper);
  void ClearFunctionWrapper(void* key);
  void SaveWeakCallbackWrapper(void* key, std::unique_ptr<WeakCallbackWrapper> wrapper);
  void ClearWeakCallbackWrapper(void* key);

  inline std::shared_ptr<VM> GetVM() { return vm_; }
  inline std::shared_ptr<TaskRunner> GetJsTaskRunner() { return js_runner_; }
  inline std::shared_ptr<TaskRunner> GetWorkerTaskRunner() { return worker_task_runner_; }

#if defined(ENABLE_INSPECTOR) && defined(JS_V8) && !defined(V8_WITHOUT_INSPECTOR)
  inline void SetInspectorClient(std::shared_ptr<hippy::inspector::V8InspectorClientImpl> inspector_client) {
    inspector_client_ = inspector_client;
  }
  inline std::shared_ptr<hippy::inspector::V8InspectorClientImpl> GetInspectorClient() {
    return inspector_client_;
  }
#endif
 private:
  void CreateVM(const std::shared_ptr<VMInitParam>& param);

 private:
  std::shared_ptr<TaskRunner> js_runner_;
  std::shared_ptr<TaskRunner> worker_task_runner_;
  std::unordered_map<void*, std::unordered_map<string_view, std::any>> class_template_holder_map_;
  std::unordered_map<void*, std::vector<std::unique_ptr<FunctionWrapper>>> function_wrapper_holder_map_;
  std::unordered_map<void*, std::vector<std::unique_ptr<WeakCallbackWrapper>>> weak_callback_holder_map_;
  std::shared_ptr<VM> vm_;
  std::unique_ptr<RegisterMap> map_;
#if defined(ENABLE_INSPECTOR) && defined(JS_V8) && !defined(V8_WITHOUT_INSPECTOR)
  std::shared_ptr<hippy::inspector::V8InspectorClientImpl> inspector_client_;
#endif
};

}
}
