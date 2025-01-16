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

#include "renderer/uimanager/hr_gesture_dispatcher.h"
#include "footstone/hippy_value.h"
#include "renderer/utils/hr_pixel_utils.h"

namespace hippy {
inline namespace render {
inline namespace native {

using HippyValue = footstone::HippyValue;
using HippyValueObjectType = footstone::HippyValue::HippyValueObjectType;

void HRGestureDispatcher::HandleTouchEvent(std::shared_ptr<NativeRenderContext> &ctx, uint32_t node_id, float window_x,
    float window_y, const std::string &event_name) {
  HippyValueObjectType param;
  param[HRGestureDispatcher::KEY_PAGE_X] = HippyValue(HRPixelUtils::VpToDp(window_x));
  param[HRGestureDispatcher::KEY_PAGE_Y] = HippyValue(HRPixelUtils::VpToDp(window_y));
  auto params = std::make_shared<HippyValue>(std::move(param));
  HREventUtils::SendGestureEvent(ctx, node_id, event_name, params);
}

} // namespace native
} // namespace render
} // namespace hippy
