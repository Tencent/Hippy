import WebSocket, { Server } from 'ws/index.js';
import { DeviceInfo } from './@types/tunnel';
import { ClientRole, ClientEvent, AppClientType, DevicePlatform, DeviceManagerEvent } from './@types/enum';
import { AppClient, TunnelAppClient, WsAppClient, IwdpAppClient, DevtoolsClient } from './client';
import { IosTarget } from './adapter';
import messageChannel from './message-channel';
import { v4 as uuidv4 } from 'uuid';
import androidTargetManager from './android-pages-manager';
import { selectTarget } from './router/chrome-inspect-router';
import createDebug from 'debug';

const debug = createDebug('socket-bridge');

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
    debug('debug page: %j', debugPage);
    debug('%s connected!', role);

    if (pathname !== this.wsPath) return;
    if (!Object.values(ClientRole).includes(role)) return debug('invalid client role!');

    if (role === ClientRole.Devtools) {
      const appWs = this.appWsMap.get(targetId);
      if(!appWs && appClientType.indexOf(AppClientType.WS) !== -1)
        return debug('app ws is not connected!!!');

      const result = selectTarget(targetId);
      if(!result) return;
      const { devtoolsClient, appClients, target } = result;

      if(!appClients) return debug('add channel failed!');

      // bind appWs

      const removeChannel = () => messageChannel.removeChannel(target.id, devtoolsClient.id);
      devtoolsClient.bindWs(ws, removeChannel);
    } else {
      debug('ws app client created');
      if(role === ClientRole.Android) {
        if(!clientId) clientId = uuidv4()  // TODO 终端加上 clientId 后移除 uuidv4
        androidTargetManager.addWsTarget(clientId, ws);
        // 终端刷新时未断连，会导致调试页面列表很多脏数据
        ws.on('close', () => {
          androidTargetManager.removeWsTarget(clientId);
        });
      }

      this.appWsMap.set(clientId, ws);
    }
  }

  close() {
    this.wss.close(() => {
      debug('close wss!!!');
    });
  }
}

const getClientInfo = (reqUrl) => {
  const url = new URL(reqUrl, 'http://0.0.0.0');
  const clientId = url.searchParams.get('clientId');
  const targetId = url.searchParams.get('targetId');
  const platform = url.searchParams.get('platform') as DevicePlatform;
  const role = url.searchParams.get('role') as ClientRole;
  const bundleName = url.searchParams.get('bundleName');
  let appClientType = url.searchParams.get('appClientType') as AppClientType || '[]';
  let debugPage: any = url.searchParams.get('debugPage') || '{}';
  try {
    appClientType = JSON.parse(decodeURIComponent(appClientType));
    debugPage = JSON.parse(decodeURIComponent(debugPage));
  }
  catch(e) {
    debugPage = {};
    debug('parse debug page json error: %j', e);
  }

  return { appClientType, platform, clientId, targetId, debugPage, pathname: url.pathname, role, bundleName };
};
