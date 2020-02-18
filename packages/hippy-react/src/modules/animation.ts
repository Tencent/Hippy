import { HippyEventEmitter, HippyEventRevoker } from '../events';
import { Bridge, Device } from '../native';
import { warn } from '../utils';
import { repeatCountDict } from '../utils/animation';

type AnimationValue = number | { animationId: number};
type AnimationCallback = () => void;
type AnimationDirection = 'left' | 'right' | 'top' | 'bottom' | 'center';

interface AnimationOptions {
  /**
   * Initial value at `Animation` start
   */
  startValue: AnimationValue;

  /**
   * End value when `Animation` end.
   */
  toValue: AnimationValue;

  /**
   * Animation execution time
   */
  duration: number;

  /**
   * Timeline mode of animation
   */
  mode?: 'timing';  // TODO: fill more options

  /**
   * Delay starting time
   */
  delay?: number;

  /**
   * Value type, leavel it blank in most case, except use rotate related
   * animation, set it to be 'deg'.
   */
  valueType?: 'deg'; // TODO: fill more options

  /**
   * Animation start position
   */
  direction?: AnimationDirection;

  /**
   * Animation interpolation type
   */
  timingFunction?: 'linear' | 'ease' | 'bezier' | 'in' | 'ease-in' | 'out' | 'ease-out' | 'inOut' | 'ease-in-out';

  /**
   * Animation repeat times, use 'loop' to be alway repeating.
   */
  repeatCount?: number;

  inputRange?: any[];
  outputRange?: any[];
}

interface Animation extends AnimationOptions {
  animationId: number;
  onAnimationStartCallback?: AnimationCallback;
  onAnimationEndCallback?: AnimationCallback;
  onAnimationCancelCallback?: AnimationCallback;
  onAnimationRepeatCallback?: AnimationCallback;
  animationStartListener?: HippyEventRevoker;
  animationEndListener?: HippyEventRevoker;
  animationCancelListener?: HippyEventRevoker;
  animationRepeatListener?: HippyEventRevoker;

  // Fallback event handlers
  onRNfqbAnimationStart?: Function;
  onRNfqbAnimationEnd?: Function;
  onRNfqbAnimationCancel?: Function;
  onRNfqbAnimationRepeat?: Function;
  onHippyAnimationStart?: Function;
  onHippyAnimationEnd?: Function;
  onHippyAnimationCancel?: Function;
  onHippyAnimationRepeat?: Function;
}

const AnimationEventEmitter = new HippyEventEmitter();

/**
 * Better performance of Animation solution.
 *
 * It pushes the animation scheme to native at once.
 */
class Animation implements Animation {
  constructor(config: AnimationOptions) {
    let startValue: AnimationValue = 0;
    if (config.startValue && config.startValue.constructor && config.startValue.constructor.name === 'Animation') {
      startValue = { animationId: (config.startValue as Animation).animationId };
    } else {
      ({ startValue } = config);
    }

    this.mode = config.mode || 'timing';

    this.delay = config.delay || 0;
    this.startValue = startValue || 0;
    this.toValue = config.toValue || 0;
    this.valueType = config.valueType || undefined;
    this.duration = config.duration || 0;
    this.direction = config.direction || 'center';
    this.timingFunction = config.timingFunction || 'linear';
    this.repeatCount = repeatCountDict(config.repeatCount || 0);
    this.inputRange = config.inputRange || [];
    this.outputRange = config.outputRange || [];

    this.animationId = Bridge.callNativeWithCallbackId('AnimationModule', 'createAnimation', true, this.mode, Object.assign({
      delay: this.delay,
      startValue: this.startValue,
      toValue: this.toValue,
      duration: this.duration,
      direction: this.direction,
      timingFunction: this.timingFunction,
      repeatCount: this.repeatCount,
      inputRange: this.inputRange,
      outputRange: this.outputRange,
    }, (this.valueType ? { valueType: this.valueType } : {})));

    this.destroy = this.destroy.bind(this);

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
    if (this.animationStartListener) {
      this.animationStartListener.remove();
    }
    if (this.animationEndListener) {
      this.animationEndListener.remove();
    }
    if (this.animationCancelListener) {
      this.animationCancelListener.remove();
    }
    if (this.animationRepeatListener) {
      this.animationRepeatListener.remove();
    }
  }

