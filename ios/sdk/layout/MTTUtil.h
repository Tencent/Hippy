/**
 * Copyright (c) 2017-present, Tencent, Inc.
 * All rights reserved.
 * Author: ianwang <ianwang@tencent.com>
 * Created on: 2017-12-31
 */

#ifndef MTTUTIL_H_
#define MTTUTIL_H_

#include "MTTFlex.h"
#include <assert.h>
#include <math.h>
#include <stdarg.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

//#define __DEBUG__
//#define LAYOUT_TIME_ANALYZE
#define ASSERT(e) (assert(e))
#define nullptr (NULL)
#define VALUE_AUTO (NAN)
#define VALUE_UNDEFINED (NAN)
#define isUndefined(n) (isnan(n))
#define isAuto(n) (isnan(n))
#define isDefined(n) (!isnan(n))
#define PixelRound(value, scale) (roundf((value) * (scale)) / (scale))
#define PixelRoundInt(value) (roundf(value))
#define NanAsINF(n) (isnan(n) ? INFINITY : n)

typedef enum {
  LogLevelInfo,
  LogLevelVerbose,
  LogLevelDebug,
  LogLevelWarn,
  LogLevelError,
  LogLevelFatal,
} LogLevel;

#define MTTLogd(...) MTTLog(LogLevelDebug,  __VA_ARGS__)
#define MTTLogdStr(...) MTTLog(LogLevelDebug, "%s", __VA_ARGS__)
void  MTTLog(LogLevel level, const char *format, ...);

bool FloatIsEqual(const float a, const float b);
bool FloatIsEqualInScale(float a, float b, float scale);
bool MTTSizeIsEqual(MTTSize a, MTTSize b);
bool MTTSizeIsEqualInScale(MTTSize a, MTTSize b, float scale);
float MTTRoundValueToPixelGrid(float value, bool forceCeil, bool forceFloor);

#endif
