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

import { Server as HTTPServer, IncomingMessage } from 'http';
import { Socket } from 'net';
import { Server as WSServer } from 'ws';
import { ClientRole, WinstonColor, WSCode } from '@debug-server-next/@types/enum';
import { DebugTargetManager } from '@debug-server-next/controller/debug-targets';
import { cleanAllDebugTargets } from '@debug-server-next/controller/pub-sub-manager';
import { onDevtoolsConnection, onAppConnection } from '@debug-server-next/controller/chrome-devtools';
import { Logger } from '@debug-server-next/utils/log';
import {
  parseWsUrl,
  getWsInvalidReason,
  AppWsUrlParams,
  DevtoolsWsUrlParams,
  HMRWsParams,
  JSRuntimeWsUrlParams,
} from '@debug-server-next/utils/url';
import { config } from '@debug-server-next/config';
import { onHMRClientConnection, onHMRServerConnection } from '@debug-server-next/controller/hmr';
import { MyWebSocket } from '@debug-server-next/@types/socker-server';
import { onVueClientConnection } from '@debug-server-next/controller/vue-devtools';

const heartbeatInterval = 30000;

const log = new Logger('socket-server', WinstonColor.Cyan);

/**
 * Debug WebSocket server, support deploy in multiple node server, use Redis Pub/Sub broadcast message
 */
export class SocketServer {
  private wss: WSServer;
  private server: HTTPServer | undefined;
  private interval;

  public constructor(server: HTTPServer) {
    this.server = server;
  }

  public start() {
    const wss = new WSServer({
      noServer: true,
      path: config.wsPath,
    });
    this.wss = wss;
    this.server.on('upgrade', this.onUpgrade.bind(this));
    wss.on('connection', this.onConnection.bind(this));

    wss.on('error', (e: Error) => {
      log.error('wss error: %s', (e as Error)?.stack);
    });
    wss.on('upgrade', (response: IncomingMessage) => {
      log.info('wss upgrade: %j', response);
    });
    wss.on('close', () => {
      clearInterval(this.interval);
    });

    this.interval = setInterval(() => {
      (this.wss.clients as Set<MyWebSocket>).forEach((client) => {
        if (client.isAlive === false) {
          client.terminate();
          return;
        }

        client.isAlive = false;
        client.ping(() => {});
      });
    }, heartbeatInterval);
  }

  public async close() {
    await cleanAllDebugTargets();
    this.wss.close(() => {
      log.warn('wss closed.');
    });
  }

  private onUpgrade(req: IncomingMessage, socket: Socket, head: Buffer) {
    log.verbose('onUpgrade, ws url: %s', req.url);
    const wsUrlParams = parseWsUrl(req.url);
    const reason = getWsInvalidReason(wsUrlParams);
    if (reason) {
      log.warn('onUpgrade error: %s', reason);
      return socket.destroy();
    }

    this.wss.handleUpgrade(req, socket, head, (ws) => {
      this.wss.emit('connection', ws, req);
    });
  }

  /**
   * ⚠️: don't do async operation before subscribe, otherwise will miss message
   */
  private async onConnection(ws: MyWebSocket, req: IncomingMessage) {
    const wsUrlParams = parseWsUrl(req.url);
    const host = ((req.headers.host || req.headers.Host) as string) || '';
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    const { clientRole } = wsUrlParams;
    if ([ClientRole.JSRuntime, ClientRole.VueDevtools].includes(clientRole)) {
      onVueClientConnection(ws, wsUrlParams as JSRuntimeWsUrlParams | DevtoolsWsUrlParams);
      return;
    }
    if (clientRole === ClientRole.HMRClient) {
      onHMRClientConnection(ws, wsUrlParams as HMRWsParams);
    } else if (clientRole === ClientRole.HMRServer) {
      onHMRServerConnection(ws, wsUrlParams as HMRWsParams);
    } else if (clientRole === ClientRole.Devtools) {
      onDevtoolsConnection(ws, wsUrlParams as DevtoolsWsUrlParams);
    } else {
      onAppConnection(ws, wsUrlParams as AppWsUrlParams, host);
    }

    if (clientRole === ClientRole.Devtools) {
      const params = wsUrlParams as DevtoolsWsUrlParams;
      const exist = await this.checkDebugTargetExist(params);
      if (!exist) {
        const reason = `debugTarget not exist! ${params.clientId}`;
        log.warn(reason);
        ws.close(WSCode.NoDebugTarget, reason);
      }
    }
  }

  private async checkDebugTargetExist(wsUrlParams: DevtoolsWsUrlParams): Promise<boolean> {
    const { clientId, hash } = wsUrlParams;
    const debugTarget = await DebugTargetManager.findDebugTarget(clientId, hash);
    log.verbose('checkDebugTargetExist debug target: %j', debugTarget);
    return Boolean(debugTarget);
  }
}
