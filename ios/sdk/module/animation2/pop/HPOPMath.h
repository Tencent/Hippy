/*!
 * iOS SDK
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 Copyright (c) 2014-present, Facebook, Inc.
 All rights reserved.

 This source code is licensed under the BSD-style license found in the
 LICENSE file in the root directory of this source tree. An additional grant
 of patent rights can be found in the PATENTS file in the same directory.
 */

#import <Foundation/Foundation.h>

#import <CoreGraphics/CoreGraphics.h>

#import "HPOPDefines.h"

NS_INLINE CGFloat sqrtr(CGFloat f)
{
#if CGFLOAT_IS_DOUBLE
  return sqrt(f);
#else
  return sqrtf(f);
#endif
}

// round to nearest sub; pass 2.0 to round to every 0.5 (eg: retina pixels)
NS_INLINE CGFloat POPSubRound(CGFloat f, CGFloat sub)
{
  return round(f * sub) / sub;
}

#define MIX(a, b, f) ((a) + (f) * ((b) - (a)))

// the longer the duration, the higher the necessary precision
#define SOLVE_EPS(dur) (1. / (1000. * (dur)))

#define _EQLF_(x, y, epsilon) (fabsf ((x) - (y)) < epsilon)

extern void POPInterpolateVector(NSUInteger count, CGFloat *dst, const CGFloat *from, const CGFloat *to, CGFloat f);

extern double POPTimingFunctionSolve(const double vec[4], double t, double eps);

// quadratic mapping of t [0, 1] to [start, end]
extern double POPQuadraticOutInterpolation(double t, double start, double end);

// normalize value to [0, 1] based on its range [startValue, endValue]
extern double POPNormalize(double value, double startValue, double endValue);

// project a normalized value [0, 1] to a given range [start, end]
extern double POPProjectNormal(double n, double start, double end);

// solve a quadratic equation of the form a * x^2 + b * x + c = 0
extern void POPQuadraticSolve(CGFloat a, CGFloat b, CGFloat c, CGFloat &x1, CGFloat &x2);

// for a given tension return the bouncy 3 friction that produces no bounce
extern double POPBouncy3NoBounce(double tension);
