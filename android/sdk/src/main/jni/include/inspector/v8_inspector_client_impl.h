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
  void Connect(const std::shared_ptr<JavaRef>& bridge);

  void SendMessageToV8(const unicode_string_view& params);
  void CreateContext();
  void DestroyContext();
  v8::Local<v8::Context> ensureDefaultContextInGroup(
      int contextGroupId) override;

  void runMessageLoopOnPause(int contextGroupId) override;
  void quitMessageLoopOnPause() override;
  void runIfWaitingForDebugger(int contextGroupId) override;

 private:
  std::shared_ptr<Scope> scope_;
  std::unique_ptr<v8_inspector::V8Inspector> inspector_;
  std::unique_ptr<V8ChannelImpl> channel_;
  std::unique_ptr<v8_inspector::V8InspectorSession> session_;
};

}  // namespace inspector
}  // namespace hippy