  /**
   * Start animation execution
   */
  public start() {
    this.removeEventListener();

    // Set as iOS default
    let animationEventName = 'onAnimation';
    // If running in Android, change it.
    if (__PLATFORM__ === 'android' || Device.platform.OS === 'android') {
      animationEventName = 'onHippyAnimation';
    }

    if (typeof this.onAnimationStartCallback === 'function') {
      this.animationStartListener = AnimationEventEmitter.addListener(`${animationEventName}Start`, (animationId) => {
        if (animationId === this.animationId) {
          (this.animationStartListener as HippyEventRevoker).remove();
          if (typeof this.onAnimationStartCallback === 'function') {
            this.onAnimationStartCallback();
          }
        }
      });
    }
    if (typeof this.onAnimationEndCallback === 'function') {
      this.animationEndListener = AnimationEventEmitter.addListener(`${animationEventName}End`, (animationId) => {
        if (animationId === this.animationId) {
          (this.animationEndListener as HippyEventRevoker).remove();
          if (typeof this.onAnimationEndCallback === 'function') {
            this.onAnimationEndCallback();
          }
        }
      });
    }
    if (typeof this.onAnimationCancelCallback === 'function') {
      this.animationCancelListener = AnimationEventEmitter.addListener(`${animationEventName}Cancel`, (animationId) => {
        if (animationId === this.animationId) {
          (this.animationCancelListener as HippyEventRevoker).remove();
          if (typeof this.onAnimationCancelCallback === 'function') {
            this.onAnimationCancelCallback();
          }
        }
      });
    }
    if (typeof this.onAnimationRepeatCallback === 'function') {
      this.animationRepeatListener = AnimationEventEmitter.addListener(`${animationEventName}Repeat`, (animationId) => {
        if (animationId === this.animationId) {
          if (typeof this.onAnimationRepeatCallback === 'function') {
            this.onAnimationRepeatCallback();
          }
        }
      });
    }
    Bridge.callNative('AnimationModule', 'startAnimation', this.animationId);
  }

  /**
   * Use destroy() to destroy animation.
   */
  public destory() {
    warn('Animation.destory() method will be deprecated soon, please use Animation.destroy() as soon as possible');
    this.destroy();
  }

  /**
   * Destroy the animation
   */
  destroy() {
    this.removeEventListener();
    Bridge.callNative('AnimationModule', 'destroyAnimation', this.animationId);
  }

  /**
   * Pause the running animation
   */
  pause() {
    Bridge.callNative('AnimationModule', 'pauseAnimation', this.animationId);
  }

  /**
   * Resume execution of paused animation
   */
  resume() {
    Bridge.callNative('AnimationModule', 'resumeAnimation', this.animationId);
  }

  /**
   * Update to new animation scheme
   *
   * @param {Object} newConfig - new animation schema
   */
  updateAnimation(newConfig: AnimationOptions) {
    if (typeof newConfig !== 'object') {
      throw new TypeError('Invalid arguments');
    }

    if (typeof newConfig.mode === 'string' && newConfig.mode !== this.mode) {
      throw new TypeError('Update animation mode not supported');
    }

    Object.entries(newConfig).forEach(([prop, value]) => {
      if (prop === 'startValue') {
        let startValue: AnimationValue = 0;
        if (newConfig.startValue instanceof Animation) {
          startValue = { animationId: newConfig.startValue.animationId };
        } else {
          ({ startValue } = newConfig);
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

    Bridge.callNative('AnimationModule', 'updateAnimation', this.animationId, Object.assign({
      delay: this.delay,
      startValue: this.startValue,
      toValue: this.toValue,
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
  onAnimationStart(cb: AnimationCallback) {
    this.onAnimationStartCallback = cb;
  }

  /**
   * Call when animation is ended.
   * @param {Function} cb - callback when animation started.
   */
  onAnimationEnd(cb: AnimationCallback) {
    this.onAnimationEndCallback = cb;
  }

  /**
   * Call when animation is canceled.
   * @param {Function} cb - callback when animation started.
   */
  onAnimationCancel(cb: AnimationCallback) {
    this.onAnimationCancelCallback = cb;
  }

  /**
   * Call when animation is repeated.
   * @param {Function} cb - callback when animation started.
   */
  onAnimationRepeat(cb: AnimationCallback) {
    this.onAnimationRepeatCallback = cb;
  }
}

export default Animation;
export {
  Animation,
  AnimationCallback,
};
