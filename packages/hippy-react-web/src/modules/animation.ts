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

// @ts-nocheck
import bezierEasing from 'bezier-easing';
import findNodeHandle from '../adapters/find-node';
import normalizeValue from '../adapters/normalize-value';
import { tryMakeCubicBezierEasing } from './cubic-bezier';

type AnimationCallback = () => void;

function initLeftRepeatCount(repeatCount: number | 'loop') {
  if (repeatCount === 'loop') {
    return -1;
  }
  return repeatCount;
}

const isDef = v => v !== undefined;

export class Animation {
  public constructor(config) {
    this.initNowAnimationState(config);
    this.onHippyAnimationStart = this.onAnimationStart.bind(this);
    this.onHippyAnimationEnd = this.onAnimationEnd.bind(this);
    this.onHippyAnimationCancel = this.onAnimationCancel.bind(this);
    this.onHippyAnimationRepeat = this.onAnimationRepeat.bind(this);
  }

  public initNowAnimationState(config) {
    this.mode = config.mode || 'timing';
    this.delay = config.delay || 0;
    this.startValue = config.startValue || 0;
    this.toValue = config.toValue || 0;
    this.valueType = config.valueType || undefined;
    this.duration = config.duration || 0;
    this.direction = config.direction || 'center';
    this.timingFunction = config.timingFunction || 'linear';
    this.initRepeatCount = initLeftRepeatCount(config.repeatCount || 0);
    this.leftRepeatCount = this.initRepeatCount;
    this.leftDelayCount = this.delay;
    this.nowValue = this.startValue;
    this.nowLeftDuration = this.duration;
    this.nowPercentage = 0;
    this.animationRunningFlag = false;
    this.endAnimationFlag = false;
    this.valueDistance = this.toValue - this.startValue;
    if (this.startValue) {
      // set start value immediately
      this.renderStyleAttribute(this.startValue);
    }
  }

  public setRef(ref) {
    if (ref) {
      this.refNode = findNodeHandle(ref);
    }
  }

  public setStyleAttribute(styleAttribute) {
    if (styleAttribute) {
      this.styleAttribute = styleAttribute;
    }
  }

  public setTransformStyleAttribute(styleAttribute) {
    if (styleAttribute) {
      this.transformStyleAttribute = styleAttribute;
    }
  }

  public clearAnimationInterval() {
    this.animationRunningFlag = false;
    if (this.animationInterval) window.clearInterval(this.animationInterval);
  }

  public resetState() {
    this.nowValue = this.startValue;
    this.nowLeftDuration = this.duration;
  }

  public renderStyleAttribute(finalValue) {
    if (!this.refNode) return;
    if (this.styleAttribute) {
      this.refNode.style[this.styleAttribute.toString()] = normalizeValue(
        this.styleAttribute.toString(),
        finalValue,
      );
    } else if (this.transformStyleAttribute) {
      const transformValue = normalizeValue(
        this.transformStyleAttribute,
        finalValue,
        this.valueType,
      );
      this.refNode.style.transform = `${this.transformStyleAttribute}(${transformValue})`;
    }
  }

  public getNowValue() {
    const { timingFunction, nowPercentage, valueDistance } = this;
    switch (timingFunction) {
      case 'linear':
        return this.startValue + valueDistance * nowPercentage;
      case 'ease-in':
        return this.startValue + valueDistance * (nowPercentage ** 1.675);
      case 'ease-out':
        return this.startValue + valueDistance * (1 - ((1 - nowPercentage) ** 1.675));
      case 'ease-in-out':
        return this.startValue + valueDistance * 0.5
          * (Math.sin((nowPercentage - 0.5) * Math.PI) + 1);
      case 'easebezierEasing':
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

  public calculateNowValue() {
    this.nowLeftDuration -= 16;
    this.nowPercentage = 1 - (this.nowLeftDuration / this.duration);
    return this.getNowValue();
  }

  public renderNowValue(finalValue) {
    this.nowValue = finalValue;
    this.renderStyleAttribute(finalValue);
  }

  public endAnimation() {
    if (this.onAnimationEndCallback) {
      this.onAnimationEndCallback();
    }
    this.endAnimationFlag = true;
    this.animationRunningFlag = false;
    this.nowPercentage = 0;
    this.clearAnimationInterval();
  }

  public repeatAnimation() {
    this.nowLeftDuration = this.duration;
    this.nowPercentage = 0;
    if (this.leftRepeatCount > 0) this.leftRepeatCount -= 1;
    if (this.onAnimationRepeatCallback) {
      this.onAnimationRepeatCallback();
    }
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
            if (this.leftRepeatCount === 0) {
              this.endAnimation();
            } else {
              finalValue = this.startValue;
              this.repeatAnimation();
            }
          }
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
          if (this.leftRepeatCount === 0) {
            this.endAnimation();
          } else {
            finalValue = this.startValue;
            pauseValue = this.startValue;
            this.repeatAnimation();
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
   * Update to new animation scheme
   *
   * @param {Object} param - new animation schema
   */
  public updateAnimation(param) {
    if (param && this.refNode && !this.animationRunningFlag) {
      const {
        startValue, toValue, duration, timingFunction, repeatCount,
        mode, delay, valueType, direction,
      } = param;
      if (isDef(startValue)) {
        this.renderStyleAttribute(startValue);
      }
      if (isDef(mode)) this.mode = mode;
      if (isDef(delay)) {
        this.delay = delay;
        this.leftDelayCount = this.delay;
      }
      if (isDef(startValue)) {
        this.startValue = startValue;
        this.nowValue = this.startValue;
      }
      if (isDef(toValue)) this.toValue = toValue;
      if (isDef(valueType)) this.valueType = valueType;
      if (isDef(duration)) {
        this.duration = duration;
        this.nowLeftDuration = this.duration;
      }
      if (isDef(direction)) this.direction = direction;
      if (isDef(timingFunction)) this.timingFunction = timingFunction;
      if (isDef(repeatCount)) {
        this.initRepeatCount = initLeftRepeatCount(repeatCount || 0);
        this.leftRepeatCount = this.initRepeatCount;
      }
      this.valueDistance = this.toValue - this.startValue;
      this.endAnimationFlag = false;
    }
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
}

export default Animation;
