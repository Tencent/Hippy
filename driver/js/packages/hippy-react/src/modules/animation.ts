/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2022 THL A29 Limited, a Tencent company.
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

import { repeatCountDict } from '../utils/animation';
import { colorParse } from '../color';

/**
 * parse value of special value type
 * @param valueType
 * @param originalValue
 */
function parseValue(valueType: string | undefined, originalValue: number | string) {
  if (valueType === 'color' && ['number', 'string'].indexOf(typeof originalValue) >= 0) {
    return colorParse(originalValue);
  }
  return originalValue;
}

const animationEvent = {
  START: 'animationstart',
  END: 'animationend',
  CANCEL: 'animationcancel',
  REPEAT: 'animationrepeat',
};

/**
 * Better performance of Animation solution.
 *
 * It pushes the animation scheme to native at once.
 */
class Animation implements HippyTypes.Animation {
  mode: HippyTypes.AnimationMode;
  startValue: HippyTypes.AnimationValue;
  toValue: HippyTypes.AnimationValue;
  duration: number;
  delay?: number | undefined;
  valueType?: HippyTypes.AnimationValueType;
  direction?: HippyTypes.AnimationDirection | undefined;
  timingFunction?: HippyTypes.AnimationTimingFunction | undefined;
  repeatCount?: number | undefined;
  animation?: HippyTypes.AnimationInstance;
  inputRange?: any[] | undefined;
  outputRange?: any[] | undefined;
  animationId?: number | undefined;
  onAnimationStartCallback?: HippyTypes.AnimationCallback | undefined;
  onAnimationEndCallback?: HippyTypes.AnimationCallback | undefined;
  onAnimationCancelCallback?: HippyTypes.AnimationCallback | undefined;
  onAnimationRepeatCallback?: HippyTypes.AnimationCallback | undefined;
  animationStartListener?: Function | undefined;
  animationEndListener?: Function | undefined;
  animationCancelListener?: Function | undefined;
  animationRepeatListener?: Function | undefined;
  onHippyAnimationStart?: Function | undefined;
  onHippyAnimationEnd?: Function | undefined;
  onHippyAnimationCancel?: Function | undefined;
  onHippyAnimationRepeat?: Function | undefined;

  public constructor(config: HippyTypes.AnimationOptions) {
    let startValue: HippyTypes.AnimationValue;
    if (config.startValue?.constructor && config.startValue.constructor.name === 'Animation') {
      startValue = { animationId: (config.startValue as HippyTypes.Animation).animationId };
    } else {
      const { startValue: tempStartValue } = config;
      startValue = parseValue(config.valueType, tempStartValue as number | string);
    }
    const toValue = parseValue(config.valueType, config.toValue as number | string);
    this.mode = config.mode || 'timing';
    this.delay = config.delay || 0;
    this.startValue = startValue || 0;
    this.toValue = toValue || 0;
    this.valueType = config.valueType || undefined;
    this.duration = config.duration || 0;
    this.direction = config.direction || 'center';
    this.timingFunction = config.timingFunction || 'linear';
    this.repeatCount = repeatCountDict(config.repeatCount || 0);
    this.inputRange = config.inputRange || [];
    this.outputRange = config.outputRange || [];
    this.animation = new global.Hippy.Animation(Object.assign({
      mode: this.mode,
      delay: this.delay,
      startValue: this.startValue,
      toValue: this.toValue,
      duration: this.duration,
      direction: this.direction,
      timingFunction: this.timingFunction,
      repeatCount: this.repeatCount,
      inputRange: this.inputRange,
      outputRange: this.outputRange,
    },  (this.valueType ? { valueType: this.valueType } : {})));
    this.animationId = this.animation.getId();
    this.destroy = this.destroy.bind(this);

    this.onHippyAnimationStart = this.onAnimationStart.bind(this);
    this.onHippyAnimationEnd = this.onAnimationEnd.bind(this);
    this.onHippyAnimationCancel = this.onAnimationCancel.bind(this);
    this.onHippyAnimationRepeat = this.onAnimationRepeat.bind(this);
  }

  /**
   * Remove all of animation event listener
   */
  public removeEventListener() {
    if (!this.animation) {
      throw new Error('animation has not been initialized yet');
    }
    if (typeof this.onAnimationStartCallback === 'function') {
      this.animation.removeEventListener(animationEvent.START);
    }
    if (typeof this.onAnimationEndCallback === 'function') {
      this.animation.removeEventListener(animationEvent.END);
    }
    if (typeof this.onAnimationCancelCallback === 'function') {
      this.animation.removeEventListener(animationEvent.CANCEL);
    }
    if (typeof this.onAnimationRepeatCallback === 'function') {
      this.animation.removeEventListener(animationEvent.REPEAT);
    }
  }

