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

#include "inspector/v8_channel_impl.h"

#include <string>
#include <utility>

namespace hippy {
namespace inspector {

V8ChannelImpl::V8ChannelImpl(std::shared_ptr<PlatformRuntime> runtime)
    : runtime_(std::move(runtime)) {}

void V8ChannelImpl::sendResponse(
    int callId,
    std::unique_ptr<v8_inspector::StringBuffer> message) {
  if (message->string().is8Bit()) {
    return;
  }

  const uint16_t* source = message->string().characters16();
  int len = message->string().length();

  if (runtime_ != nullptr) {
    runtime_->SendResponse(source, len);
  }
}

void V8ChannelImpl::sendNotification(
    std::unique_ptr<v8_inspector::StringBuffer> message) {
  if (message->string().is8Bit()) {
    return;
  }

  const uint16_t* source = message->string().characters16();
  int len = message->string().length();

  if (runtime_ != nullptr) {
    runtime_->SendNotification(source, len);
  }
}

}  // namespace inspector
}  // namespace hippy
