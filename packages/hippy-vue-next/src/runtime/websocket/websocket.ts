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

import type { NeedToTyped } from '@hippy-shared/index';
import { isFunction } from '@vue/shared';

import type { CallbackType } from '../../../global';
import { warn, getNormalizeEventName } from '../../util';
import { EventBus } from '../event/event-bus';
import { Native } from '../native';

/** 回调事件列表 */
interface EventListeners {
  [eventName: string]: CallbackType[];
}

/**
 * websocket回调方法类型
 *
 * @public
 */
export interface WebsocketCallback {
  onOpen?: CallbackType[];
  onClose?: CallbackType[];
  onError?: CallbackType[];
  onMessage?: CallbackType[];
}

// 定义websocket状态常量
const READY_STATE_CONNECTING = 0;
const READY_STATE_OPEN = 1;
const READY_STATE_CLOSING = 2;
const READY_STATE_CLOSED = 3;

// websocket模块名称和native事件名称
const WEB_SOCKET_MODULE_NAME = 'websocket';
const WEB_SOCKET_NATIVE_EVENT = 'hippyWebsocketEvents';

// 是否已经绑定了 websocket 事件监听器
let isBindWebsocketEvent = false;

/**
 * 判断事件类型是否是合法的 websocket 事件
 *
 * @param type - 事件类型
 */
const isValidEventType = (type: string): boolean => ['open', 'close', 'message', 'error'].indexOf(type) !== -1;

/**
 * The WebSocket API is an advanced technology that makes it possible to open a two-way
 * interactive communication session between the user's browser and a server. With this API,
 * you can send messages to a server and receive event-driven responses without having to
 * poll the server for a reply.
 */
class WebSocket {
  // websocket的状态码
  public readyState: number;

  // websocket回调方法
  public webSocketCallbacks: WebsocketCallback;

  // webSocketId
  public webSocketId = -1;

  // 要访问的websocket链接
  public readonly url: string;

  // 服务器选择的协议
  public readonly protocol: string = '';

  // 事件监听列表
  protected listeners: EventListeners = {};

  /**
   * Returns a newly created WebSocket object.
   *
   * @param url - The URL to which to connect; this should be the URL to which the
   *                       WebSocket server will respond.
   * @param protocols - Either a single protocol string or an array
   *                                          of protocol strings. These strings are used to
   *                                          indicate sub-protocols, so that a single server
   *                                          can implement multiple WebSocket sub-protocols
   *                                          (for example, you might want one server to be able
   *                                          to handle different types of interactions depending
   *                                          on the specified protocol).
   *                                          If you don't specify a protocol string, an empty
   *                                          string is assumed.
   * @param extrasHeaders - Http headers will append to connection.
   */
  constructor(
    url: string,
    protocols?: string | string[],
    extrasHeaders?: { [key: string]: NeedToTyped },
  ) {
    this.url = url;
    this.readyState = READY_STATE_CONNECTING;
    this.webSocketCallbacks = {};
    this.onWebSocketEvent = this.onWebSocketEvent.bind(this);
    const headers = {
      ...extrasHeaders,
    };

    if (!isBindWebsocketEvent) {
      // 总线是全局的，如果是多实例可能会有问题，待验证 fixme
      isBindWebsocketEvent = true;
      EventBus.$on(WEB_SOCKET_NATIVE_EVENT, this.onWebSocketEvent);
    }

    if (!url) {
      throw new TypeError('Invalid WebSocket url');
    }

    if (Array.isArray(protocols) && protocols.length > 0) {
      this.protocol = protocols.join(',');
      headers['Sec-WebSocket-Protocol'] = this.protocol;
    } else if (typeof protocols === 'string') {
      this.protocol = protocols;
      headers['Sec-WebSocket-Protocol'] = this.protocol;
    }

    const params = {
      headers,
      url,
    };

    Native.callNativeWithPromise(
      WEB_SOCKET_MODULE_NAME,
      'connect',
      params,
    ).then((resp) => {
      if (!resp || resp.code !== 0) {
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
   * @param code - A numeric value indicating the status code explaining
   *                          why the connection is being closed. If this parameter
   *                          is not specified, a default value of 1005 is assumed.
   *                          See the list of status codes of CloseEvent for permitted values.
   * @param reason - A human-readable string explaining why the connection
   *                            is closing. This string must be no longer than 123 bytes
   *                            of UTF-8 text (not characters).
   */
  close(code, reason): void {
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
   * @param data - The data to send to the server. Hippy supports string type only.
   */
  send(data): void {
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
    this.addEventListener('open', callback);
  }

  /**
   * Set an EventHandler that is called when the WebSocket connection's readyState
   * changes to CLOSED.
   */
  set onclose(callback) {
    this.addEventListener('close', callback);
  }

  /**
   * Set an EventHandler that is called when a message is received from the server.
   */
  set onerror(callback) {
    this.addEventListener('error', callback);
  }

  /**
   * Set an event handler property is a function which gets called when an error
   * occurs on the WebSocket.
   */
  set onmessage(callback) {
    this.addEventListener('message', callback);
  }

  /**
   * WebSocket events handler from Native.
   *
   * @param param - Native response.
   */
  onWebSocketEvent(param): void {
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
      EventBus.$off(WEB_SOCKET_NATIVE_EVENT, this.onWebSocketEvent);
    }

    const callbacks = this.webSocketCallbacks[eventType];
    if (callbacks?.length) {
      callbacks.forEach((callback) => {
        if (isFunction(callback)) {
          callback(param.data);
        }
      });
    }
  }

  /**
   * 添加 websocket 事件监听器
   *
   * @param type - 事件类型
   * @param listener - 事件回调方法
   */
  addEventListener(type: string, listener: CallbackType): void {
    if (isValidEventType(type)) {
      // 如果监听类型的事件列表没有初始化，则先进行初始化
      if (!this.listeners[type]) {
        this.listeners[type] = [];
      }

      // 添加监听的事件列表
      this.listeners[type].push(listener);

      // 事件 type 本质上就是 close、error、message、open 的别名
      const typeName = getNormalizeEventName(type);
      this.webSocketCallbacks[typeName] = this.listeners[type];
    }
  }
}

// 这里因为需要将hippy的websocket赋值给global，故进行ignore处理
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.WebSocket = WebSocket;
