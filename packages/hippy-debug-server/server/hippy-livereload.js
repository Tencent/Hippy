const { Server: WebSocketServer } = require('ws');
const { timerLogger } = require('../utils');

let serverSocket;
let clientSocket;

function sendCompileFinMsg() {
  if (!clientSocket) {
    return;
  }

  try {
    const actionData = { action: 'compileSuccess' };
    timerLogger.info('Trigger Live Reloading...');
    clientSocket.send(JSON.stringify(actionData));
  } catch (err) {
    timerLogger.warn(err);
  }
}

function startLiveReloadServer(server, path) {
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
    if (url.indexOf('/debugger-live-reload') < 0) {
      ws.close(1011, 'unknown proxy');
      return;
    }

    timerLogger.info('Live Reload Ready...');

    if (clientSocket) {
      clientSocket.onerror = null;
      clientSocket.onclose = null;
      clientSocket.onmessage = null;
      clientSocket.close(1011, 'Another client connected');
    }
    clientSocket = ws;
    const close = () => {
      timerLogger.info('Live Reloading Closed...');
      clientSocket = null;
    };
    clientSocket.onerror = close;
    clientSocket.onclose = close;
  });
}

module.exports = {
  startLiveReloadServer,
  sendCompileFinMsg,
};
