import createDebug from 'debug';
import kill from 'kill-port';
import Koa from 'koa';
import serve from 'koa-static';
import path from 'path';
import { startAdbProxy, startIosProxy, startTunnel } from './child-process';
import chromeInspectRouter from './router/chrome-inspect-router';
import { SocketBridge } from './socket-bridge';

const debug = createDebug('server');
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
    useTunnel,
  } = argv;
  if (clearAddrInUse) {
    try {
      await kill(port, 'tcp');
      await kill(iwdpPort, 'tcp');
    } catch (e) {
      return debug('Address already in use!');
    }
  }
  return new Promise((resolve, reject) => {
    const app = new Koa();

    server = app.listen(port, host, () => {
      debug('start koa dev server');
      if (useTunnel) startTunnel({ iwdpPort, iwdpStartPort, iwdpEndPort });
      else if (startIWDP) startIosProxy({ iwdpPort, iwdpStartPort, iwdpEndPort });
      if (startAdb) startAdbProxy(port);

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
    if (staticPath) {
      servePath = path.resolve(staticPath);
    } else {
      servePath = path.resolve(path.dirname(entry));
    }
    debug(`serve bundle: ${entry} \nserve folder: ${servePath}`);
    const serveOption = {
      maxage: 30 * 24 * 60 * 60 * 1000,
    };
    app.use(serve(servePath));
    app.use(serve(path.join(__dirname, 'public'), serveOption));
  });
};

export const stopServer = (exitProcess: boolean = false) => {
  if (!server) {
    if (exitProcess)
      setTimeout(() => {
        process.exit(0);
      }, 100);
    return;
  }
  try {
    debug('stopServer');
    server.close();
    server = null;
    if (exitProcess)
      setTimeout(() => {
        process.exit(0);
      }, 100);
  } catch (e) {
    debug('stopServer error, %j', e);
  }
};

process.on('exit', () => stopServer(true));
// catch ctrl c
process.on('SIGINT', () => stopServer(true));
// catch kill
process.on('SIGTERM', () => stopServer(true));

process.on('unhandledRejection', (e) => {
  debug('unhandledRejection %J', e);
});
