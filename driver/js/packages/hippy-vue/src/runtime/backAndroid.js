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

import { getApp } from '../util';
import Native from './native';

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
  exitApp() {
    // noop
  },
  addListener() {
    return {
      remove() {
        // noop
      },
    };
  },
  removeListener() {
    // noop
  },
  initEventListener() {
    // noop
  },
};

const BackAndroid = (() => {
  if (Hippy.device.platform.OS === 'android') {
    return realBackAndroid;
  }
  return fakeBackAndroid;
})();

export default BackAndroid;
