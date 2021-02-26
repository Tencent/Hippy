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

#include "core/modules/timer_module.h"

#include <memory>

#include "core/base/common.h"
#include "core/base/logging.h"
#include "core/modules/module_register.h"
#include "core/napi/callback_info.h"
#include "core/task/javascript_task_runner.h"
#include "core/task/javascript_task.h"

REGISTER_MODULE(TimerModule, SetTimeout)
REGISTER_MODULE(TimerModule, ClearTimeout)
REGISTER_MODULE(TimerModule, SetInterval)
REGISTER_MODULE(TimerModule, ClearInterval)

namespace napi = ::hippy::napi;

using Ctx = hippy::napi::Ctx;
using CtxValue = hippy::napi::CtxValue;
using RegisterFunction = hippy::base::RegisterFunction;
using RegisterMap = hippy::base::RegisterMap;
TimerModule::TimerModule() {}

TimerModule::~TimerModule() {}

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
  std::shared_ptr<Scope> scope = info.GetScope();
  std::shared_ptr<Ctx> context = scope->GetContext();
  HIPPY_CHECK(context);

  int32_t argument1 = 0;
  if (!context->GetValueNumber(info[0], &argument1)) {
    info.GetExceptionValue()->Set(context, "The first argument must be int32.");
    return;
  }

  TaskId task_id = argument1;
  Cancel(task_id, scope);
  info.GetReturnValue()->Set(context->CreateNumber(task_id));
}

std::shared_ptr<hippy::napi::CtxValue> TimerModule::Start(
    const napi::CallbackInfo& info,
    bool repeat) {
  std::shared_ptr<Scope> scope = info.GetScope();
  std::shared_ptr<Ctx> context = scope->GetContext();
  HIPPY_CHECK(context);

  std::shared_ptr<CtxValue> function = info[0];
  if (!context->IsFunction(function)) {
    info.GetExceptionValue()->Set(context,
                                  "The first argument must be function.");
    return nullptr;
  }

  double number = 0;
  context->GetValueNumber(info[1], &number);

  hippy::base::TaskRunner::DelayedTimeInMs interval =
      static_cast<hippy::base::TaskRunner::DelayedTimeInMs>(
          std::max(.0, number));

  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  std::weak_ptr<JavaScriptTask> weak_task = task;
  std::weak_ptr<Scope> weak_scope = scope;
  std::weak_ptr<CtxValue> weak_function = function;

  task->callback = [this, weak_scope, weak_function, weak_task, repeat,
                    interval] {
    std::shared_ptr<Scope> scope = weak_scope.lock();
    if (!scope) {
      return;
    }
    std::shared_ptr<CtxValue> function = weak_function.lock();
    if (function) {
      std::shared_ptr<hippy::napi::Ctx> context = scope->GetContext();
      context->CallFunction(function);
    }

    std::unique_ptr<RegisterMap>& map = scope->GetRegisterMap();
    if (map) {
      RegisterMap::const_iterator it = map->find(hippy::base::kAsyncTaskEndKey);
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
        std::shared_ptr<JavaScriptTaskRunner> runner = scope->GetTaskRunner();
        if (runner) {
          runner->PostDelayedTask(delayed_task, interval);
        }
      }
    } else {
      RemoveTask(delayed_task);
    }
  };

  std::shared_ptr<JavaScriptTaskRunner> runner = scope->GetTaskRunner();
  if (runner) {
    runner->PostDelayedTask(task, interval);
  }

  std::shared_ptr<TaskEntry> entry =
      std::make_shared<TaskEntry>(context, task, function);
  std::pair<TaskId, std::shared_ptr<TaskEntry>> item{task->id_,
                                                     std::move(entry)};
  task_map_.insert(item);

  return context->CreateNumber(task->id_);
}

void TimerModule::RemoveTask(std::shared_ptr<JavaScriptTask> task) {
  if (!task) {
    return;
  }

  task_map_.erase(task->id_);
}

void TimerModule::Cancel(TaskId task_id, std::shared_ptr<Scope> scope) {
  auto item = task_map_.find(task_id);
  if (item != task_map_.end()) {
    std::shared_ptr<JavaScriptTaskRunner> runner = scope->GetTaskRunner();
    std::shared_ptr<JavaScriptTask> task = item->second->task_.lock();

    if (runner) {
      runner->CancelTask(task);
    }
    task_map_.erase(item->first);
  }
}
