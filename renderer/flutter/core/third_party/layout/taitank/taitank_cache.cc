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

#include "taitank_cache.h"

#ifdef __DEBUG__
#  include <iostream>
#  include <string>
#endif

#include "taitank_util.h"

namespace taitank {

TaitankLayoutCache::TaitankLayoutCache() { InitCache(); }

TaitankLayoutCache::~TaitankLayoutCache() {}

void TaitankLayoutCache::CacheResult(TaitankSize available_size, TaitankSize result_size,
                                     TaitankSizeMode measure_mode, FlexLayoutAction layout_action) {
  if (layout_action == LAYOUT_ACTION_LAYOUT) {
    cached_layout_.available_size = available_size;
    cached_layout_.width_measure_mode = measure_mode.width_measure_mode;
    cached_layout_.height_measure_mode = measure_mode.height_measure_mode;
    cached_layout_.result_size = result_size;
    cached_layout_.layout_action = layout_action;
  } else {
    cached_measures_[next_measure_index_].available_size = available_size;
    cached_measures_[next_measure_index_].width_measure_mode = measure_mode.width_measure_mode;
    cached_measures_[next_measure_index_].height_measure_mode = measure_mode.height_measure_mode;
    cached_measures_[next_measure_index_].result_size = result_size;
    cached_measures_[next_measure_index_].layout_action = layout_action;
    next_measure_index_ = (next_measure_index_ + 1) % kMaxMeasuresCount;
  }
}

static inline bool SizeIsExactAndMatchesOldMeasuredSize(MeasureMode sizeMode, float size,
                                                        float lastResultSize) {
  return sizeMode == MEASURE_MODE_EXACTLY && FloatIsEqual(size, lastResultSize);
}

static inline bool OldSizeIsUndefinedAndStillFits(MeasureMode sizeMode, float size,
                                                  MeasureMode lastSizeMode, float lastResultSize) {
  return sizeMode == MEASURE_MODE_AT_MOST && lastSizeMode == MEASURE_MODE_UNDEFINED &&
         (size >= lastResultSize || FloatIsEqual(size, lastResultSize));
}

static inline bool NewMeasureSizeIsStricterAndStillValid(MeasureMode sizeMode, float size,
                                                         MeasureMode lastSizeMode, float lastSize,
                                                         float lastResultSize) {
  return lastSizeMode == MEASURE_MODE_AT_MOST && sizeMode == MEASURE_MODE_AT_MOST &&
         lastSize > size && (lastResultSize <= size || FloatIsEqual(size, lastResultSize));
}

MeasureResult* TaitankLayoutCache::UseMeasureCacheIfPossible(TaitankSize available_size,
                                                             TaitankSizeMode measure_mode,
                                                             FlexLayoutAction layout_action,
                                                             bool is_measure_node) {
  if (next_measure_index_ <= 0) {
    return nullptr;
  }

  for (uint32_t i = 0; i < next_measure_index_; i++) {
    MeasureResult& cacheMeasure = cached_measures_[i];
    if (layout_action != cacheMeasure.layout_action && !is_measure_node) {
      continue;
    }

    bool widthCanUse = false;
    widthCanUse = cacheMeasure.width_measure_mode == measure_mode.width_measure_mode &&
                  FloatIsEqual(cacheMeasure.available_size.width, available_size.width);

    if (is_measure_node) {
      if (!widthCanUse) {
        widthCanUse = SizeIsExactAndMatchesOldMeasuredSize(
            measure_mode.width_measure_mode, available_size.width, cacheMeasure.result_size.width);
      }

      if (!widthCanUse) {
        widthCanUse = OldSizeIsUndefinedAndStillFits(
            measure_mode.width_measure_mode, available_size.width, cacheMeasure.width_measure_mode,
            cacheMeasure.result_size.width);
      }

      if (!widthCanUse) {
        widthCanUse = NewMeasureSizeIsStricterAndStillValid(
            measure_mode.width_measure_mode, available_size.width, cacheMeasure.width_measure_mode,
            cacheMeasure.available_size.width, cacheMeasure.result_size.width);
      }
    }

    bool heightCanUse = false;
    heightCanUse = cacheMeasure.height_measure_mode == measure_mode.height_measure_mode &&
                   FloatIsEqual(cacheMeasure.available_size.height, available_size.height);

    if (is_measure_node) {
      if (!heightCanUse) {
        heightCanUse = SizeIsExactAndMatchesOldMeasuredSize(measure_mode.height_measure_mode,
                                                            available_size.height,
                                                            cacheMeasure.result_size.height);
      }

      if (!heightCanUse) {
        heightCanUse = OldSizeIsUndefinedAndStillFits(
            measure_mode.height_measure_mode, available_size.height,
            cacheMeasure.height_measure_mode, cacheMeasure.result_size.height);
      }

      if (!heightCanUse) {
        heightCanUse = NewMeasureSizeIsStricterAndStillValid(
            measure_mode.height_measure_mode, available_size.height,
            cacheMeasure.height_measure_mode, cacheMeasure.available_size.height,
            cacheMeasure.result_size.height);
      }
    }

    if (widthCanUse && heightCanUse) {
#ifdef __DEBUG__
      TaitankLogd("cache: action:%d\n", cacheMeasure.layoutAction);
#endif
      return &cacheMeasure;
    }
  }

  return nullptr;
}

MeasureResult* TaitankLayoutCache::UseLayoutCacheIfPossible(TaitankSize available_size,
                                                            TaitankSizeMode measure_mode) {
  if (isUndefined(cached_layout_.available_size.width) ||
      isUndefined(cached_layout_.available_size.height)) {
    return nullptr;
  }

  if (TaitankSizeIsEqual(cached_layout_.available_size, available_size) &&
      cached_layout_.width_measure_mode == measure_mode.width_measure_mode &&
      cached_layout_.height_measure_mode == measure_mode.height_measure_mode) {
#ifdef __DEBUG__
    TaitankLogd("cache: action:%d\n", LAYOUT_ACTION_LAYOUT);
#endif
    return &cached_layout_;
  }

  return nullptr;
}

MeasureResult* TaitankLayoutCache::get_cached_measure_result(TaitankSize available_size,
                                                             TaitankSizeMode measure_mode,
                                                             FlexLayoutAction layout_action,
                                                             bool is_measure_node) {
  if (is_measure_node) {
    MeasureResult* result = UseLayoutCacheIfPossible(available_size, measure_mode);
    if (result != nullptr) {
      return result;
    }
    return UseMeasureCacheIfPossible(available_size, measure_mode, layout_action, is_measure_node);
  } else if (layout_action == LAYOUT_ACTION_LAYOUT) {
    return UseLayoutCacheIfPossible(available_size, measure_mode);
  } else {
    return UseMeasureCacheIfPossible(available_size, measure_mode, layout_action, is_measure_node);
  }

  return nullptr;
}

MeasureResult* TaitankLayoutCache::get_cached_layout() { return &cached_layout_; }

void TaitankLayoutCache::InitCache() {
  cached_layout_.available_size = {VALUE_UNDEFINED, VALUE_UNDEFINED};
  cached_layout_.result_size = {VALUE_UNDEFINED, VALUE_UNDEFINED};
  cached_layout_.width_measure_mode = MEASURE_MODE_UNDEFINED;
  cached_layout_.height_measure_mode = MEASURE_MODE_UNDEFINED;
  for (uint32_t i = 0; i < kMaxMeasuresCount; i++) {
    cached_measures_[i].available_size = {VALUE_UNDEFINED, VALUE_UNDEFINED};
    cached_measures_[i].result_size = {VALUE_UNDEFINED, VALUE_UNDEFINED};
    cached_measures_[i].width_measure_mode = MEASURE_MODE_UNDEFINED;
    cached_measures_[i].height_measure_mode = MEASURE_MODE_UNDEFINED;
  }
  next_measure_index_ = 0;
}

void TaitankLayoutCache::ClearCache() { InitCache(); }

}  // namespace taitank