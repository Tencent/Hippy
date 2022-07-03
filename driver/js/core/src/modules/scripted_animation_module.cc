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

#include "core/modules/scripted_animation_module.h"

#include "footstone/logging.h"
#include "footstone/task.h"
#include "footstone/check.h"
#include "footstone/time_delta.h"
#include "footstone/one_shot_timer.h"
#include "footstone/repeating_timer.h"
#include "footstone/string_view_utils.h"
#include "core/base/common.h"
#include "core/modules/module_register.h"

REGISTER_MODULE(ScriptedAnimationModule, RequestAnimationFrame) // NOLINT(cert-err58-cpp)
REGISTER_MODULE(ScriptedAnimationModule, CancelAnimationFrame) // NOLINT(cert-err58-cpp)

namespace napi = ::hippy::napi;

using unicode_string_view = footstone::stringview::unicode_string_view;
using Ctx = hippy::napi::Ctx;
using CtxValue = hippy::napi::CtxValue;
using RegisterFunction = hippy::base::RegisterFunction;
using RegisterMap = hippy::base::RegisterMap;
using Task = footstone::runner::Task;
using TaskRunner = footstone::runner::TaskRunner;
using RepeatingTimer = footstone::timer::RepeatingTimer;
using OneShotTimer = footstone::timer::OneShotTimer;
using TimeDelta = footstone::time::TimeDelta;

ScriptedAnimationModule::ScriptedAnimationModule() : delayTaskManager(std::make_shared<DelayTaskManager>()) {}

ScriptedAnimationModule::~ScriptedAnimationModule() = default;

void ScriptedAnimationModule::RequestAnimationFrame(const napi::CallbackInfo& info) {
  TimeDelta delay = TimeDelta::FromNanoseconds(preferredIntervalInNanoseconds);
  info.GetReturnValue()->Set(delayTaskManager->Start(info, false, delay));
}

void ScriptedAnimationModule::CancelAnimationFrame(const napi::CallbackInfo& info) {
  std::shared_ptr<Scope> scope = info.GetScope();
  std::shared_ptr<Ctx> context = scope->GetContext();
  FOOTSTONE_CHECK(context);

  int32_t argument = 0;
  if (!context->GetValueNumber(info[0], &argument)) {
    info.GetExceptionValue()->Set(context, "The first argument must be int32.");
    return;
  }

  uint32_t task_id = footstone::checked_numeric_cast<int32_t, uint32_t>(argument);
  delayTaskManager->Cancel(task_id);
  info.GetReturnValue()->Set(context->CreateNumber(task_id));
}
