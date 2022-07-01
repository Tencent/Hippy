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
#include "core/core.h"
#include "v8_channel_impl.h"

namespace hippy {
namespace inspector {

class V8InspectorClientImpl : public v8_inspector::V8InspectorClient,
 public std::enable_shared_from_this<V8InspectorClientImpl> {
 public:
  using unicode_string_view = footstone::stringview::unicode_string_view;
  using TaskRunner = footstone::TaskRunner;

  explicit V8InspectorClientImpl(std::shared_ptr<Scope> scope, std::weak_ptr<TaskRunner> runner);
  ~V8InspectorClientImpl() = default;

  inline std::shared_ptr<TaskRunner> GetInspectorRunner() {
    return inspector_runner_;
  }

  inline std::unique_ptr<V8ChannelImpl>& GetChannel() {
    return channel_;
  }

  inline std::unique_ptr<v8_inspector::V8InspectorSession>& GetSession() {
    return session_;
  }

  inline void SetSession(std::unique_ptr<v8_inspector::V8InspectorSession> session) {
    session_ = std::move(session);
  }

  inline std::unique_ptr<v8_inspector::V8Inspector>& GetInspector() {
    return inspector_;
  }

#if defined(ENABLE_INSPECTOR) && !defined(V8_WITHOUT_INSPECTOR)
  void Reset(std::shared_ptr<Scope> scope, const std::shared_ptr<hippy::devtools::DevtoolsDataSource> devtools_data_source);
  void Connect(const std::shared_ptr<hippy::devtools::DevtoolsDataSource> devtools_data_source);
#endif

  void SendMessageToV8(unicode_string_view&& params);
  void CreateContext();
  void DestroyContext();
  v8::Local<v8::Context> ensureDefaultContextInGroup(int contextGroupId) override;
  void runMessageLoopOnPause(int contextGroupId) override;
  void quitMessageLoopOnPause() override;
  void runIfWaitingForDebugger(int contextGroupId) override;

  void muteMetrics(int contextGroupId) override {}
  void unmuteMetrics(int contextGroupId) override {}

  void beginUserGesture() override {}
  void endUserGesture() override {}

  std::unique_ptr<v8_inspector::StringBuffer> valueSubtype(
      v8::Local<v8::Value>) override {
    return nullptr;
  }
  bool formatAccessorsAsProperties(v8::Local<v8::Value>) {
    return false;
  }
  bool isInspectableHeapObject(v8::Local<v8::Object>) override { return true; }

  void beginEnsureAllContextsInGroup(int contextGroupId) override {}
  void endEnsureAllContextsInGroup(int contextGroupId) override {}

  void installAdditionalCommandLineAPI(v8::Local<v8::Context>,
                                       v8::Local<v8::Object>) override {}
  void consoleAPIMessage(int contextGroupId,
                         v8::Isolate::MessageErrorLevel level,
                         const v8_inspector::StringView& message,
                         const v8_inspector::StringView& url,
                         unsigned lineNumber,
                         unsigned columnNumber,
                         v8_inspector::V8StackTrace*) override {}

  v8::MaybeLocal<v8::Value> memoryInfo(v8::Isolate*,
                                       v8::Local<v8::Context>) override {
    return v8::MaybeLocal<v8::Value>();
  }

  void consoleTime(const v8_inspector::StringView& title) override {}
  void consoleTimeEnd(const v8_inspector::StringView& title) override {}
  void consoleTimeStamp(const v8_inspector::StringView& title) override {}
  void consoleClear(int contextGroupId) override {}
  double currentTimeMS() override { return 0; }
  typedef void (*TimerCallback)(void*);
  void startRepeatingTimer(double, TimerCallback, void* data) override {}
  void cancelTimer(void* data) override {}
  bool canExecuteScripts(int contextGroupId) override { return true; }

  void maxAsyncCallStackDepthChanged(int depth) override {}

 private:
  std::shared_ptr<Scope> scope_;
  std::unique_ptr<v8_inspector::V8Inspector> inspector_;
  std::unique_ptr<V8ChannelImpl> channel_;
  std::unique_ptr<v8_inspector::V8InspectorSession> session_;
  std::weak_ptr<TaskRunner> js_runner_;
  std::shared_ptr<TaskRunner> inspector_runner_;
  std::mutex mutex_;
};

}  // namespace inspector
}  // namespace hippy
