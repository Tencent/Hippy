import { HippyEventEmitter, HippyEventRevoker } from '../events';
import { Bridge, Device } from '../native';
import { warn } from '../utils';
import { Animation, AnimationCallback } from './animation';
import { repeatCountDict } from '../utils/animation';
import '../global';

interface AnimationInstance {
  animationId: number;
  follow: boolean;
}

interface AnimationChild {
  animation: Animation;
  follow: boolean;
}

interface AnimationSetOption {
  children: AnimationChild[];
  repeatCount: number;
  virtual: any; // TODO: What's it?
}

interface AnimationSet extends Animation {
  animationId: number;
  animationList: AnimationInstance[];

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
 * Better performance of Animation series solution.
 *
 * It pushes the animation scheme to native at once.
 */
class AnimationSet implements AnimationSet {
  constructor(config: AnimationSetOption) {
    this.animationList = [];
    config.children.forEach((item) => {
      this.animationList.push({
        animationId: item.animation.animationId,
        follow: item.follow || false,
      });
    });

    this.animationId = Bridge.callNativeWithCallbackId('AnimationModule', 'createAnimationSet', true, {
      repeatCount: repeatCountDict(config.repeatCount || 0),
      children: this.animationList,
      virtual: config.virtual,
    });

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
    warn('AnimationSet.destory() method will be deprecated soon, please use Animation.destroy() as soon as possible');
    this.destroy();
  }

  /**
   * Destroy the animation
   */
  public destroy() {
    this.removeEventListener();
    Bridge.callNative('AnimationModule', 'destroyAnimation', this.animationId);
  }

  /**
   * Pause the running animation
   */
  public pause() {
    Bridge.callNative('AnimationModule', 'pauseAnimation', this.animationId);
  }

  /**
   * Resume execution of paused animation
   */
  public resume() {
    Bridge.callNative('AnimationModule', 'resumeAnimation', this.animationId);
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
