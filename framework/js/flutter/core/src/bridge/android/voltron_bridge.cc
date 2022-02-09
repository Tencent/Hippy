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

#include "voltron_bridge.h"

#include <utility>

namespace voltron {
void VoltronBridge::SendResponse(std::unique_ptr<v8_inspector::StringBuffer> message) {
  if (runtime_) {
    const uint16_t* source = message->string().characters16();
    int len = message->string().length();
    runtime_->SendResponse(source, len);
  }
}

void VoltronBridge::SendNotification(std::unique_ptr<v8_inspector::StringBuffer> message) {
  if (runtime_) {
    const uint16_t* source = message->string().characters16();
    int len = message->string().length();
    runtime_->SendNotification(source, len);
  }
}

voltron::VoltronBridge::VoltronBridge(std::shared_ptr<PlatformRuntime> runtime)
    : runtime_(std::move(runtime)) {}

VoltronBridge::~VoltronBridge() {
  runtime_ = nullptr;
}
std::shared_ptr<PlatformRuntime> VoltronBridge::GetPlatformRuntime() {
  return runtime_;
}

}

