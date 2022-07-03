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

#pragma once

#include <memory>
#include <unordered_map>
#include <utility>

#include "footstone/task.h"
#include "footstone/base_timer.h"
#include "footstone/time_delta.h"
#include "core/modules/module_base.h"
#include "core/napi/callback_info.h"
#include "core/napi/js_native_api.h"
#include "core/napi/js_native_api_types.h"

class DelayTaskManager {
public:
  DelayTaskManager();
  ~DelayTaskManager();

  using CtxValue = hippy::napi::CtxValue;
  using Ctx = hippy::napi::Ctx;
  using BaseTimer = footstone::BaseTimer;
  using TimeDelta = footstone::TimeDelta;

  std::shared_ptr<CtxValue> Start(const hippy::napi::CallbackInfo& info, bool repeat, TimeDelta& delay);
  void Cancel(uint32_t task_id);

  std::shared_ptr<std::unordered_map<uint32_t , std::unique_ptr<BaseTimer>>> timer_map_;
};
