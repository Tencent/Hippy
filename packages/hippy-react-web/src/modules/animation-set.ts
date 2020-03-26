/* eslint-disable no-console */

import bezierEasing from 'bezier-easing';
import findNodeHandle from '../adapters/find-node';
import normalizeValue from '../adapters/normalize-value';

function initLeftRepeatCount(repeatCount: number | 'loop') {
  if (repeatCount === 'loop') {
    return -1;
  }
  return repeatCount;
}

export class AnimationSet {
  constructor(config) {
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

  initNowAnimationState() {
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
      console.warn('AnimationSet children param error');
    }
  }

  resetState() {
    this.runningAnimationIndex = 0;
    this.initNowAnimationState();
  }

  setRef(ref) {
    if (ref) {
      this.refNode = findNodeHandle(ref);
    }
  }

  setStyleAttribute(styleAttribute) {
    if (styleAttribute) {
      this.styleAttribute = styleAttribute;
    }
  }

  setTransformStyleAttribute(styleAttribute) {
    if (styleAttribute) {
      this.transformStyleAttribute = styleAttribute;
    }
  }

  clearAnimationInterval() {
    this.animationRunningFlag = false;
    if (this.animationInterval) window.clearInterval(this.animationInterval);
  }

  renderStyleAttribute(finalValue) {
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

  getNowValue() {
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
        // TODO Once Hippy native supports custom bazier params, will fix here to accept params
        return this.startValue + valueDistance * bezierEasing(0.42, 0, 1, 1);
      default:
        return this.startValue + valueDistance * nowPercentage;
    }
  }

  calculateNowValue() {
    this.nowLeftDuration -= 16;
    this.nowPercentage = 1 - (this.nowLeftDuration / this.duration);
    return this.getNowValue();
  }

  renderNowValue(finalValue) {
    this.nowValue = finalValue;
    this.renderStyleAttribute(finalValue);
  }


  endAnimationSet() {
    this.endAnimationFlag = true;
    this.animationRunningFlag = false;
    if (this.onAnimationEndCallback) {
      this.onAnimationEndCallback();
    }
    this.clearAnimationInterval();
  }

  repeatAnimationSet() {
    if (this.leftSetRepeatCount > 0) this.leftSetRepeatCount -= 1;
    if (this.onAnimationRepeatCallback) {
      this.onAnimationRepeatCallback();
    }
    this.runningAnimationIndex = 0;
    this.initNowAnimationState();
  }

  continueToNextChildAnimation() {
    this.runningAnimationIndex += 1;
    this.initNowAnimationState();
  }

  repeatChildAnimation() {
    if (this.leftRepeatCount > 0) this.leftRepeatCount -= 1;
    this.nowLeftDuration = this.duration;
    this.nowPercentage = 0;
  }

  /**
   * Start animation execution
   */
  start() {
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
          if (finalValue <= this.toValue && this.toValue >= this.startValue) {
            finalValue = this.calculateNowValue();
            if (finalValue > this.toValue) finalValue = this.toValue;
            this.renderNowValue(finalValue);
          } else if (finalValue >= this.toValue
            && this.startValue >= this.toValue) {
            finalValue = this.calculateNowValue();
            if (finalValue < this.toValue) finalValue = this.toValue;
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
    // console.log('start animation');
  }

  /**
   * Resume execution of paused animation
   */
  resume() {
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
      // console.log('resume animation');
    }
  }

  /**
   * Destroy the animation
   */
  destroy() {
    this.clearAnimationInterval();
    if (!this.endAnimationFlag && this.onAnimationCancelCallback) {
      this.onAnimationCancelCallback();
    }
    this.resetState();
    // console.log('destroy animation');
  }

  /**
   * Pause the running animation
   */
  pause() {
    this.clearAnimationInterval();
    // console.log('pause animation');
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

export default AnimationSet;
