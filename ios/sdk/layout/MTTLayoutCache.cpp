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

#include "MTTLayoutCache.h"

#include "MTTUtil.h"

#ifdef __DEBUG__
#include <iostream>
#include <string>
#endif

MTTLayoutCache::MTTLayoutCache() {
  initCache();
}

MTTLayoutCache::~MTTLayoutCache() {}

void MTTLayoutCache::cacheResult(MTTSize availableSize,
                                MTTSize resultSize,
                                MTTSizeMode measureMode,
                                FlexLayoutAction layoutAction) {
  if (layoutAction == LayoutActionLayout) {
    cachedLayout.availableSize = availableSize;
    cachedLayout.widthMeasureMode = measureMode.widthMeasureMode;
    cachedLayout.heightMeasureMode = measureMode.heightMeasureMode;
    cachedLayout.resultSize = resultSize;
    cachedLayout.layoutAction = layoutAction;
  } else {
    cachedMeasures[nextMeasureIndex].availableSize = availableSize;
    cachedMeasures[nextMeasureIndex].widthMeasureMode = measureMode.widthMeasureMode;
    cachedMeasures[nextMeasureIndex].heightMeasureMode = measureMode.heightMeasureMode;
    cachedMeasures[nextMeasureIndex].resultSize = resultSize;
    cachedMeasures[nextMeasureIndex].layoutAction = layoutAction;
    nextMeasureIndex = (nextMeasureIndex + 1) % MAX_MEASURES_COUNT;
  }
}

static inline bool SizeIsExactAndMatchesOldMeasuredSize(MeasureMode sizeMode,
                                                        float size,
                                                        float lastResultSize) {
  return sizeMode == MeasureModeExactly && FloatIsEqual(size, lastResultSize);
}

static inline bool OldSizeIsUndefinedAndStillFits(MeasureMode sizeMode,
                                                  float size,
                                                  MeasureMode lastSizeMode,
                                                  float lastResultSize) {
  return sizeMode == MeasureModeAtMost && lastSizeMode == MeasureModeUndefined &&
         (size >= lastResultSize || FloatIsEqual(size, lastResultSize));
}

static inline bool NewMeasureSizeIsStricterAndStillValid(MeasureMode sizeMode,
                                                         float size,
                                                         MeasureMode lastSizeMode,
                                                         float lastSize,
                                                         float lastResultSize) {
  return lastSizeMode == MeasureModeAtMost && sizeMode == MeasureModeAtMost && lastSize > size &&
         (lastResultSize <= size || FloatIsEqual(size, lastResultSize));
}

