import HippyEventListener  from '../events/listener';
import { Bridge } from '../global';
import { warn } from '../utils';

const enum READY_STATE {
  CONNECTING,
  OPEN,
  CLOSING,
  CLOSED,
}

interface WebSocket {
  /**
   * Read-only property returns the absolute URL of the WebSocket as resolved by the constructor.
   */
  url: string;

  /**
   * read-only property returns the name of the sub-protocol the server selected; this will be
   * one of the stringsspecified in the protocols parameter when creating the WebSocket object,
   * or the empty string if no connection is established.
   */
  protocol: string;

  /**
   * Read-only property returns the current state of the WebSocket connection.
   */
  readyState: READY_STATE;
  webSocketCallbacks: {
    onOpen?: Function;
    onClose?: Function;
    onError?: Function;
    onMessage?: Function;
  }
  webSocketCallbackId: number;
  webSocketId?: number;
}

const WEB_SOCKET_MODULE_NAME = 'websocket';
let websocketEventHub: HippyEventListener;

/**
 * The WebSocket API is an advanced technology that makes it possible to open a two-way
 * interactive communication session between the user's browser and a server. With this API,
 * you can send messages to a server and receive event-driven responses without having to
 * poll the server for a reply.
 */
class WebSocket implements WebSocket {
  protocol = '';

  /**
   * Returns a newly created WebSocket object.
   *
   * @param {string} url - The URL to which to connect; this should be the URL to which the
   *                       WebSocket server will respond.
   * @param {string | string[]} [protocals] - Either a single protocol string or an array
   *                                          of protocol strings. These strings are used to
   *                                          indicate sub-protocols, so that a single server
   *                                          can implement multiple WebSocket sub-protocols
   *                                          (for example, you might want one server to be able
   *                                          to handle different types of interactions depending
   *                                          on the specified protocol).
   *                                          If you don't specify a protocol string, an empty
   *                                          string is assumed.
   * @param {Object} headers - Http headers will append to connection.
   */
  constructor(url: string, protocals: string[] | string, extrasHeaders: {[key: string]: string}) {
    this.onWebSocketEvent = this.onWebSocketEvent.bind(this);

    if (!websocketEventHub) {
      websocketEventHub = new HippyEventListener('hippyWebsocketEvents');
    }
    this.readyState = READY_STATE.CONNECTING;
    this.webSocketCallbacks = {};

    if (!url || typeof url !== 'string') {
      throw new TypeError('Invalid WebSocket url');
    }

    const headers: {
      [key: string]: string;
    } = {
      ...extrasHeaders,
    };

    if (protocals !== undefined) {
      if (Array.isArray(protocals) && protocals.length > 0) {
        headers['Sec-WebSocket-Protocol'] = protocals.join(',');
      } else if (typeof protocals === 'string') {
        headers['Sec-WebSocket-Protocol'] = protocals;
      } else {
        throw new TypeError('Invalid WebSocket protocals');
      }
    }

    const params = {
      headers,
      url,
    };

    this.url = url;
    this.webSocketCallbackId = websocketEventHub.addCallback(this.onWebSocketEvent);

    Bridge.callNativeWithPromise(WEB_SOCKET_MODULE_NAME, 'connect', params)
      .then((resp: { code: number, id: number }) => {
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
  public close(code: number, reason: string) {
    if (this.readyState !== READY_STATE.OPEN) {
      warn('WebSocket is not connected');
      return;
    }

    this.readyState = READY_STATE.CLOSING;
    Bridge.callNative(WEB_SOCKET_MODULE_NAME, 'close', {
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
  public send(data: string) {
    if (this.readyState !== READY_STATE.OPEN) {
      warn('WebSocket is not connected');
      return;
    }

    if (typeof data !== 'string') {
      throw new TypeError(`Unsupported websocket data type: ${typeof data}`);
    }

    Bridge.callNative(WEB_SOCKET_MODULE_NAME, 'send', {
      id: this.webSocketId,
      data,
    });
  }

  /**
   * Set an EventHandler that is called when the WebSocket connection's readyState changes to OPEN;
   */
  public set onopen(callback: () => void) {
    this.webSocketCallbacks.onOpen = callback;
  }

  /**
   * Set an EventHandler that is called when the WebSocket connection's readyState
   * changes to CLOSED.
   */
  public set onclose(callback: () => void) {
    this.webSocketCallbacks.onClose = callback;
  }

  /**
   * Set an EventHandler that is called when a message is received from the server.
   */
  public set onerror(callback: Function) {
    this.webSocketCallbacks.onError = callback;
  }

  /**
   * Set an event handler property is a function which gets called when an error
   * occurs on the WebSocket.
   */
  public set onmessage(callback: (data: any) => void) {
    this.webSocketCallbacks.onMessage = callback;
  }

  /**
   * WebSocket events handler from Native.
   *
   * @param {Object} param - Native response.
   */
  private onWebSocketEvent<T>(param: {
    id: number;
    type: 'onOpen' | 'onClose';
    data: T;
  }) {
    if (typeof param !== 'object' || param.id !== this.webSocketId) {
      return;
    }

    const { type: eventType } = param;
    if (eventType === 'onOpen') {
      this.readyState = READY_STATE.OPEN;
    } else if (eventType === 'onClose') {
      this.readyState = READY_STATE.CLOSED;
      websocketEventHub.removeCallback(this.webSocketCallbackId);
    }

    const callback = this.webSocketCallbacks[eventType];
    if (typeof callback === 'function') {
      callback(param.data);
    }
  }
}

export default WebSocket;
