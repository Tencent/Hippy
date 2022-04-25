/**
 * copy form webpack-dev-server, modify to support Hippy HMR
 */
'use strict';

const os = require('os');
const path = require('path');
const url = require('url');
const util = require('util');
const fs = require('graceful-fs');
const ipaddr = require('ipaddr.js');
const express = require('express');
const { validate } = require('schema-utils');
const WebSocket = require('ws');
const { get } = require('lodash');
const colors = require('colors/safe');
const { HMREvent, GatewayFamily } = require('@debug-server-next/@types/enum');
const { encodeHMRData } = require('@debug-server-next/utils/buffer');
const { getWSProtocolByHttpProtocol, makeUrl } = require('@debug-server-next/utils/url');
const { saveDevPort, injectEntry } = require('@debug-server-next/utils/webpack');
const { internalIP, internalIPSync } = require('@debug-server-next/utils/ip');
const { startAdbProxy } = require('@debug-server-next/child-process/adb');
const schema = require('./options.json');

if (!process.env.WEBPACK_SERVE) {
  process.env.WEBPACK_SERVE = true;
}

class Server {
  constructor(options = {}, compiler, cb) {
    // TODO: remove this after plugin support is published
    if (options.hooks) {
      util.deprecate(
        () => {},
        "Using 'compiler' as the first argument is deprecated. Please use 'options' as the first argument and 'compiler' as the second argument.",
        'DEP_WEBPACK_DEV_SERVER_CONSTRUCTOR',
      )();

      [options = {}, compiler] = [compiler, options];
    }

    validate(schema, options, 'webpack Dev Server');

    this.options = options;
    this.staticWatchers = [];
    this.listeners = [];
    // Keep track of websocket proxies for external websocket upgrade.
    this.webSocketProxies = [];
    this.sockets = [];
    this.compiler = compiler;
    this.currentHash = null;
    this.cb = cb || (() => {});
    this.msgQueue = [];
    this.hadSyncBundleResource = false;
  }

  static get DEFAULT_STATS() {
    return {
      all: false,
      hash: true,
      warnings: true,
      errors: true,
      errorDetails: false,
    };
  }

  static isAbsoluteURL(URL) {
    // Don't match Windows paths `c:\`
    if (/^[a-zA-Z]:\\/.test(URL)) {
      return false;
    }

    // Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
    // Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
    return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(URL);
  }

  static async getHostname(hostname) {
    if (hostname === 'local-ip') {
      return (await internalIP(GatewayFamily.V4)) || (await internalIP(GatewayFamily.V6)) || '0.0.0.0';
    }
    if (hostname === 'local-ipv4') {
      return (await internalIP(GatewayFamily.V4)) || '0.0.0.0';
    }
    if (hostname === 'local-ipv6') {
      return (await internalIP(GatewayFamily.V6)) || '::';
    }

    return hostname || 'localhost';
  }

  static async getFreePort(port) {
    if (typeof port !== 'undefined' && port !== null && port !== 'auto') {
      return port;
    }

    const pRetry = require('p-retry');
    const portfinder = require('portfinder');

    portfinder.basePort = process.env.WEBPACK_DEV_SERVER_BASE_PORT || 39000;

    // Try to find unused port and listen on it for 3 times,
    // if port is not specified in options.
    const defaultPortRetry = parseInt(process.env.WEBPACK_DEV_SERVER_PORT_RETRY, 10) || 3;

    return pRetry(() => portfinder.getPortPromise(), {
      retries: defaultPortRetry,
    });
  }

  static findCacheDir() {
    const cwd = process.cwd();

    let dir = cwd;

    for (;;) {
      try {
        if (fs.statSync(path.join(dir, 'package.json')).isFile()) break;
        // eslint-disable-next-line no-empty
      } catch (e) {}

      const parent = path.dirname(dir);

      if (dir === parent) {
        // eslint-disable-next-line no-undefined
        dir = undefined;
        break;
      }

      dir = parent;
    }

    if (!dir) {
      return path.resolve(cwd, '.cache/webpack-dev-server');
    }
    if (process.versions.pnp === '1') {
      return path.resolve(dir, '.pnp/.cache/webpack-dev-server');
    }
    if (process.versions.pnp === '3') {
      return path.resolve(dir, '.yarn/.cache/webpack-dev-server');
    }

    return path.resolve(dir, 'node_modules/.cache/webpack-dev-server');
  }

  addAdditionalEntries(compiler) {
    if (!this.options.remote) return;
    const { appendEntries: hmrAppendEntries, prependEntries: hmrPrependEntries } = this.addHMREntries(compiler);
    const { appendEntries: vueAppendEntries, prependEntries: vuePrependEntries } = this.addVueDevtoolsEntries();

    // must ensure correct inject sequence, because the append entries depend on the prepend and original entries.
    injectEntry(
      compiler,
      undefined,
      [...hmrPrependEntries, ...vuePrependEntries],
      [...hmrAppendEntries, ...vueAppendEntries],
    );
  }

  addHMREntries(compiler) {
    const appendEntries = [];
    const prependEntries = [];
    const isWebTarget = compiler.options.externalsPresets
      ? compiler.options.externalsPresets.web
      : [
          'web',
          'webworker',
          'electron-preload',
          'electron-renderer',
          'node-webkit',
          // eslint-disable-next-line no-undefined
          undefined,
          null,
        ].includes(compiler.options.target);

    // TODO maybe empty empty client
    if (this.options.client && isWebTarget) {
      let webSocketURL = '';

      const { host, port, protocol } = this.options.remote;
      const searchParams = new URLSearchParams();
      searchParams.set('protocol', `${getWSProtocolByHttpProtocol(protocol)}:`);
      searchParams.set('hostname', host);
      searchParams.set('port', String(port));
      searchParams.set('pathname', '/debugger-proxy');
      searchParams.set('role', 'hmr_client');
      searchParams.set('hash', this.options.id);

      if (typeof this.options.client.logging !== 'undefined') {
        searchParams.set('logging', this.options.client.logging);
      }

      searchParams.set('hot', Boolean(this.options.hot));
      searchParams.set('liveReload', Boolean(this.options.liveReload));
      searchParams.set('progress', Boolean(this.options.client.progress));
      searchParams.set('overlay', false);
      searchParams.set('reconnect', this.options.client.reconnect || 10);

      webSocketURL = searchParams.toString();

      appendEntries.push(`${require.resolve('../client/index.js')}?${webSocketURL}`);
    }

    if (this.options.hot) {
      let hotEntry;
      if (this.options.hot === 'only') {
        hotEntry = require.resolve('../client/hot/only-dev-server');
      } else if (this.options.hot) {
        hotEntry = require.resolve('../client/hot/dev-server');
      }
      appendEntries.push(hotEntry);
    }
    return { appendEntries, prependEntries };
  }

