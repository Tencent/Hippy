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

#import "HPOPMath.h"

#import "HPOPAnimationPrivate.h"
#import "HPUnitBezier.h"

void POPInterpolateVector(NSUInteger count, CGFloat *dst, const CGFloat *from, const CGFloat *to, CGFloat f)
{
  for (NSUInteger idx = 0; idx < count; idx++) {
    dst[idx] = MIX(from[idx], to[idx], f);
  }
}

double POPTimingFunctionSolve(const double vec[4], double t, double eps)
{
  HPWebCore::UnitBezier bezier(vec[0], vec[1], vec[2], vec[3]);
  return bezier.solve(t, eps);
}

double POPNormalize(double value, double startValue, double endValue)
{
  return (value - startValue) / (endValue - startValue);
}

double POPProjectNormal(double n, double start, double end)
{
  return start + (n * (end - start));
}

static double linear_interpolation(double t, double start, double end)
{
  return t * end + (1.f - t) * start;
}

double POPQuadraticOutInterpolation(double t, double start, double end)
{
  return linear_interpolation(2*t - t*t, start, end);
}

static double b3_friction1(double x)
{
  return (0.0007 * pow(x, 3)) - (0.031 * pow(x, 2)) + 0.64 * x + 1.28;
}

static double b3_friction2(double x)
{
  return (0.000044 * pow(x, 3)) - (0.006 * pow(x, 2)) + 0.36 * x + 2.;
}

static double b3_friction3(double x)
{
  return (0.00000045 * pow(x, 3)) - (0.000332 * pow(x, 2)) + 0.1078 * x + 5.84;
}

double POPBouncy3NoBounce(double tension)
{
  double friction = 0;
  if (tension <= 18.) {
    friction = b3_friction1(tension);
  } else if (tension > 18 && tension <= 44) {
    friction = b3_friction2(tension);
  } else if (tension > 44) {
    friction = b3_friction3(tension);
  } else {
    assert(false);
  }
  return friction;
}

void POPQuadraticSolve(CGFloat a, CGFloat b, CGFloat c, CGFloat &x1, CGFloat &x2)
{
  CGFloat discriminant = sqrt(b * b - 4 * a * c);
  x1 = (-b + discriminant) / (2 * a);
  x2 = (-b - discriminant) / (2 * a);
}
