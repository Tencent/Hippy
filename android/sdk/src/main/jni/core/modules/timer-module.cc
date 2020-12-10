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

#include "core/modules/timer-module.h"

#include <memory>

#include "core/engine-impl.h"
#include "core/modules/js-value-helper.h"
#include "core/modules/module-register.h"
#include "core/napi/callback-info.h"
#include "core/task/javascript-task-runner.h"
#include "core/task/javascript-task.h"

REGISTER_MODULE(TimerModule, SetTimeout)
REGISTER_MODULE(TimerModule, ClearTimeout)
REGISTER_MODULE(TimerModule, SetInterval)
REGISTER_MODULE(TimerModule, ClearInterval)

namespace napi = ::hippy::napi;

static const std::string kAsyncTaskEndKey = "ASYNC_TASK_END";

using RegisterFunction = hippy::base::RegisterFunction;
using RegisterMap = hippy::base::RegisterMap;

TimerModule::TimerModule(hippy::napi::napi_context context) {
  std::weak_ptr<Engine> engine =
      EngineImpl::instance()->GetEngineWithContext(context);
  if (engine.lock()) {
    task_runner_ = engine.lock()->jsRunner();
  }
}

TimerModule::~TimerModule() {
  for (auto& item : task_map_) {
    std::shared_ptr<JavaScriptTask> task = item.second->task_.lock();
    task_runner_->cancelTask(task);
  }
}

void TimerModule::SetTimeout(const napi::CallbackInfo& info) {
  info.GetReturnValue()->Set(Start(info, false));
}

void TimerModule::ClearTimeout(const napi::CallbackInfo& info) {
  ClearInterval(info);
}

void TimerModule::SetInterval(const napi::CallbackInfo& info) {
  info.GetReturnValue()->Set(Start(info, true));
}

void TimerModule::ClearInterval(const napi::CallbackInfo& info) {
  std::shared_ptr<Environment> env = info.GetEnv();
  napi::napi_context context = env->getContext();
  HIPPY_CHECK(context);

  int32_t argument1 = 0;
  if (!napi::napi_get_value_number(context, info[0], &argument1)) {
    info.GetExceptionValue()->Set(context, "The first argument must be int32.");
    return;
  }

  TaskId task_id = argument1;
  Cancel(task_id);
  info.GetReturnValue()->Set(napi_create_number(context, task_id));
}

napi::napi_value TimerModule::Start(const napi::CallbackInfo& info,
                                    bool repeat) {
  std::shared_ptr<Environment> env = info.GetEnv();
  napi::napi_context context = env->getContext();
  HIPPY_CHECK(context);

  napi::napi_value function = info[0];
  if (!napi::napi_is_function(context, function)) {
    info.GetExceptionValue()->Set(context,
                                  "The first argument must be function.");
    return nullptr;
  }

  double number = 0;
  napi::napi_get_value_number(context, info[1], &number);

  hippy::base::TaskRunner::DelayedTimeInMs interval =
      static_cast<hippy::base::TaskRunner::DelayedTimeInMs>(
          std::max(.0, number));

  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  std::weak_ptr<JavaScriptTask> weak_task = task;
  std::weak_ptr<Environment> weak_env = env;
  napi::napi_value_weak weak_function = function;
  
  task->callback = [this, context, weak_function, weak_task, repeat, interval,
                    runner = task_runner_, weak_env] {
    napi::napi_value function = weak_function.lock();
      
    if (function) {
      hippy::InvokeJsFunction(context, function);
    }
    
    std::shared_ptr<Environment> env = weak_env.lock();
    if (!env) {
        return;
    }
      
    std::unique_ptr<RegisterMap>& map = env->GetRegisterMap();
    if (map) {
      RegisterMap::const_iterator it = map->find(kAsyncTaskEndKey);
      if (it != map->end()) {
        RegisterFunction f = it->second;
        if (f) {
          f(nullptr);
        }
      }
    }
    
    std::shared_ptr<JavaScriptTask> delayed_task = weak_task.lock();
    if (repeat) {
      if (delayed_task) {
        runner->postDelayedTask(delayed_task, interval);
      }
    } else {
      RemoveTask(delayed_task);
    }
  };
  task_runner_->postDelayedTask(task, interval);

  std::shared_ptr<TaskEntry> entry =
      std::make_shared<TaskEntry>(context, task, function);
  std::pair<TaskId, std::shared_ptr<TaskEntry>> item{task->id_,
                                                     std::move(entry)};
  task_map_.insert(item);

  return napi_create_number(context, task->id_);
}

void TimerModule::RemoveTask(std::shared_ptr<JavaScriptTask> task) {
  if (!task) {
    return;
  }

  task_map_.erase(task->id_);
}

void TimerModule::Cancel(TaskId task_id) {
  auto item = task_map_.find(task_id);
  if (item != task_map_.end()) {
    std::shared_ptr<JavaScriptTask> task = item->second->task_.lock();
    task_runner_->cancelTask(task);
    task_map_.erase(item->first);
  }
}
