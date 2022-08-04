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

import { EventBus } from './runtime/event/event-bus';
import { Native } from './runtime/native';

const DEVICE_MODULE = 'DeviceEventModule';
const backPressSubscriptions = new Set();
let hasInitialized = false;

/**
 * Android physical return key event listener
 */
const realBackAndroid = {
  /**
   * exit APP
   */
  exitApp() {
    Native.callNative(DEVICE_MODULE, 'invokeDefaultBackPressHandler');
  },
  /**
   * Add physical button listener events
   *
   * @param handler - handler method
   *
   */
  addListener(handler) {
    if (!hasInitialized) {
      hasInitialized = true;
      realBackAndroid.initEventListener();
    }
    Native.callNative(DEVICE_MODULE, 'setListenBackPress', true);
    backPressSubscriptions.add(handler);
    return {
      remove() {
        realBackAndroid.removeListener(handler);
      },
    };
  },

  /**
   * Remove physical button listener events
   *
   * @param handler - handler method
   */
  removeListener(handler) {
    backPressSubscriptions.delete(handler);
    if (backPressSubscriptions.size === 0) {
      Native.callNative(DEVICE_MODULE, 'setListenBackPress', false);
    }
  },

  /**
   * Initialize event listeners
   */
  initEventListener() {
    // Vue3 has no $on $off, etc., uses the event bus provided by tiny-emitter
    EventBus.$on('hardwareBackPress', () => {
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
 * Handle events that simulate physical return keys for iOS
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

/**
 * physical return button processing
 *
 * @public
 */
export const BackAndroid = (() => {
  if (Native.isAndroid()) {
    return realBackAndroid;
  }
  return fakeBackAndroid;
})();
