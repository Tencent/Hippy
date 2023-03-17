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

#include "driver/runtime/v8/runtime.h"
#include "driver/runtime/v8/v8_bridge_utils.h"
#include "footstone/string_view_utils.h"
#include "js2dart.h"
#include "voltron_bridge.h"

using string_view = footstone::stringview::string_view;
using V8BridgeUtils = hippy::runtime::V8BridgeUtils;
using bytes = std::string;
using StringViewUtils = footstone::StringViewUtils;

namespace voltron::bridge {
void CallDart(hippy::CallbackInfo& info, int32_t runtime_id) {
  FOOTSTONE_DLOG(INFO) << "CallDartMethod";
  auto cb = [](const std::shared_ptr<hippy::Runtime> &runtime,
               const string_view &module,
               const string_view &func,
               const string_view &cb_id,
               bool is_heap_buffer,
               bytes &&buffer) {
    std::u16string
        module_name = StringViewUtils::CovertToUtf16(module, module.encoding()).utf16_value();
    std::u16string
        module_func = StringViewUtils::CovertToUtf16(func, func.encoding()).utf16_value();
    std::u16string call_id = StringViewUtils::CovertToUtf16(cb_id, cb_id.encoding()).utf16_value();
    FOOTSTONE_DCHECK(runtime->HasData(kBridgeSlot));
    auto bridge = std::any_cast<std::shared_ptr<VoltronBridge>>(runtime->GetData(kBridgeSlot));
    FOOTSTONE_DCHECK(bridge != nullptr);
    bridge->GetPlatformRuntime()->CallDart(module_name,
                                          module_func,
                                          call_id,
                                          std::move(buffer),
                                          !runtime->IsEnableV8Serialization(),
                                          nullptr);
  };
  V8BridgeUtils::CallNative(info, runtime_id, cb);

}
}
