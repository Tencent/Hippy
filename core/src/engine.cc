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

#include "core/scope.h"
#include "core/task/javascript_task.h"
#include "core/task/javascript_task_runner.h"

const uint32_t Engine::kDefaultWorkerPoolSize = 1;

Engine::Engine(std::unique_ptr<RegisterMap> map)
    : vm_(nullptr), map_(std::move(map)), scope_cnt_(0) {
  SetupThreads();

  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback = [=] { CreateVM(); };
  js_runner_->PostTask(task);
}

Engine::~Engine() {
  TDF_BASE_DLOG(INFO) << "~Engine";
  std::lock_guard<std::mutex> lock(cnt_mutex_);
  TDF_BASE_DCHECK(scope_cnt_ == 0) << "this engine is in use";
}

void Engine::TerminateRunner() {
  TDF_BASE_DLOG(INFO) << "~TerminateRunner";
  std::lock_guard<std::mutex> lock(runner_mutex_);
  if (js_runner_) {
    js_runner_->Terminate();
    js_runner_ = nullptr;
  }
  if (worker_task_runner_) {
    worker_task_runner_->Terminate();
    worker_task_runner_ = nullptr;
  }
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

  if (kDefaultWorkerPoolSize > 0) {
    worker_task_runner_ =
        std::make_shared<WorkerTaskRunner>(kDefaultWorkerPoolSize);
  } else {
    worker_task_runner_ = nullptr;
  }
}

void Engine::CreateVM() {
  TDF_BASE_DLOG(INFO) << "Engine CreateVM";
  vm_ = hippy::napi::CreateVM();

  RegisterMap::const_iterator it = map_->find(hippy::base::kVMCreateCBKey);
  if (it != map_->end()) {
    RegisterFunction f = it->second;
    if (f) {
      TDF_BASE_DLOG(INFO) << "run VMCreatedCB begin";
      f(vm_.get());
      TDF_BASE_DLOG(INFO) << "run VMCreatedCB end";
      map_->erase(it);
    }
  }
}

void Engine::Enter() {
  TDF_BASE_DLOG(INFO) << "Engine Enter";
  std::lock_guard<std::mutex> lock(cnt_mutex_);
  ++scope_cnt_;
}

void Engine::Exit() {
  TDF_BASE_DLOG(INFO) << "Engine Exit";
  std::lock_guard<std::mutex> lock(cnt_mutex_);
  --scope_cnt_;
}
