const fs = require('fs');
const Koa = require('koa');
const path = require('path');
const chromeOpen = require('chrome-opn');
const devSupportWsServer = require('./websocketProxy');
const liveReloadWsServer = require('./hippy-livereload');
const {
  getFrameworkVersion,
  logger,
  exec,
  content,
  mimes,
} = require('../utils');

async function startDevServer(args) {
  const {
    entry = 'dist/dev/index.bundle',
    host = '127.0.0.1',
    port = 38989,
  } = args;

  if (!getFrameworkVersion()) {
    throw new Error('The current folder is not containing Hippy project.');
  }

  const app = new Koa();

  const staticPath = path.resolve('./dist/dev');

  function parseMime(url) {
    let extName = path.extname(url);
    extName = extName ? extName.slice(1) : 'unknown';
    return mimes[extName];
  }

  app.use((ctx) => {
    // Response jsbundle for debugging
    if (ctx.url === 'index.bundle') {
      const jsContent = fs.readFileSync(entry);
      ctx.res.writeHead(200, {
        'Content-Type': 'application/javascript',
      });
      ctx.res.write(jsContent);
      return ctx.res.end();
    }

    // Read the file content from specific path
    const contentStr = content(ctx, staticPath);
    const mimeType = parseMime(ctx.url);

    if (mimeType) {
      ctx.type = mimeType;
    }

    if (mimeType && mimeType.indexOf('image/') >= 0) {
      ctx.res.writeHead(200);
      ctx.res.write(contentStr, 'binary');
      return ctx.res.end();
    }

    if (ctx.url === '/json') {
      const jsonReturn = `[{
        "description": "hippy instance",
        "devtoolsFrontendUrl": "chrome-devtools://devtools/bundled/js_app.html?experiments=true&v8only=true&ws=${host}:${port}/debugger-proxy?role=chrome",
        "devtoolsFrontendUrlCompat": "chrome-devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=${host}:${port}/debugger-proxy?role=chrome",
        "faviconUrl": "http://res.imtt.qq.com/hippydoc/img/hippy-logo.ico",
        "title": "Hippy debug tools for V8",
        "type": "node",
        "url": "",
        "webSocketDebuggerUrl": "ws://${host}:${port}/debugger-proxy?role=chrome"
      }]`;
      ctx.res.writeHead(200, {
        'Content-Type': 'application/json; charset=UTF-8',
        'Content-Length': jsonReturn.length,
      });
      ctx.res.write(jsonReturn);
      return ctx.res.end();
    }

    if (ctx.url === '/json/version') {
      const versionReturn = `{
        "Browser": "Hippy/v1.0.0",
        "Protocol-Version": "1.1"
      }`;
      ctx.res.writeHead(200, {
        'Content-Type': 'application/json; charset=UTF-8',
        'Content-Length': versionReturn.length,
      });
      ctx.res.write(versionReturn);
      return ctx.res.end();
    }

    ctx.res.writeHead(200, {
      'Content-Type': 'application/javascript',
    });
    ctx.res.write(contentStr);
    return ctx.res.end();
  });

  const serverInstance = app.listen(port, host, () => {
    exec('adb', ['reverse', '--remove-all'])
      .then(() => exec('adb', ['reverse', `tcp:${port}`, `tcp:${port}`]))
      .catch((err) => {
        logger.warn(`Port reverse failed, please execute command manually if you need android debugging: adb reverse --remove-all && adb reverse tcp:${port} tcp:${port}`);
        logger.error(err);
      });
    devSupportWsServer.startWebsocketProxyServer(serverInstance, '/debugger-proxy');
    liveReloadWsServer.startLiveReloadServer(serverInstance, '/debugger-live-reload');
    chromeOpen('chrome://inspect');
    logger.info('Hippy debug server is started, you can open "chrome://inspect" in Chrome to debug your Hippy app now.');
  });
}

module.exports = startDevServer;
