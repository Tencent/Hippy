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

#import "HPOPAnimationInternal.h"
#import "HPOPPropertyAnimation.h"

static void clampValue(CGFloat &value, CGFloat fromValue, CGFloat toValue, NSUInteger clamp)
{
  BOOL increasing = (toValue > fromValue);

  // Clamp start of animation.
  if ((kHPOPAnimationClampStart & clamp) &&
      ((increasing && (value < fromValue)) || (!increasing && (value > fromValue)))) {
    value = fromValue;
  }

  // Clamp end of animation.
  if ((kHPOPAnimationClampEnd & clamp) &&
      ((increasing && (value > toValue)) || (!increasing && (value < toValue)))) {
    value = toValue;
  }
}

struct _POPPropertyAnimationState : _POPAnimationState
{
  HPOPAnimatableProperty *property;
  POPValueType valueType;
  NSUInteger valueCount;
  VectorRef fromVec;
  VectorRef toVec;
  VectorRef currentVec;
  VectorRef previousVec;
  VectorRef previous2Vec;
  VectorRef velocityVec;
  VectorRef originalVelocityVec;
  VectorRef distanceVec;
  CGFloat roundingFactor;
  NSUInteger clampMode;
  NSArray *progressMarkers;
  POPProgressMarker *progressMarkerState;
  NSUInteger progressMarkerCount;
  NSUInteger nextProgressMarkerIdx;
  CGFloat dynamicsThreshold;

  _POPPropertyAnimationState(id __unsafe_unretained anim) : _POPAnimationState(anim),
  property(nil),
  valueType((POPValueType)0),
  valueCount(0),
  fromVec(nullptr),
  toVec(nullptr),
  currentVec(nullptr),
  previousVec(nullptr),
  previous2Vec(nullptr),
  velocityVec(nullptr),
  originalVelocityVec(nullptr),
  distanceVec(nullptr),
  roundingFactor(0),
  clampMode(0),
  progressMarkers(nil),
  progressMarkerState(nil),
  progressMarkerCount(0),
  nextProgressMarkerIdx(0),
  dynamicsThreshold(0)
  {
    type = kHPOPAnimationBasic;
  }

  ~_POPPropertyAnimationState()
  {
    if (progressMarkerState) {
      free(progressMarkerState);
      progressMarkerState = NULL;
    }
  }

  bool canProgress() {
    return hasValue();
  }

  bool shouldRound() {
    return 0 != roundingFactor;
  }

  bool hasValue() {
    return 0 != valueCount;
  }

  bool isDone() {
    // inherit done
    if (_POPAnimationState::isDone()) {
      return true;
    }

    // consider an animation with no values done
    if (!hasValue() && !isCustom()) {
      return true;
    }

    return false;
  }

  // returns a copy of the currentVec, rounding if needed
  VectorRef currentValue() {
    VectorRef vec = VectorRef(Vector::new_vector(currentVec.get()));
    if (shouldRound()) {
      vec->subRound(1 / roundingFactor);
    }
      return vec;
  }

  void resetProgressMarkerState()
  {
    for (NSUInteger idx = 0; idx < progressMarkerCount; idx++)
      progressMarkerState[idx].reached = false;

    nextProgressMarkerIdx = 0;
  }

  void updatedProgressMarkers()
  {
    if (progressMarkerState) {
      free(progressMarkerState);
      progressMarkerState = NULL;
    }

    progressMarkerCount = progressMarkers.count;

    if (0 != progressMarkerCount) {
      progressMarkerState = (POPProgressMarker *)malloc(progressMarkerCount * sizeof(POPProgressMarker));
      [progressMarkers enumerateObjectsUsingBlock:^(NSNumber *progressMarker, NSUInteger idx, BOOL *stop) {
        progressMarkerState[idx].reached = false;
        progressMarkerState[idx].progress = [progressMarker floatValue];
      }];
    }

    nextProgressMarkerIdx = 0;
  }

  virtual void updatedDynamicsThreshold()
  {
    dynamicsThreshold = property.threshold;
  }

  void finalizeProgress()
  {
    progress = 1.0;
    NSUInteger count = valueCount;
    VectorRef outVec(Vector::new_vector(count, NULL));

    if (outVec && toVec) {
      *outVec = *toVec;
    }

    currentVec = outVec;
    clampCurrentValue();
    delegateProgress();
  }

  void computeProgress() {
    if (!canProgress()) {
      return;
    }

    static ComputeProgressFunctor<Vector4r> func;
    Vector4r v = vector4(currentVec);
    Vector4r f = vector4(fromVec);
    Vector4r t = vector4(toVec);
    progress = func(v, f, t);
  }

