/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

import { translateColor, getCssMap, type StyleNode } from '@hippy-vue-next-style-parser/index';
import type { NeedToTyped, CallbackType, NativeInterfaceMap } from '../../types';
import { HIPPY_VUE_VERSION } from '../../config';
import { isStyleMatched, trace, warn, getBeforeLoadStyle } from '../../util';
import { type HippyElement } from '../element/hippy-element';
import { EventBus } from '../event/event-bus';
import { type HippyNode } from '../node/hippy-node';

// Extend the global interface definition
declare global {
  // eslint-disable-next-line no-var,@typescript-eslint/naming-convention,vars-on-top
  var Hippy: NeedToTyped;
  // eslint-disable-next-line no-var,@typescript-eslint/naming-convention,vars-on-top
  var __HIPPYNATIVEGLOBAL__: NeedToTyped;
  // eslint-disable-next-line no-var,vars-on-top
  var localStorage: Storage;
}

export enum PlatformType {
  ANDROID = 'android',
  iOS = 'ios',
  OHOS = 'ohos',
}

// screen dimension information
interface ScreenInfo {
  width: number;
  height: number;
  scale: number;
  fontScale: number;
  statusBarHeight: number;
  navigatorBarHeight: number;
}

interface Dimensions {
  window: ScreenInfo;
  screen: ScreenInfo;
}

// Element position information type
export interface MeasurePosition {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
}

// DOM Bounding Rect
export interface DOMRect {
  x: number | undefined;
  y: number | undefined;
  top: number | undefined;
  left: number | undefined;
  bottom: number | undefined;
  right: number | undefined;
  width: number | undefined;
  height: number | undefined;
}

// Native location information type
interface NativePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

// image size type
interface ImageSize {
  width: number;
  height: number;
}

// Get the function's signature
type CallNativeFunctionSignature<
  K extends keyof NativeInterfaceMap,
  T extends keyof NativeInterfaceMap[K],
> = NativeInterfaceMap[K][T] extends (...args: NeedToTyped[]) => NeedToTyped
  ? NativeInterfaceMap[K][T]
  : never;

interface CallNativeFunctionType {
  <K extends keyof NativeInterfaceMap, T extends keyof NativeInterfaceMap[K]>(
    moduleName: K,
    methodName: T,
    ...args: Parameters<CallNativeFunctionSignature<K, T>>
  ): void;
  // supplement the call signature of function.call
  call: <
    K extends keyof NativeInterfaceMap,
    T extends keyof NativeInterfaceMap[K],
    U,
  >(
    thisType: U,
    moduleName: K,
    methodName: T,
    ...args: Parameters<CallNativeFunctionSignature<K, T>>
  ) => void;
}

interface CallNativeWithPromiseType {
  <K extends keyof NativeInterfaceMap, T extends keyof NativeInterfaceMap[K]>(
    moduleName: K,
    methodName: T,
    ...args: Parameters<CallNativeFunctionSignature<K, T>>
  ): Promise<ReturnType<CallNativeFunctionSignature<K, T>>>;
  call: <
    K extends keyof NativeInterfaceMap,
    T extends keyof NativeInterfaceMap[K],
    U,
  >(
    thisType: U,
    moduleName: K,
    methodName: T,
    ...args: Parameters<CallNativeFunctionSignature<K, T>>
  ) => Promise<ReturnType<CallNativeFunctionSignature<K, T>>>;
}

export interface AsyncStorage {
  getAllKeys: () => Promise<string[]>;
  getItem: (key: string) => Promise<string>;
  multiGet: (keys: string[]) => Promise<string[]>;
  multiRemove: (keys: string[]) => Promise<void>;
  multiSet: (keys: { [key: string]: string | number }) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  setItem: (key: string, value: string | number) => Promise<void>;
}

/**
 * network info revoker
 */
export interface NetInfoRevoker {
  eventName?: string;
  listener?: CallbackType;
  remove: () => void;
}

/**
 * Native api type
 *
 * @public
 */
