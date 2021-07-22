import Koa from 'koa';
import serve from 'koa-static';
import path from 'path';
import { SocketBridge } from './socket-bridge';
import chromeInspectRouter from './router/chrome-inspect-router';
import { startAdbProxy, startIosProxy } from './child-process';
import { TunnelData } from './@types/tunnel';
import deviceManager from './device-manager';
import { TunnelEvent } from './@types/enum';
import { onMessage } from './message-channel/tunnel';
import { appClientManager } from './client';
import createDebug from 'debug';

const debug = createDebug('server');
// const addon = require('./build/Tunnel.node');
// global.addon = addon;

let server;

export const startServer = (argv) => {
  const {
    host,
    port,
    static: staticPath,
    entry,
    iwdpPort,
  } = argv;
  new Promise((resolve, reject) => {
    const app = new Koa();

    server = app.listen(port, host, () => {
      debug('start koa dev server');
      // startTunnel(iwdpPort);
      startAdbProxy(port);
      startIosProxy(iwdpPort);

      new SocketBridge(server, argv);
      resolve(null);
    });

    server.on('close', () => {
      debug('server is closed.');
      reject();
    });

    app.use(async (ctx, next) => {
      try {
        await next();
      } catch (e) {
        debug(`koa error: %j`, e);
        return (ctx.body = e.msg);
      }
    });

    app.use(chromeInspectRouter(argv).routes()).use(chromeInspectRouter(argv).allowedMethods());

    debug(`serve bundle: ${entry} \nserve folder: ${staticPath}`)
    // if(entry) app.use(serve(entry));
    if(staticPath) app.use(serve(staticPath));
  });
}

export const stopServer = () => {
  if(!server) return;
  server.close();
}

const startTunnel = (iwdpPort) => {
  const adbPath = path.join(__dirname, './build/adb');
  const iwdpParams = `--no-frontend --config=null:${iwdpPort},:${iwdpPort + 100}-${iwdpPort + 200}`
  // global.addon.addEventListener((event, data: TunnelData) => {
  //   debug(`receive tunnel event: ${event}`);

    // if (event === TunnelEvent.GetWebsocketPort) {
    //   // createTunnelClient();
    // } else if ([TunnelEvent.RemoveDevice, TunnelEvent.AddDevice].indexOf(event) !== -1) {
    //   deviceManager.getDeviceList();
    // } else if (event === TunnelEvent.AppConnect) {
    //   deviceManager.appDidConnect();
    // } else if (event === TunnelEvent.appDisconnect) {
    //   deviceManager.appDidDisConnect();
    // } else if (event === TunnelEvent.ReceiveData) {
    //   onMessage(data);
    // }
  // });
  global.addon.tunnelStart(adbPath, iwdpParams);
}

process.on('exit', stopServer);
process.on('SIGINT', stopServer);
