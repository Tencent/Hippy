/* eslint-disable no-use-before-define */

import { HippyEventEmitter } from '../events';
import { Bridge } from '../global';

type NetworkChangeEventData = any;
type NetworkInfoCallback = (data: NetworkChangeEventData) => void;

interface NetInfoRevoker {
  eventName: string;
  listener: NetworkInfoCallback;
}

const DEVICE_CONNECTIVITY_EVENT = 'networkStatusDidChange';
const subScriptions = new Map();

let NetInfoEventEmitter: HippyEventEmitter;

class NetInfoRevoker implements NetInfoRevoker {
  constructor(eventName: string, listener: (data: any) => void) {
    this.eventName = eventName;
    this.listener = listener;
  }

  remove() {
    if (!this.eventName || !this.listener) {
      return;
    }
    removeEventListener(this.eventName, this.listener);
    delete this.listener;
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
function addEventListener(eventName: string, listener: NetworkInfoCallback): NetInfoRevoker {
  NetInfoEventEmitter = new HippyEventEmitter();
  let event = eventName;
  if (event && event === 'change') {
    event = DEVICE_CONNECTIVITY_EVENT;
  }
  const count = NetInfoEventEmitter.listenerSize(event);
  if (count < 1) {
    Bridge.callNative('NetInfo', 'addListener', event);
  }
  const handler = NetInfoEventEmitter.addListener(
    event,
    (data: NetworkChangeEventData) => {
      listener(data);
    },
  );
  // FIXME: Seems only accept one callback for each event, should support multiple callback.
  subScriptions.set(handler, handler);
  return new NetInfoRevoker(event, listener);
}

/**
 * Removenetwork status event event listener
 *
 * @param {string} eventName - Event name will listen for NetInfo module,
 *                             use `change` for listen network change.
 * @param {function} [handler] - The specific event listener will remove.
 */
function removeEventListener(eventName: string, listener?: NetInfoRevoker | NetworkInfoCallback) {
  if (listener instanceof NetInfoRevoker) {
    listener.remove();
    return;
  }

  let event = eventName;
  if (eventName && eventName === 'change') {
    event = DEVICE_CONNECTIVITY_EVENT;
  }
  const count = NetInfoEventEmitter.listenerSize(event);
  if (count <= 1) {
    Bridge.callNative('NetInfo', 'removeListener', event);
  }
  const handler = subScriptions.get(listener);
  if (!handler) {
    return;
  }
  handler.remove();
  subScriptions.delete(listener);
}

/**
 * Get the current network status
 */
function fetch(): Promise<NetworkChangeEventData> {
  return Bridge
    .callNativeWithPromise('NetInfo', 'getCurrentConnectivity')
    .then((resp: any) => resp.network_info);
}

export {
  addEventListener,
  removeEventListener,
  fetch,
};
