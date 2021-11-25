import {
  getApp,
  warn,
  isFunction,
} from '../util';
import Native from './native';

const READY_STATE_CONNECTING = 0;
const READY_STATE_OPEN = 1;
const READY_STATE_CLOSING = 2;
const READY_STATE_CLOSED = 3;

const WEB_SOCKET_MODULE_NAME = 'websocket';
const WEB_SOCKET_NATIVE_EVENT = 'hippyWebsocketEvents';

let websocketEventHub;
let app;

/**
 * The WebSocket API is an advanced technology that makes it possible to open a two-way
 * interactive communication session between the user's browser and a server. With this API,
 * you can send messages to a server and receive event-driven responses without having to
 * poll the server for a reply.
 */
class WebSocket {
  /**
   * Returns a newly created WebSocket object.
   *
   * @param {string} url - The URL to which to connect; this should be the URL to which the
   *                       WebSocket server will respond.
   * @param {string | string[]} [protocols] - Either a single protocol string or an array
   *                                          of protocol strings. These strings are used to
   *                                          indicate sub-protocols, so that a single server
   *                                          can implement multiple WebSocket sub-protocols
   *                                          (for example, you might want one server to be able
   *                                          to handle different types of interactions depending
   *                                          on the specified protocol).
   *                                          If you don't specify a protocol string, an empty
   *                                          string is assumed.
   * @param {Object} extrasHeaders - Http headers will append to connection.
   */
  constructor(url, protocols, extrasHeaders) {
    if (!app) {
      app = getApp();
    }
    this.url = url;
    this.readyState = READY_STATE_CONNECTING;
    this.webSocketCallbacks = {};
    this.onWebSocketEvent = this.onWebSocketEvent.bind(this);
    const headers = {
      ...extrasHeaders,
    };

    if (!websocketEventHub) {
      websocketEventHub = app.$on(WEB_SOCKET_NATIVE_EVENT, this.onWebSocketEvent);
    }

    if (!url || typeof url !== 'string') {
      throw new TypeError('Invalid WebSocket url');
    }

    if (Array.isArray(protocols) && protocols.length > 0) {
      headers['Sec-WebSocket-Protocol'] = protocols.join(',');
    } else if (typeof protocols === 'string') {
      headers['Sec-WebSocket-Protocol'] = protocols;
    }

    const params = {
      headers,
      url,
    };

    Native.callNativeWithPromise(WEB_SOCKET_MODULE_NAME, 'connect', params).then((resp) => {
      if (!resp || resp.code !== 0 || typeof resp.id !== 'number') {
        warn('Fail to create websocket connection', resp);
        return;
      }

      this.webSocketId = resp.id;
    });
  }

  /**
   * Closes the WebSocket connection or connection attempt, if any.
   * If the connection is already CLOSED, this method does nothing.
   *
   * @param {number} [code] - A numeric value indicating the status code explaining
   *                          why the connection is being closed. If this parameter
   *                          is not specified, a default value of 1005 is assumed.
   *                          See the list of status codes of CloseEvent for permitted values.
   * @param {string} [reason] - A human-readable string explaining why the connection
   *                            is closing. This string must be no longer than 123 bytes
   *                            of UTF-8 text (not characters).
   */
  close(code, reason) {
    if (this.readyState !== READY_STATE_OPEN) {
      return;
    }

    this.readyState = READY_STATE_CLOSING;
    Native.callNative(WEB_SOCKET_MODULE_NAME, 'close', {
      id: this.webSocketId,
      code,
      reason,
    });
  }

  /**
   * Enqueues the specified data to be transmitted to the server over the WebSocket connection.
   *
   * @param {string} data - The data to send to the server. Hippy supports string type only.
   */
  send(data) {
    if (this.readyState !== READY_STATE_OPEN) {
      warn('WebSocket is not connected');
      return;
    }

    if (typeof data !== 'string') {
      throw new TypeError(`Unsupported websocket data type: ${typeof data}`);
    }

    Native.callNative(WEB_SOCKET_MODULE_NAME, 'send', {
      id: this.webSocketId,
      data,
    });
  }

  /**
   * Set an EventHandler that is called when the WebSocket connection's readyState changes to OPEN;
   */
  set onopen(callback) {
    this.webSocketCallbacks.onOpen = callback;
  }

  /**
   * Set an EventHandler that is called when the WebSocket connection's readyState
   * changes to CLOSED.
   */
  set onclose(callback) {
    this.webSocketCallbacks.onClose = callback;
  }

  /**
   * Set an EventHandler that is called when a message is received from the server.
   */
  set onerror(callback) {
    this.webSocketCallbacks.onError = callback;
  }

  /**
   * Set an event handler property is a function which gets called when an error
   * occurs on the WebSocket.
   */
  set onmessage(callback) {
    this.webSocketCallbacks.onMessage = callback;
  }

  /**
   * WebSocket events handler from Native.
   *
   * @param {Object} param - Native response.
   */
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
      app.$off(WEB_SOCKET_NATIVE_EVENT);
    }

    const callback = this.webSocketCallbacks[eventType];
    if (isFunction(callback)) {
      callback(param.data);
    }
  }
}

export default WebSocket;
