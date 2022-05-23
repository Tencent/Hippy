/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
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

/* eslint-disable no-console */
// @ts-nocheck
import bezierEasing from 'bezier-easing';
import findNodeHandle from '../adapters/find-node';
import normalizeValue from '../adapters/normalize-value';
import { warn } from '../utils';
import { tryMakeCubicBezierEasing } from './cubic-bezier';

function initLeftRepeatCount(repeatCount: number | 'loop') {
  if (repeatCount === 'loop') {
    return -1;
  }
  return repeatCount;
}

type AnimationCallback = () => void;

export class AnimationSet {
  public constructor(config) {
    // define the animation array
    this.children = config.children || [];
    this.initSetRepeatCount = initLeftRepeatCount(config.repeatCount || 0);
    this.leftSetRepeatCount = this.initSetRepeatCount;
    // the index of the child animation running
    this.runningAnimationIndex = 0;
    this.initNowAnimationState();
    this.onHippyAnimationStart = this.onAnimationStart.bind(this);
    this.onHippyAnimationEnd = this.onAnimationEnd.bind(this);
    this.onHippyAnimationCancel = this.onAnimationCancel.bind(this);
    this.onHippyAnimationRepeat = this.onAnimationRepeat.bind(this);
  }

  public setStyleAttribute(styleAttribute) {
    if (styleAttribute) {
      this.styleAttribute = styleAttribute;
    }
  }

  public endAnimationSet() {
    this.endAnimationFlag = true;
    this.animationRunningFlag = false;
    if (this.onAnimationEndCallback) {
      this.onAnimationEndCallback();
    }
    this.clearAnimationInterval();
  }

  public repeatAnimationSet() {
    if (this.leftSetRepeatCount > 0) this.leftSetRepeatCount -= 1;
    if (this.onAnimationRepeatCallback) {
      this.onAnimationRepeatCallback();
    }
    this.runningAnimationIndex = 0;
    this.initNowAnimationState();
  }

  public continueToNextChildAnimation() {
    this.runningAnimationIndex += 1;
    this.initNowAnimationState();
  }

  public repeatChildAnimation() {
    if (this.leftRepeatCount > 0) this.leftRepeatCount -= 1;
    this.nowLeftDuration = this.duration;
    this.nowPercentage = 0;
  }

  /**
   * Start animation execution
   */
  public start() {
    this.clearAnimationInterval();
    if (this.refNode) {
      this.resetState();
      if (this.onAnimationStartCallback) {
        this.onAnimationStartCallback();
      }
      let finalValue = this.startValue;
      this.leftDelayCount = this.delay;
      this.leftRepeatCount = this.initRepeatCount;
      this.leftSetRepeatCount = this.initSetRepeatCount;
      this.renderStyleAttribute(finalValue);
      if (!this.animationRunningFlag) this.animationRunningFlag = true;
      this.animationInterval = setInterval(() => {
        // if there are still delay time left, wait until it past
        if (this.leftDelayCount > 0) {
          this.leftDelayCount -= 16;
        } else {
          if (this.toValue >= this.startValue) {
            finalValue = this.calculateNowValue();
            this.renderNowValue(finalValue);
          } else if (this.startValue >= this.toValue) {
            finalValue = this.calculateNowValue();
            this.renderNowValue(finalValue);
          }
          if (this.nowLeftDuration <= 0) {
            // the repeat count of children Animation
            if (this.leftRepeatCount === 0) {
              if (this.runningAnimationIndex === this.children.length - 1) {
                // the repeat count of AnimationSet
                if (this.leftSetRepeatCount === 0) {
                  this.endAnimationSet();
                } else {
                  this.repeatAnimationSet();
                  finalValue = this.startValue;
                }
              } else {
                this.continueToNextChildAnimation();
                finalValue = this.startValue;
              }
            } else {
              this.repeatChildAnimation();
              finalValue = this.startValue;
            }
          }
        }
      }, 16);
    }
  }

  /**
   * Resume execution of paused animation
   */
  public resume() {
    this.clearAnimationInterval();
    if (this.refNode) {
      let finalValue = this.nowValue;
      let pauseValue = Number(JSON.parse(JSON.stringify(this.nowValue)));
      if (!this.animationRunningFlag) this.animationRunningFlag = true;
      this.animationInterval = setInterval(() => {
        if (this.leftDelayCount > 0) {
          this.leftDelayCount -= 16;
        } else if (this.nowLeftDuration < 0) {
          // children animation loop ended
          if (this.leftRepeatCount === 0) {
            if (this.runningAnimationIndex === this.children.length - 1) {
              if (this.leftSetRepeatCount === 0) {
                this.endAnimationSet();
              } else {
                // not "loop" status， need to minus 1 Animation repeat count
                this.repeatAnimationSet();
                finalValue = this.startValue;
              }
            } else {
              this.continueToNextChildAnimation();
              finalValue = this.startValue;
            }
          } else {
            this.repeatChildAnimation();
            finalValue = this.startValue;
            pauseValue = this.startValue;
          }
        } else if (this.toValue >= pauseValue) {
          finalValue = this.calculateNowValue();
          if (finalValue > this.toValue) finalValue = this.toValue;
          this.renderNowValue(finalValue);
        } else if (this.startValue >= pauseValue) {
          finalValue = this.calculateNowValue();
          if (finalValue < this.toValue) finalValue = this.toValue;
          this.renderNowValue(finalValue);
        }
      }, 16);
    }
  }

