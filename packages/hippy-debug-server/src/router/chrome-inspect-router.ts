import { AppClientType, ChromePageType, ClientRole } from '../@types/enum';
import Router from 'koa-router';
import request from 'request-promise';
import { DevicePlatform } from 'src/@types/enum';
import { v4 as uuidv4 } from 'uuid';
import { DebugPage } from '../@types/tunnel';
import fs from 'fs';
import androidTargetManager from '../android-pages-manager';
import { appClientManager } from '../client';
import messageChannel from '../message-channel';
import * as _ from 'lodash';

export default ({ host, port, iwdpPort, wsPath }) => {
  const chromeInspectRouter = new Router();

  chromeInspectRouter.get('/json/version', (ctx) => {
    ctx.body = { Browser: 'Hippy/v1.0.0', 'Protocol-Version': '1.1' };
  });

  chromeInspectRouter.get('/json', async (ctx) => {
    const rst = await getTargets({ iwdpPort, host, port, wsPath });
    ctx.body = rst;
  });

  return chromeInspectRouter;
};

/**
 * ios: 通过 IWDP 获取调试页面列表
 */
const getIosTargets = async ({ iwdpPort, host, port, wsPath, clientId }): Promise<DebugPage[]> => {
  try {
    const deviceList = await request({
      url: '/json',
      baseUrl: `http://127.0.0.1:${iwdpPort}`,
      json: true,
    });
    const appClientType = appClientManager.getIosAppClients().map(({ ctor }) => ctor.name);
    const pages: DebugPage[] = await Promise.all(
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
    return pages.flat().map((page) => {
      const targetId = page.webSocketDebuggerUrl;
      const ws = `${host}:${port}${wsPath}?platform=${
        DevicePlatform.IOS
      }&clientId=${clientId}&targetId=${targetId}&role=${ClientRole.Devtools}&appClientType=${encodeURIComponent(
        JSON.stringify(appClientType),
      )}&debugPage=${encodeURIComponent(JSON.stringify(page))}`;
      const matchRst = page.title.match(/^HippyContext:\s(.*)$/);
      const bundleName = matchRst ? matchRst[1] : '';
      return {
        ...page,
        id: targetId,
        clientId,
        thumbnailUrl: '',
        description: page.title,
        devtoolsFrontendUrl: `http://localhost:${port}/front_end/inspector.html?remoteFrontend=true&experiments=true&ws=${encodeURIComponent(
          ws,
        )}`,
        devtoolsFrontendUrlCompat: `http://localhost:${port}/front_end/inspector.html?remoteFrontend=true&experiments=true&ws=${encodeURIComponent(
          ws,
        )}`,
        faviconUrl: bundleName ? 'http://res.imtt.qq.com/hippydoc/img/hippy-logo.ico' : '',
        title: page.title,
        bundleName,
        type: ChromePageType.Page,
        platform: DevicePlatform.IOS,
        url: '',
        webSocketDebuggerUrl: `ws://${ws}`,
      };
    });
  } catch (e) {
    return [];
  }
};

const getAndroidTargets = ({ host, port, wsPath, clientId }) => {
  const appClientType = appClientManager.getAndroidAppClients().map(({ ctor }) => ctor.name);
  return androidTargetManager.getTargets().map(({ id: targetId, ws }) => {
    const wsUrl = `${host}:${port}${wsPath}?platform=${
      DevicePlatform.Android
    }&clientId=${clientId}&targetId=${targetId}&role=${ClientRole.Devtools}&appClientType=${encodeURIComponent(
      JSON.stringify(appClientType),
    )}`;
    return {
      id: targetId || clientId,
      clientId,
      thumbnailUrl: '',
      description: 'Hippy instance',
      devtoolsFrontendUrl: `http://localhost:${port}/front_end/inspector.html?remoteFrontend=true&experiments=true&ws=${encodeURIComponent(
        wsUrl,
      )}`,
      devtoolsFrontendUrlCompat: `http://localhost:${port}/front_end/inspector.html?remoteFrontend=true&experiments=true&ws=${encodeURIComponent(
        wsUrl,
      )}`,
      faviconUrl: 'http://res.imtt.qq.com/hippydoc/img/hippy-logo.ico',
      title: 'Hippy debug tools for V8',
      type: ChromePageType.Page,
      platform: DevicePlatform.Android,
      ws,
      url: '',
      webSocketDebuggerUrl: `ws://${wsUrl}`,
    };
  });
};

let targets: DebugPage[] = [];

export const getTargets = async ({ iwdpPort, host, port, wsPath }) => {
  const clientId = uuidv4();
  let rst: DebugPage[] = [];
  const iosTargets = await getIosTargets({ iwdpPort, host, port, wsPath, clientId });
  const androidTargets = getAndroidTargets({ host, port, wsPath, clientId });
  rst.push(...iosTargets);
  rst.push(...androidTargets);
  targets = rst;
  return rst.map((page) => _.omit(page, ['ws']));
};

/**
 *
 */
export const selectTarget = (id: string) => {
  const target = targets.find((target) => target.id === id);
  if (!target) return;

  return {
    ...messageChannel.addChannel(target),
    target,
  };
};