  addVueDevtoolsEntries() {
    if (!this.options.vueDevtools) return { appendEntries: [], prependEntries: [] };
    const { host, port, protocol } = this.options.remote;
    const vueBackend = makeUrl(require.resolve('@hippy/hippy-vue-devtools-plugin/lib/backend'), {
      host,
      port,
      protocol,
    });
    const vueHook = require.resolve('@hippy/hippy-vue-devtools-plugin/lib/hook');
    return {
      appendEntries: [vueBackend],
      prependEntries: [vueHook],
    };
  }

  getCompilerOptions() {
    if (typeof this.compiler.compilers !== 'undefined') {
      if (this.compiler.compilers.length === 1) {
        return this.compiler.compilers[0].options;
      }

      // Configuration with the `devServer` options
      const compilerWithDevServer = this.compiler.compilers.find((config) => config.options.devServer);

      if (compilerWithDevServer) {
        return compilerWithDevServer.options;
      }

      // Configuration with `web` preset
      const isTarget = (config) =>
        [
          'web',
          'webworker',
          'electron-preload',
          'electron-renderer',
          'node-webkit',
          // eslint-disable-next-line no-undefined
          undefined,
          null,
        ].includes(config.options.target);
      const compilerWithWebPreset = this.compiler.compilers.find(
        (config) => (config.options.externalsPresets && config.options.externalsPresets.web) || isTarget(config),
      );

      if (compilerWithWebPreset) {
        return compilerWithWebPreset.options;
      }

      // Fallback
      return this.compiler.compilers[0].options;
    }

    return this.compiler.options;
  }

