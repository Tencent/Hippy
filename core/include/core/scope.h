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

#include <any>
#include <string>
#include <unordered_map>
#include <vector>

#include "base/unicode_string_view.h"
#include "core/base/common.h"
#include "core/base/task.h"
#include "core/base/uri_loader.h"
#include "core/engine.h"
#include "core/napi/js_ctx.h"
#include "core/task/worker_task_runner.h"

class JavaScriptTaskRunner;
class ModuleBase;
class Scope;

class ScopeWrapper {
 public:
  explicit ScopeWrapper(std::shared_ptr<Scope> scope) : scope(scope) {}

 public:
  std::weak_ptr<Scope> scope;
};

class Scope {
 public:
  using unicode_string_view = tdf::base::unicode_string_view;
  using RegisterMap = hippy::base::RegisterMap;
  using CtxValue = hippy::napi::CtxValue;
  using Ctx = hippy::napi::Ctx;
  using UriLoader = hippy::base::UriLoader;
  using Encoding = hippy::napi::Encoding;
  using FuncWrapper = hippy::napi::FuncWrapper;

  Scope(std::weak_ptr<Engine> engine,
        std::string name,
        std::unique_ptr<RegisterMap> map);
  ~Scope();

  void WillExit();
  inline std::shared_ptr<Ctx> GetContext() { return context_; }
  inline std::unique_ptr<RegisterMap>& GetRegisterMap() { return map_; }

  inline void SaveFuncWrapper(std::unique_ptr<hippy::napi::FuncWrapper> wrapper) {
    func_wrapper_holder_.push_back(std::move(wrapper));
  }

  inline std::shared_ptr<ModuleBase> GetModuleObject(const std::string& module_name) {
    return  module_object_map_[module_name];
  }

  void* GetScopeWrapperPointer();

  void RunJS(const unicode_string_view& js,
             const unicode_string_view& name,
             bool is_copy = true);

  std::shared_ptr<CtxValue> RunJSSync(const unicode_string_view& data,
                                      const unicode_string_view& name,
                                      bool is_copy = true);

  inline std::shared_ptr<JavaScriptTaskRunner> GetTaskRunner() {
    TDF_BASE_CHECK(engine_.lock());
    return engine_.lock()->GetJSRunner();
  }

  inline void SetUriLoader(std::shared_ptr<UriLoader> loader) {
    loader_ = loader;
  }

  inline std::shared_ptr<UriLoader> GetUriLoader() { return loader_; }

  inline auto& GetJsModuleArray() {
    return js_module_array;
  }

  inline bool HasTurboInstance(const std::string& name) {
    return turbo_instance_map_.find(name) != turbo_instance_map_.end();
  }

  inline std::shared_ptr<CtxValue> GetTurboInstance(const std::string& name) {
    return turbo_instance_map_[name];
  }

  inline void SetTurboInstance(const std::string& name, const std::shared_ptr<CtxValue>& instance) {
    turbo_instance_map_[name] = instance;
  }

  inline std::any GetTurboHostObject(const std::string& name) {
    return turbo_host_object_map_[name];
  }

  inline void SetTurboHostObject(const std::string& name, const std::any& host_object) {
    turbo_host_object_map_[name] = host_object;
  }

  inline void AddWillExitCallback(std::function<void()> cb) { // cb will run in the js thread
    will_exit_cbs_.push_back(cb);
  }

 private:
  friend class Engine;
  void Init(bool use_snapshot);
  void CreateContext();
  void BindModule();
  void Bootstrap();
  void InvokeCallback();


 private:
  std::weak_ptr<Engine> engine_;
  std::shared_ptr<Ctx> context_;
  std::string name_;
  std::unique_ptr<RegisterMap> map_;
  std::unordered_map<std::string, std::shared_ptr<ModuleBase>> module_object_map_;
  std::vector<std::shared_ptr<CtxValue>> js_module_array;
  std::shared_ptr<UriLoader> loader_;
  std::unique_ptr<ScopeWrapper> wrapper_;
  std::vector<std::unique_ptr<hippy::napi::FuncWrapper>> func_wrapper_holder_;
  std::unordered_map<std::string, std::shared_ptr<CtxValue>> turbo_instance_map_;
  std::unordered_map<std::string, std::any> turbo_host_object_map_;
  std::vector<std::function<void()>> will_exit_cbs_;
};
