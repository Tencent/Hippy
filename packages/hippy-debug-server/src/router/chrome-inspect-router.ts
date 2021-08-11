import Router from 'koa-router';
import request from 'request-promise';
import { AppClientType, DevicePlatform } from 'src/@types/enum';
import { v4 as uuidv4 } from 'uuid';
import { ChromePageType, ClientRole } from '../@types/enum';
import { DebugTarget } from '../@types/tunnel';
import { androidDebugTargetManager } from '../android-debug-target-manager';
import { appClientManager } from '../client';
import { makeUrl } from '../utils/url';

type RouterArgv = Pick<Application.StartServerArgv, 'host' | 'port' | 'iwdpPort' | 'wsPath'>;

export const getChromeInspectRouter = ({ host, port, iwdpPort, wsPath }: RouterArgv) => {
  const chromeInspectRouter = new Router();

  chromeInspectRouter.get('/json/version', (ctx) => {
    ctx.body = { Browser: 'Hippy/v1.0.0', 'Protocol-Version': '1.1' };
  });

  chromeInspectRouter.get('/json', async (ctx) => {
    const rst = await DebugTargetManager.getDebugTargets({ iwdpPort, host, port, wsPath });
    ctx.body = rst;
  });

  return chromeInspectRouter;
};

export class DebugTargetManager {
  public static debugTargets: DebugTarget[] = [];

  public static getDebugTargets = async ({ iwdpPort, host, port, wsPath }: RouterArgv): Promise<DebugTarget[]> => {
    // clientId 可以随意赋值，每个 ws 连过来时 clientId 不同即可
    const clientId = uuidv4();
    const rst: DebugTarget[] = [];
    const iosTargets = await getIosTargets({ iwdpPort, host, port, wsPath, clientId });
    const androidTargets = getAndroidTargets({ host, port, wsPath, clientId });
    rst.push(...iosTargets);
    rst.push(...androidTargets);
    DebugTargetManager.debugTargets = rst;
    return rst;
  };

  public static findTarget(id: string) {
    return DebugTargetManager.debugTargets.find((target) => target.id === id);
  }
}

/**
 * ios: 通过 IWDP 获取调试页面列表
 */
const getIosTargets = async ({ iwdpPort, host, port, wsPath, clientId }): Promise<DebugTarget[]> => {
  try {
    const deviceList = await request({
      url: '/json',
      baseUrl: `http://127.0.0.1:${iwdpPort}`,
      json: true,
    });
    const appClientTypeList = appClientManager.getIosAppClientOptions().map(({ Ctor }) => Ctor.name) as AppClientType[];
    const debugTargets: DebugTarget[] = await Promise.all(
      deviceList.map(async (device) => {
        const port = device.url.match(/:(\d+)/)[1];
        try {
          const targets = await request({
            url: '/json',
            baseUrl: `http://127.0.0.1:${port}`,
            json: true,
          });
          targets.map((target) => (target.device = device));
          return targets;
        } catch (e) {
          return [];
        }
      }),
    );
    return debugTargets.flat().map((debugTarget) => {
      const targetId = debugTarget.webSocketDebuggerUrl;
      const wsUrl = makeUrl(`${host}:${port}${wsPath}`, {
        platform: DevicePlatform.IOS,
        clientId,
        targetId,
        role: ClientRole.Devtools,
      });
      const devtoolsFrontendUrl = makeUrl(`http://localhost:${port}/front_end/inspector.html`, {
        remoteFrontend: true,
        experiments: true,
        ws: wsUrl,
      });
      const matchRst = debugTarget.title.match(/^HippyContext:\s(.*)$/);
      const bundleName = matchRst ? matchRst[1] : '';
      return {
        ...debugTarget,
        id: targetId,
        clientId,
        thumbnailUrl: '',
        appClientTypeList,
        description: debugTarget.title,
        devtoolsFrontendUrl,
        devtoolsFrontendUrlCompat: devtoolsFrontendUrl,
        faviconUrl: bundleName ? 'http://res.imtt.qq.com/hippydoc/img/hippy-logo.ico' : '',
        title: debugTarget.title,
        bundleName,
        type: ChromePageType.Page,
        platform: DevicePlatform.IOS,
        url: '',
        webSocketDebuggerUrl: `ws://${wsUrl}`,
      };
    });
  } catch (e) {
    return [];
  }
};

/**
 * android: 通过 androidDebugTargetManager 获取调试页面列表
 */
const getAndroidTargets = ({ host, port, wsPath, clientId }): DebugTarget[] => {
  const appClientTypeList = appClientManager
    .getAndroidAppClientOptions()
    .map(({ Ctor }) => Ctor.name) as AppClientType[];
  return androidDebugTargetManager.getTargetIdList().map((targetId) => {
    const wsUrl = makeUrl(`${host}:${port}${wsPath}`, {
      platform: DevicePlatform.Android,
      clientId,
      targetId,
      role: ClientRole.Devtools,
    });
    const devtoolsFrontendUrl = makeUrl(`http://localhost:${port}/front_end/inspector.html`, {
      remoteFrontend: true,
      experiments: true,
      ws: wsUrl,
    });
    return {
      id: targetId || clientId,
      clientId,
      thumbnailUrl: '',
      description: 'Hippy instance',
      appClientTypeList,
      devtoolsFrontendUrl,
      devtoolsFrontendUrlCompat: devtoolsFrontendUrl,
      faviconUrl: 'http://res.imtt.qq.com/hippydoc/img/hippy-logo.ico',
      title: 'Hippy debug tools for V8',
      type: ChromePageType.Page,
      platform: DevicePlatform.Android,
      url: '',
      webSocketDebuggerUrl: `ws://${wsUrl}`,
    };
  });
};