export interface NativeApiType {
  // hippy native document
  hippyNativeDocument: {
    createNode: () => void;
    updateNode: () => void;
    deleteNode: () => void;
    flushBatch: () => void;
    callUIFunction: (
      id: NeedToTyped,
      name: NeedToTyped,
      param?: NeedToTyped,
      cb?: NeedToTyped,
    ) => void;
    sendRenderError: (error: Error) => void;
  };
  // hippy native register
  hippyNativeRegister: {
    regist: CallbackType;
  };

  // localized information for the current platform
  Localization: {
    direction: number;
  };
  // platform
  Platform: string;
  // current screen pixel ratio
  PixelRatio: number;
  // async localstorage
  AsyncStorage: AsyncStorage;

  Clipboard: {
    // get clipboard content
    getString: () => Promise<string>;
    // set clipboard content
    setString: (content: string) => void;
  };

  Cookie: {
    // get all cookies of the specified url
    getAll: (url: string) => Promise<string>;
    // set cookies
    set: (url: string, keyValue: string, expireDate?: Date) => void;
  };

  // get API version, only callable for Android
  APILevel: string | null;

  // device info
  Device: string | undefined;

  // whether the device is iPhoneX
  isIPhoneX: boolean;

  // 1px size on device
  OnePixel: number;

  // get the current system version, only available for iOS
  OSVersion: string | null;

  // get sdk version, only available for iOS
  SDKVersion: string | null;

  // whether the screen is currently vertical
  screenIsVertical: boolean;

  // network info
  NetInfo: {
    // fetch network info
    fetch: () => Promise<string>;
    addEventListener: (
      eventName: string,
      listener: CallbackType,
    ) => NetInfoRevoker;
    removeEventListener: (
      eventName: string,
      listener: CallbackType | NetInfoRevoker,
    ) => void;
  };

  ImageLoader: {
    getSize: (url: string) => Promise<ImageSize>;
    prefetch: (url: string) => void;
  };

  // include window and screen info
  Dimensions: Dimensions;

  // call native interface, no return value
  callNative: CallNativeFunctionType;

  // call native interface, return with promise
  callNativeWithPromise: CallNativeWithPromiseType;

  // use callback id to call native interface
  callNativeWithCallbackId: <
    K extends keyof NativeInterfaceMap,
    T extends keyof NativeInterfaceMap[K],
  >(
    moduleName: K,
    methodName: T,
    ...args: Parameters<CallNativeFunctionSignature<K, T>>
  ) => number;

  // call native UI function
  callUIFunction: (
    el: Record<string, NeedToTyped>,
    funcName: NeedToTyped,
    ...args: NeedToTyped[]
  ) => void;

  isAndroid: () => boolean;

  isIOS: () => boolean;

  isOhos: () => boolean;

  // measure the position of an element within the rootView(container)
  measureInWindow: (el: HippyNode) => Promise<MeasurePosition>;

  // measure the position of an element within the window
  measureInAppWindow: (el: HippyNode) => Promise<MeasurePosition>;

  // measure the position of an element within the window
  getBoundingClientRect: (el: HippyNode, options?: { relToContainer?: boolean }) => Promise<DOMRect>;

  // convert the given color string to int32 recognized by Native
  parseColor: (color: string, options?: { platform: string }) => number;
  // get the style of the specified element
  getElemCss: (element: HippyElement) => NeedToTyped;

  // hippy vue next package version
  version?: string;

  ConsoleModule: NeedToTyped
}

// cached data type
interface CacheType {
  // color parser map
  COLOR_PARSER?: {
    [key: string]: number;
  };
  // one pixel size
  OnePixel?: number;
  isIPhoneX?: boolean;
  Device?: string;
}

const LOG_TYPE = ['%c[native]%c', 'color: red', 'color: auto'];

export const CACHE: CacheType = {};

// faked hippy global object. avoid error in server side execute
const ssrFakeHippy = {
  device: {
    platform: {
      Localization: {},
    },
    window: {},
    screen: {},
  },
  bridge: {},
  register: {},
  document: {},
  asyncStorage: {},
};

