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
#include "v8/v8-inspector.h"
#include "bridge/android/runtime.h"

namespace hippy {
namespace inspector {

class V8ChannelImpl : public v8_inspector::V8Inspector::Channel {
 public:
  explicit V8ChannelImpl(std::shared_ptr<PlatformRuntime> runtime);
  ~V8ChannelImpl() override = default;

  inline std::shared_ptr<PlatformRuntime> GetBridge() { return runtime_; }

  inline void SetBridge(std::shared_ptr<PlatformRuntime> runtime) { runtime_ = runtime; }

  void sendResponse(
      int callId,
      std::unique_ptr<v8_inspector::StringBuffer> message) override;
  void sendNotification(
      std::unique_ptr<v8_inspector::StringBuffer> message) override;
  void flushProtocolNotifications() override {}

 private:
  friend class V8InspectorClientImpl;
  std::shared_ptr<PlatformRuntime> runtime_;
};

}  // namespace inspector
}  // namespace hippy
