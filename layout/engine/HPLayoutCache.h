/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
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

#ifndef HPLAYOUTCACHE_H_
#define HPLAYOUTCACHE_H_
#include "Flex.h"
#include <stdint.h>

typedef struct {
  HPSize availableSize;
  HPSize resultSize;
  MeasureMode widthMeasureMode;
  MeasureMode heightMeasureMode;
  FlexLayoutAction layoutAction;
} MeasureResult;

#define MAX_MEASURES_COUNT 6

class HPLayoutCache {
 public:
  HPLayoutCache();
  virtual ~HPLayoutCache();
  void cacheResult(HPSize availableSize, HPSize resultSize,
                   HPSizeMode measureMode, FlexLayoutAction layoutAction);
  MeasureResult* getCachedMeasureResult(HPSize availableSize,
                                        HPSizeMode measureMode,
                                        FlexLayoutAction layoutAction,
                                        bool isMeasureNode);
  MeasureResult* getCachedLayout();
  void clearCache();
 protected:
  void initCache();
  MeasureResult* useLayoutCacheIfPossible(HPSize availableSize,
                                          HPSizeMode measureMode);

  MeasureResult* useMeasureCacheIfPossible(HPSize availableSize,
                                           HPSizeMode measureMode,
                                           FlexLayoutAction layoutAction,
                                           bool isMeasureNode);
 private:
  MeasureResult cachedLayout;
  MeasureResult cachedMeasures[MAX_MEASURES_COUNT];
  uint32_t nextMeasureIndex;
};

#endif /* HPLAYOUTCACHE_H_ */
