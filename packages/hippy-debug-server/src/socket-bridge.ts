import WebSocket, { Server } from 'ws/index.js';
import { ClientType, ClientRole, ClientEvent, AppClientType, DevicePlatform } from './@types/enum';
import { AppClient, TunnelAppClient, WsAppClient, IosProxyClient } from './client';
import { IosTarget } from './adapter';
import messageChannel from './message-channel';
import deviceManager from './device-manager';

let deviceId;
export const DefaultTargetId = 'hippy-app';
/**
 * ws://localhost:7799/devtools?clientId=534&from=devtools&targetId=3214
 * ws://localhost:7799/devtools?clientId=534&from=app
 */
export class SocketBridge {
  wsPath: string;
  devtools: {
    [id: string]: {
      ws: WebSocket;
      clientId: string;
      targetId?: string;
    };
  } = {};
  apps: {
    [id: string]: AppClient;
  } = {};
  wss: Server;
  server;
  // 缓存起来，避免 target 中重复创建 ws client
  targetMap: Map<string, IosTarget> = new Map<string, IosTarget>();

  constructor(server, { wsPath }) {
    this.wsPath = wsPath;
    this.server = server;

    const wss = new Server({
      server: this.server,
      path: wsPath,
    });
    this.wss = wss;
    wss.on('connection', this.onConnection.bind(this));
  }

  addWsAppClient(id, ws) {
    const appClient = this.apps[id];
    if (appClient) {
      appClient.emit(ClientEvent.Close);
    }
    setTimeout(() => {
      const wsAppClient = new WsAppClient(id, ws);
      this.apps[id] = wsAppClient;
    }, 100);
  }

  addProxyAppClient(url) {
    const proxyAppClient = new IosProxyClient(url);
    const appClient = this.apps[url];
    if (appClient) {
      appClient.emit(ClientEvent.Close);
    }
    this.apps[url] = proxyAppClient;
    return proxyAppClient;
  }

  onConnection(ws, req) {
    const { clientType, appClientType, clientId, debugPage, pathname } = getClientInfo(req.url);
    if (pathname !== this.wsPath) return;

    console.info(debugPage);
    if (clientType === ClientType.Unknown) {
      console.info('invalid client type!');
      return;
    }
    if (clientType === ClientType.App) {
      console.info('app client created');
      const id = clientId || deviceId;
      // if (this.apps[id]) this.apps[id].close();
      this.addWsAppClient(id, ws);
    } else if (clientType === ClientType.Devtools) {
      if(appClientType === AppClientType.IosProxy) {
        messageChannel.init(debugPage);
        messageChannel.appClient.connect();
      }
      ws.on('message', (msg) => {
        try {
          const msgObj = JSON.parse(msg);
          messageChannel.devtoolsClient.sendMessage(msgObj);
        }
        catch(e) {
          console.error('parse devtools ws message error!');
        }
      });
      ws.on('close', () => messageChannel.devtoolsClient.emit(ClientEvent.Close));
      messageChannel.devtoolsClient.sendToDevtools = ws.send.bind(ws);
      messageChannel.devtoolsClient.close = ws.close.bind(ws);
    }
  }
}

const getClientInfo = (reqUrl) => {
  const url = new URL(reqUrl, 'http://0.0.0.0');
  const clientId = url.searchParams.get('clientId');
  const targetId = url.searchParams.get('targetId') || deviceId;
  const role = url.searchParams.get('role');
  const from = url.searchParams.get('from');
  let debugPage: any = url.searchParams.get('debugPage') || '{}';
  let clientType;
  let appClientType = AppClientType.WS;
  debugPage = JSON.parse(decodeURIComponent(debugPage));

  if (from !== ClientType.App && from !== ClientType.Devtools && role !== ClientRole.Android) {
    clientType = ClientType.Unknown;
  } else if (from === ClientType.App || role === ClientRole.Android) {
    clientType = ClientType.App;
  } else if (from === ClientType.Devtools) {
    clientType = ClientType.Devtools;
  }
  if (debugPage?.webSocketDebuggerUrl) {
    appClientType = AppClientType.IosProxy;
  }
  return { clientType, appClientType, clientId, targetId, debugPage, pathname: url.pathname };
};
