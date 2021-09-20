const { Server: WebSocketServer } = require('ws');
const { timerLogger, Watcher, logger } = require('../utils');
const clientSockets = [];
let serverSocket;
let clientId = 0;

function sendCompileFinMsg(option = {}) {
  if (!clientSockets.length) return;
  try {
    clientSockets.forEach((item) => {
      const actionData = { ...option };
      if (actionData.action === 'compileSuccess') {
        timerLogger.info('Project is Reloading...');
      }
      item.clientSocket.send(JSON.stringify(actionData));
    });
  } catch (e) {
    console.warn(e);
  }
}

function initialWatcher(watchPath) {
  const msgObj = {
    action: 'compileSuccess',
  };
  const watcher = new Watcher({
    watchDir: [watchPath],
    // watchIgnore: /.+\.json/,
    onFileAdded: () => {
      timerLogger.info('onFileAdded...');
      sendCompileFinMsg(msgObj);
    },
    onFileChanged: () => {
      timerLogger.info('onFileChanged...');
      sendCompileFinMsg(msgObj);
    },
    onFileDeleted: () => {
      timerLogger.info('onFileDeleted...');
      sendCompileFinMsg(msgObj);
    },
  });
  watcher.start().catch(err => logger.error('live reload watch error', err));
}

function startLiveReloadServer(server, path, watchPath) {
  if (serverSocket) {
    timerLogger.warn('server socket is already exist');
    return;
  }
  serverSocket = new WebSocketServer({
    server,
    path,
  });
  serverSocket.on('connection', (ws, req) => {
    const currentId = clientId;
    clientId += 1;
    const { url } = req;
    if (url.indexOf('/debugger-live-reload') < 0) {
      ws.close(1011, 'unknown proxy');
      return;
    }
    timerLogger.info('Live Reload Ready...');
    let clientSocket = ws;
    clientSockets.push({
      clientSocket,
      clientId: currentId,
    });
    const close = () => {
      timerLogger.info('Live Reloading Closed...');
      const index = clientSockets.findIndex(item => item.clientId === currentId);
      clientSocket = null;
      if (index !== -1) {
        clientSockets.splice(index, 1);
      }
    };
    clientSocket.onerror = close;
    clientSocket.onclose = close;
  });
  initialWatcher(watchPath);
}

module.exports = {
  startLiveReloadServer,
  sendCompileFinMsg,
};