  async normalizeOptions() {
    const { options } = this;

    if (!this.logger) {
      this.logger = this.compiler.getInfrastructureLogger('webpack-dev-server');
    }

    const compilerOptions = this.getCompilerOptions();
    // TODO remove `{}` after drop webpack v4 support
    const compilerWatchOptions = compilerOptions.watchOptions || {};
    const getWatchOptions = (watchOptions = {}) => {
      const getPolling = () => {
        if (typeof watchOptions.usePolling !== 'undefined') {
          return watchOptions.usePolling;
        }

        if (typeof watchOptions.poll !== 'undefined') {
          return Boolean(watchOptions.poll);
        }

        if (typeof compilerWatchOptions.poll !== 'undefined') {
          return Boolean(compilerWatchOptions.poll);
        }

        return false;
      };
      const getInterval = () => {
        if (typeof watchOptions.interval !== 'undefined') {
          return watchOptions.interval;
        }

        if (typeof watchOptions.poll === 'number') {
          return watchOptions.poll;
        }

        if (typeof compilerWatchOptions.poll === 'number') {
          return compilerWatchOptions.poll;
        }
      };

      const usePolling = getPolling();
      const interval = getInterval();
      const { poll, ...rest } = watchOptions;

      return {
        ignoreInitial: true,
        persistent: true,
        followSymlinks: false,
        atomic: false,
        alwaysStat: true,
        ignorePermissionErrors: true,
        // Respect options from compiler watchOptions
        usePolling,
        interval,
        ignored: watchOptions.ignored,
        // TODO: we respect these options for all watch options and allow
        // developers to pass them to chokidar, but chokidar doesn't have
        // these options maybe we need revisit that in future
        ...rest,
      };
    };
    const getStaticItem = (optionsForStatic) => {
      const getDefaultStaticOptions = () => ({
        directory: path.join(process.cwd(), 'public'),
        staticOptions: {},
        publicPath: ['/'],
        serveIndex: { icons: true },
        watch: getWatchOptions(),
      });

      let item;

      if (typeof optionsForStatic === 'undefined') {
        item = getDefaultStaticOptions();
      } else if (typeof optionsForStatic === 'string') {
        item = {
          ...getDefaultStaticOptions(),
          directory: optionsForStatic,
        };
      } else {
        const def = getDefaultStaticOptions();

        item = {
          directory: typeof optionsForStatic.directory !== 'undefined' ? optionsForStatic.directory : def.directory,
          // TODO: do merge in the next major release
          staticOptions:
            typeof optionsForStatic.staticOptions !== 'undefined' ? optionsForStatic.staticOptions : def.staticOptions,
          publicPath: typeof optionsForStatic.publicPath !== 'undefined' ? optionsForStatic.publicPath : def.publicPath,
          // TODO: do merge in the next major release
          serveIndex:
            // eslint-disable-next-line no-nested-ternary
            typeof optionsForStatic.serveIndex !== 'undefined'
              ? typeof optionsForStatic.serveIndex === 'boolean' && optionsForStatic.serveIndex
                ? def.serveIndex
                : optionsForStatic.serveIndex
              : def.serveIndex,
          watch:
            // eslint-disable-next-line no-nested-ternary
            typeof optionsForStatic.watch !== 'undefined'
              ? typeof optionsForStatic.watch === 'boolean'
                ? optionsForStatic.watch
                  ? def.watch
                  : false
                : getWatchOptions(optionsForStatic.watch)
              : def.watch,
        };
      }

      if (Server.isAbsoluteURL(item.directory)) {
        throw new Error('Using a URL as static.directory is not supported');
      }

      // ensure that publicPath is an array
      if (typeof item.publicPath === 'string') {
        item.publicPath = [item.publicPath];
      }

      return item;
    };

    if (typeof options.allowedHosts === 'undefined') {
      // AllowedHosts allows some default hosts picked from `options.host` or `webSocketURL.hostname` and `localhost`
      options.allowedHosts = 'auto';
    } else if (
      typeof options.allowedHosts === 'string' &&
      options.allowedHosts !== 'auto' &&
      options.allowedHosts !== 'all'
    ) {
      // We store allowedHosts as array when supplied as string
      options.allowedHosts = [options.allowedHosts];
    } else if (Array.isArray(options.allowedHosts) && options.allowedHosts.includes('all')) {
      // CLI pass options as array, we should normalize them
      options.allowedHosts = 'all';
    }

    if (typeof options.bonjour === 'undefined') {
      options.bonjour = false;
    } else if (typeof options.bonjour === 'boolean') {
      options.bonjour = options.bonjour ? {} : false;
    }

    if (typeof options.client === 'undefined' || (typeof options.client === 'object' && options.client !== null)) {
      if (!options.client) {
        options.client = {};
      }

      // Disable client overlay by default
      if (typeof options.client.overlay === 'undefined') {
        options.client.overlay = false;
      } else if (typeof options.client.overlay !== 'boolean') {
        options.client.overlay = {
          errors: true,
          warnings: true,
          ...options.client.overlay,
        };
      }

      if (typeof options.client.reconnect === 'undefined') {
        options.client.reconnect = 10;
      } else if (options.client.reconnect === true) {
        options.client.reconnect = Infinity;
      } else if (options.client.reconnect === false) {
        options.client.reconnect = 0;
      }

      // Respect infrastructureLogging.level
      if (typeof options.client.logging === 'undefined') {
        options.client.logging = compilerOptions.infrastructureLogging
          ? compilerOptions.infrastructureLogging.level
          : 'info';
      }
    }

    if (typeof options.compress === 'undefined') {
      options.compress = true;
    }

    if (typeof options.devMiddleware === 'undefined') {
      options.devMiddleware = {};
    }

    // No need to normalize `headers`

    if (typeof options.historyApiFallback === 'undefined') {
      options.historyApiFallback = false;
    } else if (typeof options.historyApiFallback === 'boolean' && options.historyApiFallback) {
      options.historyApiFallback = {};
    }

    // No need to normalize `host`

    options.hot = typeof options.hot === 'boolean' || options.hot === 'only' ? options.hot : true;

    const isHTTPs = Boolean(options.https);
    const isSPDY = Boolean(options.http2);

    if (isHTTPs || isSPDY) {
      // TODO: remove in the next major release
      util.deprecate(
        () => {},
        `'${isHTTPs ? 'https' : 'http2'}' option is deprecated. Please use the 'server' option.`,
        `DEP_WEBPACK_DEV_SERVER_${isHTTPs ? 'HTTPS' : 'HTTP2'}`,
      )();
    }

    options.server = {
      type:
        // eslint-disable-next-line no-nested-ternary
        typeof options.server === 'string'
          ? options.server
          : typeof (options.server || {}).type === 'string'
          ? options.server.type
          : isSPDY
          ? 'spdy'
          : isHTTPs
          ? 'https'
          : 'http',
      options: {
        ...options.https,
        ...(options.server || {}).options,
      },
    };

    if (options.server.type === 'spdy' && typeof options.server.options.spdy === 'undefined') {
      options.server.options.spdy = {
        protocols: ['h2', 'http/1.1'],
      };
    }

    if (options.server.type === 'https' || options.server.type === 'spdy') {
      if (typeof options.server.options.requestCert === 'undefined') {
        options.server.options.requestCert = false;
      }

      // TODO remove the `cacert` option in favor `ca` in the next major release
      for (const property of ['cacert', 'ca', 'cert', 'crl', 'key', 'pfx']) {
        if (typeof options.server.options[property] === 'undefined') {
          // eslint-disable-next-line no-continue
          continue;
        }

        const value = options.server.options[property];
        const readFile = (item) => {
          if (Buffer.isBuffer(item) || (typeof item === 'object' && item !== null && !Array.isArray(item))) {
            return item;
          }

          if (item) {
            let stats = null;

            try {
              stats = fs.lstatSync(fs.realpathSync(item)).isFile();
            } catch (error) {
              // Ignore error
            }

            // It is file
            return stats ? fs.readFileSync(item) : item;
          }
        };

        options.server.options[property] = Array.isArray(value) ? value.map((item) => readFile(item)) : readFile(value);
      }

      let fakeCert;

      if (!options.server.options.key || !options.server.options.cert) {
        const certificateDir = Server.findCacheDir();
        const certificatePath = path.join(certificateDir, 'server.pem');
        let certificateExists;

        try {
          const certificate = await fs.promises.stat(certificatePath);
          certificateExists = certificate.isFile();
        } catch {
          certificateExists = false;
        }

        if (certificateExists) {
          const certificateTtl = 1000 * 60 * 60 * 24;
          const certificateStat = await fs.promises.stat(certificatePath);

          const now = new Date();

          // cert is more than 30 days old, kill it with fire
          if ((now - certificateStat.ctime) / certificateTtl > 30) {
            const del = require('del');

            this.logger.info('SSL certificate is more than 30 days old. Removing...');

            await del([certificatePath], { force: true });

            certificateExists = false;
          }
        }

        if (!certificateExists) {
          this.logger.info('Generating SSL certificate...');

          const selfsigned = require('selfsigned');
          const attributes = [{ name: 'commonName', value: 'localhost' }];
          const pems = selfsigned.generate(attributes, {
            algorithm: 'sha256',
            days: 30,
            keySize: 2048,
            extensions: [
              {
                name: 'basicConstraints',
                cA: true,
              },
              {
                name: 'keyUsage',
                keyCertSign: true,
                digitalSignature: true,
                nonRepudiation: true,
                keyEncipherment: true,
                dataEncipherment: true,
              },
              {
                name: 'extKeyUsage',
                serverAuth: true,
                clientAuth: true,
                codeSigning: true,
                timeStamping: true,
              },
              {
                name: 'subjectAltName',
                altNames: [
                  {
                    // type 2 is DNS
                    type: 2,
                    value: 'localhost',
                  },
                  {
                    type: 2,
                    value: 'localhost.localdomain',
                  },
                  {
                    type: 2,
                    value: 'lvh.me',
                  },
                  {
                    type: 2,
                    value: '*.lvh.me',
                  },
                  {
                    type: 2,
                    value: '[::1]',
                  },
                  {
                    // type 7 is IP
                    type: 7,
                    ip: '127.0.0.1',
                  },
                  {
                    type: 7,
                    ip: 'fe80::1',
                  },
                ],
              },
            ],
          });

          await fs.promises.mkdir(certificateDir, { recursive: true });

          await fs.promises.writeFile(certificatePath, pems.private + pems.cert, {
            encoding: 'utf8',
          });
        }

        fakeCert = await fs.promises.readFile(certificatePath);

        this.logger.info(`SSL certificate: ${certificatePath}`);
      }

      if (options.server.options.cacert) {
        if (options.server.options.ca) {
          this.logger.warn("Do not specify 'ca' and 'cacert' options together, the 'ca' option will be used.");
        } else {
          options.server.options.ca = options.server.options.cacert;
        }

        delete options.server.options.cacert;
      }

      options.server.options.key = options.server.options.key || fakeCert;
      options.server.options.cert = options.server.options.cert || fakeCert;
    }

    options.liveReload = typeof options.liveReload !== 'undefined' ? options.liveReload : true;

    // https://github.com/webpack/webpack-dev-server/issues/1990
    const defaultOpenOptions = { wait: false };
    const getOpenItemsFromObject = ({ target, ...rest }) => {
      const normalizedOptions = { ...defaultOpenOptions, ...rest };

      if (typeof normalizedOptions.app === 'string') {
        normalizedOptions.app = {
          name: normalizedOptions.app,
        };
      }

      const normalizedTarget = typeof target === 'undefined' ? '<url>' : target;

      if (Array.isArray(normalizedTarget)) {
        return normalizedTarget.map((singleTarget) => ({ target: singleTarget, options: normalizedOptions }));
      }

      return [{ target: normalizedTarget, options: normalizedOptions }];
    };

    if (typeof options.open === 'undefined') {
      options.open = [];
    } else if (typeof options.open === 'boolean') {
      options.open = options.open ? [{ target: '<url>', options: defaultOpenOptions }] : [];
    } else if (typeof options.open === 'string') {
      options.open = [{ target: options.open, options: defaultOpenOptions }];
    } else if (Array.isArray(options.open)) {
      const result = [];

      options.open.forEach((item) => {
        if (typeof item === 'string') {
          result.push({ target: item, options: defaultOpenOptions });

          return;
        }

        result.push(...getOpenItemsFromObject(item));
      });

      options.open = result;
    } else {
      options.open = [...getOpenItemsFromObject(options.open)];
    }

    if (typeof options.port === 'string' && options.port !== 'auto') {
      options.port = Number(options.port);
    }

    if (typeof options.setupExitSignals === 'undefined') {
      options.setupExitSignals = true;
    }

    if (typeof options.static === 'undefined') {
      options.static = [getStaticItem()];
    } else if (typeof options.static === 'boolean') {
      options.static = options.static ? [getStaticItem()] : false;
    } else if (typeof options.static === 'string') {
      options.static = [getStaticItem(options.static)];
    } else if (Array.isArray(options.static)) {
      options.static = options.static.map((item) => {
        if (typeof item === 'string') {
          return getStaticItem(item);
        }

        return getStaticItem(item);
      });
    } else {
      options.static = [getStaticItem(options.static)];
    }

    if (typeof options.watchFiles === 'string') {
      options.watchFiles = [{ paths: options.watchFiles, options: getWatchOptions() }];
    } else if (
      typeof options.watchFiles === 'object' &&
      options.watchFiles !== null &&
      !Array.isArray(options.watchFiles)
    ) {
      options.watchFiles = [
        {
          paths: options.watchFiles.paths,
          options: getWatchOptions(options.watchFiles.options || {}),
        },
      ];
    } else if (Array.isArray(options.watchFiles)) {
      options.watchFiles = options.watchFiles.map((item) => {
        if (typeof item === 'string') {
          return { paths: item, options: getWatchOptions() };
        }

        return {
          paths: item.paths,
          options: getWatchOptions(item.options || {}),
        };
      });
    } else {
      options.watchFiles = [];
    }

    options.host = await Server.getHostname(options.host);
    options.port = await Server.getFreePort(options.port);
  }