  /**
   * Start animation execution
   */
  public start() {
    if (!this.animation) {
      throw new Error('animation has not been initialized yet');
    }
    this.removeEventListener();
    if (typeof this.onAnimationStartCallback === 'function') {
      this.animation.addEventListener(animationEvent.START, () => {
        if (typeof this.onAnimationStartCallback === 'function') {
          this.onAnimationStartCallback();
        }
      });
    }
    if (typeof this.onAnimationEndCallback === 'function') {
      this.animation.addEventListener(animationEvent.END, () => {
        if (typeof this.onAnimationEndCallback === 'function') {
          this.onAnimationEndCallback();
        }
      });
    }
    if (typeof this.onAnimationCancelCallback === 'function') {
      this.animation.addEventListener(animationEvent.CANCEL, () => {
        if (typeof this.onAnimationCancelCallback === 'function') {
          this.onAnimationCancelCallback();
        }
      });
    }
    if (typeof this.onAnimationRepeatCallback === 'function') {
      this.animation.addEventListener(animationEvent.REPEAT, () => {
        if (typeof this.onAnimationRepeatCallback === 'function') {
          this.onAnimationRepeatCallback();
        }
      });
    }
    this.animation.start();
  }

  /**
   * Destroy the animation
   */
  public destroy() {
    if (!this.animation) {
      throw new Error('animation has not been initialized yet');
    }
    this.animation.destroy();
  }

  /**
   * Pause the running animation
   */
  public pause() {
    if (!this.animation) {
      throw new Error('animation has not been initialized yet');
    }
    this.animation.pause();
  }

  /**
   * Resume execution of paused animation
   */
  public resume() {
    if (!this.animation) {
      throw new Error('animation has not been initialized yet');
    }
    this.animation.resume();
  }

  /**
   * Update to new animation scheme
   *
   * @param {Object} newConfig - new animation schema
   */
  public updateAnimation(newConfig: HippyTypes.AnimationOptions) {
    if (!this.animation) {
      throw new Error('animation has not been initialized yet');
    }
    if (typeof newConfig !== 'object') {
      throw new TypeError('Invalid arguments');
    }
    if (typeof newConfig.mode === 'string' && newConfig.mode !== this.mode) {
      throw new TypeError('Update animation mode not supported');
    }
    (Object.keys(newConfig) as (keyof HippyTypes.AnimationOptions)[]).forEach((prop) => {
      const value = newConfig[prop];
      if (prop === 'startValue') {
        let startValue: HippyTypes.AnimationValue;
        if (newConfig.startValue instanceof Animation) {
          startValue = { animationId: newConfig.startValue.animationId };
        } else {
          const { startValue: tempStartValue } = newConfig;
          startValue = parseValue(this.valueType, tempStartValue as number|string);
        }
        this.startValue = startValue || 0;
      } else if (prop === 'repeatCount') {
        this.repeatCount = repeatCountDict(newConfig.repeatCount || 0);
      } else {
        Object.defineProperty(this, prop, {
          value,
        });
      }
    });
    this.animation.updateAnimation(Object.assign({
      mode: this.mode,
      delay: this.delay,
      startValue: this.startValue,
      toValue: parseValue(this.valueType, this.toValue as number|string),
      duration: this.duration,
      direction: this.direction,
      timingFunction: this.timingFunction,
      repeatCount: this.repeatCount,
      inputRange: this.inputRange,
      outputRange: this.outputRange,
    }, (this.valueType ? { valueType: this.valueType } : {})));
  }

  /**
   * Call when animation started.
   * @param {Function} cb - callback when animation started.
   */
  public onAnimationStart(cb: HippyTypes.AnimationCallback) {
    this.onAnimationStartCallback = cb;
  }

  /**
   * Call when animation is ended.
   * @param {Function} cb - callback when animation started.
   */
  public onAnimationEnd(cb: HippyTypes.AnimationCallback) {
    this.onAnimationEndCallback = cb;
  }

  /**
   * Call when animation is canceled.
   * @param {Function} cb - callback when animation started.
   */
  public onAnimationCancel(cb: HippyTypes.AnimationCallback) {
    this.onAnimationCancelCallback = cb;
  }

  /**
   * Call when animation is repeated.
   * @param {Function} cb - callback when animation started.
   */
  public onAnimationRepeat(cb: HippyTypes.AnimationCallback) {
    this.onAnimationRepeatCallback = cb;
  }
}

export default Animation;
export {
  Animation,
};
