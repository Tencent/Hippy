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
#include <string>

#include "footstone/unicode_string_view.h"
#include "footstone/task_runner.h"
#include "driver/runtime/v8/inspector/v8_channel_impl.h"
#include "driver/runtime/v8/inspector/v8_inspector_context.h"
#include "driver/runtime/v8/interrupt_queue.h"

namespace hippy {
namespace inspector {

class V8InspectorClientImpl : public v8_inspector::V8InspectorClient,
 public std::enable_shared_from_this<V8InspectorClientImpl> {
 public:
  using unicode_string_view = footstone::stringview::unicode_string_view;
  using TaskRunner = footstone::TaskRunner;

  explicit V8InspectorClientImpl(std::weak_ptr<TaskRunner> runner): js_runner_(std::move(runner)) {}
  ~V8InspectorClientImpl();

  void CreateInspector(const std::shared_ptr<Scope>& scope);
#if defined(ENABLE_INSPECTOR) && !defined(V8_WITHOUT_INSPECTOR)
  std::shared_ptr<V8InspectorContext> CreateInspectorContext(const std::shared_ptr<Scope> scope, std::shared_ptr<hippy::devtools::DevtoolsDataSource> devtools_data_source);
  void DestroyInspectorContext(bool is_reload, const std::shared_ptr<V8InspectorContext> &inspector_context);
#endif
  void SendMessageToV8(const std::shared_ptr<V8InspectorContext>& inspector_context, unicode_string_view&& params);

  inline std::unique_ptr<v8_inspector::V8Inspector>& GetInspector() {
    return inspector_;
  }

  v8::Local<v8::Context> ensureDefaultContextInGroup(int contextGroupId) override;
  void runMessageLoopOnPause(int contextGroupId) override;
  void quitMessageLoopOnPause() override;
  void runIfWaitingForDebugger(int contextGroupId) override;

 private:
  void CreateContext(const std::shared_ptr<V8InspectorContext>& inspector_context);
  void DestroyContext(const std::shared_ptr<V8InspectorContext>& inspector_context);

  std::unique_ptr<v8_inspector::V8Inspector> inspector_;
  std::weak_ptr<TaskRunner> js_runner_;
  std::shared_ptr<TaskRunner> inspector_runner_;
  std::mutex mutex_;
  std::shared_ptr<InterruptQueue> interrupt_queue_;
  std::shared_ptr<V8InspectorContext> reload_inspector_context_;
  std::atomic_int32_t context_group_count_{1};
  std::unordered_map<int32_t, std::shared_ptr<V8InspectorContext>> inspector_context_map_;
  std::mutex inspector_context_mutex_;
};

}  // namespace inspector
}  // namespace hippy
