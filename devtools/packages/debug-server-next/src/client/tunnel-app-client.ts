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

import { Logger } from '@debug-server-next/utils/log';
import { AppClient } from './app-client';

const log = new Logger('app-client:tunnel');

/**
 * Communicate with app by TCP, implement by Tunnel.node
 */
export class TunnelAppClient extends AppClient {
  private requestPromiseMap: Adapter.RequestPromiseMap = new Map();

  public constructor(id, option) {
    super(id, option);
    if (typeof global.addon?.sendMsg === 'undefined') {
      throw new Error('tunnel does not imported.');
    }
    this.registerMessageListener();
  }

  protected async registerMessageListener() {
    const { tunnelEmitter, TUNNEL_EVENT } = await import('../child-process/index');
    // TODO tunnel doesn't support multiple debug instance, so remove last listeners
    tunnelEmitter.removeAllListeners(TUNNEL_EVENT);
    tunnelEmitter.on(TUNNEL_EVENT, async (data) => {
      let msgObject: Adapter.CDP.Res;
      try {
        msgObject = JSON.parse(data);
      } catch (e) {
        return log.error('parse tunnel response json failed. error: %s, \n msg: %j', (e as Error)?.stack, data);
      }
      if ('id' in msgObject) {
        const requestPromise = this.requestPromiseMap.get(msgObject.id);
        if (requestPromise) requestPromise.resolve(msgObject);
      }
      const res = await this.downwardMessageHandler(msgObject);
      if (!('id' in msgObject)) return;
      const requestPromise = this.requestPromiseMap.get(msgObject.id);
      if (requestPromise) {
        requestPromise.resolve(res);
      }
    });
  }

  protected sendHandler(msg: Adapter.CDP.Req): Promise<Adapter.CDP.Res> {
    return new Promise((resolve, reject) => {
      if (msg.id) {
        this.requestPromiseMap.set(msg.id, { resolve, reject });
      }
      global.addon.sendMsg(JSON.stringify(msg));
    });
  }
}
