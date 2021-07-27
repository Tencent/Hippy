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
import kill from 'kill-port';

const debug = createDebug('server');
// const addon = require('./build/Tunnel.node');
// global.addon = addon;

let server;

export const startServer = async (argv) => {
  const {
    host,
    port,
    static: staticPath,
    entry,
    iwdpPort,
    iwdpStartPort,
    iwdpEndPort,
    startAdb,
    startIWDP,
    clearAddrInUse,
  } = argv;
  if(clearAddrInUse) {
    try {
      await kill(port, 'tcp');
      await kill(iwdpPort, 'tcp');
    }
    catch(e) {
      return debug('Address already in use!');
    }
  }
  return new Promise((resolve, reject) => {
    const app = new Koa();

    server = app.listen(port, host, () => {
      debug('start koa dev server');
      // startTunnel(iwdpPort);
      if(startAdb)
        startAdbProxy(port);
      if(startIWDP)
        startIosProxy(iwdpPort, iwdpStartPort, iwdpEndPort);

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

    let servePath;
    if(staticPath) {
      servePath = path.resolve(staticPath);
    } else {
      servePath = path.resolve(path.dirname(entry));
    }
    debug(`serve bundle: ${entry} \nserve folder: ${servePath}`)
    const serveOption = {
      maxage: 30 * 24 * 60 * 60 * 1000,
    };
    app.use(serve(servePath));
    app.use(serve(path.join(__dirname, 'public'), serveOption));
  });
}

export const stopServer = (exitProcess: boolean = false) => {
  if(!server) {
    if(exitProcess)
      setTimeout(() => {
        process.exit(0);
      }, 100);
    return;
  }
  try {
    debug('stopServer');
    server.close();
    server = null;
    if(exitProcess)
      setTimeout(() => {
        process.exit(0);
      }, 100);
  }
  catch(e) {
    debug('stopServer error, %j', e);
  }
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
  // addon.tunnelStart(adbPath, iwdpParams);
}

process.on('exit', () => stopServer(true));
// catch ctrl c
process.on('SIGINT', () => stopServer(true));
// catch kill
process.on('SIGTERM', () => stopServer(true));
