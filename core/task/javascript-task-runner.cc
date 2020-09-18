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

#include "core/task/javascript-task-runner.h"

#include <memory>

#include "core/base/task.h"

JavaScriptTaskRunner::JavaScriptTaskRunner() {
  SetName("hippy.js");
}

bool JavaScriptTaskRunner::IsJsThread() {
  return this->Id() == hippy::base::ThreadId::GetCurrent();
}

// keep the same with TaskRunner::run
void JavaScriptTaskRunner::PauseThreadForInspector() {
  is_inspector_call_pause_ = true;

  while (is_inspector_call_pause_) {
    std::shared_ptr<hippy::base::Task> task = GetNext();
    if (task == nullptr) {
      return;
    }

    if (task->canceled_ == false) {
      task->Run();
    }
  }
}

void JavaScriptTaskRunner::ResumeThreadForInspector() {
  is_inspector_call_pause_ = false;
}
