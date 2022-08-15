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

Engine::Engine(std::shared_ptr<TaskRunner> js,
               std::shared_ptr<TaskRunner> worker,
               std::unique_ptr<RegisterMap> map,
               const std::shared_ptr<VMInitParam>& init_param)
    : js_runner_(std::move(js)),
      worker_task_runner_(std::move(worker)),
      vm_(nullptr),
      map_(std::move(map)),
      scope_cnt_(0) {
  FOOTSTONE_DCHECK(js_runner_);
  auto cb = [=] { CreateVM(init_param); };
  js_runner_->PostTask(std::move(cb));
}

Engine::~Engine() {
  FOOTSTONE_DLOG(INFO) << "~Engine";
  std::lock_guard<std::mutex> lock(cnt_mutex_);
  FOOTSTONE_DCHECK(scope_cnt_ == 0) << "this engine is in use";
}

std::shared_ptr<Scope> Engine::CreateScope(const std::string& name,
                                           std::unique_ptr<RegisterMap> map) {
  FOOTSTONE_DLOG(INFO) << "Engine CreateScope";
  std::shared_ptr<Scope> scope =
      std::make_shared<Scope>(this, name, std::move(map));
  scope->wrapper_ = std::make_unique<ScopeWrapper>(scope);

  auto cb = [scope_ = scope] { scope_->Initialized(); };
  if (footstone::Worker::IsTaskRunning() && js_runner_ == footstone::runner::TaskRunner::GetCurrentTaskRunner()) {
    cb();
  } else {
    js_runner_->PostTask(std::move(cb));
  }
  return scope;
}

void Engine::CreateVM(const std::shared_ptr<VMInitParam>& param) {
  FOOTSTONE_DLOG(INFO) << "Engine CreateVM";
  vm_ = hippy::napi::CreateVM(param);

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

void Engine::Enter() {
  FOOTSTONE_DLOG(INFO) << "Engine Enter, scope_cnt_ = " << scope_cnt_;
  std::lock_guard<std::mutex> lock(cnt_mutex_);
  ++scope_cnt_;
}

void Engine::Exit() {
  FOOTSTONE_DLOG(INFO) << "Engine Exit, scope_cnt_ = " << scope_cnt_;
  std::lock_guard<std::mutex> lock(cnt_mutex_);
  --scope_cnt_;
}

}
}
