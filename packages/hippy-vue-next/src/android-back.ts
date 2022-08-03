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
 * 安卓物理返回键事件监听
 */
const realBackAndroid = {
  /**
   * 退出APP
   */
  exitApp() {
    Native.callNative(DEVICE_MODULE, 'invokeDefaultBackPressHandler');
  },
  /**
   * 添加物理按键监听事件
   *
   * @param handler - 处理事件
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
   * 移除物理按键监听事件
   *
   * @param handler - 处理事件
   */
  removeListener(handler) {
    backPressSubscriptions.delete(handler);
    if (backPressSubscriptions.size === 0) {
      Native.callNative(DEVICE_MODULE, 'setListenBackPress', false);
    }
  },

  /**
   * 初始化事件监听器
   */
  initEventListener() {
    // Vue3无$on $off等，使用tiny-emitter提供的事件总线
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
 * 为iOS模拟物理返回按键的处理事件
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
 * 安卓物理返回按键处理
 *
 * @public
 */
export const BackAndroid = (() => {
  if (Native.isAndroid()) {
    return realBackAndroid;
  }
  return fakeBackAndroid;
})();
