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

#include "base/unicode_string_view.h"
#include "core/core.h"
#include "jni/scoped_java_ref.h"
#include "v8_channel_impl.h"

namespace hippy {
namespace inspector {

class V8InspectorClientImpl : public v8_inspector::V8InspectorClient {
 public:
  using unicode_string_view = tdf::base::unicode_string_view;

  explicit V8InspectorClientImpl(std::shared_ptr<Scope> scope);
  ~V8InspectorClientImpl() = default;

  void Reset(std::shared_ptr<Scope> scope, std::shared_ptr<JavaRef> bridge);
  void Connect(std::shared_ptr<JavaRef> bridge);

  void SendMessageToV8(const unicode_string_view& params);
  void CreateContext();
  void DestroyContext();
  v8::Local<v8::Context> ensureDefaultContextInGroup(
      int contextGroupId) override;

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
  bool formatAccessorsAsProperties(v8::Local<v8::Value>) override {
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

  // TODO(dgozman): this was added to support service worker shadow page. We
  // should not connect at all.
  bool canExecuteScripts(int contextGroupId) override { return true; }

  void maxAsyncCallStackDepthChanged(int depth) override {}

 private:
  std::shared_ptr<Scope> scope_;
  std::unique_ptr<v8_inspector::V8Inspector> inspector_;
  std::unique_ptr<V8ChannelImpl> channel_;
  std::unique_ptr<v8_inspector::V8InspectorSession> session_;
};

}  // namespace inspector
}  // namespace hippy
