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

import { warn } from '../utils';

const enum WebSocketReadyState {
  CONNECTING,
  OPEN,
  CLOSING,
  CLOSED,
}

class WebSocketWeb implements HippyTypes.WebSocket {
  public protocol = '';
  public url: string;
  public webSocketIns: WebSocket;
  public readyState: number;
  public onopen: ((...args: any[]) => void | undefined) | undefined;
  public onmessage: ((...args: any[]) => void | undefined) | undefined;
  public onclose: ((...args: any[]) => void | undefined) | undefined;
  public onerror: ((...args: any[]) => void | undefined) | undefined;


  public constructor(url: any, protocols: string[] | string) {
    this.readyState = WebSocketReadyState.CONNECTING;
    if (!url || typeof url !== 'string') {
      throw new TypeError('Invalid WebSocket url');
    }
    this.url = url;
    this.webSocketIns = new WebSocket(url, protocols);
    this.webSocketIns.addEventListener('open', (event) => {
      this.readyState = WebSocketReadyState.OPEN;
      if (this.onopen) {
        this.onopen(event);
      }
    });
    this.webSocketIns.addEventListener('message', (event) => {
      if (this.onmessage) {
        this.onmessage(event);
      }
    });
    this.webSocketIns.addEventListener('close', (event) => {
      this.readyState = WebSocketReadyState.CLOSED;
      if (this.onclose) {
        this.onclose(event);
      }
    });
    this.webSocketIns.addEventListener('error', (event) => {
      if (this.onerror) {
        this.onerror(event);
      }
    });
  }
  public close(code: number, reason: string) {
    if (this.readyState !== WebSocketReadyState.OPEN) {
      warn('WebSocket is not connected');
      return;
    }
    this.readyState = WebSocketReadyState.CLOSING;
    this.webSocketIns.close(code, reason);
  }
  public send(data: string | undefined) {
    if (this.readyState !== WebSocketReadyState.OPEN) {
      warn('WebSocket is not connected');
      return;
    }
    if (typeof data !== 'string') {
      throw new TypeError(`Unsupported websocket data type: ${typeof data}`);
    }
    this.webSocketIns.send(data);
  }
}

export default WebSocketWeb;
