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
import { AppClientEvent, WSCode } from '@debug-server-next/@types/enum';
import { Logger } from '@debug-server-next/utils/log';
import { AppClient } from './app-client';

const log = new Logger('app-client:ws');

/**
 * Communicate with app by WebSocket
 */
export class WSAppClient extends AppClient {
  private ws: WebSocket;
  private requestPromiseMap: Adapter.RequestPromiseMap = new Map();

  public constructor(id, option) {
    super(id, option);
    this.ws = option.ws;
    if (!this.ws) {
      const e = new Error('WSAppClient constructor option need ws');
      throw e;
    }
    this.registerMessageListener();
  }

  public destroy() {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.close(WSCode.AppClientDestroyed, 'WSAppClient is destroyed');
  }

  protected registerMessageListener() {
    this.ws.on('message', async (msg: string) => {
      let msgObj: Adapter.CDP.Res;
      try {
        msgObj = JSON.parse(msg);
      } catch (e) {
        log.error(`parse WSAppClient json message error: ${msg}`);
      }

      const res = await this.downwardMessageHandler(msgObj);
      if (!('id' in msgObj)) return;
      const requestPromise = this.requestPromiseMap.get(msgObj.id);
      if (requestPromise) requestPromise.resolve(res);
    });

    this.ws.on('close', () => {
      this.isClosed = true;
      log.warn(`${this.id} WSAppClient closed.`);
      this.emit(AppClientEvent.Close);
    });
  }

  protected sendHandler(msg: Adapter.CDP.Req): Promise<Adapter.CDP.Res> {
    if (this.ws.readyState !== WebSocket.OPEN) return;
    return new Promise((resolve, reject) => {
      const msgStr = JSON.stringify(msg);
      this.ws.send(msgStr);
      this.requestPromiseMap.set(msg.id, { resolve, reject });
    });
  }
}
