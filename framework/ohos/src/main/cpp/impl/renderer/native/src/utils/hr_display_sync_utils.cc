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

#include "renderer/utils/hr_display_sync_utils.h"

namespace hippy {
inline namespace render {
inline namespace native {

const char *DO_FRAME = "frameUpdate";

bool HRDisplaySyncUtils::sEnablePostFrame = false;
OH_DisplaySoloist *HRDisplaySyncUtils::sBackDisplaySync = nullptr;
std::mutex HRDisplaySyncUtils::sMutex_;
std::map<uint32_t, std::vector<uint32_t>> HRDisplaySyncUtils::sListeners;

void HRDisplaySyncUtils::RegisterDoFrameListener(uint32_t rendererId, uint32_t rootId) {
  std::lock_guard<std::mutex> lock(sMutex_);
  sListeners[rendererId].push_back(rootId);
  if (!sEnablePostFrame) {
    sEnablePostFrame = true;
    StartPostFrame();
  }
}

void HRDisplaySyncUtils::UnregisterDoFrameListener(uint32_t rendererId, uint32_t rootId) {
  std::lock_guard<std::mutex> lock(sMutex_);
  auto it = sListeners.find(rendererId);
  if (it != sListeners.end()) {
    auto& roots = it->second;
    roots.erase(std::remove(roots.begin(), roots.end(), rootId), roots.end());
    if (roots.empty()) {
      sListeners.erase(it);
    }
  }

  if (sListeners.empty()) {
    sEnablePostFrame = false;
    StopPostFrame();
  }
}

void HRDisplaySyncUtils::HandleDoFrameCallback() {
  std::lock_guard<std::mutex> lock(sMutex_);
  for (const auto& entry : sListeners) {
    auto rendererId = entry.first;
    const std::vector<uint32_t>& rootList = entry.second;
    if (!rootList.empty()) {
      for (uint32_t rootId : rootList) {
        HREventUtils::SendRootEvent((uint32_t)rendererId, (uint32_t)rootId, DO_FRAME, nullptr);
      }
    }
  }
}

void HRDisplaySyncUtils::StartPostFrame() {
  if (!sBackDisplaySync) {
    sBackDisplaySync = OH_DisplaySoloist_Create(false);
  }
  
  DisplaySoloist_ExpectedRateRange rateRange = {0, 120, 60};
  OH_DisplaySoloist_SetExpectedFrameRateRange(sBackDisplaySync, &rateRange);
  OH_DisplaySoloist_Start(sBackDisplaySync, FrameCallback, nullptr);
}

void HRDisplaySyncUtils::StopPostFrame() {
  if (sBackDisplaySync) {
    OH_DisplaySoloist_Stop(sBackDisplaySync);
    OH_DisplaySoloist_Destroy(sBackDisplaySync);
    sBackDisplaySync = nullptr;
  }
}

// This method is from a sub thread.
void HRDisplaySyncUtils::FrameCallback(long long timestamp, long long targetTimestamp, void *data) {
  HandleDoFrameCallback();
}


} // namespace native
} // namespace render
} // namespace hippy