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
  private appWsMap = new Map<string, WebSocket>();
  private appClientListMap: Map<string, AppClient[]> = new Map();
  private wsPath: string;
  private wss: Server;
  private server;
  private debugTarget: DebugTarget;

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
    appClientList.forEach((appClient) => {
      appClient.send(msg);
    });
  }

  /**
   * 选择调试页面，为其搭建通道
   */
  public selectDebugTarget(debugTarget: DebugTarget, ws?: WebSocket): AppClient[] {
    const appClientId = debugTarget.id;
    let appClientList = this.appClientListMap.get(appClientId);
    if (!appClientList?.length) {
      let options;
      if (debugTarget.platform === DevicePlatform.Android) {
        options = appClientManager.getAndroidAppClientOptions();
      } else {
        options = appClientManager.getIosAppClientOptions();
      }

      appClientList = options.map(({ Ctor, ...option }: AppClientFullOptionOmicCtx) => {
        const urlParsedContext = debugTarget2UrlParsedContext(debugTarget);
        const newOption: AppClientOption = {
          urlParsedContext,
          ...option,
        };
        if (Ctor.name === AppClientType.WS) {
          newOption.ws = this.appWsMap.get(appClientId);
        }
        return new Ctor(appClientId, newOption);
      });
      this.appClientListMap.set(appClientId, appClientList);
    }

    // 绑定数据上行
    appClientList.forEach((appClient) => {
      appClient.removeAllListeners(ClientEvent.Message);
      appClient.on(ClientEvent.Message, (msg: Adapter.CDP.Res) => {
        // 上行到监听器
        this.triggerListerner(msg);
        // 上行到devtools
        if (ws) {
          ws.send(JSON.stringify(msg));
        }
      });
    });

    // 绑定数据下行
    if (ws) {
      ws.on('message', (msg: string) => {
        const msgObj: Adapter.CDP.Req = JSON.parse(msg);
        appClientList.forEach((appClient) => {
          appClient.send(msgObj);
        });
      });

      ws.on('close', () => {
        appClientList.forEach((appClient) => {
          appClient.resumeApp();
        });
      });
    }

    return appClientList;
  }

  private onConnection(ws, req) {
    const ctx = parseWsUrl(req.url);
    const { platform, clientRole, clientId, targetId, pathname } = ctx;
    const debugTarget = DebugTargetManager.findTarget(targetId);
    debug('debug page: %j', debugTarget);
    debug('%s connected!', clientRole);

    if (pathname !== this.wsPath) return debug('invalid ws connection path!');
    if (clientRole === ClientRole.Devtools && !debugTarget) return debug("debugTarget doesn't exist!");
    if (!Object.values(ClientRole).includes(clientRole)) return debug('invalid client role!');

    if (clientRole === ClientRole.Devtools) {
      this.selectDebugTarget(debugTarget, ws);
    } else {
      debug('ws app client connected.');
      if (platform === DevicePlatform.Android) {
        androidDebugTargetManager.addWsTarget(clientId);
      }
      this.appWsMap.set(clientId, ws);
    }
  }
}
