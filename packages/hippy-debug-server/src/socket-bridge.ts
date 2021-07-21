import WebSocket, { Server } from 'ws/index.js';
import { DeviceInfo } from './@types/tunnel';
import { ClientRole, ClientEvent, AppClientType, DevicePlatform, DeviceManagerEvent } from './@types/enum';
import { AppClient, TunnelAppClient, WsAppClient, IosProxyClient, DevtoolsClient } from './client';
import { IosTarget } from './adapter';
import messageChannel from './message-channel';
import { v4 as uuidv4 } from 'uuid';
import androidTargetManager from './android-pages-manager';
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
    let { appClientType, role, clientId, targetId, debugPage, pathname, platform } = getClientInfo(req.url);
    debug('%j', debugPage);
    if (pathname !== this.wsPath) return;
    if (!Object.values(ClientRole).includes(role)) return debug('invalid client role!');

    if(role === ClientRole.Android) {
      debug('ws app client created');
      if(!clientId) clientId = uuidv4()  // TODO 移除 uuidv4
      androidTargetManager.addWsTarget(clientId);
      this.appWsMap.set(clientId, ws);
      // 终端刷新时未断连，会导致调试页面列表很多脏数据
      ws.on('close', () => {
        androidTargetManager.removeWsTarget(clientId);
      });
    } else if (role === ClientRole.Devtools) {
      const devtoolsClient = new DevtoolsClient(req.url);
      const appWs = this.appWsMap.get(targetId);
      if(!appWs && appClientType === AppClientType.WS) return debug('app ws is not connected!!!');
      const appClient = messageChannel.addChannel({
        devtoolsClient,
        appClientId: targetId,
        appClientType,
        ws: appWs,
        debugPage,
        platform,
      });
      if(!appClient) return debug('add channel failed!');
      const removeChannel = () => messageChannel.removeChannel(appClient.id, devtoolsClient.id);
      devtoolsClient.bindWs(ws, removeChannel);
    }
  }
}

const getClientInfo = (reqUrl) => {
  const url = new URL(reqUrl, 'http://0.0.0.0');
  const clientId = url.searchParams.get('clientId');
  const targetId = url.searchParams.get('targetId');
  const platform = url.searchParams.get('platform') as DevicePlatform;
  const role = url.searchParams.get('role') as ClientRole;
  const bundleName = url.searchParams.get('bundleName');
  const appClientType = url.searchParams.get('appClientType') as AppClientType;
  let debugPage: any = url.searchParams.get('debugPage') || '{}';
  try {
    debugPage = JSON.parse(decodeURIComponent(debugPage));
  }
  catch(e) {
    debugPage = {};
    debug('parse debug page json error: %j', e);
  }

  return { appClientType, platform, clientId, targetId, debugPage, pathname: url.pathname, role, bundleName };
};