  setupProgressPlugin() {
    const { ProgressPlugin } = this.compiler.webpack || require('webpack');

    new ProgressPlugin((percent, msg, addInfo, pluginName) => {
      percent = Math.floor(percent * 100);

      if (percent === 100) {
        msg = 'Compilation completed';
      }

      if (addInfo) {
        msg = `${msg} (${addInfo})`;
      }

      if (this.webSocketClient) {
        this.sendMessage({
          messages: [
            {
              type: HMREvent.ProgressUpdate,
              data: {
                percent,
                msg,
                pluginName,
              },
            },
          ],
        });
      }

      if (this.server) {
        this.server.emit(HMREvent.ProgressUpdate, { percent, msg, pluginName });
      }
    }).apply(this.compiler);
  }

  async initialize() {
    const compilers = this.compiler.compilers || [this.compiler];

    compilers.forEach((compiler) => {
      this.addAdditionalEntries(compiler);

      const webpack = compiler.webpack || require('webpack');

      // TODO remove after drop webpack v4 support
      compiler.options.plugins = compiler.options.plugins || [];

      if (this.options.hot) {
        const HMRPluginExists = compiler.options.plugins.find(
          (p) => p.constructor === webpack.HotModuleReplacementPlugin,
        );

        if (HMRPluginExists) {
          this.logger.warn(
            '"hot: true" automatically applies HMR plugin, you don\'t have to add it manually to your webpack configuration.',
          );
        } else {
          // Apply the HMR plugin
          const plugin = new webpack.HotModuleReplacementPlugin();

          plugin.apply(compiler);
        }
      }
    });

    if (this.options.client && this.options.client.progress) {
      this.setupProgressPlugin();
    }

    this.setupAdbReverse();
    this.setupHooks();
    this.setupApp();
    this.setupHostHeaderCheck();
    this.setupDevMiddleware();
    // Should be after `webpack-dev-middleware`, otherwise other middlewares might rewrite response
    this.setupBuiltInRoutes();
    this.setupWatchFiles();
    this.setupFeatures();
    this.createServer();

    if (this.options.setupExitSignals) {
      const signals = ['SIGINT', 'SIGTERM'];

      let needForceShutdown = false;

      signals.forEach((signal) => {
        const listener = () => {
          if (needForceShutdown) {
            // eslint-disable-next-line no-process-exit
            process.exit();
          }

          this.logger.info('Gracefully shutting down. To force exit, press ^C again. Please wait...');

          needForceShutdown = true;

          this.stopCallback(() => {
            if (typeof this.compiler.close === 'function') {
              this.compiler.close(() => {
                // eslint-disable-next-line no-process-exit
                process.exit();
              });
            } else {
              // eslint-disable-next-line no-process-exit
              process.exit();
            }
          });
        };

        this.listeners.push({ name: signal, listener });

        process.on(signal, listener);
      });
    }
  }

