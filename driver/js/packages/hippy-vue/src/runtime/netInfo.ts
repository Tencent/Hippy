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

import { NeedToTyped } from '../types/native';
import { getApp, warn } from '../util';
import Native from './native';
let app: NeedToTyped;

const DEVICE_CONNECTIVITY_EVENT = 'networkStatusDidChange';
const subscriptions = new Map();

class NetInfoRevoker {
  eventName: string;
  listener: NeedToTyped;
  constructor(eventName: string, listener: NeedToTyped) {
    this.eventName = eventName;
    this.listener = listener;
  }
  remove() {
    if (!this.eventName || !this.listener) {
      return;
    }
    removeEventListener(this.eventName, this.listener);
    this.listener = undefined;
  }
}

/**
 * Add a network status event listener
 *
 * @param {string} eventName - Event name will listen for NetInfo module,
 *                             use `change` for listen network change.
 * @param {function} listener - Event status event callback
 * @returns {object} NetInfoRevoker - The event revoker for destroy the network info event listener.
 */
function addEventListener(eventName: string, listener: NeedToTyped) {
  if (typeof listener !== 'function') {
    warn('NetInfo listener is not a function');
    return;
  }
  let event = eventName;
  if (event === 'change') {
    event = DEVICE_CONNECTIVITY_EVENT;
  }
  if (subscriptions.size === 0) {
    Native.callNative('NetInfo', 'addListener', event);
  }
  if (!app) {
    app = getApp();
  }
  app.$on(
    event,
    listener,
  );
  subscriptions.set(listener, listener);
  return new NetInfoRevoker(event, listener);
}

/**
 * Remove network status event listener
 *
 * @param {string} eventName - Event name will listen for NetInfo module,
 *                             use `change` for listen network change.
 * @param {NetInfoRevoker} [listener] - The specific event listener will remove.
 */
function removeEventListener(eventName: string, listener: NeedToTyped) {
  if (listener instanceof NetInfoRevoker) {
    listener.remove();
    return;
  }
  let event = eventName;
  if (eventName === 'change') {
    event = DEVICE_CONNECTIVITY_EVENT;
  }
  const handler = subscriptions.get(listener);
  if (!handler) {
    return;
  }
  if (!app) {
    app = getApp();
  }
  app.$off(
    event,
    handler,
  );
  subscriptions.delete(listener);
  if (subscriptions.size < 1) {
    Native.callNative('NetInfo', 'removeListener', event);
  }
}

/**
 * Get the current network status
 */
function fetch() {
  return Native
    .callNativeWithPromise('NetInfo', 'getCurrentConnectivity')
    .then((resp: NeedToTyped) => resp.network_info);
}

export {
  addEventListener,
  removeEventListener,
  fetch,
  NetInfoRevoker,
};
