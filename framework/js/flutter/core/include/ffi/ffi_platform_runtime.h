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
#  include "common_header.h"
#endif
#include "bridge_define.h"

namespace voltron {
class FFIPlatformRuntime : public PlatformRuntime {
 private:
  int32_t engine_id_ = 0;
  int64_t runtime_id_ = 0;

 public:
  explicit FFIPlatformRuntime(int32_t engine_id);
  ~FFIPlatformRuntime() override = default;
  void CallNaive(const char16_t* moduleName, const char16_t* moduleFunc, const char16_t* callId, const void* paramsData,
                 uint32_t paramsLen, bool bridgeParamJson, std::function<void()> callback, bool autoFree) override;
  void ReportJSONException(const char* jsonValue) override;
  void ReportJSException(const char16_t* description_stream, const char16_t* stack_stream) override;
  void SendResponse(const uint16_t* source, int len) override;
  void SendNotification(const uint16_t* source, int len) override;
  int64_t CalculateNodeLayout(int32_t instance_id, int32_t node_id, double width, int32_t width_mode, double height,
                              int32_t height_mode) override;
  void Destroy() override;
  void SetRuntimeId(int64_t runtime_id) override;
  int64_t GetRuntimeId() override;

 private:
  static const void* copyParamsData(const void* form, uint32_t length);
};
}  // namespace voltron
