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

#ifdef JS_V8
#include "driver/vm/v8/v8_vm.h"
#elif JS_JSH
#include "driver/vm/jsh/jsh_vm.h"
#endif

using TaskRunner = footstone::TaskRunner;
using Task = footstone::Task;

namespace hippy {
inline namespace driver {

Engine::Engine()
    : js_runner_(nullptr),
      vm_(nullptr) {}

Engine::~Engine() {
  FOOTSTONE_DLOG(INFO) << "~Engine";
  for(auto& [key, template_map] : class_template_holder_map_) {
    auto animation_template = std::any_cast<std::shared_ptr<ClassTemplate<CubicBezierAnimation>>>(template_map["Animation"]);
    animation_template->holder_ctx_values.clear();
    auto animation_set_template = std::any_cast<std::shared_ptr<ClassTemplate<AnimationSet>>>(template_map["AnimationSet"]);
    animation_set_template->holder_ctx_values.clear();
  }
}

void Engine::AsyncInitialize(std::shared_ptr<TaskRunner> js,
                             const std::shared_ptr<VMInitParam>& param,
                             std::function<void(std::shared_ptr<Engine>)> engine_initialized_callback) {
  js_runner_ = std::move(js);
  auto weak_engine = weak_from_this();
  auto cb = [weak_engine, param, callback = std::move(engine_initialized_callback)] {
    auto engine = weak_engine.lock();
    FOOTSTONE_DCHECK(engine);
    if (!engine) {
      return;
    }
    engine->CreateVM(param);
    if (callback) {
      callback(engine);
    }
  };
  js_runner_->PostTask(std::move(cb));
}

std::shared_ptr<Scope> Engine::CreateScope(const std::string& name) {
  FOOTSTONE_DLOG(INFO) << "Engine CreateScope";
  return std::make_shared<Scope>(weak_from_this(), name);
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
}

}
}