  void delegateProgress() {
    if (!canProgress()) {
      return;
    }

    if (delegateDidProgress && progressMarkerState) {

      while (nextProgressMarkerIdx < progressMarkerCount) {
        if (progress < progressMarkerState[nextProgressMarkerIdx].progress)
          break;

        if (!progressMarkerState[nextProgressMarkerIdx].reached) {
          ActionEnabler enabler;
          [delegate hpop_animation:self didReachProgress:progressMarkerState[nextProgressMarkerIdx].progress];
          progressMarkerState[nextProgressMarkerIdx].reached = true;
        }

        nextProgressMarkerIdx++;
      }
    }

    if (!didReachToValue) {
      bool didReachToValue = false;
      if (0 == valueCount) {
        didReachToValue = true;
      } else {
        Vector4r distance = toVec->vector4r();
        distance -= currentVec->vector4r();

        if (0 == distance.squaredNorm()) {
          didReachToValue = true;
        } else {
          // components
          if (distanceVec) {
            didReachToValue = true;
            const CGFloat *distanceValues = distanceVec->data();
            for (NSUInteger idx = 0; idx < valueCount; idx++) {
              didReachToValue &= (signbit(distance[idx]) != signbit(distanceValues[idx]));
            }
          }
        }
      }

      if (didReachToValue) {
        handleDidReachToValue();
      }
    }
  }

  void handleDidReachToValue() {
    didReachToValue = true;

    if (delegateDidReachToValue) {
      ActionEnabler enabler;
      [delegate hpop_animationDidReachToValue:self];
    }

    POPAnimationDidReachToValueBlock block = animationDidReachToValueBlock;
    if (block != NULL) {
      ActionEnabler enabler;
      block(self);
    }

    if (tracing) {
      [tracer didReachToValue:POPBox(currentValue(), valueType, true)];
    }
  }

  void readObjectValue(VectorRef *ptrVec, id obj)
  {
    // use current object value as from value
    HPOPAnimatablePropertyReadBlock read = property.readBlock;
    if (NULL != read) {

      Vector4r vec = read_values(read, obj, valueCount);
      *ptrVec = VectorRef(Vector::new_vector(valueCount, vec));

      if (tracing) {
        [tracer readPropertyValue:POPBox(*ptrVec, valueType, true)];
      }
    }
  }

  virtual void willRun(bool started, id obj) {
    // ensure from value initialized
    if (NULL == fromVec) {
      readObjectValue(&fromVec, obj);
    }

    // ensure to value initialized
    if (NULL == toVec) {
      // compute decay to value
      if (kHPOPAnimationDecay == type) {
        [self toValue];
      } else {
        // read to value
        readObjectValue(&toVec, obj);
      }
    }

    // handle one time value initialization on start
    if (started) {

      // initialize current vec
      if (!currentVec) {
        currentVec = VectorRef(Vector::new_vector(valueCount, NULL));

        // initialize current value with from value
        // only do this on initial creation to avoid overwriting current value
        // on paused animation continuation
        if (currentVec && fromVec) {
          *currentVec = *fromVec;
        }
      }

      // ensure velocity values
      if (!velocityVec) {
        velocityVec = VectorRef(Vector::new_vector(valueCount, NULL));
      }
      if (!originalVelocityVec) {
        originalVelocityVec = VectorRef(Vector::new_vector(valueCount, NULL));
      }
    }

    // ensure distance value initialized
    // depends on current value set on one time start
    if (NULL == distanceVec) {

      // not yet started animations may not have current value
      VectorRef fromVec2 = NULL != currentVec ? currentVec : fromVec;

      if (fromVec2 && toVec) {
        Vector4r distance = toVec->vector4r();
        distance -= fromVec2->vector4r();

        if (0 != distance.squaredNorm()) {
          distanceVec = VectorRef(Vector::new_vector(valueCount, distance));
        }
      }
    }
  }

  virtual void reset(bool all) {
    _POPAnimationState::reset(all);

    if (all) {
      currentVec = NULL;
      previousVec = NULL;
      previous2Vec = NULL;
    }
    progress = 0;
    resetProgressMarkerState();
    didReachToValue = false;
    distanceVec = NULL;
  }

  void clampCurrentValue(NSUInteger clamp)
  {
    if (kHPOPAnimationClampNone == clamp)
      return;

    // Clamp all vector values
    CGFloat *currentValues = currentVec->data();
    const CGFloat *fromValues = fromVec->data();
    const CGFloat *toValues = toVec->data();

    for (NSUInteger idx = 0; idx < valueCount; idx++) {
      clampValue(currentValues[idx], fromValues[idx], toValues[idx], clamp);
    }
  }

  void clampCurrentValue()
  {
    clampCurrentValue(clampMode);
  }
};

typedef struct _POPPropertyAnimationState POPPropertyAnimationState;

@interface HPOPPropertyAnimation ()

@end

