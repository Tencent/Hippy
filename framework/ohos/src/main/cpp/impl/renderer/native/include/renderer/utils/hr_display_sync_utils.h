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

#include <map>
#include <vector>
#include "renderer/utils/hr_event_utils.h"
#include <native_display_soloist/native_display_soloist.h>


namespace hippy {
inline namespace render {
inline namespace native {

class HRDisplaySyncUtils{
 public:
  static void RegisterDoFrameListener(uint32_t rendererId, uint32_t rootId);
  static void UnregisterDoFrameListener(uint32_t rendererId, uint32_t rootId);
 private:
  static void StartPostFrame();
  static void StopPostFrame();
  static void FrameCallback(long long timestamp, long long targetTimestamp, void *data);
  static void HandleDoFrameCallback();
  
  static bool sEnablePostFrame;
  static OH_DisplaySoloist *sBackDisplaySync;
  static std::mutex sMutex_;
  static std::map<uint32_t, std::vector<uint32_t>> sListeners;
};
} // namespace native
} // namespace render
} // namespace hippy
