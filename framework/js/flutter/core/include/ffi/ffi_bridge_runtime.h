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

#if defined(__ANDROID__) || defined(_WIN32)
#  include "bridge/bridge_runtime.h"
#elif __APPLE__
#  include "bridge/bridge_runtime.h"
#  include "render/ffi/common_header.h"
#endif
#include "bridge_define.h"

namespace voltron {
class FFIJSBridgeRuntime : public JSBridgeRuntime {
 private:
  int32_t engine_id_ = 0;
  int64_t runtime_id_ = 0;

 public:
  explicit FFIJSBridgeRuntime(int32_t engine_id);
  ~FFIJSBridgeRuntime() override = default;
  void CallDart(std::u16string &moduleName, std::u16string &moduleFunc, std::u16string &callId,
                std::string params, bool bridgeParamJson, std::function<void()> callback) override;
  void ReportJSONException(const char* jsonValue) override;
  void ReportJSException(std::u16string &description_stream, std::u16string &stack_stream) override;
  void SendResponse(const uint16_t* source, int len) override;
  void SendNotification(const uint16_t* source, int len) override;
  void Destroy() override;
  void SetRuntimeId(int64_t runtime_id) override;
  int64_t GetRuntimeId() override;
};
}  // namespace voltron
