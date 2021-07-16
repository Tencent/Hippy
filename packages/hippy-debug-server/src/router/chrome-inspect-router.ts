import { AppClientType, ChromePageType } from '../@types/enum';
import Router from 'koa-router';
import request from 'request-promise';
import { DevicePlatform, ClientType } from 'src/@types/enum';
import deviceManager from '../device-manager';
import { v4 as uuidv4 } from 'uuid';
import { DebugPage } from '../@types/tunnel'
import fs from 'fs';
import androidPageManager from '../android-pages-manager';
// import path from 'path';

export default ({
  host,
  port,
  iwdpPort,
  wsPath,
  entry,
}) => {
  const chromeInspectRouter = new Router();

  chromeInspectRouter.get('/json/version', (ctx) => {
    ctx.body = { Browser: 'Hippy/v1.0.0', 'Protocol-Version': '1.1' };
  });

  chromeInspectRouter.get('/json', async (ctx) => {
    const device = deviceManager.getCurrent();
    let rst: DebugPage[];
    // ios: 通过 IWDP 获取调试页面列表
    if(device?.platform === DevicePlatform.IOS) {
      const pages = await fetchTargets(iwdpPort);
      rst = pages.map(page => {
        const targetId = page.webSocketDebuggerUrl;
        const clientId = uuidv4();
        const ws = `${host}:${port}${
          wsPath
        }?clientId=${clientId}&targetId=${targetId}&from=${ClientType.Devtools}&role=chrome&appClientType=${AppClientType.IosProxy}&debugPage=${encodeURIComponent(
          JSON.stringify(page),
        )}`;
        return {
          id: targetId,
          thumbnailUrl: '',
          description: page.title,
          devtoolsFrontendUrl: `chrome-devtools://devtools/bundled/inspector.html?experiments=true&ws=${encodeURIComponent(ws)}`,
          devtoolsFrontendUrlCompat: `chrome-devtools://devtools/bundled/inspector.html?experiments=true&ws=${encodeURIComponent(ws)}`,
          faviconUrl: 'http://res.imtt.qq.com/hippydoc/img/hippy-logo.ico',
          title: page.title,
          type: ChromePageType.Page,
          url: '',
          webSocketDebuggerUrl: `ws://${ws}`,
        }
      });
    }
    else {
      rst = androidPageManager.getPages().map(targetId => {
        const clientId = uuidv4();
        const appClientType = androidPageManager.useTunnel ? AppClientType.Tunnel : AppClientType.WS;
        const ws = `${host}:${port}${wsPath}?clientId=${clientId}&targetId=${targetId}&role=chrome&from=${ClientType.Devtools}&appClientType=${appClientType}`;
        return {
          id: targetId || clientId,
          thumbnailUrl: '',
          description: 'Hippy instance',
          devtoolsFrontendUrl: `chrome-devtools://devtools/bundled/inspector.html?experiments=true&ws=${encodeURIComponent(ws)}`,
          devtoolsFrontendUrlCompat: `chrome-devtools://devtools/bundled/inspector.html?experiments=true&ws=${encodeURIComponent(ws)}`,
          faviconUrl: 'http://res.imtt.qq.com/hippydoc/img/hippy-logo.ico',
          title: 'Hippy debug tools for V8',
          type: ChromePageType.Page,
          url: '',
          webSocketDebuggerUrl: `ws://${ws}`,
        };
      });
    }

    ctx.body = rst;
  });

  if(entry)
    chromeInspectRouter.get('/index.bundle', ctx => {
      ctx.res.writeHead(200, {
        'content-type': 'application/javascript',
      });
      ctx.body = fs.createReadStream(entry);
    })

  return chromeInspectRouter;
}


const fetchTargets = async (iwdpPort): Promise<DebugPage[]> => {
  const deviceList = await request({
    url: '/json',
    baseUrl: `http://127.0.0.1:${iwdpPort}`,
    json: true,
  });
  const pages = await Promise.all(deviceList.map(async device => {
    const port = device.url.match(/:(\d+)/)[1];
    const targets = await request({
      url: '/json',
      baseUrl: `http://127.0.0.1:${port}`,
      json: true,
    });
    targets.map(target => target.device = device);
    return targets;
  }))
  return pages.flat() as DebugPage[];
}
