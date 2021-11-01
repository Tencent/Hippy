/*
 *
 * Tencent is pleased to support the open source community by making Taitank available. 
 * Copyright (C) 2021 THL A29 Limited, a Tencent company.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the “License”);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    http:// www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed in writing, software
 * distributed under the License is distributed on an “AS IS” BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations
 * under the License.
 *
 */

#ifndef TAITANK_TAITANK_CACHE_H_
#define TAITANK_TAITANK_CACHE_H_

#include <stdint.h>

#include "taitank_flex.h"

namespace taitank {

const int kMaxMeasuresCount = 6;

struct MeasureResult {
  TaitankSize available_size;
  TaitankSize result_size;
  MeasureMode width_measure_mode;
  MeasureMode height_measure_mode;
  FlexLayoutAction layout_action;
};

class TaitankLayoutCache {
 public:
  TaitankLayoutCache();
  virtual ~TaitankLayoutCache();
  void CacheResult(TaitankSize available_size, TaitankSize result_size,
                   TaitankSizeMode measure_mode, FlexLayoutAction layout_action);
  MeasureResult *get_cached_measure_result(TaitankSize available_size, TaitankSizeMode measure_mode,
                                           FlexLayoutAction layout_action, bool is_measure_node);
  MeasureResult *get_cached_layout();
  void ClearCache();

 protected:
  void InitCache();
  MeasureResult *UseLayoutCacheIfPossible(TaitankSize available_size, TaitankSizeMode measure_mode);

  MeasureResult *UseMeasureCacheIfPossible(TaitankSize available_size, TaitankSizeMode measure_mode,
                                           FlexLayoutAction layout_action, bool is_measure_node);

 private:
  MeasureResult cached_layout_;
  MeasureResult cached_measures_[kMaxMeasuresCount];
  uint32_t next_measure_index_;
};

}  // namespace taitank

#endif  // TAITANK_TAITANK_CACHE_H_
