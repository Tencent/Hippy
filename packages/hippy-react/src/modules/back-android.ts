/* eslint-disable import/no-mutable-exports */
/* eslint-disable @typescript-eslint/no-unused-vars */

import '@localTypes/global';
import { HippyEventEmitter } from '../events';
import { Bridge, Device } from '../native';

const hippyEventEmitter = new HippyEventEmitter();
const backPressSubscriptions = new Set();

type EventListener = () => void;

interface BackAndroidRevoker {
  remove(): void;
}

/**
 * Android hardware back button event listener.
 */
const realBackAndroid = {
  exitApp() {
    Bridge.callNative('DeviceEventModule', 'invokeDefaultBackPressHandler');
  },

  addListener(handler: EventListener): BackAndroidRevoker {
    Bridge.callNative('DeviceEventModule', 'setListenBackPress', true);
    backPressSubscriptions.add(handler);
    return {
      remove() {
        realBackAndroid.removeListener(handler);
      },
    };
  },

  removeListener(handler: EventListener) {
    backPressSubscriptions.delete(handler);
    if (backPressSubscriptions.size === 0) {
      Bridge.callNative('DeviceEventModule', 'setListenBackPress', false);
    }
  },

  initEventListener() {
    hippyEventEmitter.addListener('hardwareBackPress', () => {
      let invokeDefault = true;
      const subscriptions = [...backPressSubscriptions].reverse();
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
let BackAndroid = {
  exitApp() {},
  addListener(handler: EventListener): BackAndroidRevoker {
    return {
      remove() {},
    };
  },
  removeListener(handler: EventListener) {},
  initEventListener() {},
};

if (__PLATFORM__) {
  if (__PLATFORM__ === 'android') {
    BackAndroid = realBackAndroid;
    BackAndroid.initEventListener();
  }
} else if (Device.platform.OS === 'android') {
  BackAndroid = realBackAndroid;
  BackAndroid.initEventListener();
}

export default BackAndroid;
export {
  BackAndroidRevoker,
};
