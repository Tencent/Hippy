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

#include "render/bridge/bridge_manager.h"

namespace voltron {
class EXPORT JSBridgeRuntime : public BridgeRuntime {
 public:
  JSBridgeRuntime(int32_t engine_id, uint32_t ffi_id, bool bridge_parse_json);
  virtual ~JSBridgeRuntime() = default;

 public:
  virtual void CallDart(std::u16string &moduleName, std::u16string &moduleFunc, std::u16string &callId,
                                std::string params, bool bridgeParamJson,
                                std::function<void()> callback) = 0;
  virtual void ReportJSONException(const char* jsonValue) = 0;
  virtual void ReportJSException(std::u16string &description_stream, std::u16string &stack_stream) = 0;
  virtual void SetRuntimeId(int64_t runtime_id) = 0;
  virtual int64_t GetRuntimeId() = 0;
};
}  // namespace voltron
