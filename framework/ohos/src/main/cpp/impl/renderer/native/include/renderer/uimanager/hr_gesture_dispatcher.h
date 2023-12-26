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

#include <memory>
#include <map>
#include "renderer/native_render_context.h"
#include "renderer/utils/hr_event_utils.h"

namespace hippy {
inline namespace render {
inline namespace native {

class HRGestureDispatcher {
public:
  constexpr static const char * KEY_PAGE_X = "page_x";
  constexpr static const char * KEY_PAGE_Y = "page_y";
  
  inline static void HandleAttachedToWindow(std::shared_ptr<NativeRenderContext> &ctx, uint32_t node_id) {
    HREventUtils::SendComponentEvent(ctx, node_id, "attachedtowindow", nullptr);
  }

  inline static void HandleDetachedFromWindow(std::shared_ptr<NativeRenderContext> &ctx, uint32_t node_id) {
    HREventUtils::SendComponentEvent(ctx, node_id, "detachedfromwindow", nullptr);
  }

  inline static void HandleClickEvent(std::shared_ptr<NativeRenderContext> &ctx, uint32_t node_id, const std::string &event_name) {
    HREventUtils::SendGestureEvent(ctx, node_id, event_name, nullptr);
  }

  static void HandleTouchEvent(std::shared_ptr<NativeRenderContext> &ctx, uint32_t node_id,
      float window_x, float window_y, const std::string &event_name);

};

} // namespace native
} // namespace render
} // namespace hippy
