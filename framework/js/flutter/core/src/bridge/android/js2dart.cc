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

#include "core/runtime/v8/runtime.h"
#include "core/runtime/v8/v8_bridge_utils.h"
#include "js2dart.h"
#include "bridge/string_util.h"
#include "voltron_bridge.h"

using unicode_string_view = tdf::base::unicode_string_view;
using V8BridgeUtils = hippy::runtime::V8BridgeUtils;
using bytes = std::string;

namespace voltron::bridge {
void CallDart(hippy::napi::CBDataTuple *data) {
  TDF_BASE_DLOG(INFO) << "CallDartMethod";
  auto cb = [](const std::shared_ptr<Runtime> &runtime,
               const unicode_string_view &module,
               const unicode_string_view &func,
               const unicode_string_view &cb_id,
               bool is_heap_buffer,
               const bytes &buffer) {
    char16_t *module_name = StrViewToCU16String(module);
    char16_t *module_func = StrViewToCU16String(func);
    char16_t *call_id = StrViewToCU16String(cb_id);
    const char *buffer_data = buffer.c_str();
    int buffer_length = buffer.length();

    auto bridge = std::static_pointer_cast<VoltronBridge>(runtime->GetBridge());

    if (bridge) {
      bridge->GetPlatformRuntime()->CallNaive(module_name,
                                              module_func,
                                              call_id,
                                              buffer_data,
                                              buffer_length,
                                              !runtime->IsEnableV8Serialization(),
                                              nullptr,
                                              true);
    }
  };
  V8BridgeUtils::CallNative(data, cb);

}
}
