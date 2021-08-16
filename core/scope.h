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

#ifndef CORE_SCOPE_H_
#define CORE_SCOPE_H_

#include <string>
#include <unordered_map>

#include "core/base/common.h"
#include "core/base/task.h"
#include "core/engine.h"
#include "core/napi/js-native-api-types.h"
#include "core/napi/js-native-api.h"

class JavaScriptTaskRunner;
class ModuleBase;
class Scope;

class ScopeWrapper {
 public:
  ScopeWrapper(std::shared_ptr<Scope> scope) : scope_(scope) {}

 public:
  std::weak_ptr<Scope> scope_;
};

class Scope {
 public:
  using RegisterMap = hippy::base::RegisterMap;
  using CtxValue = hippy::napi::CtxValue;
  using Ctx = hippy::napi::Ctx;

  Scope(Engine* engine,
        const std::string& name,
        std::unique_ptr<RegisterMap> map);
  ~Scope();

  inline std::shared_ptr<Ctx> GetContext() { return context_; }
  inline std::unique_ptr<RegisterMap>& GetRegisterMap() { return map_; }

  bool LoadModules();
  ModuleBase* GetModuleClass(const std::string& moduleName);
  void AddModuleClass(const std::string& name,
                      std::unique_ptr<ModuleBase> module);
  std::shared_ptr<CtxValue> GetModuleValue(const std::string& moduleName);
  void AddModuleValue(const std::string& name, std::shared_ptr<CtxValue> value);

  void SaveFunctionData(std::unique_ptr<hippy::napi::FunctionData> data);

  inline void SaveBindingData(std::unique_ptr<hippy::napi::BindingData> data) {
    binding_data_ = std::move(data);
  }

  inline const std::unique_ptr<hippy::napi::BindingData>& GetBindingData() {
    return binding_data_;
  }

  void RunJS(const std::string& js);
  std::shared_ptr<CtxValue> RunJS(const uint8_t* data,
                                  size_t len,
                                  const char* name = nullptr);

  inline std::shared_ptr<JavaScriptTaskRunner> GetTaskRunner() {
    return engine_->GetJSRunner();
  }

  inline void AddTask(std::unique_ptr<hippy::base::Task> task) {
    std::shared_ptr<JavaScriptTaskRunner> runner = engine_->GetJSRunner();
    if (runner) {
      runner->PostTask(std::move(task));
    }
  }

 private:
  friend class Engine;
  void Initialized();

 private:
  Engine* engine_;
  std::shared_ptr<Ctx> context_;
  std::string name_;
  std::unique_ptr<RegisterMap> map_;
  std::unordered_map<std::string, std::shared_ptr<CtxValue>> module_value_map_;
  std::unordered_map<std::string, std::unique_ptr<ModuleBase>>
      module_class_map_;
  std::vector<std::unique_ptr<hippy::napi::FunctionData>> function_data_;
  std::unique_ptr<hippy::napi::BindingData> binding_data_;
  std::unique_ptr<ScopeWrapper> wrapper_;
};

#endif  // CORE_SCOPE_H_
