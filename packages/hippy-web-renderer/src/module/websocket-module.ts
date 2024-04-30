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

import { HippyWebModule } from '../base';
import { HippyCallBack } from '../types';
import { error } from '../common';
const enum EventType {
  ON_OPEN='onOpen',
  ON_CLOSE='onClose',
  ON_ERROR='onError',
  ON_MESSAGE='onMessage',
}
export class WebSocketModule extends HippyWebModule {
  public name = 'websocket';
  private webSocketConnections: {[key: string]: WebsocketObject} = {};
  private connections = 0;

  public connect(data: {url?: string, headers?: {[key: string]: any} }, callBack: HippyCallBack) {
    const response = {
      code: -1,
      reason: '',
    };
    if (!data) {
      response.reason = 'invalid connect param';
      callBack.resolve(response);
      return;
    }
    if (!data.url) {
      response.reason = 'no valid url for websocket';
      callBack.resolve(response);
      return;
    }
    let protocols = [];
    if (data.headers?.['Sec-WebSocket-Protocol']) {
      protocols =  data?.headers['Sec-WebSocket-Protocol'].split(',');
    }
    this.connections += 1;
    const id = this.connections;
    this.webSocketConnections[id] = new WebsocketObject(id, data.url, protocols);
    this.webSocketConnections[id].connect(this.dispatchEvent.bind(this));
    callBack.resolve({ code: 0, id });
  }

  public send(data: {id: string, data: any}) {
    if (!data || !data.id) {
      error('hippy', 'send: ERROR: request is null or no socket id specified');
      return;
    }
    if (!this.webSocketConnections[data.id] || !this.webSocketConnections[data.id].disconnected) {
      error('hippy', 'send: ERROR: no socket id specified or disconnected');
      return;
    }
    if (!data.data || typeof  data.data !== 'string') {
      error('hippy', 'send: ERROR: no data specified to be sent or data type error');
    }
    this.webSocketConnections[data.id]!.send(data.data);
  }

  public close(data: { id: string, code: number, reason: string}) {
    if (!data || !data.id) {
      error('hippy', 'close: ERROR: request is null');
      return;
    }
    if (!this.webSocketConnections[data.id] || this.webSocketConnections[data.id].disconnected) {
      error('hippy', 'close: ERROR: no socket id specified, or not found, or not connected yet');
      return;
    }
    this.webSocketConnections[data.id].close(data.code, data.reason);
  }

  public dispatchEvent(id: number, eventType: EventType, data: any) {
    this.context.sendEvent('hippyWebsocketEvents', { ...data, id, type: eventType });
  }

  public initialize() {

  }

  public destroy() {

  }
}

const enum WebSocketReadyState {
  CONNECTING,
  OPEN,
  CLOSING,
  CLOSED,
}

class WebsocketObject {
  private id!: number;
  private connection?: WebSocket;
  private state?: WebSocketReadyState;
  private dispatchEvent?: (id: number, eventType: EventType, data?: {[key: string]: any}) => void;
  private protocols: string|string[]|undefined;
  private url: string;
  public constructor(id: number, url: string, protocols: string|string[]|undefined) {
    this.id = id;
    this.protocols = protocols;
    this.url = url;
    this.handleSocketOpen = this.handleSocketOpen.bind(this);
    this.handleSocketMessage = this.handleSocketMessage.bind(this);
    this.handleSocketClose = this.handleSocketClose.bind(this);
    this.handleSocketError = this.handleSocketError.bind(this);
  }

  public get disconnected() {
    return this.state !== WebSocketReadyState.OPEN;
  }

  public connect(dispatchEvent: (id: number, eventType: EventType, data: any) => void) {
    if (!this.connection) {
      this.connection = new window.__WebSocket(this.url, this.protocols ?? []);
    }
    this.dispatchEvent = dispatchEvent;
    this.state = WebSocketReadyState.CONNECTING;
    this.connection!.addEventListener('open', this.handleSocketOpen);
    this.connection!.addEventListener('message', this.handleSocketMessage);
    this.connection!.addEventListener('close', this.handleSocketClose);
    this.connection!.addEventListener('error', this.handleSocketError);
  }

  public handleSocketOpen() {
    this.state = WebSocketReadyState.OPEN;
    this.dispatchEvent!(this.id, EventType.ON_OPEN);
  }

  public handleSocketClose() {
    this.state = WebSocketReadyState.CLOSED;
    this.dispatchEvent!(this.id, EventType.ON_CLOSE);
  }

  public handleSocketMessage(event: any) {
    this.dispatchEvent!(this.id, EventType.ON_MESSAGE, { data: event });
  }

  public handleSocketError(event: any) {
    this.dispatchEvent!(this.id, EventType.ON_ERROR, { reason: event.toString() });
  }

  public send(data: string) {
    this.connection?.send(data);
  }

  public close(code?: number, reason?: string) {
    this.connection?.close(code, reason);
    this.state = WebSocketReadyState.CLOSING;
    this.destroy();
  }

  public destroy() {
    this.connection?.removeEventListener('open', this.handleSocketOpen);
    this.connection?.removeEventListener('message', this.handleSocketMessage);
    this.connection?.removeEventListener('close', this.handleSocketClose);
    this.connection?.removeEventListener('error', this.handleSocketError);
  }
}
