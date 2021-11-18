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

#include <assert.h>
#include <math.h>
#include <stdarg.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <cmath>

#include "MTTFlex.h"

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

typedef enum {
  LogLevelInfo,
  LogLevelVerbose,
  LogLevelDebug,
  LogLevelWarn,
  LogLevelError,
  LogLevelFatal,
} LogLevel;

#define MTTLogd(...) MTTLog(LogLevelDebug, __VA_ARGS__)
#define MTTLogdStr(...) MTTLog(LogLevelDebug, "%s", __VA_ARGS__)
void MTTLog(LogLevel level, const char *format, ...);

bool FloatIsEqual(const float a, const float b);
bool FloatIsEqualInScale(float a, float b, float scale);
bool MTTSizeIsEqual(MTTSize a, MTTSize b);
bool MTTSizeIsEqualInScale(MTTSize a, MTTSize b, float scale);
float MTTRoundValueToPixelGrid(float value, float scaleValue, bool forceCeil, bool forceFloor);
