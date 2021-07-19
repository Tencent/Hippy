/* eslint-disable no-use-before-define */

import Native from './native';
import { getApp, warn } from '../util';
let app;

const DEVICE_CONNECTIVITY_EVENT = 'networkStatusDidChange';
const subscriptions = new Map();

class NetInfoRevoker {
  constructor(eventName, listener) {
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
function addEventListener(eventName, listener) {
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
 * Remove network status event event listener
 *
 * @param {string} eventName - Event name will listen for NetInfo module,
 *                             use `change` for listen network change.
 * @param {NetInfoRevoker} [listener] - The specific event listener will remove.
 */
function removeEventListener(eventName, listener) {
  if (listener instanceof NetInfoRevoker) {
    listener.remove();
    return;
  }

  let event = eventName;
  if (eventName === 'change') {
    event = DEVICE_CONNECTIVITY_EVENT;
  }
  if (subscriptions.size <= 1) {
    Native.callNative('NetInfo', 'removeListener', event);
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
}

/**
 * Get the current network status
 */
function fetch() {
  return Native
    .callNativeWithPromise('NetInfo', 'getCurrentConnectivity')
    .then(resp => resp.network_info);
}

export {
  addEventListener,
  removeEventListener,
  fetch,
  NetInfoRevoker,
};
