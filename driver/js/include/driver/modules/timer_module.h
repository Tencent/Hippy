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

#include "driver/modules/module_base.h"
#include "driver/napi/callback_info.h"
#include "driver/napi/js_native_api.h"
#include "driver/napi/js_native_api_types.h"
#include "footstone/task.h"
#include "footstone/base_timer.h"

namespace hippy {
inline namespace driver {
inline namespace module {

class TimerModule : public ModuleBase {
 public:
  using BaseTimer = footstone::BaseTimer;
  using CtxValue = hippy::napi::CtxValue;
  using Ctx = hippy::napi::Ctx;

  TimerModule() = default;

  void SetTimeout(const hippy::napi::CallbackInfo& info);
  void ClearTimeout(const hippy::napi::CallbackInfo& info);
  void SetInterval(const hippy::napi::CallbackInfo& info);
  void ClearInterval(const hippy::napi::CallbackInfo& info);

 private:
  std::shared_ptr<CtxValue> Start(const hippy::napi::CallbackInfo& info,
                                  bool repeat);
  void Cancel(uint32_t task_id);

  struct TaskEntry {
    TaskEntry(
        std::shared_ptr<Ctx> ctx,
        std::shared_ptr<CtxValue> func,
        std::shared_ptr<BaseTimer> timer): ctx(ctx), func(func), timer(timer) {}

      std::shared_ptr<Ctx> ctx;
      std::shared_ptr<CtxValue> func;
      std::shared_ptr<BaseTimer> timer;
    };
  };

  std::shared_ptr<std::unordered_map<uint32_t , std::shared_ptr<footstone::BaseTimer>>> timer_map_ = std::make_shared<
      std::unordered_map<uint32_t , std::shared_ptr<footstone::BaseTimer>>>();
  static const int kTimerInvalidId = 0;
}

}
}

