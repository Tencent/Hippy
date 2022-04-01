//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#pragma once

#include <string>
#include "api/adapter/data/trace_event_metas.h"
#include "api/adapter/data/frame_timing_metas.h"

namespace tdf {
namespace devtools {
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
}  // namespace devtools
}  // namespace tdf
