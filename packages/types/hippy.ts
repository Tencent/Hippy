import style from './style';

namespace Hippy {
  export type Style = style;

  interface AnimationStyle {
    animationId: number;
  }
  interface NativeStyle {
    [key: string]: null | string | number | number[] | AnimationStyle | AnimationStyle[];
  }

  export type Platform = 'android' | 'ios';

  export type Attributes = {
    [key: string]: string | number;
  };

  export interface NativeNode {
    id: number;
    pId: number;
    index: number;
    name?: string;
    style?: NativeStyle;
    tagName?: string;
    props?: {
      [key: string]: string | number | undefined | Attributes | Style;
      attributes?: Attributes;
    }
  }

  export interface AsyncStorage {
    getAllKeys(): Promise<string[]>;
    getItem(key: string): Promise<string>;
    multiGet(keys: string[]): Promise<string[]>;
    multiRemove(keys: string[]): Promise<void>;
    multiSet(keys: { [key: string]: string | number }): Promise<void>;
    removeItem(key: string): Promise<void>;
    setItem(key: string, value: string | number): Promise<void>;
  }

  export interface Bridge {
    callNative(moduleName: string, methodName: string, ...args: any[]): void;
    callNativeWithCallbackId(moduleName: string, methodName: string, ...args: any[]): number;
    callNativeWithPromise<T>(moduleName: string, methodName: string, ...args: any[]): Promise<T>;
    removeNativeCallback(callbackId: number): void;
  }

  export interface Sizes {
    fontScale: number;
    height: number;
    scale: number;
    statusBarHeight: number;
    width: number;
  }

  export interface HippyConstance {
    asyncStorage: AsyncStorage;
    bridge: Bridge;
    device: {
      cancelVibrate(): void;
      vibrate(pattern: number, repeatTimes?: number): void;
      platform: {
        OS: Platform;
        APILevel: number; // Android Only
      };
      screen: Sizes;
      window: Sizes;
    };
    document: {
      createNode(rootViewId: number, queue: NativeNode[]): void;
      deleteNode(rootViewId: number, queue: NativeNode[]): void;
      endBatch(renderId: number): void;
      flushBatch(rootViewId: number, queue: NativeNode[]): void;
      sendRenderError(err: Error): void;
      startBatch(renderId: number): void;
      updateNode(rootViewId: number, queue: NativeNode[]): void;
    };

    /**
     * Register a listener for a specific event, and the listener will be called
     * when the event is triggered.
     *
     * @param {string} eventName - The event name will be registered.
     * @param {Function} listener - Event callback.
     */
    on(eventName: string, listener: Function): void;

    /**
     * Remove specific event listener,
     *
     * @param {string} eventName - The event name will be removed.
     * @param {Function} listener - Specific event callback will be removed,
     *                              the listeners will clean all if not specific.
     */
    off(eventName: string, listener?: Function): void;

    /**
     * Trigger a event with arguments.
     *
     * @param {string} eventName - The event name will be trigger.
     * @param  {any} args - Event callback arguments.
     */
    emit(eventName: string, ...args: any[]): void;

    register: {
      /**
       * Register the Hippy app entry function,
       * the native will trigger an event to execute the function
       * and start the app.
       *
       * The different platforms the event name is different, for Android it's 'loadInstance',
       * for iOS it's 'runApplication'.
       *
       * For the same app startup multiple times, it needs to use a different Javascript Context
       * for the environment isolation.
       *
       * @param {string} appName - The app name will be register.
       * @param {*} entryFunc - The entry function will be execute after native called.
       */
      regist(appName: string, entryFunc: Function): void;
    };
  }
}

export default Hippy;
