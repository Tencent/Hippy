const READY_STATE_CONNECTING = 0;
const READY_STATE_OPEN = 1;
const READY_STATE_CLOSING = 2;
const READY_STATE_CLOSED = 3;

const WEB_SOCKET_MODULE_NAME = 'websocket';

let websocketEventHub;

class WebSocket {
  constructor(url, protocals, extrasHeaders) {
    if (!websocketEventHub) {
      websocketEventHub = new Event.Listener('hippyWebsocketEvents');
    }
    this._readyState = READY_STATE_CONNECTING;
    this._webSocketCallbacks = {};

    if (typeof url !== 'string' || url.length === 0) {
      throw new TypeError('Invalid url');
    }

    let connectHeaders = {};

    if (typeof protocals !== 'undefined') {
      if (Array.isArray(protocals) && protocals.length > 0) {
        connectHeaders['Sec-WebSocket-Protocol'] = protocals.join(',');
      } else if (typeof protocals === 'string') {
        connectHeaders['Sec-WebSocket-Protocol'] = protocals;
      }
    }

    if (typeof extrasHeaders === 'object') {
      connectHeaders = Object.assign(connectHeaders, extrasHeaders);
    }

    const params = {
      headers: connectHeaders,
      url,
    };

    this._url = url;
    this._webSocketCallbackId = websocketEventHub.addCallback(this._onWebSocketEvent.bind(this));

    Hippy.bridge.callNativeWithPromise(WEB_SOCKET_MODULE_NAME, 'connect', params).then((resp) => {
      if (!resp || resp.code !== 0 || typeof resp.id !== 'number') {
        console.error(`Fail to create websocket connection, reason: ${(resp ? resp.reason : 'unknown error')}`); // eslint-disable-line
        return;
      }

      this._webSocketId = resp.id;
    });
  }

  close(code, reason) {
    if (this._readyState !== READY_STATE_OPEN) {
      return;
    }

    this._readyState = READY_STATE_CLOSING;
    Hippy.bridge.callNative(WEB_SOCKET_MODULE_NAME, 'close', {
      id: this._webSocketId,
      code,
      reason,
    });
  }

  send(data) {
    if (this._readyState !== READY_STATE_OPEN) {
      console.error('WebSocket not connected'); // eslint-disable-line
      return;
    }

    if (typeof data === 'string') {
      Hippy.bridge.callNative(WEB_SOCKET_MODULE_NAME, 'send', {
        id: this._webSocketId,
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

  get readyState() {
    return this._readyState;
  }

  get url() {
    return this._url;
  }

  set onopen(callback) {
    this._webSocketCallbacks.onOpen = callback;
  }

  set onclose(callback) {
    this._webSocketCallbacks.onClose = callback;
  }

  set onerror(callback) {
    this._webSocketCallbacks.onError = callback;
  }

  set onmessage(callback) {
    this._webSocketCallbacks.onMessage = callback;
  }

  _onWebSocketEvent(param) {
    if (typeof param !== 'object' || param.id !== this._webSocketId) {
      return;
    }

    const eventType = param.type;
    if (typeof eventType !== 'string') {
      return;
    }

    if (eventType === 'onOpen') {
      this._readyState = READY_STATE_OPEN;
    } else if (eventType === 'onClose') {
      this._readyState = READY_STATE_CLOSED;
      websocketEventHub.removeCallback(this._webSocketCallbackId);
    }

    const callback = this._webSocketCallbacks[eventType];
    if (typeof callback === 'function') {
      callback(param.data);
    }
  }
}

global.WebSocket = WebSocket;
