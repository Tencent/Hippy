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
#include "footstone/idle_task.h"

using string_view = footstone::stringview::string_view;
using Ctx = hippy::napi::Ctx;
using CtxValue = hippy::napi::CtxValue;
using CallbackInfo = hippy::CallbackInfo;
using RegisterFunction = hippy::base::RegisterFunction;
using RegisterMap = hippy::base::RegisterMap;
using BaseTimer = footstone::BaseTimer;
using Task = footstone::runner::Task;
using TaskRunner = footstone::runner::TaskRunner;
using RepeatingTimer = footstone::timer::RepeatingTimer;
using OneShotTimer = footstone::timer::OneShotTimer;
using TimeDelta = footstone::time::TimeDelta;
using IdleTask = footstone::IdleTask;
using IdleCbParam = footstone::IdleTask::IdleCbParam;

constexpr char kTimeoutKey[] = "timeout";
constexpr char kDidTimeoutKey[] = "didTimeout";
constexpr char kTimeRemainingKey[] = "timeRemaining";

namespace hippy {
inline namespace driver {
inline namespace module {

GEN_INVOKE_CB(TimerModule, SetTimeout) // NOLINT(cert-err58-cpp)
GEN_INVOKE_CB(TimerModule, ClearTimeout) // NOLINT(cert-err58-cpp)
GEN_INVOKE_CB(TimerModule, SetInterval) // NOLINT(cert-err58-cpp)
GEN_INVOKE_CB(TimerModule, ClearInterval) // NOLINT(cert-err58-cpp)
GEN_INVOKE_CB(TimerModule, RequestIdleCallback) // NOLINT(cert-err58-cpp)
GEN_INVOKE_CB(TimerModule, CancelIdleCallback) // NOLINT(cert-err58-cpp)

TimerModule::TimerModule() :
    timer_map_(std::make_shared<std::unordered_map<uint32_t,
                                                   std::shared_ptr<footstone::BaseTimer>>>()),
    idle_function_holder_map_(std::make_shared<std::unordered_map<uint32_t,
                                                                  std::shared_ptr<CtxValue>>>()) {}

void TimerModule::SetTimeout(CallbackInfo& info, void* data) {
  info.GetReturnValue()->Set(Start(info, false));
}

void TimerModule::ClearTimeout(CallbackInfo& info, void* data) {
  ClearInterval(info, data);
}

void TimerModule::SetInterval(CallbackInfo& info, void* data) {
  info.GetReturnValue()->Set(Start(info, true));
}

void TimerModule::ClearInterval(CallbackInfo& info, void* data) {
  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
  auto scope = scope_wrapper->scope.lock();
  FOOTSTONE_CHECK(scope);
  auto context = scope->GetContext();
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

void TimerModule::RequestIdleCallback(CallbackInfo& info, void* data) {
  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
  auto scope = scope_wrapper->scope.lock();
  FOOTSTONE_CHECK(scope);
  auto context = scope->GetContext();
  FOOTSTONE_CHECK(context);

  auto function = info[0];
  if (!context->IsFunction(function)) {
    info.GetExceptionValue()->Set(context,"The first argument must be function.");
    return;
  }

  auto runner = scope->GetTaskRunner();
  FOOTSTONE_DCHECK(runner);

  auto timeout = TimeDelta::Max();
  if (info[1]) {
    std::unordered_map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>> option;
    auto timeout_key = context->CreateString(kTimeoutKey);
    auto timeout_value = context->GetProperty(info[1], timeout_key);
    double time;
    auto flag = context->GetValueNumber(timeout_value, &time);
    if (flag) {
      timeout = TimeDelta::FromMilliseconds(static_cast<int64_t>(time));
    }
  }

  std::weak_ptr<Scope> weak_scope = scope;
  auto task = std::make_unique<IdleTask>();
  task->SetTimeout(timeout);
  auto task_id = task->GetId();
  (*idle_function_holder_map_)[task_id] = function;
  std::weak_ptr<CtxValue> weak_function = function;
  std::weak_ptr<std::unordered_map<uint32_t, std::shared_ptr<CtxValue>>> weak_map = idle_function_holder_map_;
  task->SetUnit([weak_scope, weak_function, weak_map, task_id](const IdleCbParam& idle_cb_param) {
    auto scope = weak_scope.lock();
    if (!scope) {
      return;
    }

    auto function = weak_function.lock();
    FOOTSTONE_DCHECK(function);
    if (!function) {
      return;
    }
    std::shared_ptr<hippy::napi::Ctx> context = scope->GetContext();
    auto param = context->CreateObject();
    auto did_timeout_key = context->CreateString(kDidTimeoutKey);
    auto did_timeout_value = context->CreateBoolean(idle_cb_param.did_time_out);
    context->SetProperty(param, did_timeout_key, did_timeout_value);
    auto res_time = idle_cb_param.res_time.ToMillisecondsF();
    auto time_remaining_key = context->CreateString(kTimeRemainingKey);
    auto time_remaining_value = context->CreateNumber(res_time);
    context->SetProperty(param, time_remaining_key, time_remaining_value);
    std::shared_ptr<CtxValue> argv[] = { param };
    context->CallFunction(function, context->GetGlobalObject(), 1, argv);
    auto idle_function_holder_map = weak_map.lock();
    if (!idle_function_holder_map) {
      return;
    }
    auto it = idle_function_holder_map->find(task_id);
    FOOTSTONE_DCHECK(it != idle_function_holder_map->end());
    if (it != idle_function_holder_map->end()) {
      idle_function_holder_map->erase(it);
    }
  });
  runner->PostIdleTask(std::move(task));
}

void TimerModule::CancelIdleCallback(CallbackInfo& info, void* data) {

}

std::shared_ptr<hippy::napi::CtxValue> TimerModule::Start(
    CallbackInfo& info,
    bool repeat) {
  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
  auto scope = scope_wrapper->scope.lock();
  FOOTSTONE_CHECK(scope);
  auto context = scope->GetContext();
  FOOTSTONE_CHECK(context);

  auto function = info[0];
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
  auto task = std::make_unique<Task>();
  auto task_id = task->GetId();
  std::weak_ptr<std::unordered_map<uint32_t , std::shared_ptr<BaseTimer>>> weak_timer_map = timer_map_;
  // holding chain: scope -> timer_module -> timer_map -> BaseTimer -> task -> CtxValue(function)
  task->SetExecUnit([weak_scope, function, task_id, repeat, weak_timer_map] {
    auto scope = weak_scope.lock();
    if (!scope) {
      return;
    }
    auto timer_map = weak_timer_map.lock();
    if (!timer_map) {
      return;
    }

    FOOTSTONE_DCHECK(function);
    if (!function) {
      return;
    }
    std::shared_ptr<hippy::napi::Ctx> context = scope->GetContext();
    context->CallFunction(function, context->GetGlobalObject(), 0, nullptr);

#if defined(JS_JSC)
    // exception check for jsc
    RegisterFunction func;
    if (scope->GetExtraCallback(kAsyncTaskEndKey, func)) {
      func(nullptr);
    }
#endif /* defined(JS_JSC) */

    if (!repeat) {
      timer_map->erase(task_id);
    }
  });

  if (repeat) {
    auto timer = std::make_shared<RepeatingTimer>(runner);
    timer->Start(std::move(task), delay);
    timer_map_->insert({task_id, std::move(timer)});
  } else {
    auto timer = std::make_shared<OneShotTimer>(runner);
    timer->Start(std::move(task), delay);
    timer_map_->insert({task_id, std::move(timer)});
  }

  return context->CreateNumber(task_id);
}

void TimerModule::Cancel(uint32_t task_id) {
  timer_map_->erase(task_id);
}

std::shared_ptr<CtxValue> TimerModule::BindFunction(std::shared_ptr<Scope> scope,
                                                    std::shared_ptr<CtxValue>* rest_args) {
  auto context = scope->GetContext();
  auto object = context->CreateObject();

  auto key = context->CreateString("SetTimeout");
  auto wrapper = std::make_unique<hippy::napi::FunctionWrapper>(InvokeTimerModuleSetTimeout, nullptr);
  auto value = context->CreateFunction(wrapper);
  scope->SaveFunctionWrapper(std::move(wrapper));
  context->SetProperty(object, key, value);

  key = context->CreateString("ClearTimeout");
  wrapper = std::make_unique<hippy::napi::FunctionWrapper>(InvokeTimerModuleClearTimeout, nullptr);
  value = context->CreateFunction(wrapper);
  scope->SaveFunctionWrapper(std::move(wrapper));
  context->SetProperty(object, key, value);

  key = context->CreateString("SetInterval");
  wrapper = std::make_unique<hippy::napi::FunctionWrapper>(InvokeTimerModuleSetInterval, nullptr);
  value = context->CreateFunction(wrapper);
  scope->SaveFunctionWrapper(std::move(wrapper));
  context->SetProperty(object, key, value);

  key = context->CreateString("ClearInterval");
  wrapper = std::make_unique<hippy::napi::FunctionWrapper>(InvokeTimerModuleClearInterval, nullptr);
  value = context->CreateFunction(wrapper);
  scope->SaveFunctionWrapper(std::move(wrapper));
  context->SetProperty(object, key, value);

  key = context->CreateString("RequestIdleCallback");
  wrapper = std::make_unique<hippy::napi::FunctionWrapper>(InvokeTimerModuleRequestIdleCallback, nullptr);
  value = context->CreateFunction(wrapper);
  scope->SaveFunctionWrapper(std::move(wrapper));
  context->SetProperty(object, key, value);

  key = context->CreateString("CancelIdleCallback");
  wrapper = std::make_unique<hippy::napi::FunctionWrapper>(InvokeTimerModuleCancelIdleCallback, nullptr);
  value = context->CreateFunction(wrapper);
  scope->SaveFunctionWrapper(std::move(wrapper));
  context->SetProperty(object, key, value);

  return object;
}

}
}
}
