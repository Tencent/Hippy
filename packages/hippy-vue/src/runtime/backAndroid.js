import Native from './native';
import { getApp } from '../util';

const backPressSubscriptions = new Set();
let app;
let hasInitialized = false;
/**
 * Android hardware back button event listener.
 */
const realBackAndroid = {
  exitApp() {
    Native.callNative('DeviceEventModule', 'invokeDefaultBackPressHandler');
  },
  /**
   * addBackPressListener
   * @param handler
   * @returns {{remove(): void}}
   */
  addListener(handler) {
    if (!hasInitialized) {
      hasInitialized = true;
      realBackAndroid.initEventListener();
    }
    Native.callNative('DeviceEventModule', 'setListenBackPress', true);
    backPressSubscriptions.add(handler);
    return {
      remove() {
        realBackAndroid.removeListener(handler);
      },
    };
  },

  /**
   * removeBackPressListener
   * @param handler
   */
  removeListener(handler) {
    backPressSubscriptions.delete(handler);
    if (backPressSubscriptions.size === 0) {
      Native.callNative('DeviceEventModule', 'setListenBackPress', false);
    }
  },

  initEventListener() {
    if (!app) {
      app = getApp();
    }
    app.$on('hardwareBackPress', () => {
      let invokeDefault = true;
      const subscriptions = Array.from(backPressSubscriptions).reverse();
      subscriptions.every((subscription) => {
        if (typeof subscription === 'function' && subscription()) {
          invokeDefault = false;
          return false;
        }
        return true;
      });
      if (invokeDefault) {
        realBackAndroid.exitApp();
      }
    });
  },
};

/**
 * Fake BackAndroid for iOS
 */
const fakeBackAndroid = {
  exitApp() {},
  addListener() {
    return {
      remove() {},
    };
  },
  removeListener() {},
  initEventListener() {},
};

const BackAndroid = (() => {
  if (Hippy.device.platform.OS === 'android') {
    return realBackAndroid;
  }
  return fakeBackAndroid;
})();

export default BackAndroid;