  /**
   * Destroy the animation
   */
  public destroy() {
    this.clearAnimationInterval();
    if (!this.endAnimationFlag && this.onAnimationCancelCallback) {
      this.onAnimationCancelCallback();
    }
    this.resetState();
  }

  /**
   * Pause the running animation
   */
  public pause() {
    this.clearAnimationInterval();
  }

  /**
   * Call when animation started.
   * @param {Function} cb - callback when animation started.
   */
  public onAnimationStart(cb: AnimationCallback) {
    this.onAnimationStartCallback = cb;
  }

  /**
   * Call when animation is ended.
   * @param {Function} cb - callback when animation started.
   */
  public onAnimationEnd(cb: AnimationCallback) {
    this.onAnimationEndCallback = cb;
  }

  /**
   * Call when animation is canceled.
   * @param {Function} cb - callback when animation started.
   */
  public onAnimationCancel(cb: AnimationCallback) {
    this.onAnimationCancelCallback = cb;
  }

  /**
   * Call when animation is repeated.
   * @param {Function} cb - callback when animation started.
   */
  public onAnimationRepeat(cb: AnimationCallback) {
    this.onAnimationRepeatCallback = cb;
  }

  private initNowAnimationState() {
    if (this.children && this.children.length > 0) {
      const nowAnimation = this.children[this.runningAnimationIndex].animation;
      this.mode = nowAnimation.mode || 'timing';
      this.delay = nowAnimation.delay || 0;
      this.startValue = nowAnimation.startValue || 0;
      this.toValue = nowAnimation.toValue || 0;
      this.valueType = nowAnimation.valueType || undefined;
      this.duration = nowAnimation.duration || 0;
      this.direction = nowAnimation.direction || 'center';
      this.timingFunction = nowAnimation.timingFunction || 'linear';
      this.initRepeatCount = initLeftRepeatCount(nowAnimation.initRepeatCount || 0);
      this.leftRepeatCount = this.initRepeatCount;
      this.leftDelayCount = this.delay;
      this.nowValue = this.startValue;
      this.nowLeftDuration = this.duration;
      this.nowPercentage = 0;
      this.animationRunningFlag = false;
      this.endAnimationFlag = false;
      this.valueDistance = this.toValue - this.startValue;
      if (this.startValue) {
        this.renderStyleAttribute(this.startValue);
      }
    } else {
      warn('AnimationSet children param error');
    }
  }

  private resetState() {
    this.runningAnimationIndex = 0;
    this.initNowAnimationState();
  }

  private setRef(ref) {
    if (ref) {
      this.refNode = findNodeHandle(ref);
    }
  }

  private setTransformStyleAttribute(styleAttribute) {
    if (styleAttribute) {
      this.transformStyleAttribute = styleAttribute;
    }
  }

  private clearAnimationInterval() {
    this.animationRunningFlag = false;
    if (this.animationInterval) window.clearInterval(this.animationInterval);
  }

  private renderStyleAttribute(finalValue) {
    if (!this.refNode) return;
    if (this.styleAttribute) {
      this.refNode.style[this.styleAttribute.toString()] = normalizeValue(
        this.styleAttribute.toString(),
        finalValue,
      );
    } else if (this.transformStyleAttribute) {
      const transformValue = normalizeValue(this.transformStyleAttribute, finalValue);
      this.refNode.style.transform = `${this.transformStyleAttribute}(${transformValue})`;
    }
  }

  private getNowValue() {
    const { timingFunction, nowPercentage, valueDistance } = this;
    switch (timingFunction) {
      case ('linear'):
        return this.startValue + valueDistance * nowPercentage;
      case ('ease-in'):
        return this.startValue + valueDistance * (nowPercentage ** 1.675);
      case ('ease-out'):
        return this.startValue + valueDistance * (1 - ((1 - nowPercentage) ** 1.675));
      case ('ease-in-out'):
        return this.startValue + valueDistance * 0.5
          * (Math.sin((nowPercentage - 0.5) * Math.PI) + 1);
      case ('easebezierEasing'):
        // NOTE: custom bazier implemented in default, this options consider deprecated.
        return this.startValue + valueDistance * bezierEasing(0.42, 0, 1, 1);
      default: {
        const cubicBezierEasing = tryMakeCubicBezierEasing(timingFunction);
        if (cubicBezierEasing) {
          return this.startValue + valueDistance * cubicBezierEasing(nowPercentage);
        }
        return this.startValue + valueDistance * nowPercentage;
      }
    }
  }

  private calculateNowValue() {
    this.nowLeftDuration -= 16;
    this.nowPercentage = 1 - (this.nowLeftDuration / this.duration);
    return this.getNowValue();
  }

  private renderNowValue(finalValue) {
    this.nowValue = finalValue;
    this.renderStyleAttribute(finalValue);
  }
}

export default AnimationSet;
