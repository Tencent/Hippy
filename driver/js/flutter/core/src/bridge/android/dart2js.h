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

#include "core/core.h"
#include "core/runtime/v8/v8_bridge_utils.h"

namespace voltron {
namespace bridge {

using bytes = std::string;
using unicode_string_view = footstone::stringview::unicode_string_view;
using CALLFUNCTION_CB_STATE = hippy::runtime::CALL_FUNCTION_CB_STATE;
using V8BridgeUtils = hippy::runtime::V8BridgeUtils;

void CallJSFunction(int64_t runtime_id, const unicode_string_view& action_name, bytes params_data,
                    std::function<void(int64_t)> callback);

}  // namespace bridge
}  // namespace voltron
