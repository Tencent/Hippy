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
#include <atomic>
#include <mutex>
#include <unordered_map>

#include "base/unicode_string_view.h"
#include "v8_channel_impl.h"
#include "v8_inspector_context.h"
#include "core/task/javascript_task_runner.h"

class Scope;

namespace hippy {
namespace inspector {

class V8InspectorClientImpl : public v8_inspector::V8InspectorClient {
 public:
  using unicode_string_view = tdf::base::unicode_string_view;

  explicit V8InspectorClientImpl(std::weak_ptr<JavaScriptTaskRunner> runner) : js_runner_(std::move(runner)){}
  ~V8InspectorClientImpl() = default;

  void CreateInspector(const std::shared_ptr<Scope>& scope);
  std::shared_ptr<V8InspectorContext> CreateInspectorContext(const std::shared_ptr<Bridge>& bridge);
  void DestroyInspectorContext(const std::shared_ptr<V8InspectorContext> &inspector_context);
  inline void SetReloadInspectorContext(std::shared_ptr<V8InspectorContext> inspector_context) { reload_inspector_context_ = inspector_context; }
  inline std::shared_ptr<V8InspectorContext> GetReloadInspectorContext() { return reload_inspector_context_; }

  void SendMessageToV8(const std::shared_ptr<V8InspectorContext>& inspector_context, const unicode_string_view& params);
  void CreateContext(const std::shared_ptr<V8InspectorContext>& inspector_context);
  void DestroyContext(const std::shared_ptr<V8InspectorContext>& inspector_context);
  v8::Local<v8::Context> ensureDefaultContextInGroup(
      int contextGroupId) override;

  void runMessageLoopOnPause(int contextGroupId) override;
  void quitMessageLoopOnPause() override;
  void runIfWaitingForDebugger(int contextGroupId) override;

 private:
  std::unique_ptr<v8_inspector::V8Inspector> inspector_;
  std::weak_ptr<JavaScriptTaskRunner> js_runner_;
  std::shared_ptr<V8InspectorContext> reload_inspector_context_;
  std::atomic_int32_t context_group_count_{1};
  std::unordered_map<int32_t, std::shared_ptr<V8InspectorContext>> inspector_context_map_;
  std::mutex inspector_context_mutex_;
};

}  // namespace inspector
}  // namespace hippy
