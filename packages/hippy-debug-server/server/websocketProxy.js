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

const { Server: WebSocketServer } = require('ws');
const { timerLogger, verboseInfo } = require('../utils');

let serverSocket;

let androidClientSocket;
let chromeSocket;

// eslint-disable-next-line no-underscore-dangle
global.__DEBUGGER_CONNECTED__ = false;


function sendMsgTo(dest, message) {
  if (!dest) {
    return;
  }

  try {
    dest.send(message);
  } catch (err) {
    timerLogger.warn(`sendMsgTo ${dest} error:`, err);
  }
}

function startWebsocketProxyServer(server, path) {
  if (serverSocket) {
    timerLogger.warn('server socket is already exist');
    return;
  }

  serverSocket = new WebSocketServer({
    server,
    path,
  });

  serverSocket.on('connection', (ws, req) => {
    const { url } = req;

    timerLogger.info('websocket connected, url = ', url);

    if (url.indexOf('role=chrome') > -1) { // url = /debugger-proxy?role=chrome，这里是来自Chrome的debug的链接
      chromeSocket = ws;

      chromeSocket.onerror = err => timerLogger.error('Error: chrome websocket error : ', err);

      chromeSocket.onclose = () => {
        timerLogger.info('chromeSocket closed');

        if (androidClientSocket) {
          sendMsgTo(androidClientSocket, 'chrome_socket_closed');
        }

        chromeSocket = null;
        // eslint-disable-next-line no-underscore-dangle
        global.__DEBUGGER_CONNECTED__ = false;
      };

      // eslint-disable-next-line no-underscore-dangle
      global.__DEBUGGER_CONNECTED__ = true;

      // 收到chrome的msg就转发给终端
      chromeSocket.onmessage = ({ data }) => {
        const obj = JSON.parse(data);
        if (obj.method) {
          verboseInfo('get chrome msg, method = ', obj.method, data);
        } else {
          verboseInfo('get chrome msg : ', data);
        }

        if (androidClientSocket) {
          sendMsgTo(androidClientSocket, data);
        } else {
          timerLogger.error('Error: chrome msg received, but androidClient not attached');
        }
      };
    } else if (url.indexOf('role=android_client') > -1) { // url = /debugger-proxy?role=android_client，这里是来自于终端的socket链接
      androidClientSocket = ws;

      androidClientSocket.onerror = err => timerLogger.error('Error: androidClient websocket error : ', err);

      androidClientSocket.onclose = () => {
        timerLogger.info('androidClientSocket closed');

        androidClientSocket = null;
        sendMsgTo(chromeSocket, JSON.stringify({
          method: 'client-disconnected',
        }));
      };

      // 收到终端的msg就转发给chrome
      androidClientSocket.onmessage = ({ data }) => {
        const obj = JSON.parse(data);
        if (obj.method) {
          verboseInfo('get android msg, method = ', obj.method);
        } else {
          verboseInfo('get android msg : ', data.slice(0, 200));
        }

        if (chromeSocket) {
          sendMsgTo(chromeSocket, data);
        } else {
          timerLogger.error('Error: androidClient msg received, but chrome not attached');
        }
      };
    } else {
      timerLogger.error('Error: websocket error, no such server path');
      ws.close(1011, 'Missing role param');
    }
  });
}

module.exports = {
  startWebsocketProxyServer,
};
