import {
  getApp,
  getVue,
  warn,
  isFunction,
} from '../util';

const READY_STATE_CONNECTING = 0;
const READY_STATE_OPEN = 1;
const READY_STATE_CLOSING = 2;
const READY_STATE_CLOSED = 3;

const WEB_SOCKET_MODULE_NAME = 'websocket';

let websocketEventHub;
let app;
let Vue;

class WebSocket {
  constructor(url, protocals, extrasHeaders) {
    app = app || getApp();
    Vue = Vue || getVue();

    this.url = url;
    this.readyState = READY_STATE_CONNECTING;
    this.webSocketCallbacks = {};
    this.onWebSocketEvent = this.onWebSocketEvent.bind(this);
    let headers = {};

    if (!websocketEventHub) {
      websocketEventHub = app.$on('hippyWebsocketEvents', this.onWebSocketEvent);
    }

    if (!url || typeof url !== 'string') {
      throw new TypeError('Invalid url');
    }

    if (Array.isArray(protocals) && protocals.length > 0) {
      headers['Sec-WebSocket-Protocol'] = protocals.join(',');
    } else if (typeof protocals === 'string') {
      headers['Sec-WebSocket-Protocol'] = protocals;
    }

    if (typeof extrasHeaders === 'object') {
      headers = { ...headers, ...extrasHeaders };
    }

    const params = {
      headers,
      url,
    };

    Vue.Native.callNativeWithPromise(WEB_SOCKET_MODULE_NAME, 'connect', params).then((resp) => {
      if (!resp || resp.code !== 0 || typeof resp.id !== 'number') {
        warn(`Fail to create websocket connection, reason: ${(resp ? resp.reason : 'unknown error')}`);
        return;
      }

      this.webSocketId = resp.id;
    });
  }

  close(code, reason) {
    if (this.readyState !== READY_STATE_OPEN) {
      return;
    }

    this.readyState = READY_STATE_CLOSING;
    Vue.Native.callNative(WEB_SOCKET_MODULE_NAME, 'close', {
      id: this.webSocketId,
      code,
      reason,
    });
  }

  send(data) {
    if (this.readyState !== READY_STATE_OPEN) {
      warn('WebSocket not connected');
      return;
    }

    if (typeof data === 'string') {
      Vue.Native.callNative(WEB_SOCKET_MODULE_NAME, 'send', {
        id: this.webSocketId,
        data,
      });
      return;
    }

    let buf = data;
    if (ArrayBuffer.isView(data)) {
      buf = data.buffer;
    }
    if (buf instanceof ArrayBuffer) {
      return;
    }

    throw new TypeError('Unknown data type');
  }

  set onopen(callback) {
    this.webSocketCallbacks.onOpen = callback;
  }

  set onclose(callback) {
    this.webSocketCallbacks.onClose = callback;
  }

  set onerror(callback) {
    this.webSocketCallbacks.onError = callback;
  }

  set onmessage(callback) {
    this.webSocketCallbacks.onMessage = callback;
  }

  onWebSocketEvent(param) {
    if (typeof param !== 'object' || param.id !== this.webSocketId) {
      return;
    }

    const eventType = param.type;
    if (typeof eventType !== 'string') {
      return;
    }

    if (eventType === 'onOpen') {
      this.readyState = READY_STATE_OPEN;
    } else if (eventType === 'onClose') {
      this.readyState = READY_STATE_CLOSED;
      app.$off('hippyWebsocketEvents');
    }

    const callback = this.webSocketCallbacks[eventType];
    if (isFunction(callback)) {
      callback(param.data);
    }
  }
}

export default WebSocket;
