import createDebug from 'debug';
import { AppClientType } from 'src/@types/enum';
import WebSocket, { Server } from 'ws/index.js';
import { ClientEvent, ClientRole, DevicePlatform } from './@types/enum';
import { DebugTarget } from './@types/tunnel';
import { androidDebugTargetManager } from './android-debug-target-manager';
import { appClientManager } from './client';
import { AppClient, AppClientOption } from './client/app-client';
import { AppClientFullOptionOmicCtx } from './client/app-client-manager';
import { debugTarget2UrlParsedContext } from './middlewares';
import { DebugTargetManager } from './router/chrome-inspect-router';
import { DomainRegister } from './utils/cdp';
import { parseWsUrl } from './utils/url';

const debug = createDebug('socket-bridge');
createDebug.enable('socket-bridge');

export class SocketServer extends DomainRegister {
  // key: appClientId
  private connectionMap: Map<string, Connection> = new Map();
  private wsPath: string;
  private wss: Server;
  private server;
  private debugTarget: DebugTarget;
  // key: req id
  private idWsMap: Map<number, WebSocket> = new Map();

  constructor(server, { wsPath }) {
    super();
    this.wsPath = wsPath;
    this.server = server;
  }

  public start() {
    const wss = new Server({
      server: this.server,
      path: this.wsPath,
    });
    this.wss = wss;
    wss.on('connection', this.onConnection.bind(this));
  }

  public close() {
    this.wss.close(() => {
      debug('close wss!!!');
    });
  }

  public sendMessage(msg: Adapter.CDP.Req) {
    const appClientList = this.selectDebugTarget(this.debugTarget);
    if (!appClientList) return;
    appClientList.forEach((appClient) => {
      appClient.send(msg);
    });
  }

  /**
   * 选择调试页面，为其搭建通道
   */
  public selectDebugTarget(debugTarget: DebugTarget, ws?: WebSocket): AppClient[] {
    if (!debugTarget) return;
    this.debugTarget = debugTarget;
    const appClientId = debugTarget.id;
    if (!this.connectionMap.has(appClientId)) {
      this.connectionMap.set(appClientId, {
        appClientList: [],
        devtoolsWsList: [],
        appWs: undefined,
      });
    }
    const conn = this.connectionMap.get(appClientId);
    if (!conn.appClientList?.length) {
      let options;
      if (debugTarget.platform === DevicePlatform.Android) {
        options = appClientManager.getAndroidAppClientOptions();
      } else {
        options = appClientManager.getIosAppClientOptions();
      }

      conn.appClientList = options
        .map(({ Ctor, ...option }: AppClientFullOptionOmicCtx) => {
          const urlParsedContext = debugTarget2UrlParsedContext(debugTarget);
          const newOption: AppClientOption = {
            urlParsedContext,
            ...option,
          };
          if (Ctor.name === AppClientType.WS) {
            newOption.ws = conn.appWs;
            if (!newOption.ws) {
              debug('no app ws connection, ignore WsAppClient.');
              return;
            }
          }
          return new Ctor(appClientId, newOption);
        })
        .filter((v) => v);
    }
    if (ws) conn.devtoolsWsList.push(ws);

    // 绑定数据上行
    conn.appClientList.forEach((appClient) => {
      appClient.removeAllListeners(ClientEvent.Message);
      appClient.on(ClientEvent.Message, (msg: Adapter.CDP.Res) => {
        // 上行到监听器
        this.triggerListerner(msg);
        // 上行到devtools
        if ('id' in msg) {
          // command 上行到调用的 ws
          const currentWs = this.idWsMap.get(msg.id);
          currentWs.send(JSON.stringify(msg));
          this.idWsMap.delete(msg.id);
        } else {
          // event 无法判断是谁触发的，上行到每一个 ws。客户端如果不关心该事件，就不会注册监听，不会有影响。
          conn.devtoolsWsList.forEach((ws) => {
            ws.send(JSON.stringify(msg));
          });
        }
      });
    });

    // 绑定数据下行
    if (ws) {
      ws.on('message', (msg: string) => {
        // appClient 和 ws 是一对多的关系（插件会单独建立一个通道），所以appClient收到消息后需查询上行到哪个ws
        const msgObj: Adapter.CDP.Req = JSON.parse(msg);
        this.idWsMap.set(msgObj.id, ws);
        conn.appClientList.forEach((appClient) => {
          appClient.send(msgObj);
        });
      });

      ws.on('close', () => {
        conn.appClientList.forEach((appClient) => {
          appClient.resumeApp();
        });
      });
    }

    return conn.appClientList;
  }

  private onConnection(ws, req) {
    const ctx = parseWsUrl(req.url);
    const { platform, clientRole, clientId, targetId, pathname } = ctx;
    const debugTarget = DebugTargetManager.findTarget(targetId);
    debug('debug page: %j', debugTarget);
    debug('%s connected!', clientRole);

    if (pathname !== this.wsPath) {
      ws.close();
      return debug('invalid ws connection path!');
    }
    if (clientRole === ClientRole.Devtools && !debugTarget) {
      ws.close();
      return debug("debugTarget doesn't exist!");
    }
    if (!Object.values(ClientRole).includes(clientRole)) {
      ws.close();
      return debug('invalid client role!');
    }
    if (!clientId) {
      ws.close();
      return debug('invalid ws connection!');
    }
    ws.clientId = clientId;

    if (clientRole === ClientRole.Devtools) {
      this.selectDebugTarget(debugTarget, ws);
    } else {
      debug('ws app client connected.');
      if (platform === DevicePlatform.Android) {
        androidDebugTargetManager.addWsTarget(clientId);
      }
      if (!this.connectionMap.has(clientId)) {
        this.connectionMap.set(clientId, {
          appClientList: [],
          devtoolsWsList: [],
          appWs: ws,
        });
      }
      ws.removeAllListeners('close');
      ws.on('close', () => {
        for (const [clientId, { appWs }] of this.connectionMap.entries()) {
          if (appWs === ws) {
            this.connectionMap.delete(clientId);
          }
        }
        androidDebugTargetManager.removeWsTarget(ws.clientId);
      });
    }
  }
}

type Connection = {
  appClientList: AppClient[];
  devtoolsWsList: WebSocket[];
  appWs?: WebSocket;
};
