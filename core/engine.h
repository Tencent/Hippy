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

#ifndef CORE_ENGINE_H_
#define CORE_ENGINE_H_

#include <memory>
#include <mutex>  // NOLINT(build/c++11)
#include <vector>

#include "core/base/common.h"
#include "core/napi/js-native-api-types.h"

class EngineImpl;
class Environment;
class JavaScriptTaskRunner;

class Engine : public std::enable_shared_from_this<Engine> {
 public:
  using EngineId = int32_t;
  using RegisterMap = hippy::base::RegisterMap;

  explicit Engine(EngineId engine_id);
  virtual ~Engine();

  std::weak_ptr<Environment> CreateEnvironment(const std::string& name = "", std::unique_ptr<RegisterMap> map = std::unique_ptr<RegisterMap>());
  std::weak_ptr<Environment> GetEnvironment(hippy::napi::napi_context context);
  void RemoveEnvironment(std::weak_ptr<Environment> env);

  void TerminateRunner();
  inline JavaScriptTaskRunner* jsRunner() { return js_runner_; }
  inline hippy::napi::napi_vm GetVM() { return vm_; }
  inline void UnRefEnvironment() {
    std::lock_guard<std::mutex> lock(m_mutex);
    environment_count_--;
  }
  inline size_t GetEnvironmentCount() {
    std::lock_guard<std::mutex> lock(m_mutex);

    return environment_count_;
  }
  void* ConvertVMData();
  void* GetJSPlatform();

 private:
  void setupThreads();
  hippy::napi::napi_vm createVM();
  inline hippy::napi::napi_vm getVM() { return vm_; }
  std::shared_ptr<Engine> GetPtr() { return shared_from_this(); }

 private:
  friend class Environment;
  friend class EngineImpl;

  std::vector<std::shared_ptr<Environment>> env_list_;
  JavaScriptTaskRunner* js_runner_;
  hippy::napi::napi_vm vm_;
  EngineId id_;
  std::mutex m_mutex;
  size_t environment_count_;
};

#endif  // CORE_ENGINE_H_
