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
import { TdfEvent } from '@hippy/devtools-protocol/dist/types/enum-tdf-mapping';
import { WinstonColor, ReportEvent, ClientRole, InternalChannelEvent } from '@debug-server-next/@types/enum';
import { JSRuntimeWsUrlParams, DevtoolsWsUrlParams } from '@debug-server-next/utils/url';
import { Logger } from '@debug-server-next/utils/log';
import { createVueDevtoolsChannel, createInternalChannel } from '@debug-server-next/utils/pub-sub-channel';
import { getDBOperator } from '@debug-server-next/db';
import { aegis } from '@debug-server-next/utils/aegis';
import { publishRes } from '@debug-server-next/utils/reload-adapter';
import { DebugTargetManager } from '@debug-server-next/controller/debug-targets';

const log = new Logger('vue-devtools', WinstonColor.Yellow);

/**
 * Pub/Sub vue devtools msg
 */
export const onVueClientConnection = async (ws: WebSocket, wsUrlParams: JSRuntimeWsUrlParams | DevtoolsWsUrlParams) => {
  const { contextName, clientRole, clientId } = wsUrlParams;
  log.verbose('%s connected, clientId: %s', clientRole, clientId);
  const { Subscriber, Publisher } = getDBOperator();
  aegis.reportEvent({
    name: ReportEvent.VueDevtools,
    ext1: clientId,
    ext2: contextName,
  });

  let internalHandler;
  let internalSubscriber;
  if (clientRole === ClientRole.JSRuntime) {
    const internalChannelId = createInternalChannel(clientId, '');
    internalSubscriber = new Subscriber(internalChannelId);
    internalHandler = (msg) => {
      if (msg === InternalChannelEvent.DevtoolsConnected) {
        // pub enable after devtools connected
        pubEnableVueDevtools();
      }
    };
    internalSubscriber.subscribe(internalHandler);
    // pub enable immediately, support for reload scene
    pubEnableVueDevtools();

    async function pubEnableVueDevtools() {
      const debugTarget = await DebugTargetManager.findDebugTarget(clientId, undefined, true);
      publishRes(clientId, {
        method: TdfEvent.TDFRuntimeEnableVueDevtools,
        params: {
          contextName: debugTarget?.title,
        },
      });
    }
  }

  const channel = createVueDevtoolsChannel(clientId);
  const publisher = new Publisher(channel);
  const subscriber = new Subscriber(channel);
  const handler = (msg) => {
    log.debug('receive %s message: %s', clientRole, msg);
    ws.send(msg.toString());
  };
  subscriber.subscribe(handler);

  if (clientRole === ClientRole.JSRuntime) publisher.publish(JSON.stringify([VueDevtoolsEvent.BackendDisconnect]));

  ws.on('message', async (msg) => {
    const msgStr = msg.toString();
    if (msgStr) publisher.publish(msgStr);
  });

  ws.on('close', (code, reason) => {
    log.warn('%s ws closed, code: %s, reason: %s', clientRole, code, reason);
    subscriber.unsubscribe(handler);
    subscriber.disconnect();
    if (reason.indexOf('client') !== -1) {
      publisher.publish(JSON.stringify([VueDevtoolsEvent.DevtoolsDisconnect]));
    }
    if (clientRole === ClientRole.JSRuntime) {
      internalSubscriber.unsubscribe(internalHandler);
      internalSubscriber.disconnect();
    }
  });
  ws.on('error', (e) => log.error('JSRuntime ws error: %s', e.stack || e));
};

export const enum VueDevtoolsEvent {
  BackendDisconnect = 'vue-devtools-disconnect-backend',
  DevtoolsDisconnect = 'vue-devtools-disconnect-devtools',
}
