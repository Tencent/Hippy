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

#import <cmath>

#import "HPOPDefines.h"
#if HPOP_CODE_TRIM

#import "HPOPAnimationExtras.h"
#import "HPOPPropertyAnimationInternal.h"

struct _POPSpringAnimationState : _POPPropertyAnimationState
{
  SpringSolver4d *solver;
  CGFloat springSpeed;
  CGFloat springBounciness; // normalized springiness
  CGFloat dynamicsTension;  // tension
  CGFloat dynamicsFriction; // friction
  CGFloat dynamicsMass;     // mass

  _POPSpringAnimationState(id __unsafe_unretained anim) : _POPPropertyAnimationState(anim),
  solver(nullptr),
  springSpeed(12.),
  springBounciness(4.),
  dynamicsTension(0),
  dynamicsFriction(0),
  dynamicsMass(0)
  {
    type = kHPOPAnimationSpring;
  }

  bool hasConverged()
  {
    NSUInteger count = valueCount;
    if (shouldRound()) {
      return vec_equal(previous2Vec, previousVec) && vec_equal(previousVec, toVec);
    } else {
      if (!previousVec || !previous2Vec)
        return false;

      CGFloat t  = dynamicsThreshold / 5;

      const CGFloat *toValues = toVec->data();
      const CGFloat *previousValues = previousVec->data();
      const CGFloat *previous2Values = previous2Vec->data();

      for (NSUInteger idx = 0; idx < count; idx++) {
          if ((std::abs(toValues[idx] - previousValues[idx]) >= t) || (std::abs(previous2Values[idx] - previousValues[idx]) >= t)) {
          return false;
        }
      }
      return true;
    }
  }

  bool isDone() {
    if (_POPPropertyAnimationState::isDone()) {
      return true;
    }
    return solver->started() && (hasConverged() || solver->hasConverged());
  }

  void updatedDynamics()
  {
    if (NULL != solver) {
      solver->setConstants(dynamicsTension, dynamicsFriction, dynamicsMass);
    }
  }

  void updatedDynamicsThreshold()
  {
    _POPPropertyAnimationState::updatedDynamicsThreshold();
    if (NULL != solver) {
      solver->setThreshold(dynamicsThreshold);
    }
  }

  void updatedBouncinessAndSpeed() {
    [HPOPSpringAnimation convertBounciness:springBounciness speed:springSpeed toTension:&dynamicsTension friction:&dynamicsFriction mass:&dynamicsMass];
    updatedDynamics();
  }

  bool advance(CFTimeInterval time, CFTimeInterval dt, id obj) {
    // advance past not yet initialized animations
    if (NULL == currentVec) {
      return false;
    }

    CFTimeInterval localTime = time - startTime;

    Vector4d value = vector4d(currentVec);
    Vector4d toValue = vector4d(toVec);
    Vector4d velocity = vector4d(velocityVec);

    SSState4d state;
    state.p = toValue - value;

    // the solver assumes a spring of size zero
    // flip the velocity from user perspective to solver perspective
    state.v = velocity * -1;

    solver->advance(state, localTime, dt);
    value = toValue - state.p;

    // flip velocity back to user perspective
    velocity = state.v * -1;

    *currentVec = value;

    if (velocityVec) {
      *velocityVec = velocity;
    }

    clampCurrentValue();

    return true;
  }

  virtual void reset(bool all) {
    _POPPropertyAnimationState::reset(all);

    if (solver) {
      solver->setConstants(dynamicsTension, dynamicsFriction, dynamicsMass);
      solver->reset();
    }
  }
};

typedef struct _POPSpringAnimationState POPSpringAnimationState;

#endif /* HPOP_CODE_TRIM */