MeasureResult* MTTLayoutCache::useMeasureCacheIfPossible(MTTSize availableSize,
                                                        MTTSizeMode measureMode,
                                                        FlexLayoutAction layoutAction,
                                                        bool isMeasureNode) {
  if (nextMeasureIndex <= 0) {
    return nullptr;
  }

  for (uint32_t i = 0; i < nextMeasureIndex; i++) {
    MeasureResult& cacheMeasure = cachedMeasures[i];
    if (layoutAction != cacheMeasure.layoutAction && !isMeasureNode) {
      continue;
    }

    bool widthCanUse = false;
    widthCanUse = cacheMeasure.widthMeasureMode == measureMode.widthMeasureMode &&
                  FloatIsEqual(cacheMeasure.availableSize.width, availableSize.width);

    if (isMeasureNode) {
      if (!widthCanUse) {
        widthCanUse = SizeIsExactAndMatchesOldMeasuredSize(
            measureMode.widthMeasureMode, availableSize.width, cacheMeasure.resultSize.width);
      }

      if (!widthCanUse) {
        widthCanUse = OldSizeIsUndefinedAndStillFits(
            measureMode.widthMeasureMode, availableSize.width, cacheMeasure.widthMeasureMode,
            cacheMeasure.resultSize.width);
      }

      if (!widthCanUse) {
        widthCanUse = NewMeasureSizeIsStricterAndStillValid(
            measureMode.widthMeasureMode, availableSize.width, cacheMeasure.widthMeasureMode,
            cacheMeasure.availableSize.width, cacheMeasure.resultSize.width);
      }
    }

    bool heightCanUse = false;
    heightCanUse = cacheMeasure.heightMeasureMode == measureMode.heightMeasureMode &&
                   FloatIsEqual(cacheMeasure.availableSize.height, availableSize.height);

    if (isMeasureNode) {
      if (!heightCanUse) {
        heightCanUse = SizeIsExactAndMatchesOldMeasuredSize(
            measureMode.heightMeasureMode, availableSize.height, cacheMeasure.resultSize.height);
      }

      if (!heightCanUse) {
        heightCanUse = OldSizeIsUndefinedAndStillFits(
            measureMode.heightMeasureMode, availableSize.height, cacheMeasure.heightMeasureMode,
            cacheMeasure.resultSize.height);
      }

      if (!heightCanUse) {
        heightCanUse = NewMeasureSizeIsStricterAndStillValid(
            measureMode.heightMeasureMode, availableSize.height, cacheMeasure.heightMeasureMode,
            cacheMeasure.availableSize.height, cacheMeasure.resultSize.height);
      }
    }

    if (widthCanUse && heightCanUse) {
      return &cacheMeasure;
    }
  }

  return nullptr;
}

MeasureResult* MTTLayoutCache::useLayoutCacheIfPossible(MTTSize availableSize,
                                                       MTTSizeMode measureMode) {
  if (isUndefined(cachedLayout.availableSize.width) ||
      isUndefined(cachedLayout.availableSize.height)) {
    return nullptr;
  }

  if (MTTSizeIsEqual(cachedLayout.availableSize, availableSize) &&
      cachedLayout.widthMeasureMode == measureMode.widthMeasureMode &&
      cachedLayout.heightMeasureMode == measureMode.heightMeasureMode) {
    return &cachedLayout;
  }

  return nullptr;
}

MeasureResult* MTTLayoutCache::getCachedMeasureResult(MTTSize availableSize,
                                                     MTTSizeMode measureMode,
                                                     FlexLayoutAction layoutAction,
                                                     bool isMeasureNode) {
  if (isMeasureNode) {
    MeasureResult* result = useLayoutCacheIfPossible(availableSize, measureMode);
    if (result != nullptr) {
      return result;
    }
    return useMeasureCacheIfPossible(availableSize, measureMode, layoutAction, isMeasureNode);
  } else if (layoutAction == LayoutActionLayout) {
    return useLayoutCacheIfPossible(availableSize, measureMode);
  } else {
    return useMeasureCacheIfPossible(availableSize, measureMode, layoutAction, isMeasureNode);
  }

  return nullptr;
}

MeasureResult* MTTLayoutCache::getCachedLayout() {
  return &cachedLayout;
}

void MTTLayoutCache::initCache() {
  cachedLayout.availableSize = {VALUE_UNDEFINED, VALUE_UNDEFINED};
  cachedLayout.resultSize = {VALUE_UNDEFINED, VALUE_UNDEFINED};
  cachedLayout.widthMeasureMode = MeasureModeUndefined;
  cachedLayout.heightMeasureMode = MeasureModeUndefined;
  for (uint32_t i = 0; i < MAX_MEASURES_COUNT; i++) {
    cachedMeasures[i].availableSize = {VALUE_UNDEFINED, VALUE_UNDEFINED};
    cachedMeasures[i].resultSize = {VALUE_UNDEFINED, VALUE_UNDEFINED};
    cachedMeasures[i].widthMeasureMode = MeasureModeUndefined;
    cachedMeasures[i].heightMeasureMode = MeasureModeUndefined;
  }
  nextMeasureIndex = 0;
}

void MTTLayoutCache::clearCache() {
  initCache();
}
