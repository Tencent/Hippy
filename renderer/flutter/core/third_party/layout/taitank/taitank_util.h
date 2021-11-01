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

#ifndef TAITANK_TAITANK_UTIL_H_
#define TAITANK_TAITANK_UTIL_H_

#include <assert.h>
#include <math.h>
#include <stdarg.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <cmath>

#include "taitank_flex.h"

// #define __DEBUG__
// #define LAYOUT_TIME_ANALYZE
#define ASSERT(e) (assert(e))
#define nullptr (NULL)
#define VALUE_AUTO (NAN)
#define VALUE_UNDEFINED (NAN)
#define isUndefined(n) (std::isnan(n))
#define isAuto(n) (std::isnan(n))
#define isDefined(n) (!std::isnan(n))
#define PixelRound(value, scale) (roundf((value) * (scale)) / (scale))
#define PixelRoundInt(value) (roundf(value))
#define NanAsINF(n) (std::isnan(n) ? INFINITY : n)

#define TaitankLogd(...) TaitankLog(LogLevelDebug, __VA_ARGS__)
#define TaitankLogdStr(...) TaitankLog(LogLevelDebug, "%s", __VA_ARGS__)

namespace taitank {

enum LogLevel {
  LogLevelInfo,
  LogLevelVerbose,
  LogLevelDebug,
  LogLevelWarn,
  LogLevelError,
  LogLevelFatal,
};

void TaitankLog(LogLevel level, const char *format, ...);

bool FloatIsEqual(const float a, const float b);
bool FloatIsEqualInScale(const float a, const float b, const float scale);
bool TaitankSizeIsEqual(const TaitankSize a, const TaitankSize b);
bool TaitankSizeIsEqualInScale(const TaitankSize a, const TaitankSize b, const float scale);
float TaitankRoundValueToPixelGrid(float value, const bool forceCeil, const bool forceFloor);

}  // namespace taitank

#endif  // TAITANK_TAITANK_UTIL_H_