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

#include "MTTUtil.h"

#ifdef ANDROID
#include <android/log.h>
void MTTLog(LogLevel level, const char *format, ...) {
  va_list args;
  va_start(args, format);
  int androidLevel = LogLevelDebug;
  switch (level) {
    case LogLevelInfo:
      androidLevel = ANDROID_LOG_INFO;
      break;
    case LogLevelVerbose:
      androidLevel = ANDROID_LOG_VERBOSE;
    case LogLevelDebug:
      androidLevel = ANDROID_LOG_DEBUG;
      break;
    case LogLevelWarn:
      androidLevel = ANDROID_LOG_WARN;
      break;
    case LogLevelError:
      androidLevel = ANDROID_LOG_ERROR;
      break;
    case LogLevelFatal:
      androidLevel = ANDROID_LOG_FATAL;
      break;
    default:
      break;
  }
  __android_log_vprint(androidLevel, "HippyLayout", format, args);
  va_end(args);
}
#else
void MTTLog(LogLevel level, const char *format, ...) {
  va_list args;
  va_start(args, format);
  if (level >= LogLevelError) {
    vfprintf(stderr, format, args);
  } else {
    vprintf(format, args);
  }
  va_end(args);
}
#endif

bool FloatIsEqual(const float a, const float b) {
  if (isUndefined(a)) {
    return isUndefined(b);
  }
  if (isUndefined(b)) {
    return isUndefined(a);
  }
  return fabs(a - b) < 0.0001f;
}

bool FloatIsEqualInScale(float a, float b, float scale) {
  if (isUndefined(a)) {
    return isUndefined(b);
  }
  if (isUndefined(b)) {
    return isUndefined(a);
  }
  a = PixelRound(a, scale);
  b = PixelRound(b, scale);
  return fabs(a - b) < 0.0001f;
}

bool MTTSizeIsEqual(MTTSize a, MTTSize b) {
  return FloatIsEqual(a.width, b.width) && FloatIsEqual(a.height, b.height);
}

bool MTTSizeIsEqualInScale(MTTSize a, MTTSize b, float scale) {
  return FloatIsEqualInScale(a.width, b.width, scale) &&
         FloatIsEqualInScale(a.height, b.height, scale);
}

float MTTRoundValueToPixelGrid(float value, float scaleFactor, bool forceCeil, bool forceFloor) {
  float scaleValue = value * scaleFactor;
  float fractial = fmodf(scaleValue, 1.0);
  if (fractial < 0) {
    ++fractial;
  }

  if (FloatIsEqual(fractial, 0)) {
    // First we check if the value is already rounded
    scaleValue = scaleValue - fractial;
  } else if (FloatIsEqual(fractial, 1.0)) {
    scaleValue = scaleValue - fractial + 1.0;
  } else if (forceCeil) {
    // Next we check if we need to use forced rounding
    scaleValue = scaleValue - fractial + 1.0f;
  } else if (forceFloor) {
    scaleValue = scaleValue - fractial;
  } else {
    // Finally we just round the value
    scaleValue = scaleValue - fractial +
      (fractial > 0.5f || FloatIsEqual(fractial, 0.5f) ? 1.0f : 0.0f);
  }
  return scaleValue / scaleFactor;
}
