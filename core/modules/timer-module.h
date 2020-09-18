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

#ifndef CORE_MODULES_TIMER_MODULE_H_
#define CORE_MODULES_TIMER_MODULE_H_

#include <memory>
#include <unordered_map>
#include <utility>

#include "core/base/task.h"
#include "core/modules/module-base.h"
#include "core/napi/callback-info.h"
#include "core/napi/js-native-api-types.h"
#include "core/napi/js-native-api.h"

class JavaScriptTask;
class JavaScriptTaskRunner;

class TimerModule : public ModuleBase {
 public:
  explicit TimerModule();
  ~TimerModule();

  void SetTimeout(const hippy::napi::CallbackInfo& info);
  void ClearTimeout(const hippy::napi::CallbackInfo& info);
  void SetInterval(const hippy::napi::CallbackInfo& info);
  void ClearInterval(const hippy::napi::CallbackInfo& info);

 private:
  using TaskId = hippy::base::Task::TaskId;
  using CtxValue = hippy::napi::CtxValue;
  using Ctx = hippy::napi::Ctx;

  std::shared_ptr<CtxValue> Start(const hippy::napi::CallbackInfo& info,
                                  bool repeat);
  void RemoveTask(std::shared_ptr<JavaScriptTask> task);
  void Cancel(TaskId task_id, std::shared_ptr<Scope> scope);

  struct TaskEntry {
    TaskEntry(std::shared_ptr<Ctx> context,
              std::weak_ptr<JavaScriptTask> task,
              std::shared_ptr<CtxValue> function) {
      task_ = std::move(task);
      function_ = function;
      context_ = context;
    }

    std::weak_ptr<JavaScriptTask> task_;
    std::shared_ptr<CtxValue> function_;
    std::shared_ptr<Ctx> context_;
  };

  std::unordered_map<TaskId, std::shared_ptr<TaskEntry>> task_map_;

  static const int kTimerInvalidId = 0;
};

#endif  // CORE_MODULES_TIMER_MODULE_H_
