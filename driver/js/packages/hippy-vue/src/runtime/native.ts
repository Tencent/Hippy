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

import colorParser from '@css-loader/color-parser';
import { isDef } from 'shared/util';
import {
  HIPPY_VUE_VERSION,
  warn,
  trace,
} from '../util';
import { getElemCss } from '../native/index';
import { NeedToTyped } from '../types/native';
import ViewNode from '../renderer/view-node';
import BackAndroid from './backAndroid';
import * as NetInfo from './netInfo';

export enum PlatformType {
  ANDROID = 'android',
  iOS = 'ios',
  OHOS = 'ohos',
}

const {
  on,
  off,
  emit,
  bridge: {
    callNative,
    callNativeWithPromise,
    callNativeWithCallbackId,
  },
  device: {
    platform: {
      OS: Platform,
      Localization = {},
    },
    screen: {
      scale: PixelRatio,
    },
  },
  device: Dimensions,
  document: UIManagerModule,
  register: HippyRegister,
} = Hippy;

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

const CACHE: CacheType = {};

const LOG_TYPE = ['%c[native]%c', 'color: red', 'color: auto'];

const measureInWindowByMethod = function measureInWindowByMethod(el: ViewNode, method: string) {
  const empty = {
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
  return new Promise(resolve => UIManagerModule.callUIFunction(nodeId, method, [], (pos: NeedToTyped) => {
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
  }));
};

/**
 * Native communication module
 */
const Native: NeedToTyped = {
  /**
   * Class native methods
   */
  callNative,

  /**
   * Call native methods with a promise response.
   */
  callNativeWithPromise,

  /**
   * Call native with callId returns
   */
  callNativeWithCallbackId,

  /**
   * Draw UI with native language.
   */
  UIManagerModule,

  /**
   * console log to native
   */
  ConsoleModule: global.ConsoleModule || global.console,

  /**
   * Global device event listener
   */
  on,
  off,
  emit,

  /**
   * Get the device pixel ratio
   */
  PixelRatio,

  /**
   * Get the running operating system.
   */
  Platform,

  /**
   * Get the localization of country, language and direction
   */
  Localization,

  /**
   * Hippy-Vue version
   */
  version: HIPPY_VUE_VERSION,

  /**
   * Cookie Module
   */
  Cookie: {
    /**
     * Get all cookies by string
     * @param {string} url - Get the cookies by specific url.
     * @return {Promise<string>} - Cookie string, like `name=someone;gender=female`.
     */
    getAll(url: NeedToTyped) {
      if (!url) {
        throw new TypeError('Vue.Native.Cookie.getAll() must have url argument');
      }
      return callNativeWithPromise.call(this, 'network', 'getCookie', url);
    },
    /**
     * Set cookie key and value
     * @param {string} url - Set the cookie to specific url.
     * @param {string} keyValue - Full of key values, like `name=someone;gender=female`.
     * @param {Date} expireDate - Specific date of expiration.
     */
    set(url: NeedToTyped, keyValue: NeedToTyped, expireDate: NeedToTyped) {
      if (!url) {
        throw new TypeError('Vue.Native.Cookie.getAll() must have url argument');
      }
      if (typeof keyValue !== 'string') {
        throw new TypeError('Vue.Native.Cookie.getAll() only receive string type of keyValue');
      }
      let expireStr = '';
      if (expireDate) {
        if (expireDate instanceof Date) {
          expireStr = expireDate.toUTCString();
        } else {
          throw new TypeError('Vue.Native.Cookie.getAll() only receive Date type of expires');
        }
      }
      callNative.call(this, 'network', 'setCookie', url, keyValue, expireStr);
    },
  },

  /**
   * Clipboard Module
   */
  Clipboard: {
    getString() {
      return callNativeWithPromise.call(this, 'ClipboardModule', 'getString');
    },
    setString(content: NeedToTyped) {
      callNative.call(this, 'ClipboardModule', 'setString', content);
    },
  },

  /**
   * Determine the device is iPhone X
   */
  get isIPhoneX() {
    if (!isDef(CACHE.isIPhoneX)) {
      // Assume false in most cases.
      let isIPhoneX = false;
      if (Native.Platform === 'ios') {
        // iOS12 - iPhone11: 48 Phone12/12 pro/12 pro max: 47 other: 44
        isIPhoneX = Native.Dimensions.screen.statusBarHeight !== 20;
      }
      CACHE.isIPhoneX = isIPhoneX;
    }
    return CACHE.isIPhoneX;
  },

  /**
   * Determine the screen is vertical orientation.
   * Should always retrieve from scratch.
   */
  get screenIsVertical() {
    return Native.Dimensions.window.width < Native.Dimensions.window.height;
  },

  /**
   * Get the device information
   */
  get Device() {
    if (!isDef(CACHE.Device)) {
      if (Platform === PlatformType.iOS) {
        if (global.__HIPPYNATIVEGLOBAL__?.Device) {
          CACHE.Device = global.__HIPPYNATIVEGLOBAL__.Device;
        } else {
          CACHE.Device = 'iPhone';
        }
      } else if (Platform === PlatformType.ANDROID) {
        // TODO: Need android native fill the information
        CACHE.Device = 'Android device';
      } else if (Platform === PlatformType.OHOS) {
        CACHE.Device = 'Ohos device';
      } else {
        CACHE.Device = 'Unknown device';
      }
    }
    return CACHE.Device;
  },

  /**
   * Get the OS version
   */
  get OSVersion() {
    if (Platform !== 'ios') {
      warn('Vue.Native.OSVersion is available in iOS only');
      return null;
    }
    if (!global.__HIPPYNATIVEGLOBAL__ || !global.__HIPPYNATIVEGLOBAL__.OSVersion) {
      warn('Vue.Native.OSVersion is only available for iOS SDK > 0.2.0');
      return null;
    }
    return global.__HIPPYNATIVEGLOBAL__.OSVersion;
  },

  /**
   * Get the SDK version
   */
  get SDKVersion() {
    if (Platform !== 'ios') {
      warn('Vue.Native.SDKVersion is available in iOS only');
      return null;
    }
    if (!global.__HIPPYNATIVEGLOBAL__ || !global.__HIPPYNATIVEGLOBAL__.OSVersion) {
      warn('Vue.Native.SDKVersion is only available for iOS SDK > 0.2.0');
      return null;
    }
    return global.__HIPPYNATIVEGLOBAL__.SDKVersion;
  },

  /**
   * Get the API version
   */
  get APILevel() {
    if (Platform !== 'android') {
      warn('Vue.Native.APIVersion is available in Android only');
      return null;
    }
    if (!global.__HIPPYNATIVEGLOBAL__ || !global.__HIPPYNATIVEGLOBAL__.Platform.APILevel) {
      warn('Vue.Native.APILevel needs higher Android SDK version to retrieve');
      return null;
    }
    return global.__HIPPYNATIVEGLOBAL__.Platform.APILevel;
  },

  /**
   * Get the screen or view size.
   */
  get Dimensions() {
    const { screen } = Dimensions;
    const { statusBarHeight } = screen;
    return {
      window: Dimensions.window,
      screen: {
        ...screen,
        statusBarHeight,
      },
    };
  },

  /**
   * Get the one pixel size of device
   */
  get OnePixel() {
    if (!isDef(CACHE.OnePixel)) {
      const ratio = Native.PixelRatio;
      let onePixel = Math.round(0.4 * ratio) / ratio;
      if (!onePixel) { // Assume 0 is false
        onePixel = 1 / ratio;
      }
      CACHE.OnePixel = onePixel;
    }
    return CACHE.OnePixel;
  },

  /**
   * Call native UI methods.
   */
  callUIFunction(...args: NeedToTyped[]) {
    const [el, funcName, ...options] = args;
    const { nodeId } = el;
    let [params = [], callback] = options;
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    trace(...LOG_TYPE, 'callUIFunction', { nodeId, funcName, params });
    UIManagerModule.callUIFunction(nodeId, funcName, params, callback);
  },

  /**
   * Measure the component size and position.
   * @deprecated
   */
  measureInWindow(el: NeedToTyped) {
    return measureInWindowByMethod(el, 'measureInWindow');
  },

  /**
   * Measure the component size and position.
   */
  measureInAppWindow(el: NeedToTyped) {
    if (Native.Platform === 'android') {
      return measureInWindowByMethod(el, 'measureInWindow');
    }
    return measureInWindowByMethod(el, 'measureInAppWindow');
  },

  getBoundingClientRect(el: NeedToTyped, options: NeedToTyped) {
    const { nodeId } = el;
    return new Promise((resolve, reject) => {
      if (!el.isMounted || !nodeId) {
        return reject(new Error(`getBoundingClientRect cannot get nodeId of ${el} or ${el} is not mounted`));
      }
      trace(...LOG_TYPE, 'UIManagerModule', { nodeId, funcName: 'getBoundingClientRect', params: options });
      UIManagerModule.callUIFunction(nodeId, 'getBoundingClientRect', [options], (res: NeedToTyped) => {
        // Android error handler.
        if (!res || res.errMsg) {
          return reject(new Error((res?.errMsg) || 'getBoundingClientRect error with no response'));
        }
        const { x, y, width, height } = res;
        let bottom = 0;
        let right = 0;
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

  /**
   * parse the color to int32Color which native can understand.
   * @param { String | Number } color
   * @param { {platform: "ios" | "android"} } options
   * @returns { Number } int32Color
   */
  parseColor(color: NeedToTyped, options = { platform: Native.Platform }) {
    if (Number.isInteger(color)) {
      return color;
    }
    const cache = CACHE.COLOR_PARSER || (CACHE.COLOR_PARSER = Object.create(null));
    if (!cache[color]) {
      // cache the calculation result
      cache[color] = colorParser(color);
    }
    return cache[color];
  },

  /**
   * Key-Value storage system
   */
  AsyncStorage: global.Hippy.asyncStorage,
  /**
   * Android hardware back button event listener.
   */
  BackAndroid,
  /**
   * operations for img
   */
  ImageLoader: {
    /**
     * Get the image size before rendering.
     *
     * @param {string} url - Get image url.
     */
    getSize(url: NeedToTyped) {
      return callNativeWithPromise.call(this, 'ImageLoaderModule', 'getSize', url);
    },

    /**
     * Prefetch image, to make rendering faster.
     *
     * @param {string} url - Prefetch image url.
     */
    prefetch(url: NeedToTyped) {
      callNative.call(this, 'ImageLoaderModule', 'prefetch', url);
    },
  },
  /**
   * Network operations
   */
  NetInfo,
  getElemCss,
};

// Public export
export default Native;
// Private export
export {
  HippyRegister,
  UIManagerModule,
};
