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

#include "renderer/utils/hr_event_utils.h"
#include "renderer/native_render_provider_manager.h"

namespace hippy {
inline namespace render {
inline namespace native {

bool HREventUtils::CheckRegisteredEvent(std::shared_ptr<NativeRenderContext> &ctx, uint32_t node_id, const std::string &event_name) {
  auto instance_id = ctx->GetInstanceId();
  auto root_id = ctx->GetRootId();
  auto provider = NativeRenderProviderManager::GetRenderProvider(instance_id);
  if (provider) {
    std::string lower_name = event_name;
    std::transform(lower_name.begin(), lower_name.end(), lower_name.begin(), ::tolower);
    return provider->GetNativeRenderImpl()->CheckRegisteredEvent(root_id, node_id, lower_name);
  }
  return false;
}

void HREventUtils::SendRootEvent(uint32_t renderer_id, uint32_t root_id, const std::string &event_name,
                                 const std::shared_ptr<HippyValue> &params) {
  auto provider = NativeRenderProviderManager::GetRenderProvider(renderer_id);
  if (provider) {
    provider->DispatchEvent(root_id, root_id, event_name, params, false, false, HREventType::ROOT);
  }
}

void HREventUtils::Send(std::shared_ptr<NativeRenderContext> &ctx, uint32_t node_id, const std::string &event_name,
          const std::shared_ptr<HippyValue> &params, bool use_capture, bool use_bubble, HREventType event_type) {
  auto instance_id = ctx->GetInstanceId();
  auto root_id = ctx->GetRootId();
  auto provider = NativeRenderProviderManager::GetRenderProvider(instance_id);
  if (provider) {
    provider->DispatchEvent(root_id, node_id, event_name, params, use_capture, use_bubble, event_type);
  }
}

} // namespace native
} // namespace render
} // namespace hippy
