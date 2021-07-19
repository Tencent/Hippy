/**
 * Copyright (c) 2017-present, Tencent, Inc.
 * All rights reserved.
 * Author: ianwang <ianwang@tencent.com>
 * Created on: 2018-01-08
 */

#include "MTTLayoutCache.h"
#include "MTTUtil.h"

#ifdef DEBUG
#include <string>
#include <iostream>
using namespace std;
#endif

MTTLayoutCache::MTTLayoutCache() {
    initCache();
}

MTTLayoutCache::~MTTLayoutCache() { }

void MTTLayoutCache::cacheResult(MTTSize availableSize, MTTSize resultSize, MTTSizeMode measureMode, FlexLayoutAction layoutAction) {
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

static inline bool SizeIsExactAndMatchesOldMeasuredSize(MeasureMode sizeMode, float size, float lastResultSize) {
    return sizeMode == MeasureModeExactly && FloatIsEqual(size, lastResultSize);
}

static inline bool OldSizeIsUndefinedAndStillFits(MeasureMode sizeMode, float size, MeasureMode lastSizeMode, float lastResultSize) {
    return sizeMode == MeasureModeAtMost && lastSizeMode == MeasureModeUndefined && (size >= lastResultSize || FloatIsEqual(size, lastResultSize));
}

static inline bool NewMeasureSizeIsStricterAndStillValid(
    MeasureMode sizeMode, float size, MeasureMode lastSizeMode, float lastSize, float lastResultSize) {
    return lastSizeMode == MeasureModeAtMost && sizeMode == MeasureModeAtMost && lastSize > size
           && (lastResultSize <= size || FloatIsEqual(size, lastResultSize));
}

MeasureResult *MTTLayoutCache::useMeasureCacheIfPossible(
    MTTSize availableSize, MTTSizeMode measureMode, FlexLayoutAction layoutAction, bool isMeasureNode) {
    if (nextMeasureIndex <= 0) {
        return nullptr;
    }

    for (uint32_t i = 0; i < nextMeasureIndex; i++) {
        MeasureResult &cacheMeasure = cachedMeasures[i];
        if (layoutAction != cacheMeasure.layoutAction && !isMeasureNode) {
            continue;
        }

        bool widthCanUse = false;
        widthCanUse
            = cacheMeasure.widthMeasureMode == measureMode.widthMeasureMode && FloatIsEqual(cacheMeasure.availableSize.width, availableSize.width);

        if (isMeasureNode) {
            if (!widthCanUse) {
                widthCanUse = SizeIsExactAndMatchesOldMeasuredSize(measureMode.widthMeasureMode, availableSize.width, cacheMeasure.resultSize.width);
            }

            if (!widthCanUse) {
                widthCanUse = OldSizeIsUndefinedAndStillFits(
                    measureMode.widthMeasureMode, availableSize.width, cacheMeasure.widthMeasureMode, cacheMeasure.resultSize.width);
            }

            if (!widthCanUse) {
                widthCanUse = NewMeasureSizeIsStricterAndStillValid(measureMode.widthMeasureMode, availableSize.width, cacheMeasure.widthMeasureMode,
                    cacheMeasure.availableSize.width, cacheMeasure.resultSize.width);
            }
        }

        bool heightCanUse = false;
        heightCanUse = cacheMeasure.heightMeasureMode == measureMode.heightMeasureMode
                       && FloatIsEqual(cacheMeasure.availableSize.height, availableSize.height);

        if (isMeasureNode) {
            if (!heightCanUse) {
                heightCanUse
                    = SizeIsExactAndMatchesOldMeasuredSize(measureMode.heightMeasureMode, availableSize.height, cacheMeasure.resultSize.height);
            }

            if (!heightCanUse) {
                heightCanUse = OldSizeIsUndefinedAndStillFits(
                    measureMode.heightMeasureMode, availableSize.height, cacheMeasure.heightMeasureMode, cacheMeasure.resultSize.height);
            }

            if (!heightCanUse) {
                heightCanUse = NewMeasureSizeIsStricterAndStillValid(measureMode.heightMeasureMode, availableSize.height,
                    cacheMeasure.heightMeasureMode, cacheMeasure.availableSize.height, cacheMeasure.resultSize.height);
            }
        }

        if (widthCanUse && heightCanUse) {
            //#ifdef __DEBUG__
            //			MTTLogd("cache: action:%d\n", cacheMeasure.layoutAction);
            //#endif
            return &cacheMeasure;
        }
    }

    return nullptr;
}

MeasureResult *MTTLayoutCache::useLayoutCacheIfPossible(MTTSize availableSize, MTTSizeMode measureMode) {
    if (isUndefined(cachedLayout.availableSize.width) || isUndefined(cachedLayout.availableSize.height)) {
        return nullptr;
    }

    if (MTTSizeIsEqual(cachedLayout.availableSize, availableSize) && cachedLayout.widthMeasureMode == measureMode.widthMeasureMode
        && cachedLayout.heightMeasureMode == measureMode.heightMeasureMode) {
        //#ifdef __DEBUG__
        //			MTTLogd("cache: action:%d\n", LayoutActionLayout);
        //#endif
        return &cachedLayout;
    }

    return nullptr;
}

MeasureResult *MTTLayoutCache::getCachedMeasureResult(
    MTTSize availableSize, MTTSizeMode measureMode, FlexLayoutAction layoutAction, bool isMeasureNode) {
    if (isMeasureNode) {
        MeasureResult *result = useLayoutCacheIfPossible(availableSize, measureMode);
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

MeasureResult *MTTLayoutCache::getCachedLayout() {
    return &cachedLayout;
}

void MTTLayoutCache::initCache() {
    cachedLayout.availableSize = { VALUE_UNDEFINED, VALUE_UNDEFINED };
    cachedLayout.resultSize = { VALUE_UNDEFINED, VALUE_UNDEFINED };
    cachedLayout.widthMeasureMode = MeasureModeUndefined;
    cachedLayout.heightMeasureMode = MeasureModeUndefined;
    //	for(uint32_t i = 0 ; i < MAX_MEASURES_COUNT; i++) {
    //		cachedMeasures[i].availableSize = {VALUE_UNDEFINED, VALUE_UNDEFINED};
    //		cachedMeasures[i].resultSize = {VALUE_UNDEFINED, VALUE_UNDEFINED};
    //		cachedMeasures[i].widthMeasureMode = MeasureModeUndefined;
    //		cachedMeasures[i].heightMeasureMode = MeasureModeUndefined;
    //	}
    nextMeasureIndex = 0;
}

void MTTLayoutCache::clearCache() {
    initCache();
}
