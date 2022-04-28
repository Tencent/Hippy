/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
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

#include <string>
#include "api/adapter/data/trace_event_metas.h"
#include "api/adapter/data/frame_timing_metas.h"

namespace hippy::devtools {
class PerformanceAdapter {
 public:
  using CoreTimelineCallback = std::function<void(const TraceEventMetas &metas)>;
  using CoreFrameTimingsCallback = std::function<void(const FrameTimingMetas &frame_timings)>;

  /**
   * 获取timeline性能数据
   * @param callback 操作完成后的回调
   */
  virtual void CollectTimeline(CoreTimelineCallback callback) = 0;

  /**
   * 获取FrameTimings数据
   * @param callback 操作完成的回调
   */
  virtual void CollectFrameTimings(CoreFrameTimingsCallback callback) = 0;

  /**
   * 清空内核 frameTimings 数据
   */
  virtual void ResetFrameTimings() = 0;

  /**
   * 清空内核 timeline 数据
   */
  virtual void ResetTimeline() = 0;
};
}  // namespace hippy::devtools
