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

import WebSocket from 'ws';
import { AppClientEvent, WinstonColor, WSCode } from '@debug-server-next/@types/enum';
import { Logger } from '@debug-server-next/utils/log';
import { AppClient } from './app-client';

const log = new Logger('app-client:IWDP', WinstonColor.BrightBlue);

/**
 * Communicate with app by IWDP
 */
export class IWDPAppClient extends AppClient {
  public url: string;
  private ws: WebSocket;
  private requestPromiseMap: Adapter.RequestPromiseMap = new Map();
  private isConnecting = false;
  private pingTimer;
  private msgBuffer: Array<{
    msg: Adapter.CDP.Req;
    resolve: Adapter.Resolve;
    reject: Adapter.Reject;
  }> = [];

  public constructor(id, option) {
    super(id, option);
    this.url = option.iWDPWsUrl;
    if (!this.url) {
      const e = new Error(
        'IWDPAppClient constructor option need iWDPWsUrl, if you are debug iOS without USB, please ignore this error.',
      );
      throw e;
    }
    this.connect();
  }

  public destroy() {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.close(WSCode.AppClientDestroyed, 'IWDPAppClient is destroyed');
  }

  protected registerMessageListener() {
    if (!this.ws) return;
    this.ws.on('message', async (msg: string) => {
      let msgObj: Adapter.CDP.Res;
      try {
        msgObj = JSON.parse(msg);
        const res = await this.downwardMessageHandler(msgObj);
        if (!('id' in msgObj)) return;
        const requestPromise = this.requestPromiseMap.get(msgObj.id);
        if (requestPromise) {
          requestPromise.resolve(res);
        }
      } catch (e) {
        log.error(`IWDPAppClient parse json error: ${msg}`);
      }
    });

    this.ws.on('open', () => {
      this.isConnecting = false;
      this.startPing();
      log.info(`IWDPAppClient ws opened: ${this.url}`);
      for (const { msg, resolve, reject } of this.msgBuffer) {
        const msgStr = JSON.stringify(msg);
        this.ws.send(msgStr);
        this.requestPromiseMap.set(msg.id, { resolve, reject });
      }
      this.msgBuffer = [];
    });

    this.ws.on('close', () => {
      this.stopPing();
      this.isConnecting = false;
      this.isClosed = true;
      this.emit(AppClientEvent.Close);
      log.warn('IWDPAppClient ws close!');
    });

    this.ws.on('error', (e) => {
      this.stopPing();
      this.isConnecting = false;
      log.error('IWDPAppClient ws error: %s', e?.stack);
    });
  }

  protected sendHandler(msg: Adapter.CDP.Req): Promise<Adapter.CDP.Res> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        const msgStr = JSON.stringify(msg);
        this.ws.send(msgStr);
        this.requestPromiseMap.set(msg.id, { resolve, reject });
      } else {
        if (!this.isConnecting) {
          this.connect();
          this.isConnecting = true;
        }
        this.msgBuffer.push({
          msg,
          resolve,
          reject,
        });
      }
    });
  }

  /**
   * connect to IWDP server
   */
  private connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) return;

    try {
      this.ws = new WebSocket(this.url);
      this.registerMessageListener();
    } catch (e) {
      log.error('IWDP connect error: %s', (e as Error)?.stack);
      throw e;
    }
  }

  private startPing() {
    this.pingTimer = setInterval(() => {
      this.ws.ping('ping');
    }, 1000);
  }

  private stopPing() {
    this.pingTimer && clearInterval(this.pingTimer);
  }
}