  setupApp() {
    // Init express server
    // eslint-disable-next-line new-cap
    this.app = new express();
  }

  getWebpackStats(statsObj) {
    const stats = Server.DEFAULT_STATS;
    const compilerOptions = this.getCompilerOptions();

    if (compilerOptions.stats && compilerOptions.stats.warningsFilter) {
      stats.warningsFilter = compilerOptions.stats.warningsFilter;
    }

    return statsObj.toJson(stats);
  }

  async setupAdbReverse() {
    await saveDevPort(this.options.port);
    await startAdbProxy();
  }

  setupHooks() {
    this.compiler.hooks.failed.tap('webpack-dev-server', (error) => {
      this.cb(error);
    });
    this.compiler.hooks.invalid.tap('webpack-dev-server', () => {
      this.sendMessage({
        messages: [
          {
            type: HMREvent.Invalid,
          },
        ],
      });
    });
    this.compiler.hooks.done.tap('webpack-dev-server', async (stats) => {
      if (!this.webSocketClient) {
        await this.createWebSocketClient();
      }
      this.stats = stats;
      this.cb(null, stats);
      this.sendStatsWithOption(this.getWebpackStats(stats));
    });
    this.setupEmitHooks();
  }

  setupEmitHooks() {
    const { compiler } = this;
    compiler.hooks.emit.tap('webpack-dev-server', (compilation) => {
      this.emitMap = new Map();

      compiler.hooks.assetEmitted.tap('webpack-dev-server', (file, info) => {
        let content = null;
        let targetName = null;

        if (info.compilation) {
          ({ targetPath: targetName, content } = info);
        } else {
          let targetFile = file;
          const queryStringIdx = targetFile.indexOf('?');
          if (queryStringIdx >= 0) {
            targetFile = targetFile.substr(0, queryStringIdx);
          }
          targetName = targetFile;
          content = info;
        }

        /**
         * targetName may be absolute or relative path
         * target file name must be relative to outputPath
         */
        const name = path.relative(this.compiler.outputPath, path.resolve(this.compiler.outputPath, targetName))
        this.emitMap.set(targetName, {
          name,
          content: content,
          isHMRResource: (/hot-update\.js(on)?(\.map)?$/.test(file)),
        });
      });
    });
  }

  setupHostHeaderCheck() {
    this.app.all('*', (req, res, next) => {
      if (this.checkHeader(req.headers, 'host')) {
        return next();
      }

      res.send('Invalid Host header');
    });
  }

  setupDevMiddleware() {
    const webpackDevMiddleware = require('webpack-dev-middleware');

    // middleware for serving webpack bundle
    this.middleware = webpackDevMiddleware(this.compiler, this.options.devMiddleware);
  }

  setupBuiltInRoutes() {
    const { app, middleware } = this;

    app.get('/__webpack_dev_server__/sockjs.bundle.js', (req, res) => {
      res.setHeader('Content-Type', 'application/javascript');

      const { createReadStream } = fs;
      const clientPath = path.join(__dirname, '..', 'client');

      createReadStream(path.join(clientPath, 'modules/sockjs-client/index.js')).pipe(res);
    });

    app.get('/webpack-dev-server/invalidate', (_req, res) => {
      this.invalidate();

      res.end();
    });

    app.get('/webpack-dev-server', (req, res) => {
      middleware.waitUntilValid((stats) => {
        res.setHeader('Content-Type', 'text/html');
        res.write('<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body>');

        const statsForPrint = typeof stats.stats !== 'undefined' ? stats.toJson().children : [stats.toJson()];

        res.write('<h1>Assets Report:</h1>');

        statsForPrint.forEach((item, index) => {
          res.write('<div>');

          const name = item.name || (stats.stats ? `unnamed[${index}]` : 'unnamed');

          res.write(`<h2>Compilation: ${name}</h2>`);
          res.write('<ul>');

          const publicPath = item.publicPath === 'auto' ? '' : item.publicPath;

          for (const asset of item.assets) {
            const assetName = asset.name;
            const assetURL = `${publicPath}${assetName}`;

            res.write(`<li>
              <strong><a href="${assetURL}" target="_blank">${assetName}</a></strong>
            </li>`);
          }

          res.write('</ul>');
          res.write('</div>');
        });

        res.end('</body></html>');
      });
    });
  }

  setupCompressFeature() {
    const compress = require('compression');

    this.app.use(compress());
  }

  setupHistoryApiFallbackFeature() {
    const { historyApiFallback } = this.options;

    if (typeof historyApiFallback.logger === 'undefined' && !historyApiFallback.verbose) {
      historyApiFallback.logger = this.logger.log.bind(this.logger, '[connect-history-api-fallback]');
    }

    // Fall back to /index.html if nothing else matches.
    this.app.use(require('connect-history-api-fallback')(historyApiFallback));
  }

  setupStaticFeature() {
    this.options.static.forEach((staticOption) => {
      staticOption.publicPath.forEach((publicPath) => {
        this.app.use(publicPath, express.static(staticOption.directory, staticOption.staticOptions));
      });
    });
  }

  setupStaticServeIndexFeature() {
    const serveIndex = require('serve-index');

    this.options.static.forEach((staticOption) => {
      staticOption.publicPath.forEach((publicPath) => {
        if (staticOption.serveIndex) {
          this.app.use(publicPath, (req, res, next) => {
            // serve-index doesn't fallthrough non-get/head request to next middleware
            if (req.method !== 'GET' && req.method !== 'HEAD') {
              return next();
            }

            serveIndex(staticOption.directory, staticOption.serveIndex)(req, res, next);
          });
        }
      });
    });
  }

  setupStaticWatchFeature() {
    this.options.static.forEach((staticOption) => {
      if (staticOption.watch) {
        this.watchFiles(staticOption.directory, staticOption.watch);
      }
    });
  }

  setupOnBeforeSetupMiddlewareFeature() {
    this.options.onBeforeSetupMiddleware(this);
  }

  setupWatchFiles() {
    const { watchFiles } = this.options;

    if (watchFiles.length > 0) {
      watchFiles.forEach((item) => {
        this.watchFiles(item.paths, item.options);
      });
    }
  }

  setupMiddleware() {
    this.app.use(this.middleware);
  }

  setupOnAfterSetupMiddlewareFeature() {
    this.options.onAfterSetupMiddleware(this);
  }

