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

#include "bridge/bridge_runtime.h"
#include "core/runtime/v8/bridge.h"

namespace voltron {
using hippy::Bridge;
class VoltronBridge : public Bridge {
 public:
  VoltronBridge(std::shared_ptr<JSBridgeRuntime> runtime);
  ~VoltronBridge();
#ifdef ENABLE_INSPECTOR
  void SendResponse(std::unique_ptr<v8_inspector::StringBuffer> message) override;
  void SendNotification(std::unique_ptr<v8_inspector::StringBuffer> message) override;
#endif

  std::shared_ptr<JSBridgeRuntime> GetPlatformRuntime();
 private:
  std::shared_ptr<JSBridgeRuntime> runtime_;
};

}
