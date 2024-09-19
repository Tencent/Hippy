import type { AnimationOptions, AnimationList } from '../types';

const MODULE_NAME = 'AnimationModule';

class AnimationBase {
  // animation id
  private readonly id: number;

  constructor(animationId: number) {
    // save animation id
    this.id = animationId;
  }

  /**
   * get animation instance id
   */
  public getId() {
    return this.id;
  }

  /**
   * start animation
   */
  public start() {
    // start animation
    Hippy.bridge.callNative(MODULE_NAME, 'startAnimation', this.id);
  }

  /**
   * pause animation
   */
  public pause() {
    // pause animation
    Hippy.bridge.callNative(MODULE_NAME, 'pauseAnimation', this.id);
  }

  /**
   * resume animation
   */
  public resume() {
    // resume animation
    Hippy.bridge.callNative(MODULE_NAME, 'resumeAnimation', this.id);
  }

  /**
   * remove animation
   */
  public destroy() {
    // destroy animation
    Hippy.bridge.callNative(MODULE_NAME, 'destroyAnimation', this.id);
  }

  /**
   * update animation
   */
  public updateAnimation(options: AnimationOptions) {
    // update animation
    Hippy.bridge.callNative(MODULE_NAME, 'destroyAnimation', this.id, options);
  }

  /**
   * add event listener for animation
   */
  public addEventListener(type: string, listener: () => void) {
    // add animation event listener
    Hippy.bridge.callNative(MODULE_NAME, 'addEventListener', this.id, type, listener);
  }

  /**
   * remove animation event listener
   */
  public removeEventListener(type: string, listener: () => void) {
    // remove animation event listener
    Hippy.bridge.callNative(MODULE_NAME, 'removeEventListener', this.id, type, listener);
  }
}

/**
 * Hippy 3.x Animation New Class
 */
export class Animation extends AnimationBase {
  constructor(options: AnimationOptions) {
    // generate animation instance and save animation id
    const animationId = Hippy.bridge.callNativeWithCallbackId(MODULE_NAME, 'createAnimation', true, options.mode, options);
    super(animationId);
  }
}

/**
 * Hippy 3.x AnimationSet New Class
 */
export class AnimationSet extends AnimationBase {
  constructor({ children, repeatCount }: {
    children: AnimationList,
    repeatCount: number;
  }) {
    // generate animationSet instance and save animation id
    const animationId = Hippy.bridge.callNativeWithCallbackId(MODULE_NAME, 'createAnimationSet', true, {
      children,
      repeatCount,
    });
    super(animationId);
  }
}
