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

#include "driver/modules/timer_module.h"

#include "driver/base/common.h"
#include "driver/modules/module_register.h"
#include "footstone/logging.h"
#include "footstone/task.h"
#include "footstone/check.h"
#include "footstone/time_delta.h"
#include "footstone/one_shot_timer.h"
#include "footstone/repeating_timer.h"
#include "footstone/string_view_utils.h"

using string_view = footstone::stringview::string_view;
using Ctx = hippy::napi::Ctx;
using CtxValue = hippy::napi::CtxValue;
using RegisterFunction = hippy::base::RegisterFunction;
using RegisterMap = hippy::base::RegisterMap;
using BaseTimer = footstone::BaseTimer;
using Task = footstone::runner::Task;
using TaskRunner = footstone::runner::TaskRunner;
using RepeatingTimer = footstone::timer::RepeatingTimer;
using OneShotTimer = footstone::timer::OneShotTimer;
using TimeDelta = footstone::time::TimeDelta;

namespace hippy {
inline namespace driver {
inline namespace module {

REGISTER_MODULE(TimerModule, SetTimeout) // NOLINT(cert-err58-cpp)
REGISTER_MODULE(TimerModule, ClearTimeout) // NOLINT(cert-err58-cpp)
REGISTER_MODULE(TimerModule, SetInterval) // NOLINT(cert-err58-cpp)
REGISTER_MODULE(TimerModule, ClearInterval) // NOLINT(cert-err58-cpp)

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
  FOOTSTONE_CHECK(context);

  int32_t argument = 0;
  if (!context->GetValueNumber(info[0], &argument)) {
    info.GetExceptionValue()->Set(context, "The first argument must be int32.");
    return;
  }

  uint32_t task_id = footstone::checked_numeric_cast<int32_t, uint32_t>(argument);
  Cancel(task_id);
  info.GetReturnValue()->Set(context->CreateNumber(task_id));
}

std::shared_ptr<hippy::napi::CtxValue> TimerModule::Start(
    const napi::CallbackInfo& info,
    bool repeat) {
  std::shared_ptr<Scope> scope = info.GetScope();
  std::shared_ptr<Ctx> context = scope->GetContext();
  FOOTSTONE_CHECK(context);

  std::shared_ptr<CtxValue> function = info[0];
  if (!context->IsFunction(function)) {
    info.GetExceptionValue()->Set(context,"The first argument must be function.");
    return nullptr;
  }

  std::shared_ptr<TaskRunner> runner = scope->GetTaskRunner();
  FOOTSTONE_DCHECK(runner);

  double number = 0;
  context->GetValueNumber(info[1], &number);
  TimeDelta delay = TimeDelta::FromMilliseconds(static_cast<int64_t>(std::max(.0, number)));

  std::weak_ptr<Scope> weak_scope = scope;
  std::unique_ptr<Task> task = std::make_unique<Task>();
  uint32_t task_id = task->GetId();
  std::weak_ptr<std::unordered_map<uint32_t , std::shared_ptr<BaseTimer>>> weak_timer_map = timer_map_;
  task->SetExecUnit([weak_scope, function, task_id, repeat, weak_timer_map] {
    auto scope = weak_scope.lock();
    if (!scope) {
      return;
    }
    auto timer_map = weak_timer_map.lock();
    if (!timer_map) {
      return;
    }

    if (function) {
      std::shared_ptr<hippy::napi::Ctx> context = scope->GetContext();
      context->CallFunction(function, 0, nullptr);
    }
    std::unique_ptr<RegisterMap>& map = scope->GetRegisterMap();
    if (map) {
      auto it = map->find(hippy::base::kAsyncTaskEndKey);
      if (it != map->end()) {
        RegisterFunction f = it->second;
        if (f) {
          f(nullptr);
        }
      }
    }
    if (!repeat) {
      timer_map->erase(task_id);
    }
  });

  if (repeat) {
    std::shared_ptr<RepeatingTimer> timer = std::make_unique<RepeatingTimer>(runner);
    timer->Start(std::move(task), delay);
    timer_map_->insert({task_id, timer});
  } else {
    std::shared_ptr<OneShotTimer> timer = std::make_unique<OneShotTimer>(runner);
    timer->Start(std::move(task), delay);
    timer_map_->insert({task_id, timer});
  }

  return context->CreateNumber(task_id);
}

void TimerModule::Cancel(uint32_t task_id) {
  timer_map_->erase(task_id);
}

}
}
}