  setupHeadersFeature() {
    this.app.all('*', this.setHeaders.bind(this));
  }

  setupFeatures() {
    const features = {
      compress: () => {
        if (this.options.compress) {
          this.setupCompressFeature();
        }
      },
      historyApiFallback: () => {
        if (this.options.historyApiFallback) {
          this.setupHistoryApiFallbackFeature();
        }
      },
      static: () => {
        this.setupStaticFeature();
      },
      staticServeIndex: () => {
        this.setupStaticServeIndexFeature();
      },
      staticWatch: () => {
        this.setupStaticWatchFeature();
      },
      onBeforeSetupMiddleware: () => {
        if (typeof this.options.onBeforeSetupMiddleware === 'function') {
          this.setupOnBeforeSetupMiddlewareFeature();
        }
      },
      onAfterSetupMiddleware: () => {
        if (typeof this.options.onAfterSetupMiddleware === 'function') {
          this.setupOnAfterSetupMiddlewareFeature();
        }
      },
      middleware: () => {
        // include our middleware to ensure
        // it is able to handle '/index.html' request after redirect
        this.setupMiddleware();
      },
      headers: () => {
        this.setupHeadersFeature();
      },
    };

    const runnableFeatures = [];

    // compress is placed last and uses unshift so that it will be the first middleware used
    if (this.options.compress) {
      runnableFeatures.push('compress');
    }

    if (this.options.onBeforeSetupMiddleware) {
      runnableFeatures.push('onBeforeSetupMiddleware');
    }

    runnableFeatures.push('headers', 'middleware');

    if (this.options.static) {
      runnableFeatures.push('static');
    }

    if (this.options.historyApiFallback) {
      runnableFeatures.push('historyApiFallback', 'middleware');

      if (this.options.static) {
        runnableFeatures.push('static');
      }
    }

    if (this.options.static) {
      runnableFeatures.push('staticServeIndex', 'staticWatch');
    }

    if (this.options.onAfterSetupMiddleware) {
      runnableFeatures.push('onAfterSetupMiddleware');
    }

    runnableFeatures.forEach((feature) => {
      features[feature]();
    });
  }

  createServer() {
    // eslint-disable-next-line import/no-dynamic-require
    this.server = require(this.options.server.type).createServer(this.options.server.options, this.app);

    this.server.on('connection', (socket) => {
      // Add socket to list
      this.sockets.push(socket);

      socket.once('close', () => {
        // Remove socket from list
        this.sockets.splice(this.sockets.indexOf(socket), 1);
      });
    });

    this.server.on('error', (error) => {
      this.logger.error('start hippy dev server error: ', error);
      throw error;
    });
  }

  createWebSocketClient() {
    if (!this.options.remote) return;
    return new Promise((resolve, reject) => {
      const { host, port, protocol, proxy } = this.options.remote;
      const webSocketURL = `${getWSProtocolByHttpProtocol(
        protocol,
      )}://${host}:${port}/debugger-proxy?role=hmr_server&hash=${this.options.id}`;

      this.webSocketClient = new WebSocket(webSocketURL);
      this.webSocketClient.on('open', () => {
        this.logger.info('HMR websocket client is connected.');
        this.msgQueue.map((hmrData) => this.sendMessage(hmrData));
        this.msgQueue = [];
        resolve();
      });
      this.webSocketClient.on('ping', () => {
        this.webSocketClient.pong();
      });
      this.webSocketClient.on('close', (code, reason) => {
        this.logger.warn(
          `HMR websocket is closed(${code}), will try to reconnect when you modify source code. ${reason}`,
        );
      });
      this.webSocketClient.on('error', (e) => {
        this.logger.warn('HMR websocket error: ', e);
        if (host === '127.0.0.1' || host === 'localhost') {
          this.logger.warn(
            'Hippy use @hippy/debug-server-next to transit HMR message, connect to debug server failed, recommend to run `npm run hippy:debug` first!',
          );
        }

        if (e.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
          this.logger.info(
            `if you are behind a proxy server(such as whistle, charles), you should run 'export NODE_EXTRA_CA_CERTS=<path_to_whistle_rootCA>' first to resolve full key chain!`,
          );
        }
        if (this.webSocketClient.readyState === WebSocket.CLOSING) reject();
      });
    });
  }

  async sendStatsWithOption() {
    if (!this.stats) {
      return;
    }

    const stats = this.getWebpackStats(this.stats);
    const messages = [
      {
        type: HMREvent.Hash,
        data: stats.hash,
      },
    ];

    const { hmrResources, otherResources } = this.getEmitList();
    const allResource = [...otherResources, ...hmrResources];
    if (allResource.length === 0) return;

    const syncQueue = [];
    /**
     * hot reload will always sync all file
     * hmr will sync all file at first time, in other case will sync patch files in priority 
     */
    if (this.hadSyncBundleResource && this.options.hot) {
      syncQueue.push(hmrResources, otherResources);
    } else {
      syncQueue.push(allResource);
    }

    const hmrData = {
      emitList: syncQueue.shift(),
      messages,
    };

    if (this.options.hot === true || this.options.hot === 'only') {
      this.logger.info('enable HMR');
    }

    if (this.options.liveReload) {
      this.logger.info('enable live reload');
    }

    const shouldEmit =
      stats &&
      (!stats.errors || stats.errors.length === 0) &&
      (!stats.warnings || stats.warnings.length === 0) &&
      this.currentHash === stats.hash;

    if (shouldEmit) {
      messages.push({
        type: HMREvent.StillOk,
      });
      delete hmrData.emitList;
    } else {
      this.currentHash = stats.hash;

      if (stats.errors.length > 0 || stats.warnings.length > 0) {
        const hasErrors = stats.errors.length > 0;

        if (stats.warnings.length > 0) {
          let params;

          if (hasErrors) {
            params = { preventReloading: true };
          }

          messages.push({
            type: HMREvent.Warnings,
            data: stats.warnings,
            params,
          });
        }

        if (stats.errors.length > 0) {
          messages.push({
            type: HMREvent.Errors,
            data: stats.errors,
          });
        }
      } else {
        messages.push({
          type: HMREvent.Ok,
        });
      }
    }

    this.sendMessage({
      ...hmrData,
      hadSyncBundleResource: this.hadSyncBundleResource,
    });
    if (syncQueue.length) {
      this.sendMessage({
        emitList: syncQueue.pop(),
        hadSyncBundleResource: true,
      });
    }
    this.hadSyncBundleResource = true;
  }

