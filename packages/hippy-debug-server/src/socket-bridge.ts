import WebSocket, { Server } from 'ws/index.js';
import { DeviceInfo } from './@types/tunnel';
import { ClientType, ClientRole, ClientEvent, AppClientType, DevicePlatform, DeviceManagerEvent } from './@types/enum';
import { AppClient, TunnelAppClient, WsAppClient, IosProxyClient, DevtoolsClient } from './client';
import { IosTarget } from './adapter';
import messageChannel from './message-channel';
import { v4 as uuidv4 } from 'uuid';
import androidPageManager from './android-pages-manager';
import createDebug from 'debug';

const debug = createDebug('socket-bridge');

/**
 * ws://localhost:7799/devtools?clientId=534&from=devtools&targetId=3214
 * ws://localhost:7799/devtools?clientId=534&from=app
 */
export class SocketBridge {
  wsPath: string;
  appWsMap = new Map<string, WebSocket>();
  wss: Server;
  server;

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

  onConnection(ws, req) {
    const { clientType, appClientType, clientId, targetId, debugPage, pathname } = getClientInfo(req.url);
    debug('%s %j', clientType, debugPage);
    if (pathname !== this.wsPath) return;
    if (clientType === ClientType.Unknown) return debug('invalid client type!');

    if (clientType === ClientType.App) {
      debug('ws app client created');
      const clientId = androidPageManager.addWsClientId();
      // 相同id直接覆盖，目前 app 端 ws 连接未作区分
      this.appWsMap.set(clientId, ws);
      ws.on('close', () => {
        androidPageManager.removeWsClientId(clientId);
      });
    } else if (clientType === ClientType.Devtools) {
      const devtoolsClient = new DevtoolsClient(req.url);
      const appWs = this.appWsMap.get(targetId);
      if(!appWs && appClientType === AppClientType.WS) return debug('app ws is not connected!!!');
      const appClient = messageChannel.addChannel({
        devtoolsClient,
        appClientId: targetId,
        appClientType,
        ws: appWs,
        debugPage,
      });
      if(!appClient) return debug('add channel failed!');

      if(appClientType === AppClientType.IosProxy) {}
      ws.on('message', (msg) => {
        try {
          const msgObj = JSON.parse(msg);
          devtoolsClient.sendMessage(msgObj);
        }
        catch(e) {
          debug('parse devtools ws message error!');
        }
      });
      ws.on('close', () => {
        devtoolsClient.emit(ClientEvent.Close);
        messageChannel.removeChannel(appClient.id, devtoolsClient.id);
      });
      devtoolsClient.sendToDevtools = ws.send.bind(ws);
      devtoolsClient.close = () => {
        ws.close();
        messageChannel.removeChannel(appClient.id, devtoolsClient.id);
      };
    }
  }
}

const getClientInfo = (reqUrl) => {
  const url = new URL(reqUrl, 'http://0.0.0.0');
  const clientId = url.searchParams.get('clientId');
  const targetId = url.searchParams.get('targetId');
  const role = url.searchParams.get('role');
  const from = url.searchParams.get('from');
  const appClientType = url.searchParams.get('appClientType') as AppClientType;
  let debugPage: any = url.searchParams.get('debugPage') || '{}';
  let clientType;
  debugPage = JSON.parse(decodeURIComponent(debugPage));

  if (from !== ClientType.App && from !== ClientType.Devtools && role !== ClientRole.Android) {
    clientType = ClientType.Unknown;
  } else if (from === ClientType.App || role === ClientRole.Android) {
    clientType = ClientType.App;
  } else if (from === ClientType.Devtools) {
    clientType = ClientType.Devtools;
  }
  return { clientType, appClientType, clientId, targetId, debugPage, pathname: url.pathname };
};