// deconstruct the required properties and methods from the native injected global Hippy object
export const {
  bridge: { callNative, callNativeWithPromise, callNativeWithCallbackId },
  device: {
    platform: { OS: platform, Localization = {} },
    screen: { scale: pixelRatio },
  },
  device,
  document: hippyNativeDocument,
  register: hippyNativeRegister,
  asyncStorage,
} = global.Hippy ?? ssrFakeHippy;

/**
 * Call the Native interface to measure the location information of the node
 *
 * @param el - Hippy node instance
 * @param method - method name
 */
export const measureInWindowByMethod = async (
  el: HippyNode,
  method: 'measureInWindow' | 'measureInAppWindow',
): Promise<MeasurePosition> => {
  const empty: MeasurePosition = {
    top: -1,
    left: -1,
    bottom: -1,
    right: -1,
    width: -1,
    height: -1,
  };
  if (!el.isMounted || !el.nodeId) {
    return Promise.resolve(empty);
  }
  const { nodeId } = el;
  trace(...LOG_TYPE, 'callUIFunction', { nodeId, funcName: method, params: [] });
  return new Promise(resolve => hippyNativeDocument.callUIFunction(
    nodeId,
    method,
    [],
    (pos: NativePosition | string) => {
      if (!pos || typeof pos !== 'object' || typeof nodeId === 'undefined') {
        return resolve(empty);
      }
      const { x, y, height, width } = pos;
      return resolve({
        top: y,
        left: x,
        width,
        height,
        bottom: y + height,
        right: x + width,
      });
    },
  ));
};

// device connection event
const DEVICE_CONNECTIVITY_EVENT = 'networkStatusDidChange';
// subscribed web events
const networkSubscriptions = new Map();

/**
 * Native interfaces
 *
 * @public
 */