  openBrowser(defaultOpenTarget) {
    const open = require('open');

    Promise.all(
      this.options.open.map((item) => {
        let openTarget;

        if (item.target === '<url>') {
          openTarget = defaultOpenTarget;
        } else {
          openTarget = Server.isAbsoluteURL(item.target)
            ? item.target
            : new URL(item.target, defaultOpenTarget).toString();
        }

        return open(openTarget, item.options).catch(() => {
          this.logger.warn(
            `Unable to open "${openTarget}" page${
              // eslint-disable-next-line no-nested-ternary
              item.options.app
                ? ` in "${item.options.app.name}" app${
                    item.options.app.arguments ? ` with "${item.options.app.arguments.join(' ')}" arguments` : ''
                  }`
                : ''
            }. If you are running in a headless environment, please do not use the "open" option or related flags like "--open", "--open-target", and "--open-app".`,
          );
        });
      }),
    );
  }

  stopBonjour(callback = () => {}) {
    this.bonjour.unpublishAll(() => {
      this.bonjour.destroy();

      if (callback) {
        callback();
      }
    });
  }

  runBonjour() {
    this.bonjour = require('bonjour')();
    this.bonjour.publish({
      name: `Webpack Dev Server ${os.hostname()}:${this.options.port}`,
      port: this.options.port,
      type: this.options.server.type === 'http' ? 'http' : 'https',
      subtypes: ['webpack'],
      ...this.options.bonjour,
    });
  }

  logStatus() {
    const protocol = this.options.server.type === 'http' ? 'http' : 'https';
    const { address, port } = this.server.address();
    const prettyPrintURL = (newHostname) => url.format({ protocol, hostname: newHostname, port, pathname: '/' });

    let server;
    let localhost;
    let loopbackIPv4;
    let loopbackIPv6;
    let networkUrlIPv4;
    let networkUrlIPv6;

    if (this.options.host) {
      if (this.options.host === 'localhost') {
        localhost = prettyPrintURL('localhost');
      } else {
        let isIP;

        try {
          isIP = ipaddr.parse(this.options.host);
        } catch (error) {
          // Ignore
        }

        if (!isIP) {
          server = prettyPrintURL(this.options.host);
        }
      }
    }

    const parsedIP = ipaddr.parse(address);

    if (parsedIP.range() === 'unspecified') {
      localhost = prettyPrintURL('localhost');

      const networkIPv4 = internalIPSync(GatewayFamily.V4);

      if (networkIPv4) {
        networkUrlIPv4 = prettyPrintURL(networkIPv4);
      }

      const networkIPv6 = internalIPSync(GatewayFamily.V6);

      if (networkIPv6) {
        networkUrlIPv6 = prettyPrintURL(networkIPv6);
      }
    } else if (parsedIP.range() === 'loopback') {
      if (parsedIP.kind() === 'ipv4') {
        loopbackIPv4 = prettyPrintURL(parsedIP.toString());
      } else if (parsedIP.kind() === 'ipv6') {
        loopbackIPv6 = prettyPrintURL(parsedIP.toString());
      }
    } else {
      networkUrlIPv4 =
        parsedIP.kind() === 'ipv6' && parsedIP.isIPv4MappedAddress()
          ? prettyPrintURL(parsedIP.toIPv4Address().toString())
          : prettyPrintURL(address);

      if (parsedIP.kind() === 'ipv6') {
        networkUrlIPv6 = prettyPrintURL(address);
      }
    }

    this.logger.info('Project is running at:');

    if (server) {
      this.logger.info(`Server: ${colors.cyan(server)}`);
    }

    if (localhost || loopbackIPv4 || loopbackIPv6) {
      const loopbacks = []
        .concat(localhost ? [colors.cyan(localhost)] : [])
        .concat(loopbackIPv4 ? [colors.cyan(loopbackIPv4)] : [])
        .concat(loopbackIPv6 ? [colors.cyan(loopbackIPv6)] : []);

      this.logger.info(`Loopback: ${loopbacks.join(', ')}`);
    }

    if (networkUrlIPv4) {
      this.logger.info(`On Your Network (IPv4): ${colors.cyan(networkUrlIPv4)}`);
    }

    if (networkUrlIPv6) {
      this.logger.info(`On Your Network (IPv6): ${colors.cyan(networkUrlIPv6)}`);
    }

    if (this.options.open.length > 0) {
      const openTarget = prettyPrintURL(this.options.host || 'localhost');

      this.openBrowser(openTarget);
    }

    if (this.options.static && this.options.static.length > 0) {
      this.logger.info(
        `Content not from webpack is served from '${colors.cyan(
          this.options.static.map((staticOption) => staticOption.directory).join(', '),
        )}' directory`,
      );
    }

    if (this.options.historyApiFallback) {
      this.logger.info(
        `404s will fallback to '${colors.cyan(this.options.historyApiFallback.index || '/index.html')}'`,
      );
    }

    if (this.options.bonjour) {
      const bonjourProtocol = this.options.bonjour.type || this.options.server.type === 'http' ? 'http' : 'https';

      this.logger.info(`Broadcasting "${bonjourProtocol}" with subtype of "webpack" via ZeroConf DNS (Bonjour)`);
    }
  }

  setHeaders(req, res, next) {
    let { headers } = this.options;

    if (headers) {
      if (typeof headers === 'function') {
        headers = headers(req, res, this.middleware.context);
      }

      const allHeaders = [];

      if (!Array.isArray(headers)) {
        // eslint-disable-next-line guard-for-in
        for (const name in headers) {
          allHeaders.push({ key: name, value: headers[name] });
        }
        headers = allHeaders;
      }

      headers.forEach((header) => {
        res.setHeader(header.key, header.value);
      });
    }

    next();
  }

