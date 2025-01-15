/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#pragma once

#include <js_native_api.h>
#include <js_native_api_types.h>
#include "footstone/string_view.h"
#include "footstone/hippy_value.h"

using HippyValue = footstone::value::HippyValue;

namespace hippy {
inline namespace framework {
inline namespace renderer {
inline namespace native {

void NativeRenderProvider_UpdateRootSize(uint32_t render_manager_id, uint32_t root_id, float width, float height);
void NativeRenderProvider_UpdateNodeSize(uint32_t render_manager_id, uint32_t root_id, uint32_t node_id, float width, float height);
void NativeRenderProvider_OnReceivedEvent(uint32_t render_manager_id, uint32_t root_id, uint32_t node_id,
      const std::string &event_name, const std::shared_ptr<HippyValue> &params, bool capture, bool bubble);
void NativeRenderProvider_DoCallBack(uint32_t render_manager_id, int32_t result, const std::string &func_name,
      uint32_t root_id, uint32_t node_id, uint32_t cb_id, const HippyValue &params);

} // namespace native
} // namespace renderer
} // namespace framework
} // namespace hippy