export const Native: NativeApiType = {
  Localization,

  hippyNativeDocument,

  hippyNativeRegister,

  Platform: platform,

  PixelRatio: pixelRatio,

  ConsoleModule: global.ConsoleModule || global.console,

  callNative,

  callNativeWithPromise,

  callNativeWithCallbackId,

  AsyncStorage: asyncStorage,

  callUIFunction(...args) {
    const [el, funcName, ...options] = args;
    // if the el element does not exist or is invalid, return directly
    if (!el?.nodeId) {
      return;
    }
    const { nodeId } = el;
    let [params = [], callback] = options;
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    trace(...LOG_TYPE, 'callUIFunction', { nodeId, funcName, params });
    hippyNativeDocument.callUIFunction(nodeId, funcName, params, callback);
  },

  Clipboard: {
    /**
     * get clipboard content
     */
    getString(): Promise<string> {
      return Native.callNativeWithPromise.call(
        this,
        'ClipboardModule',
        'getString',
      );
    },

    /**
     * set clipboard content
     *
     * @param content - content string
     */
    setString(content: string): void {
      Native.callNative.call(this, 'ClipboardModule', 'setString', content);
    },
  },

  Cookie: {
    /**
     * Get all cookies by url
     *
     * @param url - Get the cookies by specific url.
     */
    getAll(url: string) {
      if (!url) {
        throw new TypeError('Native.Cookie.getAll() must have url argument');
      }
      return Native.callNativeWithPromise.call(
        this,
        'network',
        'getCookie',
        url,
      );
    },
    /**
     * Set cookie key and value
     * @param url - Set the cookie to specific url.
     * @param keyValue - Full of key values, like `name=someone;gender=female`.
     * @param expireDate - Specific date of expiration.
     */
    set(url: string, keyValue: string, expireDate?: Date) {
      if (!url) {
        throw new TypeError('Native.Cookie.set() must have url argument');
      }

      let expireStr = '';
      if (expireDate) {
        expireStr = expireDate.toUTCString();
      }
      Native.callNative.call(
        this,
        'network',
        'setCookie',
        url,
        keyValue,
        expireStr,
      );
    },
  },

  ImageLoader: {
    /**
     * get image size before image rendering
     *
     * @param url - image url
     */
    getSize(url): Promise<ImageSize> {
      return Native.callNativeWithPromise.call(
        this,
        'ImageLoaderModule',
        'getSize',
        url,
      );
    },

    /**
     * Preload the image of the specified url. When such images are loaded later,
     * the rendering speed can be accelerated without downloading.
     *
     * @param url - image url
     */
    prefetch(url: string): void {
      Native.callNative.call(this, 'ImageLoaderModule', 'prefetch', url);
    },
  },

  /**
   * Get the screen or view size.
   */
  get Dimensions(): Dimensions {
    const { screen } = device;
    // Convert statusBarHeight to dp unit for android platform
    const { statusBarHeight } = screen;
    return {
      window: device.window,
      screen: {
        ...screen,
        statusBarHeight,
      },
    };
  },

  /**
   * get device type
   */
  get Device(): string | undefined {
    if (typeof CACHE.Device === 'undefined') {
      if (Native.isIOS()) {
        if (global?.__HIPPYNATIVEGLOBAL__?.Device) {
          CACHE.Device = global.__HIPPYNATIVEGLOBAL__.Device;
        } else {
          CACHE.Device = 'iPhone';
        }
      } else if (Native.isAndroid()) {
        // currently the Android terminal has not filled the details here
        CACHE.Device = 'Android device';
      } else if (Native.isOhos()) {
        CACHE.Device = 'Ohos device';
      } else {
        CACHE.Device = 'Unknown device';
      }
    }

    return CACHE.Device;
  },

  /**
   * Whether the current screen is vertical
   */
  get screenIsVertical(): boolean {
    return Native.Dimensions.window.width < Native.Dimensions.window.height;
  },

  isAndroid(): boolean {
    return Native.Platform === PlatformType.ANDROID;
  },

  isIOS(): boolean {
    return Native.Platform === PlatformType.iOS;
  },

  isOhos(): boolean {
    return Native.Platform === PlatformType.OHOS;
  },

  /**
   * Measure the component size and position.
   */
  measureInWindow(el) {
    return measureInWindowByMethod(el, 'measureInWindow');
  },

  /**
   * Measure the component size and position.
   */
  measureInAppWindow(el) {
    if (Native.isAndroid()) {
      return measureInWindowByMethod(el, 'measureInWindow');
    }
    return measureInWindowByMethod(el, 'measureInAppWindow');
  },

  /**
   * Returns a Promise with DOMRect object providing information
   * about the size of an element and its position relative to the RootView or Container
   * @param el
   * @param options
   */
  getBoundingClientRect(el, options): Promise<DOMRect> {
    const { nodeId } = el;
    return new Promise((resolve, reject) => {
      if (!el.isMounted || !nodeId) {
        return reject(new Error(`getBoundingClientRect cannot get nodeId of ${el} or ${el} is not mounted`));
      }
      trace(...LOG_TYPE, 'UIManagerModule', { nodeId, funcName: 'getBoundingClientRect', params: options });
      hippyNativeDocument.callUIFunction(nodeId, 'getBoundingClientRect', [options], (res) => {
        if (!res || res.errMsg) {
          return reject(new Error((res?.errMsg) || 'getBoundingClientRect error with no response'));
        }
        const { x, y, width, height } = res;
        let bottom: undefined | number = undefined;
        let right: undefined | number = undefined;
        if (typeof y === 'number' && typeof height === 'number') {
          bottom = y + height;
        }
        if (typeof x === 'number' && typeof width === 'number') {
          right = x + width;
        }
        return resolve({
          x,
          y,
          width,
          height,
          bottom,
          right,
          left: x,
          top: y,
        });
      });
    });
  },
  NetInfo: {
    /**
     * get current network status, return with promise
     */
    fetch(): Promise<string> {
      return Native.callNativeWithPromise(
        'NetInfo',
        'getCurrentConnectivity',
      ).then(({ network_info }) => network_info);
    },
    addEventListener(
      eventName: string,
      listener: CallbackType,
    ): NetInfoRevoker {
      let event = eventName;
      if (event === 'change') {
        event = DEVICE_CONNECTIVITY_EVENT;
      }
      if (networkSubscriptions.size === 0) {
        Native.callNative('NetInfo', 'addListener', event);
      }
      EventBus.$on(event, listener);
      networkSubscriptions.set(listener, listener);

      return {
        eventName,
        listener,
        remove() {
          if (!this.eventName || !this.listener) {
            return;
          }
          Native.NetInfo.removeEventListener(this.eventName, this.listener);
          this.listener = undefined;
        },
      };
    },
    removeEventListener(
      eventName: string,
      listener: CallbackType | NetInfoRevoker,
    ): void {
      if ((listener as NetInfoRevoker)?.remove) {
        (listener as NetInfoRevoker).remove();
        return;
      }
      let event = eventName;
      if (eventName === 'change') {
        event = DEVICE_CONNECTIVITY_EVENT;
      }
      if (networkSubscriptions.size <= 1) {
        Native.callNative('NetInfo', 'removeListener', event);
      }
      const handler = networkSubscriptions.get(listener);
      if (!handler) {
        return;
      }

      EventBus.$off(event, handler);
      networkSubscriptions.delete(listener);
      if (networkSubscriptions.size < 1) {
        Native.callNative('NetInfo', 'removeListener', event);
      }
    },
  },

  get isIPhoneX(): boolean {
    if (typeof CACHE.isIPhoneX === 'undefined') {
      let isIPhoneX = false;
      if (Native.isIOS()) {
        // iOS12 - iPhone11: 48 Phone12/12 pro/12 pro max: 47 other: 44
        isIPhoneX = Native.Dimensions.screen.statusBarHeight !== 20;
      }
      CACHE.isIPhoneX = isIPhoneX;
    }

    return CACHE.isIPhoneX;
  },

  /**
   * Get the one pixel size of device
   */
  get OnePixel(): number {
    if (typeof CACHE.OnePixel === 'undefined') {
      const ratio = Native.PixelRatio;
      let onePixel = Math.round(0.4 * ratio) / ratio;
      if (!onePixel) {
        // Assume 0 is false
        onePixel = 1 / ratio;
      }
      CACHE.OnePixel = onePixel;
    }
    return CACHE.OnePixel;
  },

  /**
   * Get the API version, the API is only for Android so far.
   */
  get APILevel(): string | null {
    if (!Native.isAndroid()) {
      warn('Vue.Native.APIVersion is available in Android only');
      return null;
    }

    if (global?.__HIPPYNATIVEGLOBAL__?.Platform?.APILevel) {
      return global.__HIPPYNATIVEGLOBAL__.Platform.APILevel;
    }
    warn('Vue.Native.APILevel needs higher Android SDK version to retrieve');
    return null;
  },

  /**
   * Get the OS version, the API is only for ios so far.
   *
   */
  get OSVersion(): string | null {
    if (!Native.isIOS()) {
      return null;
    }
    if (global?.__HIPPYNATIVEGLOBAL__?.OSVersion) {
      return global.__HIPPYNATIVEGLOBAL__.OSVersion;
    }

    return null;
  },

  /**
   * Get the SDK version, the API is only for ios so far.
   */
  get SDKVersion(): string | null {
    if (!Native.isIOS()) {
      return null;
    }

    if (global?.__HIPPYNATIVEGLOBAL__?.OSVersion) {
      return global?.__HIPPYNATIVEGLOBAL__?.SDKVersion;
    }

    return null;
  },

  /**
   * Convert the color to the native corresponding int32 color value
   *
   * @param color - color string
   */
  parseColor(color: string | number): number {
    if (Number.isInteger(color)) {
      return color as number;
    }
    const cache = CACHE.COLOR_PARSER ?? (CACHE.COLOR_PARSER = Object.create(null));
    if (!cache[color]) {
      // cache parse result
      cache[color] = translateColor(color);
    }
    return cache[color];
  },

  getElemCss(element: HippyElement) {
    const style = Object.create(null);
    try {
      getCssMap(undefined, getBeforeLoadStyle())
        .query(element as unknown as StyleNode)
        .selectors.forEach((matchedSelector) => {
          if (!isStyleMatched(matchedSelector, element)) {
            return;
          }
          matchedSelector.ruleSet.declarations.forEach((cssStyle) => {
            style[cssStyle.property] = cssStyle.value;
          });
        });
    } catch (err) {
      warn('getDomCss Error:', err);
    }
    return style;
  },

  version: HIPPY_VUE_VERSION,
};
