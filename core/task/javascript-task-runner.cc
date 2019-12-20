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

JavaScriptTaskRunner::JavaScriptTaskRunner() { setName("hippy.js"); }

bool JavaScriptTaskRunner::is_js_thread() {
  return this->Id() == hippy::base::ThreadId::getCurrent();
}

// keep the same with TaskRunner::run
void JavaScriptTaskRunner::pauseThreadForInspector() {
  m_isInspectorCallPause = true;

  while (m_isInspectorCallPause) {
    std::shared_ptr<hippy::base::Task> task = GetNext();
    if (task == nullptr) {
      return;
    }

    if (task->canceled_ == false) {
      task->Run();
    }
  }
}

void JavaScriptTaskRunner::resumeThreadForInspector() {
  m_isInspectorCallPause = false;
}
