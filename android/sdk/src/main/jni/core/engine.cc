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

#include "core/engine.h"

#include <memory>
#include <mutex>  // NOLINT(build/c++11)

#include "core/base/logging.h"
#include "core/engine-impl.h"
#include "core/environment.h"
#include "core/task/javascript-task-runner.h"
#include "core/task/javascript-task.h"

namespace napi = ::hippy::napi;

Engine::Engine(EngineId engine_id) : vm_(nullptr), id_(engine_id) {
  setupThreads();
  environment_count_ = 0;

  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback = [=] {
    //HIPPY_LOG(hippy::Debug, "initJSFramework createVM");
    vm_ = createVM();
    //HIPPY_LOG(hippy::Debug, "initJSFramework createVM END");
  };
  jsRunner()->postTask(task);
}

Engine::~Engine() {
  delete js_runner_;
}

void Engine::TerminateRunner() {
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback = [=] { napi::napi_vm_release(vm_); };
  jsRunner()->postTask(task);

  if (js_runner_) {
    js_runner_->Terminate();
  }
}

std::weak_ptr<Environment> Engine::GetEnvironment(napi::napi_context context) {
  std::lock_guard<std::mutex> lock(m_mutex);

  for (const auto& env : env_list_) {
    if (env->getContext() == context) {
      return env;
    }
  }

  return std::weak_ptr<Environment>();
}

std::weak_ptr<Environment> Engine::CreateEnvironment(const std::string& name, std::unique_ptr<RegisterMap> map) {
  std::lock_guard<std::mutex> lock(m_mutex);

  std::shared_ptr<Environment> env = std::make_shared<Environment>(name, std::move(map));
  std::shared_ptr<Engine> engine = GetPtr();
  env->Initialized(engine);

  env_list_.push_back(env);

  environment_count_++;

  return env;
}

void Engine::RemoveEnvironment(std::weak_ptr<Environment> env) {
  std::lock_guard<std::mutex> lock(m_mutex);

  std::shared_ptr<Environment> strong_env = env.lock();
  if (strong_env == nullptr) {
    return;
  }
  auto item = std::find(std::begin(env_list_), std::end(env_list_), strong_env);
  if (item != env_list_.end()) {
    env_list_.erase(item);
  }
}

void Engine::setupThreads() {
  js_runner_ = new JavaScriptTaskRunner();
  js_runner_->Start();
}

napi::napi_vm Engine::createVM() {
  napi::napi_vm vm = napi::napi_create_vm();
  napi::napi_register_uncaught_exception_callback(vm);
  return vm;
}

void* Engine::ConvertVMData() {
  return napi::napi_get_vm_data(vm_);
}

void* Engine::GetJSPlatform() {
  return napi::napi_get_platfrom(vm_);
}