  checkHeader(headers, headerToCheck) {
    // allow user to opt out of this security check, at their own risk
    // by explicitly enabling allowedHosts
    if (this.options.allowedHosts === 'all') {
      return true;
    }

    // get the Host header and extract hostname
    // we don't care about port not matching
    const hostHeader = headers[headerToCheck];

    if (!hostHeader) {
      return false;
    }

    if (/^(file|.+-extension):/i.test(hostHeader)) {
      return true;
    }

    // use the node url-parser to retrieve the hostname from the host-header.
    const { hostname } = url.parse(
      // if hostHeader doesn't have scheme, add // for parsing.
      /^(.+:)?\/\//.test(hostHeader) ? hostHeader : `//${hostHeader}`,
      false,
      true,
    );

    // always allow requests with explicit IPv4 or IPv6-address.
    // A note on IPv6 addresses:
    // hostHeader will always contain the brackets denoting
    // an IPv6-address in URLs,
    // these are removed from the hostname in url.parse(),
    // so we have the pure IPv6-address in hostname.
    // always allow localhost host, for convenience (hostname === 'localhost')
    // allow hostname of listening address  (hostname === this.options.host)
    const isValidHostname =
      ipaddr.IPv4.isValid(hostname) ||
      ipaddr.IPv6.isValid(hostname) ||
      hostname === 'localhost' ||
      hostname === this.options.host;

    if (isValidHostname) {
      return true;
    }

    const { allowedHosts } = this.options;

    // always allow localhost host, for convenience
    // allow if hostname is in allowedHosts
    if (Array.isArray(allowedHosts) && allowedHosts.length > 0) {
      for (let hostIdx = 0; hostIdx < allowedHosts.length; hostIdx++) {
        const allowedHost = allowedHosts[hostIdx];

        if (allowedHost === hostname) {
          return true;
        }

        // support "." as a subdomain wildcard
        // e.g. ".example.com" will allow "example.com", "www.example.com", "subdomain.example.com", etc
        if (allowedHost[0] === '.') {
          // "example.com"  (hostname === allowedHost.substring(1))
          // "*.example.com"  (hostname.endsWith(allowedHost))
          if (hostname === allowedHost.substring(1) || hostname.endsWith(allowedHost)) {
            return true;
          }
        }
      }
    }

    // disallow
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  async sendMessage(hmrWsData) {
    if (this.webSocketClient) {
      if (this.webSocketClient.readyState === WebSocket.OPEN) {
        const encoded = encodeHMRData({
          ...hmrWsData,
          publicPath: get(this.compiler, 'options.output.publicPath'),
        });
        this.webSocketClient.send(encoded);
      } else if (this.webSocketClient.readyState === WebSocket.CLOSED) {
        this.msgQueue.push(hmrWsData);
        this.createWebSocketClient();
      }
    }
  }

  getEmitList() {
    const { emitMap } = this;
    const emitList = Array.from(emitMap.values());
    if (!emitList || emitList.length === 0) {
      return {
        hmrResources: [],
        otherResources: [],
      };
    }

    const hmrResources = emitList.filter((item) => item.isHMRResource);
    const otherResources = emitList.filter((item) => !item.isHMRResource);
    return {
      hmrResources,
      otherResources,
    };
  }

  watchFiles(watchPath, watchOptions) {
    const chokidar = require('chokidar');
    const watcher = chokidar.watch(watchPath, watchOptions);

    // disabling refreshing on changing the content
    if (this.options.liveReload) {
      watcher.on('change', (item) => {
        this.sendMessage({
          messages: [
            {
              type: HMREvent.StaticChanged,
              data: item,
            },
          ],
        });
      });
    }

    this.staticWatchers.push(watcher);
  }

  invalidate(callback) {
    if (this.middleware) {
      this.middleware.invalidate(callback);
    }
  }

  async start() {
    await this.normalizeOptions();

    await this.initialize();

    const listenOptions = { host: this.options.host, port: this.options.port };

    await new Promise((resolve) => {
      this.server.listen(this.options.port, this.options.host, () => {
        resolve();
      });
    });

    if (this.options.bonjour) {
      this.runBonjour();
    }

    this.logStatus();

    if (typeof this.options.onListening === 'function') {
      this.options.onListening(this);
    }
  }

  startCallback(callback = () => {}) {
    this.start()
      .then(() => callback(null), callback)
      .catch(callback);
  }

  async stop() {
    if (this.bonjour) {
      await new Promise((resolve) => {
        this.stopBonjour(() => {
          resolve();
        });
      });
    }

    this.webSocketProxies = [];

    await Promise.all(this.staticWatchers.map((watcher) => watcher.close()));

    this.staticWatchers = [];

    this.webSocketClient.terminate();

    if (this.server) {
      await new Promise((resolve) => {
        this.server.close(() => {
          this.server = null;

          resolve();
        });

        for (const socket of this.sockets) {
          socket.destroy();
        }

        this.sockets = [];
      });

      if (this.middleware) {
        await new Promise((resolve, reject) => {
          this.middleware.close((error) => {
            if (error) {
              reject(error);

              return;
            }

            resolve();
          });
        });

        this.middleware = null;
      }
    }

    // We add listeners to signals when creating a new Server instance
    // So ensure they are removed to prevent EventEmitter memory leak warnings
    for (const item of this.listeners) {
      process.removeListener(item.name, item.listener);
    }
  }

  stopCallback(callback = () => {}) {
    this.stop()
      .then(() => callback(null), callback)
      .catch(callback);
  }

  // TODO remove in the next major release
  close(callback) {
    util.deprecate(
      () => {},
      "'close' is deprecated. Please use async 'stop' or 'stopCallback' methods.",
      'DEP_WEBPACK_DEV_SERVER_CLOSE',
    )();

    return this.stop()
      .then(() => {
        if (callback) {
          callback(null);
        }
      })
      .catch((error) => {
        if (callback) {
          callback(error);
        }
      });
  }
}

const mergeExports = (obj, exports) => {
  const descriptors = Object.getOwnPropertyDescriptors(exports);

  for (const name of Object.keys(descriptors)) {
    const descriptor = descriptors[name];

    if (descriptor.get) {
      const fn = descriptor.get;

      Object.defineProperty(obj, name, {
        configurable: false,
        enumerable: true,
        get: fn,
      });
    } else if (typeof descriptor.value === 'object') {
      Object.defineProperty(obj, name, {
        configurable: false,
        enumerable: true,
        writable: false,
        value: mergeExports({}, descriptor.value),
      });
    } else {
      throw new Error('Exposed values must be either a getter or an nested object');
    }
  }

  return Object.freeze(obj);
};

module.exports = mergeExports(Server, {
  get schema() {
    return schema;
  },
  // TODO compatibility with webpack v4, remove it after drop
  cli: {
    get getArguments() {
      return () => require('../bin/cli-flags');
    },
    get processArguments() {
      return require('../bin/process-arguments');
    },
  },
});
