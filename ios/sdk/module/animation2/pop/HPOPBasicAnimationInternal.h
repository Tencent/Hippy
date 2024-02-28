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

#import "HPOPBasicAnimation.h"

#import "HPOPPropertyAnimationInternal.h"

// default animation duration
static CGFloat const kHPOPAnimationDurationDefault = 0.4;

// progress threshold for computing done
static CGFloat const kHPOPProgressThreshold = 1e-6;

static void interpolate(POPValueType valueType, NSUInteger count, const CGFloat *fromVec, const CGFloat *toVec, CGFloat *outVec, CGFloat p)
{
  switch (valueType) {
    case kHPOPValueInteger:
    case kHPOPValueFloat:
    case kHPOPValuePoint:
    case kHPOPValueSize:
    case kHPOPValueRect:
    case kHPOPValueEdgeInsets:
    case kHPOPValueColor:
      POPInterpolateVector(count, outVec, fromVec, toVec, p);
      break;
    default:
      NSCAssert(false, @"unhandled type %d", valueType);
      break;
  }
}

struct _POPBasicAnimationState : _POPPropertyAnimationState
{
  CAMediaTimingFunction *timingFunction;
  double timingControlPoints[4];
  CFTimeInterval duration;
  CFTimeInterval timeProgress;

  _POPBasicAnimationState(id __unsafe_unretained anim) : _POPPropertyAnimationState(anim),
  timingFunction(nil),
  timingControlPoints{0.},
  duration(kHPOPAnimationDurationDefault),
  timeProgress(0.)
  {
    type = kHPOPAnimationBasic;
  }

  bool isDone() {
    if (_POPPropertyAnimationState::isDone()) {
      return true;
    }
    return timeProgress + kHPOPProgressThreshold >= 1.;
  }

  void updatedTimingFunction()
  {
    float vec[4] = {0.};
    [timingFunction getControlPointAtIndex:1 values:&vec[0]];
    [timingFunction getControlPointAtIndex:2 values:&vec[2]];
    for (NSUInteger idx = 0; idx < POP_ARRAY_COUNT(vec); idx++) {
      timingControlPoints[idx] = vec[idx];
    }
  }

  bool advance(CFTimeInterval time, CFTimeInterval dt, id obj) {
    // default timing function
    if (!timingFunction) {
      ((HPOPBasicAnimation *)self).timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionDefault];
    }

    // solve for normalized time, aka progress [0, 1]
    CGFloat p = 1.0f;
    if (duration > 0.0f) {
        // cap local time to duration
        CFTimeInterval t = MIN(time - startTime, duration) / duration;
        p = POPTimingFunctionSolve(timingControlPoints, t, SOLVE_EPS(duration));
        timeProgress = t;
    } else {
        timeProgress = 1.;
    }

    // interpolate and advance
    if (!fromVec || !toVec || !currentVec) {
        return false;
    }
    interpolate(valueType, valueCount, fromVec->data(), toVec->data(), currentVec->data(), p);
    progress = p;
    clampCurrentValue();

    return true;
  }
};

typedef struct _POPBasicAnimationState POPBasicAnimationState;
