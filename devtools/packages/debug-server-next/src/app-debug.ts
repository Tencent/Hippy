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

import fs from 'fs';
import { Server as HTTPServer } from 'http';
import Koa from 'koa';
import colors from 'colors/safe';
import { initAppClient } from '@debug-server-next/client';
import { SocketServer } from '@debug-server-next/socket-server';
import { Logger } from '@debug-server-next/utils/log';
import { initDbModel } from '@debug-server-next/db';
import { routeApp } from '@debug-server-next/router';
import { config } from '@debug-server-next/config';
import { WinstonColor, DevtoolsEnv, DebugTunnel } from '@debug-server-next/@types/enum';
import { getHomeUrl } from '@debug-server-next/utils/url';
import { checkPort } from '@debug-server-next/utils/port';
import { rmFolder } from '@debug-server-next/utils/file';

const log = new Logger('debug-server', WinstonColor.Yellow);
let server: HTTPServer;
let socketServer: SocketServer;

export const startDebugServer = async () => {
  log.info('start server argv: %j', global.debugAppArgv);
  await init();

  const { host, port, env } = global.debugAppArgv;
  if (env === DevtoolsEnv.Hippy) showHippyGuide();
  const app = new Koa();
  routeApp(app);

  server = app.listen(port, host, async () => {
    if (!config.isCluster) {
      const { startTunnel, startChrome } = await import('./child-process/index');
      await startTunnel();
      startChrome();

      const { startAdbProxy } = await import('./child-process/adb');
      startAdbProxy();
    }

    socketServer = new SocketServer(server);
    socketServer.start();
  });

  server.on('close', () => {
    log.warn('debug server is closed.');
  });

  server.on('error', (e) => {
    log.error('launch debug server failed: %j', e);
  });
};

export const stopServer = async (exitProcess = false, ...arg) => {
  try {
    log.info('stopServer %j', arg);
    if (socketServer) {
      await socketServer.close();
      socketServer = null;
    }
    if (server) {
      server.close();
      server = null;
    }
    if (exitProcess) process.exit(0);
  } catch (e) {
    log.error('stopServer error, %s', (e as Error)?.stack);
  }
};

/**
 * init DB, directory, Tunnel.node, AppClient
 */
const init = async () => {
  normalizeArgv();
  await checkPort();
  const { cachePath, hmrStaticPath } = config;

  // clean all unused file
  rmFolder(cachePath);
  rmFolder(hmrStaticPath);

  if (!config.isCluster) {
    const { importTunnel } = await import('@debug-server-next/child-process/import-addon');
    await importTunnel();
  }
  await fs.promises.mkdir(cachePath, { recursive: true });
  await fs.promises.mkdir(hmrStaticPath, { recursive: true });
  initDbModel();
  initAppClient();
};

const showHippyGuide = () => {
  log.info(
    colors.bold[WinstonColor.Green](`hippy debug steps:
1. start debug server by run 'npm run hippy:debug'
2. start dev server by run 'npm run hippy:dev'
3. open hippy pages with debugMode on mobile/emulator
4. find connected debug targets on devtools home page: ${colors.underline[WinstonColor.Blue](getHomeUrl())}

find full guide on ${colors.underline[WinstonColor.Blue]('https://hippyjs.org/#/guide/debug')}`),
  );
};

/**
 * set default tunnel in different framework
 */
const normalizeArgv = () => {
  const { env, tunnel } = global.debugAppArgv;
  if (tunnel) return;
  if ([DevtoolsEnv.Hippy, DevtoolsEnv.HippyTDF].includes(env)) {
    global.debugAppArgv.tunnel = DebugTunnel.WS;
  } else if (env === DevtoolsEnv.TDFCore) {
    global.debugAppArgv.tunnel = DebugTunnel.TCP;
  }
};
