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

/* eslint-disable @typescript-eslint/no-unused-vars */

import '@localTypes/global';
import { HippyEventEmitter } from '../events';
import { Bridge, Device } from '../global';

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
const fakeBackAndroid = {
  exitApp() {},
  addListener(handler: EventListener): BackAndroidRevoker {
    return {
      remove() {},
    };
  },
  removeListener(handler: EventListener) {},
  initEventListener() {},
};

const BackAndroid = (() => {
  // @ts-ignore
  if (__PLATFORM__ === 'android' || Device.platform.OS === 'android') {
    realBackAndroid.initEventListener();
    return realBackAndroid;
  }
  return fakeBackAndroid;
})();

export default BackAndroid;
export {
  BackAndroidRevoker,
};
