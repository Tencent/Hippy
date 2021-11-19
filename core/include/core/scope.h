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

#include <string>
#include <unordered_map>

#include "base/unicode_string_view.h"
#include "core/base/common.h"
#include "core/base/task.h"
#include "core/base/uri_loader.h"
#include "core/engine.h"
#include "core/napi/js_native_api.h"
#include "core/napi/js_native_api_types.h"
#include "core/task/worker_task_runner.h"

class JavaScriptTaskRunner;
class ModuleBase;
class Scope;

class ScopeWrapper {
 public:
  explicit ScopeWrapper(std::shared_ptr<Scope> scope) : scope_(scope) {}

 public:
  std::weak_ptr<Scope> scope_;
};

class Scope {
 public:
  using unicode_string_view = tdf::base::unicode_string_view;
  using RegisterMap = hippy::base::RegisterMap;
  using CtxValue = hippy::napi::CtxValue;
  using Ctx = hippy::napi::Ctx;
  using UriLoader = hippy::base::UriLoader;
  using FunctionData = hippy::napi::FunctionData;
  using BindingData = hippy::napi::BindingData;
  using Encoding = hippy::napi::Encoding;

  Scope(Engine* engine,
        std::string  name,
        std::unique_ptr<RegisterMap> map);
  ~Scope();

  void WillExit();
  inline std::shared_ptr<Ctx> GetContext() { return context_; }
  inline std::unique_ptr<RegisterMap>& GetRegisterMap() { return map_; }

  ModuleBase* GetModuleClass(const unicode_string_view& moduleName);
  void AddModuleClass(const unicode_string_view& name,
                      std::unique_ptr<ModuleBase> module);
  std::shared_ptr<CtxValue> GetModuleValue(
      const unicode_string_view& moduleName);
  void AddModuleValue(const unicode_string_view& name,
                      const std::shared_ptr<CtxValue>& value);

  void SaveFunctionData(std::unique_ptr<FunctionData> data);

  inline void SaveBindingData(std::unique_ptr<BindingData> data) {
    binding_data_ = std::move(data);
  }

  inline const std::unique_ptr<BindingData>& GetBindingData() {
    return binding_data_;
  }

  void RunJS(const unicode_string_view& js,
             const unicode_string_view& name,
             bool is_copy = true);

  std::shared_ptr<CtxValue> RunJSSync(const unicode_string_view& data,
                                      const unicode_string_view& name,
                                      bool is_copy = true);

  inline std::shared_ptr<JavaScriptTaskRunner> GetTaskRunner() {
    return engine_->GetJSRunner();
  }

  inline std::shared_ptr<WorkerTaskRunner> GetWorkerTaskRunner() {
    return engine_->GetWorkerTaskRunner();
  }

  inline void AddTask(std::unique_ptr<hippy::base::Task> task) {
    std::shared_ptr<JavaScriptTaskRunner> runner = engine_->GetJSRunner();
    if (runner) {
      runner->PostTask(std::move(task));
    }
  }

  inline void SetUriLoader(std::shared_ptr<UriLoader> loader) {
    loader_ = loader;
  }

  inline std::shared_ptr<UriLoader> GetUriLoader() { return loader_; }

 private:
  friend class Engine;
  void Initialized();

 private:
  Engine* engine_;
  std::shared_ptr<Ctx> context_;
  std::string name_;
  std::unique_ptr<RegisterMap> map_;
  std::unordered_map<unicode_string_view, std::shared_ptr<CtxValue>>
      module_value_map_;
  std::unordered_map<unicode_string_view, std::unique_ptr<ModuleBase>>
      module_class_map_;
  std::vector<std::unique_ptr<FunctionData>> function_data_;
  std::unique_ptr<BindingData> binding_data_;
  std::unique_ptr<ScopeWrapper> wrapper_;
  std::shared_ptr<UriLoader> loader_;
};
