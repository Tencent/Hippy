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

#import "HPOPDecayAnimation.h"

#import "HPOPDefines.h"
#if HPOP_CODE_TRIM

#import <cmath>

#import "HPOPPropertyAnimationInternal.h"

// minimal velocity factor before decay animation is considered complete, in units / s
static CGFloat kHPOPAnimationDecayMinimalVelocityFactor = 5.;

// default decay animation deceleration
static CGFloat kHPOPAnimationDecayDecelerationDefault = 0.998;

static void decay_position(CGFloat *x, CGFloat *v, NSUInteger count, CFTimeInterval dt, CGFloat deceleration)
{
  dt *= 1000;

  // v0 = v / 1000
  // v = v0 * powf(deceleration, dt);
  // v = v * 1000;

  // x0 = x;
  // x = x0 + v0 * deceleration * (1 - powf(deceleration, dt)) / (1 - deceleration)
  float v0[count];
  float kv = powf(deceleration, dt);
  float kx = deceleration * (1 - kv) / (1 - deceleration);

  for (NSUInteger idx = 0; idx < count; idx++) {
    v0[idx] = v[idx] / 1000.;
    v[idx] = v0[idx] * kv * 1000.;
    x[idx] = x[idx] + v0[idx] * kx;
  }
}

struct _POPDecayAnimationState : _POPPropertyAnimationState
{
  double deceleration;
  CFTimeInterval duration;

  _POPDecayAnimationState(id __unsafe_unretained anim) :
  _POPPropertyAnimationState(anim),
  deceleration(kHPOPAnimationDecayDecelerationDefault),
  duration(0)
  {
    type = kHPOPAnimationDecay;
  }

  bool isDone() {
    if (_POPPropertyAnimationState::isDone()) {
      return true;
    }

    CGFloat f = dynamicsThreshold * kHPOPAnimationDecayMinimalVelocityFactor;
    const CGFloat *velocityValues = vec_data(velocityVec);
    for (NSUInteger idx = 0; idx < valueCount; idx++) {
      if (std::abs((velocityValues[idx])) >= f)
        return false;
    }
    return true;

  }

  void computeDuration() {

    // compute duration till threshold velocity
    Vector4r scaledVelocity = vector4(velocityVec) / 1000.;

    double k = dynamicsThreshold * kHPOPAnimationDecayMinimalVelocityFactor / 1000.;
    double vx = k / scaledVelocity.x;
    double vy = k / scaledVelocity.y;
    double vz = k / scaledVelocity.z;
    double vw = k / scaledVelocity.w;
    double d = log(deceleration) * 1000.;
    duration = MAX(MAX(MAX(log(fabs(vx)) / d, log(fabs(vy)) / d), log(fabs(vz)) / d), log(fabs(vw)) / d);

    // ensure velocity threshold is exceeded
    if (std::isnan(duration) || duration < 0) {
      duration = 0;
    }
  }

  void computeToValue() {
    // to value assuming final velocity as a factor of dynamics threshold
    // derived from v' = v * d^dt used in decay_position
    // to compute the to value with maximal dt, p' = p + (v * d) / (1 - d)
    VectorRef fromValue = NULL != currentVec ? currentVec : fromVec;
    if (!fromValue) {
      return;
    }

    // ensure duration is computed
    if (0 == duration) {
      computeDuration();
    }

    // compute to value
    VectorRef toValue(Vector::new_vector(fromValue.get()));
    Vector4r velocity = velocityVec->vector4r();
    decay_position(toValue->data(), velocity.data(), valueCount, duration, deceleration);
    toVec = toValue;
  }

  bool advance(CFTimeInterval time, CFTimeInterval dt, id obj) {
    // advance past not yet initialized animations
    if (NULL == currentVec) {
      return false;
    }

    decay_position(currentVec->data(), velocityVec->data(), valueCount, dt, deceleration);

    // clamp to compute end value; avoid possibility of decaying past
    clampCurrentValue(kHPOPAnimationClampEnd | clampMode);

    return true;
  }

};

typedef struct _POPDecayAnimationState POPDecayAnimationState;

#endif /* HPOP_CODE_TRIM */
