import createDebug from 'debug';
import fs from 'fs';
import kill from 'kill-port';
import Koa from 'koa';
import serve from 'koa-static';
import path from 'path';
import { DevtoolsEnv } from './@types/enum';
import { DebugTarget } from './@types/tunnel.d';
import { onExit, startAdbProxy, startIosProxy, startTunnel } from './child-process';
import { initHippyEnv, initTdfEnv, initVoltronEnv } from './client';
import { config } from './config';
import { DebugTargetManager, getChromeInspectRouter } from './router/chrome-inspect-router';
import { SocketServer } from './socket-server';

const debug = createDebug('server');

export class Application {
  private static argv: Application.StartServerArgv;
  private static server;
  private static socketServer: SocketServer;

  public static async startServer(argv: Application.StartServerArgv) {
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
      env,
    } = argv;
    Application.argv = argv;
    Application.init();
    Application.setEnv(env as DevtoolsEnv);

    if (clearAddrInUse) {
      try {
        await kill(port, 'tcp');
        await kill(iwdpPort, 'tcp');
      } catch (e) {
        debug('Address already in use!');
        return process.exit(1);
      }
    }
    return new Promise((resolve, reject) => {
      const app = new Koa();

      Application.server = app.listen(port, host, () => {
        debug('start koa dev server');
        if (useTunnel) startTunnel({ iwdpPort, iwdpStartPort, iwdpEndPort });
        else if (startIWDP) startIosProxy({ iwdpPort, iwdpStartPort, iwdpEndPort });
        if (startAdb) startAdbProxy(port);

        Application.socketServer = new SocketServer(Application.server, argv);
        Application.socketServer.start();
        resolve(null);
      });

      Application.server.on('close', () => {
        debug('server is closed.');
        reject();
      });

      app.use(async (ctx, next) => {
        try {
          await next();
        } catch (e) {
          debug('koa error: %j', e);
          return (ctx.body = e.msg);
        }
      });

      const chromeInspectRouter = getChromeInspectRouter(argv);
      app.use(chromeInspectRouter.routes()).use(chromeInspectRouter.allowedMethods());

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
  }

  public static stopServer(exitProcess = false) {
    if (!Application.server) {
      if (exitProcess)
        setTimeout(() => {
          process.exit(0);
        }, 100);
      return;
    }
    try {
      debug('stopServer');
      Application.server.close();
      Application.server = null;
      if (exitProcess)
        setTimeout(() => {
          process.exit(0);
        }, 100);
    } catch (e) {
      debug('stopServer error, %j', e);
    }
  }

  public static exit() {
    onExit();
  }

  public static selectDebugTarget(id: string) {
    const debugTarget = DebugTargetManager.findTarget(id);
    this.socketServer.selectDebugTarget(debugTarget);
  }

  public static getDebugTargets(): Promise<DebugTarget[]> {
    const { iwdpPort, host, port, wsPath } = Application.argv;
    return DebugTargetManager.getDebugTargets({ iwdpPort, host, port, wsPath });
  }

  public static sendMessage(msg: Adapter.CDP.Req) {
    Application.socketServer.sendMessage(msg);
  }

  public static registerDomainListener(domain, listener) {
    Application.socketServer.registerDomainListener(domain, listener);
  }

  private static init() {
    return fs.promises.mkdir(config.cachePath, { recursive: true });
  }

  private static setEnv(env: DevtoolsEnv) {
    if (env === DevtoolsEnv.Hippy) initHippyEnv();
    else if (env === DevtoolsEnv.Voltron) initVoltronEnv();
    else if (env === DevtoolsEnv.TDF) initTdfEnv();
  }
}

process.on('exit', () => Application.stopServer(true));
// catch ctrl c
process.on('SIGINT', () => Application.stopServer(true));
// catch kill
process.on('SIGTERM', () => Application.stopServer(true));

process.on('unhandledRejection', (e) => {
  debug('unhandledRejection %j', e);
});
