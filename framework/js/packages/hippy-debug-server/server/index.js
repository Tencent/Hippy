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

const fs = require('fs');
const path = require('path');
const Koa = require('koa');
const {
  logger,
  exec,
  content,
  parseMimeType,
} = require('../utils');
const devSupportWsServer = require('./websocketProxy');
const liveReloadWsServer = require('./hippy-livereload');

async function startDevServer(args) {
  const {
    static,
    entry = 'dist/dev/index.bundle',
    host = '127.0.0.1',
    port = 38989,
    livePort = 38999,
    verbose,
    live,
  } = args;
  const versionReturn = '{"Browser": "Hippy/v1.0.0","Protocol-Version": "1.1"}';
  const jsonReturn = JSON.stringify([{
    description: 'hippy instance',
    devtoolsFrontendUrl: `chrome-devtools://devtools/bundled/js_app.html?experiments=true&ws=${host}:${port}/debugger-proxy?role=chrome`,
    devtoolsFrontendUrlCompat: `chrome-devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=${host}:${port}/debugger-proxy?role=chrome`,
    faviconUrl: 'http://res.imtt.qq.com/hippydoc/img/hippy-logo.ico',
    title: 'Hippy debug tools for V8',
    type: 'page',
    url: '',
    webSocketDebuggerUrl: `ws://${host}:${port}/debugger-proxy?role=chrome`,
  }]);
  const app = new Koa();
  let staticPath;
  const watchPath = path.resolve(path.dirname(entry));
  if (static) {
    staticPath = path.resolve(static);
  } else {
    staticPath = path.resolve(path.dirname(entry));
  }
  if (!fs.statSync(staticPath).isDirectory()) {
    throw new Error('Static folder is not exist or not a folder');
  }
  app.use((ctx) => {
    if (verbose) {
      logger.info('Received url request', ctx.url);
    }
    // Response the content of version request
    if (ctx.path === '/json/version') {
      ctx.res.writeHead(200, {
        'Content-Type': 'application/json; charset=UTF-8',
        'Content-Length': versionReturn.length,
      });
      ctx.res.write(versionReturn);
      return ctx.res.end();
    }
    // Response the content of json api request
    if (ctx.path === '/json') {
      ctx.res.writeHead(200, {
        'Content-Type': 'application/json; charset=UTF-8',
        'Content-Length': jsonReturn.length,
      });
      ctx.res.write(jsonReturn);
      return ctx.res.end();
    }
    // Read the file content from specific path
    const contentStr = content(ctx, staticPath);
    if (!contentStr) {
      ctx.res.writeHead(404);
      return ctx.res.end();
    }
    ctx.res.writeHead(200, {
      'Content-Type': parseMimeType(ctx.path),
    });
    ctx.res.write(contentStr);
    return ctx.res.end();
  });
  exec('adb', ['reverse', '--remove-all'])
    .then(() => {
      exec('adb', ['reverse', `tcp:${port}`, `tcp:${port}`]);
      exec('adb', ['reverse', `tcp:${livePort}`, `tcp:${livePort}`]);
    })
    .catch((err) => {
      logger.warn('Port reverse failed, For iOS app debug only just ignore the message.');
      logger.warn('Otherwise please check adb devices command working correctly');
      if (verbose) {
        logger.error(err);
      }
    })
    .finally(() => {
      const serverDebugInstance = app.listen(port, host, () => {
        devSupportWsServer.startWebsocketProxyServer(serverDebugInstance, '/debugger-proxy');
        logger.info('Hippy debug server is started at', `${host}:${port}`, 'for entry', entry);
        logger.info('Please open "chrome://inspect" in Chrome to debug your android Hippy app, or use Safari to debug iOS app');
      });
      serverDebugInstance.timeout = 6000 * 1000;
      if (!live) return;
      const serverLiveReloadInstance = app.listen(livePort, host, () => {
        liveReloadWsServer.startLiveReloadServer(serverLiveReloadInstance, '/debugger-live-reload', watchPath);
        logger.info('Hippy live reload server is started at', `${host}:${livePort}`, 'to watch directory', watchPath);
      });
      serverLiveReloadInstance.timeout = 6000 * 1000;
    });
}

module.exports = startDevServer;
