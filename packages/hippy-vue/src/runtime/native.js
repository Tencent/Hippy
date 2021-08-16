import colorParser from '@css-loader/color-parser';
import { isDef } from 'shared/util';
import {
  HIPPY_VUE_VERSION,
  warn,
  trace,
  isFunction,
} from '../util';

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
    },
    screen: {
      scale: PixelRatio,
    },
  },
  device: Dimensions,
  document: UIManagerModule,
  register: HippyRegister,
} = Hippy;

const CACHE = {};

const measureInWindowByMethod = function (el, method) {
  const empty = {
    top: -1,
    left: -1,
    bottom: -1,
    right: -1,
    width: -1,
    height: -1,
  };
  if (!el.isMounted || !el.nodeId) {
    return empty;
  }
  const { nodeId } = el;
  // FIXME: callNativeWithPromise was broken in iOS, it response
  // UIManager was called with 3 arguments, but expect 2.
  // So wrap the function with a Promise.
  const timeout = new Promise(resolve => setTimeout(() => {
    resolve(empty);
  }, 100));
  const measure = new Promise(resolve => callNative('UIManagerModule', method, nodeId, (pos) => {
    // Android error handler.
    if (!pos || pos === 'this view is null') {
      return resolve(empty);
    }
    return resolve({
      top: pos.y,
      left: pos.x,
      bottom: pos.y + pos.height,
      right: pos.x + pos.width,
      width: pos.width,
      height: pos.height,
    });
  }));
  return Promise.race([timeout, measure]);
};

/**
 * Native communication module
 */
const Native = {
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
   * Hippy-Vue version
   */
  version: HIPPY_VUE_VERSION,

  /**
   * Cookie Module
   */
  Cookie: {
    /**
     * Get all of cookies by string
     * @param {string} url - Get the cookies by specific url.
     * @return {Promise<string>} - Cookie string, like `name=someone;gender=female`.
     */
    getAll(url) {
      if (!url) {
        throw new TypeError('Vue.Native.Cookie.getAll() must have url argument');
      }
      return callNativeWithPromise('network', 'getCookie', url);
    },
    /**
     * Set cookie key and value
     * @param {string} url - Set the cookie to specific url.
     * @param {string} keyValue - Full of key values, like `name=someone;gender=female`.
     * @param {Date} expireDate - Specific date of expiration.
     */
    set(url, keyValue, expireDate) {
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
      callNative('network', 'setCookie', url, keyValue, expireStr);
    },
  },

  /**
   * Clipboard Module
   */
  Clipboard: {
    getString() {
      return callNativeWithPromise('ClipboardModule', 'getString');
    },
    setString(content) {
      callNative('ClipboardModule', 'setString', content);
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
        isIPhoneX = Native.Dimensions.screen.statusBarHeight === 44;
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
      if (Platform === 'ios') {
        if (global.__HIPPYNATIVEGLOBAL__ && global.__HIPPYNATIVEGLOBAL__.Device) {
          CACHE.Device = global.__HIPPYNATIVEGLOBAL__.Device;
        } else {
          CACHE.Device = 'iPhone';
        }
      } else if (Platform === 'android') {
        // TODO: Need android native fill the information
        CACHE.Device = 'Android device';
      } else {
        CACHE.Device = 'Unknown device';
      }
    }
    return CACHE.Device;
  },

  /**
   * Get the OS version
   * TODO: the API is iOS only so far.
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
   * TODO: the API is iOS only so far.
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
   * TODO: the API is Android only so far.
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
    // Convert statusBarHeight to dp unit for android platform
    // Here's a base issue: statusBarHeight for iOS is dp, but for statusBarHeight is pixel.
    // So make them be same to hippy-vue.
    let { statusBarHeight } = screen;
    if (Native.Platform === 'android') {
      statusBarHeight /= Native.PixelRatio;
    }
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
  callUIFunction(...args) {
    const [el, funcName, ...options] = args;
    const { nodeId } = el;
    let [params = [], callback] = options;
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    trace('callUIFunction', { nodeId, funcName, params });
    if (Native.Platform === 'android') {
      if (isFunction(callback)) {
        callNative('UIManagerModule', 'callUIFunction', [nodeId, funcName, params], callback);
      } else {
        callNative('UIManagerModule', 'callUIFunction', [nodeId, funcName, params]);
      }
    } else if (Native.Platform === 'ios' && el.meta.component.name) {
      let { name: componentName } = el.meta.component;
      // FIXME: iOS callNative method need the real component name,
      //        but there's no a module named View in __GLOBAL__.NativeModules.
      //        Because only ScrollView use the method so far, so just a workaround here.
      if (componentName === 'View') {
        componentName = 'ScrollView';
      }
      if (isFunction(callback) && Array.isArray(params)) {
        params.push(callback);
      }
      callNative('UIManagerModule', 'callUIFunction', [componentName, nodeId, funcName, params]);
    }
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
    if (Native.Platform === 'android') {
      return measureInWindowByMethod(el, 'measureInWindow');
    }
    return measureInWindowByMethod(el, 'measureInAppWindow');
  },

  /**
   * parse the color to int32Color which native can understand.
   * @param { String | Number } color
   * @param { {platform: "ios" | "android"} } options
   * @returns { Number } int32Color
   */
  parseColor(color, options = { platform: Native.Platform }) {
    const cache = CACHE.COLOR_PARSER || (CACHE.COLOR_PARSER = Object.create(null));
    if (!cache[color]) {
      const int32Color = colorParser(color, options);
      // cache the calculation result
      cache[color] = int32Color;
    }
    return cache[color];
  },
};

// Public export
export default Native;
// Private export
export {
  HippyRegister,
  UIManagerModule,
};
