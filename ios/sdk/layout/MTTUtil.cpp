/**
 * Copyright (c) 2017-present, Tencent, Inc.
 * All rights reserved.
 * Author: ianwang <ianwang@tencent.com>
 * Created on: 2017-12-31
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
void  MTTLog(LogLevel level, const char *format, ...) {
	va_list args;
	va_start(args, format);
	if(level >= LogLevelError) {
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

bool FloatIsEqualInScale( float a, float b, float scale) {
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

	return FloatIsEqual(a.width, b.width) &&
			FloatIsEqual(a.height, b.height);
}

bool MTTSizeIsEqualInScale(MTTSize a, MTTSize b, float scale) {

	return FloatIsEqualInScale(a.width, b.width, scale) &&
			FloatIsEqualInScale(a.height, b.height, scale);
}



float MTTRoundValueToPixelGrid(float value, bool forceCeil, bool forceFloor) {
  float fractial = fmodf(value, 1.0);
  if (FloatIsEqual(fractial, 0)) {
    // First we check if the value is already rounded
	  value = value - fractial;
  } else if (FloatIsEqual(fractial, 1.0)) {
	  value = value - fractial + 1.0;
  } else if (forceCeil) {
    // Next we check if we need to use forced rounding
	  value = value - fractial + 1.0f;
  } else if (forceFloor) {
	  value = value - fractial;
  } else {
    // Finally we just round the value
	  value = roundf(value);
//	  value = value - fractial +
//        (fractial > 0.5f || FloatIsEqual(fractial, 0.5f) ? 1.0f : 0.0f);
  }
  return value;
}

