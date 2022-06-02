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

import { warn } from '../utils';
import { repeatCountDict } from '../utils/animation';
import '../global';

const animationEvent = {
  START: 'animationstart',
  END: 'animationend',
  CANCEL: 'animationcancel',
  REPEAT: 'animationrepeat',
};

/**
 * Better performance of Animation series solution.
 *
 * It pushes the animation scheme to native at once.
 */
class AnimationSet implements HippyTypes.AnimationSet {
  animationId: number;
  animation?: HippyTypes.AnimationSetInstance;
  animationList: HippyTypes.AnimationList;
  onRNfqbAnimationStart?: Function | undefined;
  onRNfqbAnimationEnd?: Function | undefined;
  onRNfqbAnimationCancel?: Function | undefined;
  onRNfqbAnimationRepeat?: Function | undefined;
  onHippyAnimationStart?: Function | undefined;
  onHippyAnimationEnd?: Function | undefined;
  onHippyAnimationCancel?: Function | undefined;
  onHippyAnimationRepeat?: Function | undefined;
  onAnimationStartCallback?: HippyTypes.AnimationCallback | undefined;
  onAnimationEndCallback?: HippyTypes.AnimationCallback | undefined;
  onAnimationCancelCallback?: HippyTypes.AnimationCallback | undefined;
  onAnimationRepeatCallback?: HippyTypes.AnimationCallback | undefined;
  animationStartListener?: Function | undefined;
  animationEndListener?: Function | undefined;
  animationCancelListener?: Function | undefined;
  animationRepeatListener?: Function | undefined;

  public constructor(config: HippyTypes.AnimationSetOptions) {
    this.animationList = [] as HippyTypes.AnimationList ;
    config?.children.forEach((item) => {
      this.animationList.push({
        animationId: item.animation.animationId,
        follow: item.follow || false,
      });
    });
    this.animation = new global.Hippy.AnimationSet({
      repeatCount: repeatCountDict(config.repeatCount || 0),
      children: this.animationList,
    });
    this.animationId = this.animation.getId();
    // TODO: Deprecated compatible, will remove soon.
    this.onRNfqbAnimationStart = this.onAnimationStart.bind(this);
    this.onRNfqbAnimationEnd = this.onAnimationEnd.bind(this);
    this.onRNfqbAnimationCancel = this.onAnimationCancel.bind(this);
    this.onRNfqbAnimationRepeat = this.onAnimationRepeat.bind(this);
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
    if (typeof this.onAnimationCancelCallback === 'function') {
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
      this.animation.addEventListener(animationEvent.CANCEL, () => {
        if (typeof this.onAnimationRepeatCallback === 'function') {
          this.onAnimationRepeatCallback();
        }
      });
    }
    this.animation.start();
  }

  /**
   * Use destroy() to destroy animation.
   */
  public destory() {
    warn('AnimationSet.destory() method will be deprecated soon, please use Animation.destroy() as soon as possible');
    this.destroy();
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

export default AnimationSet;
