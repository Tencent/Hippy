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

#include "renderer/utils/hr_perf_utils.h"
#include "renderer/native_render_provider_manager.h"

extern "C" void OnFirstPaintEndForView(uint32_t scope_id, uint32_t root_id, int64_t time);
extern "C" void OnFirstContentfulPaintEndForView(uint32_t scope_id, int64_t time);

namespace hippy {
inline namespace render {
inline namespace native {

void HRPerfUtils::OnFirstPaint(std::shared_ptr<NativeRenderContext> &ctx) {
  auto instance_id = ctx->GetInstanceId();
  auto root_id = ctx->GetRootId();
  auto provider = NativeRenderProviderManager::GetRenderProvider(instance_id);
  if (!provider) {
    return;
  }

  uint32_t scope_id = NativeRenderProviderManager::GetScopeIdOfRootId(root_id);
  int64_t time = HRPerfUtils::GetTimeMilliSeconds();

  OnFirstPaintEndForView(scope_id, root_id, time);
}

void HRPerfUtils::OnFirstContentfulPaint(std::shared_ptr<NativeRenderContext> &ctx) {
  auto instance_id = ctx->GetInstanceId();
  auto root_id = ctx->GetRootId();
  auto provider = NativeRenderProviderManager::GetRenderProvider(instance_id);
  if (!provider) {
    return;
  }

  uint32_t scope_id = NativeRenderProviderManager::GetScopeIdOfRootId(root_id);
  int64_t time = HRPerfUtils::GetTimeMilliSeconds();

  OnFirstContentfulPaintEndForView(scope_id, time);
}

int64_t HRPerfUtils::GetTimeMilliSeconds() {
  auto now = std::chrono::system_clock::now();
  auto duration = now.time_since_epoch();
  auto millis = std::chrono::duration_cast<std::chrono::milliseconds>(duration).count();
  return millis;
}

} // namespace native
} // namespace render
} // namespace hippy
