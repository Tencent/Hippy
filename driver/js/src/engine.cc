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

#include "driver/engine.h"

#include <utility>

#include "driver/scope.h"
#include "footstone/task.h"
#include "footstone/worker.h"

using TaskRunner = footstone::TaskRunner;
using Task = footstone::Task;

namespace hippy {
inline namespace driver {

Engine::Engine()
    : js_runner_(nullptr),
      worker_task_runner_(nullptr),
      vm_(nullptr),
      map_() {}

Engine::~Engine() {
  FOOTSTONE_DLOG(INFO) << "~Engine";
}

void Engine::AsyncInit(std::shared_ptr<TaskRunner> js,
                       std::shared_ptr<TaskRunner> worker,
                       std::unique_ptr<RegisterMap> map,
                       const std::shared_ptr<VMInitParam>& param) {
  js_runner_ = std::move(js);
  worker_task_runner_ = std::move(worker);
  map_ = std::move(map);
  auto weak_engine = weak_from_this();
  auto cb = [weak_engine, param] {
    auto engine = weak_engine.lock();
    FOOTSTONE_DCHECK(engine);
    if (!engine) {
      return;
    }
    engine->CreateVM(param);
  };
  js_runner_->PostTask(std::move(cb));
}

std::shared_ptr<Scope> Engine::AsyncCreateScope(const std::string& name,
                                           std::unique_ptr<RegisterMap> map) {
  FOOTSTONE_DLOG(INFO) << "Engine CreateScope";
  std::shared_ptr<Scope> scope = std::make_shared<Scope>(weak_from_this(), name, std::move(map));
  scope->wrapper_ = std::make_unique<ScopeWrapper>(scope);

  auto cb = [scope_ = scope] { scope_->Init(); };
  if (footstone::Worker::IsTaskRunning() && js_runner_ == footstone::runner::TaskRunner::GetCurrentTaskRunner()) {
    cb();
  } else {
    js_runner_->PostTask(std::move(cb));
  }
  return scope;
}

std::any Engine::GetClassTemplate(void* key, const string_view& name) {
  FOOTSTONE_DCHECK(HasClassTemplate(key, name));
  return class_template_holder_map_[key][name];
}

bool Engine::HasClassTemplate(void* key, const string_view& name) {
  auto it = class_template_holder_map_.find(key);
  if (it == class_template_holder_map_.end()) {
    return false;
  }
  return it->second.find(name) != it->second.end();
}

void Engine::SaveClassTemplate(void* key, const string_view& name, std::any&& class_template) {
  auto it = class_template_holder_map_.find(key);
  if (it == class_template_holder_map_.end()) {
    class_template_holder_map_[key] = {{name, std::move(class_template)}};
  } else {
    it->second[name] = class_template;
  }
}

void Engine::ClearClassTemplate(void* key) {
  auto it = class_template_holder_map_.find(key);
  if (it != class_template_holder_map_.end()) {
    class_template_holder_map_.erase(it);
  }
}

void Engine::SaveFunctionWrapper(void* key, std::unique_ptr<FunctionWrapper> wrapper) {
  auto it = function_wrapper_holder_map_.find(key);
  if (it == function_wrapper_holder_map_.end()) {
    function_wrapper_holder_map_[key] = std::vector<std::unique_ptr<FunctionWrapper>>{};
  }
  function_wrapper_holder_map_[key].push_back(std::move(wrapper));
}

void Engine::ClearFunctionWrapper(void* key) {
  auto it = function_wrapper_holder_map_.find(key);
  if (it != function_wrapper_holder_map_.end()) {
    function_wrapper_holder_map_.erase(it);
  }
}

void Engine::SaveWeakCallbackWrapper(void* key, std::unique_ptr<WeakCallbackWrapper> wrapper) {
  auto it = weak_callback_holder_map_.find(key);
  if (it == weak_callback_holder_map_.end()) {
    weak_callback_holder_map_[key] = std::vector<std::unique_ptr<WeakCallbackWrapper>>{};
  }
  weak_callback_holder_map_[key].push_back(std::move(wrapper));
}

void Engine::ClearWeakCallbackWrapper(void* key) {
  auto it = weak_callback_holder_map_.find(key);
  if (it != weak_callback_holder_map_.end()) {
    weak_callback_holder_map_.erase(it);
  }
}

void Engine::CreateVM(const std::shared_ptr<VMInitParam>& param) {
  FOOTSTONE_DLOG(INFO) << "Engine CreateVM";
  vm_ = hippy::CreateVM(param);

  auto it = map_->find(hippy::base::kVMCreateCBKey);
  if (it != map_->end()) {
    RegisterFunction f = it->second;
    if (f) {
      FOOTSTONE_DLOG(INFO) << "run VMCreatedCB begin";
      f(vm_.get());
      FOOTSTONE_DLOG(INFO) << "run VMCreatedCB end";
      map_->erase(it);
    }
  }
}

}
}