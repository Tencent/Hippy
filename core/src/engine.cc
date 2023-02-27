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

#include "core/scope.h"
#include "core/task/javascript_task.h"

constexpr uint32_t Engine::kDefaultWorkerPoolSize = 1;

Engine::Engine() : vm_(nullptr) {}

Engine::~Engine() {
  TDF_BASE_DLOG(INFO) << "~Engine";
}

void Engine::TerminateRunner() {
  TDF_BASE_DLOG(INFO) << "~TerminateRunner";
  worker_task_runner_->Terminate();
  js_runner_->Terminate();
}

std::shared_ptr<Scope> Engine::CreateScope(const std::string& name,
                                           std::unique_ptr<RegisterMap> map) {
  TDF_BASE_DLOG(INFO) << "Engine CreateScope";
  std::shared_ptr<Scope> scope =
      std::make_shared<Scope>(this, name, std::move(map));
  scope->wrapper_ = std::make_unique<ScopeWrapper>(scope);

  JavaScriptTask::Function cb = [scope_ = scope] { scope_->Initialized(); };
  if (js_runner_->IsJsThread()) {
    cb();
  } else {
    std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
    task->callback = cb;
    js_runner_->PostTask(std::move(task));
  }

  return scope;
}

void Engine::SetupThreads() {
  TDF_BASE_DLOG(INFO) << "Engine SetupThreads";
  js_runner_ = std::make_shared<JavaScriptTaskRunner>();
  js_runner_->Start();

  worker_task_runner_ = std::make_shared<WorkerTaskRunner>(kDefaultWorkerPoolSize);
}

void Engine::CreateVM(const std::shared_ptr<VMInitParam>& param) {
  TDF_BASE_DLOG(INFO) << "Engine CreateVM";
  vm_ = hippy::napi::CreateVM(param);
  auto it = map_->find(hippy::base::kVMCreateCBKey);
  if (it != map_->end()) {
    auto f = it->second;
    if (f) {
      TDF_BASE_DLOG(INFO) << "run VMCreatedCB begin";
      f(vm_.get());
      TDF_BASE_DLOG(INFO) << "run VMCreatedCB end";
      map_->erase(it);
    }
  }
}

void Engine::AsyncInit(const std::shared_ptr<VMInitParam>& param, std::unique_ptr<RegisterMap> map) {
  SetupThreads();

  map_ = std::move(map);
  auto weak_engine = weak_from_this();
  auto task = std::make_shared<JavaScriptTask>();
  task->callback = [weak_engine, param] {
    auto engine = weak_engine.lock();
    TDF_BASE_DCHECK(engine);
    if (!engine) {
      return;
    }
    engine->CreateVM(param);
  };
  js_runner_->PostTask(task);
}
