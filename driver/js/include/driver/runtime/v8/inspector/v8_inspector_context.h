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

#include "driver/runtime/v8/inspector/v8_channel_impl.h"

class Scope;

namespace hippy {
namespace inspector {

class V8InspectorContext {
 public:
  explicit V8InspectorContext(int32_t group_id,
                              std::unique_ptr<V8ChannelImpl> channel,
                              std::unique_ptr<v8_inspector::V8InspectorSession> session)
      : context_group_id_(group_id), channel_(std::move(channel)),
        session_(std::move(session)) {}

  inline void SetSession(std::unique_ptr<v8_inspector::V8InspectorSession> session) { session_ = std::move(session); }
#if defined(ENABLE_INSPECTOR) && !defined(V8_WITHOUT_INSPECTOR)
  inline void SetDevtoolsDataSource(std::shared_ptr<hippy::devtools::DevtoolsDataSource> devtools_data_source) { if (channel_) { channel_->SetDevtoolsDataSource(std::move(devtools_data_source));} }
#endif
  inline void SetScope(std::shared_ptr<Scope> scope) { scope_ = std::move(scope); }
  inline std::shared_ptr<Scope> GetScope() { return scope_; }
  inline V8ChannelImpl* GetV8Channel() { return channel_.get(); }
  inline int32_t GetContextGroupId() { return context_group_id_; }

  inline void SendMessageToV8(const v8_inspector::StringView message_view) {
    if (channel_) {
      session_->dispatchProtocolMessage(message_view);
    }
  }

 private:
  int32_t context_group_id_;
  std::unique_ptr<V8ChannelImpl> channel_;
  std::unique_ptr<v8_inspector::V8InspectorSession> session_;
  std::shared_ptr<Scope> scope_;
};
}  // namespace inspector
}  // namespace hippy
