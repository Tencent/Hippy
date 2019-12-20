/**
 * Copyright (c) 2017-present, Tencent, Inc.
 * All rights reserved.
 * Author: ianwang <ianwang@tencent.com>
 * Created on: 2018-01-08
 */

#ifndef MTTLAYOUTCACHE_H_
#define MTTLAYOUTCACHE_H_
#include "MTTFlex.h"
#include <stdint.h>

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
	void cacheResult(MTTSize availableSize, MTTSize resultSize,
					 MTTSizeMode measureMode, FlexLayoutAction layoutAction);
	MeasureResult* getCachedMeasureResult(MTTSize availableSize,MTTSizeMode measureMode,
										  FlexLayoutAction layoutAction,
										  bool isMeasureNode);
	MeasureResult* getCachedLayout();
	void clearCache();
protected:
	void initCache();
	MeasureResult* useLayoutCacheIfPossible(MTTSize availableSize, MTTSizeMode measureMode);

	MeasureResult* useMeasureCacheIfPossible(MTTSize availableSize, MTTSizeMode measureMode,
											 FlexLayoutAction layoutAction,
											 bool isMeasureNode);
private:
	MeasureResult cachedLayout;
	MeasureResult cachedMeasures[MAX_MEASURES_COUNT];
	uint32_t nextMeasureIndex;
};

#endif /* MTTLAYOUTCACHE_H_ */
