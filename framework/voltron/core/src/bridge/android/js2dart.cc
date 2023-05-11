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

#include "driver/js_driver_utils.h"
#include "driver/scope.h"
#include "footstone/string_view_utils.h"
#include "js2dart.h"
#include "voltron_bridge.h"

using string_view = footstone::stringview::string_view;
using JsDriverUtils = hippy::JsDriverUtils;
using bytes = std::string;
using StringViewUtils = footstone::StringViewUtils;

namespace voltron::bridge {
void CallDart(hippy::CallbackInfo& info) {
  FOOTSTONE_DLOG(INFO) << "CallDartMethod";
  auto cb = [](const std::shared_ptr<hippy::Scope>& scope,
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
    auto bridge = std::any_cast<std::shared_ptr<VoltronBridge>>(scope->GetBridge());
    FOOTSTONE_DCHECK(bridge != nullptr && bridge->GetPlatformRuntime() != nullptr);
    auto is_bridge_parse_json = bridge->GetPlatformRuntime()->IsBridgeParseJson();
    bridge->GetPlatformRuntime()->CallDart(module_name,
                                          module_func,
                                          call_id,
                                          std::move(buffer),
                                          is_bridge_parse_json,
                                          nullptr);
  };
  JsDriverUtils::CallNative(info, cb);

}
}
