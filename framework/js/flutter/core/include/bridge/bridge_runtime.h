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

#include <functional>

#include "render/ffi/bridge_manager.h"
#include "core/core.h"

namespace voltron {
class EXPORT JSBridgeRuntime : public BridgeRuntime {
 public:
  EXPORT JSBridgeRuntime(int32_t engine_id) : BridgeRuntime(engine_id) {};
  EXPORT virtual ~JSBridgeRuntime() = default;

 public:
  EXPORT virtual void CallDart(std::u16string &moduleName, std::u16string &moduleFunc, std::u16string &callId,
                                std::string params, bool bridgeParamJson,
                                std::function<void()> callback) = 0;
  EXPORT virtual void ReportJSONException(const char* jsonValue) = 0;
  EXPORT virtual void ReportJSException(std::u16string &description_stream, std::u16string &stack_stream) = 0;
  EXPORT virtual void SendResponse(const uint16_t* source, int len) = 0;
  EXPORT virtual void SendNotification(const uint16_t* source, int len) = 0;
  EXPORT virtual void Destroy() = 0;
  virtual void SetRuntimeId(int64_t runtime_id) = 0;
  virtual int64_t GetRuntimeId() = 0;
};
}  // namespace voltron
