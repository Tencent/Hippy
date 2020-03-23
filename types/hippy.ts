import style from './style';

namespace Hippy {
  export type Style = style;

  interface AnimationStyle {
    animationId: number;
  }
  interface NativeStyle {
    [key: string]: null | string | number | number[] | AnimationStyle | AnimationStyle[];
  }

  export type Platform = 'android' | 'ios'

  export interface NativeNode {
    id: number;
    pId: number;
    index: number;
    name?: string;
    style?: NativeStyle;
    props?: {
      [key: string]: string | number | style;
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
      vibrate(pattern: number, repeatTimes?: number): void;
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
    on(event: string, callback: Function): void;
    register: {
      regist(appName: string, entryFunc: Function): void;
    };
  }
}

export default Hippy;
