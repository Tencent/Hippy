/* Tencent is pleased to support the open source community by making Hippy
 * available. Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights
 * reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#pragma once

#include <stdint.h>

#include "MTTFlex.h"

typedef struct {
  MTTSize availableSize;
  MTTSize resultSize;
  MeasureMode widthMeasureMode;
  MeasureMode heightMeasureMode;
  FlexLayoutAction layoutAction;
} MeasureResult;

#define MAX_MEASURES_COUNT 6

class MTTLayoutCache {
 public:
  MTTLayoutCache();
  virtual ~MTTLayoutCache();
  void cacheResult(MTTSize availableSize,
                   MTTSize resultSize,
                   MTTSizeMode measureMode,
                   FlexLayoutAction layoutAction);
  MeasureResult* getCachedMeasureResult(MTTSize availableSize,
                                        MTTSizeMode measureMode,
                                        FlexLayoutAction layoutAction,
                                        bool isMeasureNode);
  MeasureResult* getCachedLayout();
  void clearCache();

 protected:
  void initCache();
  MeasureResult* useLayoutCacheIfPossible(MTTSize availableSize, MTTSizeMode measureMode);

  MeasureResult* useMeasureCacheIfPossible(MTTSize availableSize,
                                           MTTSizeMode measureMode,
                                           FlexLayoutAction layoutAction,
                                           bool isMeasureNode);

 private:
  MeasureResult cachedLayout;
  MeasureResult cachedMeasures[MAX_MEASURES_COUNT];
  uint32_t nextMeasureIndex;
};
