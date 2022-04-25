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

import log from '@chrome-devtools-extensions/utils/log';
import { sendToParent, CMD } from '@chrome-devtools-extensions/utils/post-message';
import { getUrlParam } from '@chrome-devtools-extensions/utils/url';

export class Channel {
  private ws: WebSocket;
  private msgBuffer: Channel.RequestData[] = [];
  private requestPromiseMap: Map<string | number, any> = new Map();
  private eventListenerMap: Map<string | RegExp, Channel.EventListener[]> = new Map();

  private get isReady() {
    return this.ws.readyState === WebSocket.OPEN;
  }

  constructor(extensionName: string) {
    const url = new URL(window.parent.location.href);
    const wsParam = url.searchParams.get('ws');
    const wssParam = url.searchParams.get('wss');
    const newUrl = new URL(wsParam ? `ws://${wsParam}` : `wss://${wssParam}`);
    newUrl.searchParams.set('extensionName', `${extensionName}`);
    newUrl.searchParams.set('hash', getUrlParam('hash'));
    const wsUrl = newUrl.toString();
    log.info(wsUrl);

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      log.info('ws connected!');
      this.msgBuffer.forEach((msg) => {
        this.ws.send(JSON.stringify(msg));
      });
      this.msgBuffer = [];
    };

    this.ws.onmessage = (event) => {
      const res = JSON.parse(event.data) as Adapter.CDP.Res;
      // event type message
      if (!('id' in res)) {
        const eventRes = res as Adapter.CDP.EventRes;
        const listeners = this.getListeners(eventRes.method);
        listeners.forEach((listener) => {
          listener(eventRes);
        });
        return;
      }
      // command type message
      const { id } = res;
      const requestPromise = this.requestPromiseMap.get(id);
      if (requestPromise) {
        if ('error' in res) {
          requestPromise.reject(res);
        } else {
          requestPromise.resolve(res);
        }
        this.requestPromiseMap.delete(id);
      }
      (globalThis as any).showLog && console.log('receive', res.id, res.method, Date.now());
    };

    this.ws.onclose = () => {
      const e = new Error('ws closed');
      log.error(e);
      for (const requestPromise of this.requestPromiseMap.values()) {
        requestPromise.reject(e);
      }
    };
  }

  public send<T>(msg: Channel.RequestData): Promise<Adapter.CDP.CommandRes<T>> {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    return new Promise((resolve, reject) =>
      sendToParent(CMD.getRequestId).then((id) => {
        msg.id = id as number;
        if (this.isReady) {
          this.requestPromiseMap.set(msg.id, { resolve, reject });
          return this.ws.send(JSON.stringify(msg));
        }
        this.msgBuffer.push(msg);
      }),
    );
  }

  public addEventListener(method: string | RegExp, listener: Channel.EventListener) {
    if (!this.eventListenerMap.has(method)) this.eventListenerMap.set(method, []);
    this.eventListenerMap.get(method)?.push(listener);
  }

  public removeEventListener(method: string | RegExp, listener: Channel.EventListener) {
    const listeners = this.eventListenerMap.get(method) || [];
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  private getListeners(method: string): Channel.EventListener[] {
    let listeners: Channel.EventListener[] = [];
    for (const [key, value] of this.eventListenerMap.entries()) {
      if ((typeof key === 'string' && key === method) || (key instanceof RegExp && key.test(method))) {
        listeners = listeners.concat(value);
      }
    }
    return listeners;
  }
}
