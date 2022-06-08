'use strict';

const os = require('os');
const path = require('path');
const url = require('url');
const util = require('util');
const fs = require('graceful-fs');
const ipaddr = require('ipaddr.js');
const defaultGateway = require('default-gateway');
const express = require('express');
const { validate } = require('schema-utils');
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
        'Using \'compiler\' as the first argument is deprecated. Please use \'options\' as the first argument and \'compiler\' as the second argument.',
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

  static findIp(gateway) {
    const gatewayIp = ipaddr.parse(gateway);

    // Look for the matching interface in all local interfaces.
    for (const addresses of Object.values(os.networkInterfaces())) {
      for (const { cidr } of addresses) {
        const net = ipaddr.parseCIDR(cidr);

        if (net[0] && net[0].kind() === gatewayIp.kind() && gatewayIp.match(net)) {
          return net[0].toString();
        }
      }
    }
  }

  static async internalIP(family) {
    try {
      const { gateway } = await defaultGateway[family]();
      return Server.findIp(gateway);
    } catch {
      // ignore
    }
  }

  static internalIPSync(family) {
    try {
      const { gateway } = defaultGateway[family].sync();
      return Server.findIp(gateway);
    } catch {
      // ignore
    }
  }

  static async getHostname(hostname) {
    if (hostname === 'local-ip') {
      return (await Server.internalIP('v4')) || (await Server.internalIP('v6')) || '0.0.0.0';
    }
    if (hostname === 'local-ipv4') {
      return (await Server.internalIP('v4')) || '0.0.0.0';
    }
    if (hostname === 'local-ipv6') {
      return (await Server.internalIP('v6')) || '::';
    }

    return hostname;
  }

  static async getFreePort(port) {
    if (typeof port !== 'undefined' && port !== null && port !== 'auto') {
      return port;
    }

    const pRetry = require('p-retry');
    const portfinder = require('portfinder');

    portfinder.basePort = process.env.WEBPACK_DEV_SERVER_BASE_PORT || 38988;

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
    const additionalEntries = [];

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
      if (this.options.webSocketServer) {
        const searchParams = new URLSearchParams();

        /** @type {"ws:" | "wss:" | "http:" | "https:" | "auto:"} */
        let protocol;

        // We are proxying dev server and need to specify custom `hostname`
        if (typeof this.options.client.webSocketURL.protocol !== 'undefined') {
          protocol = this.options.client.webSocketURL.protocol;
        } else {
          protocol = this.options.server.type === 'http' ? 'ws:' : 'wss:';
        }

        searchParams.set('protocol', protocol);

        if (typeof this.options.client.webSocketURL.username !== 'undefined') {
          searchParams.set('username', this.options.client.webSocketURL.username);
        }

        if (typeof this.options.client.webSocketURL.password !== 'undefined') {
          searchParams.set('password', this.options.client.webSocketURL.password);
        }

        /** @type {string} */
        let hostname;

        // SockJS is not supported server mode, so `hostname` and `port` can't specified, let's ignore them
        // TODO show warning about this
        const isSockJSType = this.options.webSocketServer.type === 'sockjs';

        // We are proxying dev server and need to specify custom `hostname`
        if (typeof this.options.client.webSocketURL.hostname !== 'undefined') {
          hostname = this.options.client.webSocketURL.hostname;
        } else if (typeof this.options.webSocketServer.options.host !== 'undefined' && !isSockJSType) {
          // Web socket server works on custom `hostname`,
          // only for `ws` because `sock-js` is not support custom `hostname`
          hostname = this.options.webSocketServer.options.host;
        } else if (typeof this.options.host !== 'undefined') {
          // The `host` option is specified
          hostname = this.options.host;
        } else {
          // The `port` option is not specified
          hostname = '0.0.0.0';
        }

        searchParams.set('hostname', hostname);

        /** @type {number | string} */
        let port;

        // We are proxying dev server and need to specify custom `port`
        if (typeof this.options.client.webSocketURL.port !== 'undefined') {
          port = this.options.client.webSocketURL.port;
        } else if (typeof this.options.webSocketServer.options.port !== 'undefined' && !isSockJSType) {
          // Web socket server works on custom `port`, only for `ws` because `sock-js` is not support custom `port`
          port = this.options.webSocketServer.options.port;
        } else if (typeof this.options.port === 'number') {
          // The `port` option is specified
          port = this.options.port;
        } else if (typeof this.options.port === 'string' && this.options.port !== 'auto') {
          // The `port` option is specified using `string`
          port = Number(this.options.port);
        } else {
          // The `port` option is not specified or set to `auto`
          port = '0';
        }

        searchParams.set('port', String(port));

        /** @type {string} */
        let pathname = '';

        // We are proxying dev server and need to specify custom `pathname`
        if (typeof this.options.client.webSocketURL.pathname !== 'undefined') {
          pathname = this.options.client.webSocketURL.pathname;
        } else if (
          typeof this.options.webSocketServer.options.prefix !== 'undefined'
          || typeof this.options.webSocketServer.options.path !== 'undefined'
        ) {
          // Web socket server works on custom `path`
          pathname = this.options.webSocketServer.options.prefix || this.options.webSocketServer.options.path;
        }

        searchParams.set('pathname', pathname);

        if (typeof this.options.client.logging !== 'undefined') {
          searchParams.set('logging', this.options.client.logging);
        }

        if (typeof this.options.client.reconnect !== 'undefined') {
          searchParams.set('reconnect', this.options.client.reconnect);
        }

        webSocketURL = searchParams.toString();
      }

      additionalEntries.push(`${require.resolve('../client/index.js')}?${webSocketURL}`);
    }

    if (this.options.hot) {
      let hotEntry;

      if (this.options.hot === 'only') {
        hotEntry = require.resolve('../client/hot/only-dev-server');
      } else if (this.options.hot) {
        hotEntry = require.resolve('../client/hot/dev-server');
      }

      additionalEntries.push(hotEntry);
    }

    const webpack = compiler.webpack || require('webpack');

    // use a hook to add entries if available
    if (typeof webpack.EntryPlugin !== 'undefined') {
      for (const additionalEntry of additionalEntries) {
        new webpack.EntryPlugin(compiler.context, additionalEntry, {
          // eslint-disable-next-line no-undefined
          name: undefined,
        }).apply(compiler);
      }
    } else {
      // TODO remove after drop webpack v4 support
      /**
       * prependEntry Method for webpack 4
       * @param {Entry} originalEntry
       * @param {Entry} newAdditionalEntries
       * @returns {Entry}
       */
      const prependEntry = (originalEntry, newAdditionalEntries) => {
        if (typeof originalEntry === 'function') {
          return () => Promise.resolve(originalEntry()).then(entry => prependEntry(entry, newAdditionalEntries));
        }

        if (typeof originalEntry === 'object' && !Array.isArray(originalEntry)) {
          /** @type {Object<string,string>} */
          const clone = {};

          Object.keys(originalEntry).forEach((key) => {
            // entry[key] should be a string here
            const entryDescription = originalEntry[key];

            clone[key] = prependEntry(entryDescription, newAdditionalEntries);
          });

          return clone;
        }

        // in this case, entry is a string or an array.
        // make sure that we do not add duplicates.
        /** @type {Entry} */
        const entriesClone = additionalEntries.slice(0);

        [].concat(originalEntry).forEach((newEntry) => {
          if (!entriesClone.includes(newEntry)) {
            entriesClone.push(newEntry);
          }
        });

        return entriesClone;
      };

      compiler.options.entry = prependEntry(compiler.options.entry || './src', additionalEntries);
      compiler.hooks.entryOption.call(compiler.options.context, compiler.options.entry);
    }
  }

  getCompilerOptions() {
    if (typeof this.compiler.compilers !== 'undefined') {
      if (this.compiler.compilers.length === 1) {
        return this.compiler.compilers[0].options;
      }

      // Configuration with the `devServer` options
      const compilerWithDevServer = this.compiler.compilers.find(config => config.options.devServer);

      if (compilerWithDevServer) {
        return compilerWithDevServer.options;
      }

      // Configuration with `web` preset
      const isTarget = config => [
        'web',
        'webworker',
        'electron-preload',
        'electron-renderer',
        'node-webkit',
        // eslint-disable-next-line no-undefined
        undefined,
        null,
      ].includes(config.options.target);
      const compilerWithWebPreset = this.compiler.compilers
        .find(config => (config.options.externalsPresets && config.options.externalsPresets.web) || isTarget(config));

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
              ?              typeof optionsForStatic.watch === 'boolean'
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
      typeof options.allowedHosts === 'string'
      && options.allowedHosts !== 'auto'
      && options.allowedHosts !== 'all'
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

      if (typeof options.client.webSocketURL === 'undefined') {
        options.client.webSocketURL = {};
      } else if (typeof options.client.webSocketURL === 'string') {
        const parsedURL = new URL(options.client.webSocketURL);

        options.client.webSocketURL = {
          protocol: parsedURL.protocol,
          hostname: parsedURL.hostname,
          port: parsedURL.port.length > 0 ? Number(parsedURL.port) : '',
          pathname: parsedURL.pathname,
          username: parsedURL.username,
          password: parsedURL.password,
        };
      } else if (typeof options.client.webSocketURL.port === 'string') {
        options.client.webSocketURL.port = Number(options.client.webSocketURL.port);
      }

      // Enable client overlay by default
      if (typeof options.client.overlay === 'undefined') {
        options.client.overlay = true;
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

        options.server.options[property] = Array.isArray(value) ? value.map(item => readFile(item)) : readFile(value);
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
          this.logger.warn('Do not specify \'ca\' and \'cacert\' options together, the \'ca\' option will be used.');
        } else {
          options.server.options.ca = options.server.options.cacert;
        }

        delete options.server.options.cacert;
      }

      options.server.options.key = options.server.options.key || fakeCert;
      options.server.options.cert = options.server.options.cert || fakeCert;
    }

    if (typeof options.ipc === 'boolean') {
      const isWindows = process.platform === 'win32';
      const pipePrefix = isWindows ? '\\\\.\\pipe\\' : os.tmpdir();
      const pipeName = 'webpack-dev-server.sock';

      options.ipc = path.join(pipePrefix, pipeName);
    }

    options.liveReload = typeof options.liveReload !== 'undefined' ? options.liveReload : true;

    options.magicHtml = typeof options.magicHtml !== 'undefined' ? options.magicHtml : true;

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
        return normalizedTarget.map(singleTarget => ({ target: singleTarget, options: normalizedOptions }));
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

    /**
     * Assume a proxy configuration specified as:
     * proxy: {
     *   'context': { options }
     * }
     * OR
     * proxy: {
     *   'context': 'target'
     * }
     */
    if (typeof options.proxy !== 'undefined') {
      // TODO remove in the next major release, only accept `Array`
      if (!Array.isArray(options.proxy)) {
        if (
          Object.prototype.hasOwnProperty.call(options.proxy, 'target')
          || Object.prototype.hasOwnProperty.call(options.proxy, 'router')
        ) {
          options.proxy = [options.proxy];
        } else {
          options.proxy = Object.keys(options.proxy).map((context) => {
            let proxyOptions;
            // For backwards compatibility reasons.
            const correctedContext = context.replace(/^\*$/, '**').replace(/\/\*$/, '');

            if (typeof options.proxy[context] === 'string') {
              proxyOptions = {
                context: correctedContext,
                target: options.proxy[context],
              };
            } else {
              proxyOptions = { ...options.proxy[context] };
              proxyOptions.context = correctedContext;
            }

            return proxyOptions;
          });
        }
      }

      options.proxy = options.proxy.map((item) => {
        const getLogLevelForProxy = (level) => {
          if (level === 'none') {
            return 'silent';
          }

          if (level === 'log') {
            return 'info';
          }

          if (level === 'verbose') {
            return 'debug';
          }

          return level;
        };

        if (typeof item.logLevel === 'undefined') {
          item.logLevel = getLogLevelForProxy(compilerOptions.infrastructureLogging ? compilerOptions.infrastructureLogging.level : 'info');
        }

        if (typeof item.logProvider === 'undefined') {
          item.logProvider = () => this.logger;
        }

        return item;
      });
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
      typeof options.watchFiles === 'object'
      && options.watchFiles !== null
      && !Array.isArray(options.watchFiles)
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

    const defaultWebSocketServerType = 'ws';
    const defaultWebSocketServerOptions = { path: '/ws' };

    if (typeof options.webSocketServer === 'undefined') {
      options.webSocketServer = {
        type: defaultWebSocketServerType,
        options: defaultWebSocketServerOptions,
      };
    } else if (typeof options.webSocketServer === 'boolean' && !options.webSocketServer) {
      options.webSocketServer = false;
    } else if (typeof options.webSocketServer === 'string' || typeof options.webSocketServer === 'function') {
      options.webSocketServer = {
        type: options.webSocketServer,
        options: defaultWebSocketServerOptions,
      };
    } else {
      options.webSocketServer = {
        type: options.webSocketServer.type || defaultWebSocketServerType,
        options: {
          ...defaultWebSocketServerOptions,
          ...options.webSocketServer.options,
        },
      };

      if (typeof options.webSocketServer.options.port === 'string') {
        options.webSocketServer.options.port = Number(options.webSocketServer.options.port);
      }
    }
  }

  getClientTransport() {
    return require.resolve('../client/clients/WebSocketClient');
  }

  getServerTransport() {
    let implementation;
    let implementationFound = true;

    switch (typeof this.options.webSocketServer.type) {
      case 'string':
        // Could be 'sockjs', in the future 'ws', or a path that should be required
        if (this.options.webSocketServer.type === 'sockjs') {
          implementation = require('./servers/SockJSServer');
        } else if (this.options.webSocketServer.type === 'ws') {
          implementation = require('./servers/WebsocketServer');
        } else {
          try {
            // eslint-disable-next-line import/no-dynamic-require
            implementation = require(this.options.webSocketServer.type);
          } catch (error) {
            implementationFound = false;
          }
        }
        break;
      case 'function':
        implementation = this.options.webSocketServer.type;
        break;
      default:
        implementationFound = false;
    }

    if (!implementationFound) {
      throw new Error('webSocketServer (webSocketServer.type) must be a string denoting a default implementation (e.g. \'ws\', \'sockjs\'), a full path to '
          + 'a JS file which exports a class extending BaseServer (webpack-dev-server/lib/servers/BaseServer.js) '
          + 'via require.resolve(...), or the class itself which extends BaseServer');
    }

    return implementation;
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

      if (this.webSocketServer) {
        this.sendMessage(this.webSocketServer.clients, 'progress-update', {
          percent,
          msg,
          pluginName,
        });
      }

      if (this.server) {
        this.server.emit('progress-update', { percent, msg, pluginName });
      }
    }).apply(this.compiler);
  }

  async initialize() {
    if (this.options.webSocketServer) {
      const compilers = this.compiler.compilers || [this.compiler];

      compilers.forEach((compiler) => {
        this.addAdditionalEntries(compiler);

        const webpack = compiler.webpack || require('webpack');

        new webpack.ProvidePlugin({
          __webpack_dev_server_client__: this.getClientTransport(),
        }).apply(compiler);

        // TODO remove after drop webpack v4 support
        compiler.options.plugins = compiler.options.plugins || [];

        if (this.options.hot) {
          const HMRPluginExists = compiler.options.plugins
            .find(p => p.constructor === webpack.HotModuleReplacementPlugin);

          if (HMRPluginExists) {
            this.logger.warn('"hot: true" automatically applies HMR plugin, you don\'t have to add it manually to your webpack configuration.');
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
    }

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

    // Proxy WebSocket without the initial http request
    // https://github.com/chimurai/http-proxy-middleware#external-websocket-upgrade
    this.webSocketProxies.forEach((webSocketProxy) => {
      this.server.on('upgrade', webSocketProxy.upgrade);
    }, this);
  }

  setupApp() {
    // Init express server
    // eslint-disable-next-line new-cap
    this.app = new express();
  }

  getStats(statsObj) {
    const stats = Server.DEFAULT_STATS;
    const compilerOptions = this.getCompilerOptions();

    if (compilerOptions.stats && compilerOptions.stats.warningsFilter) {
      stats.warningsFilter = compilerOptions.stats.warningsFilter;
    }

    return statsObj.toJson(stats);
  }

  setupHooks() {
    this.compiler.hooks.failed.tap('webpack-dev-server', (error) => {
      this.cb(error);
    });
    this.compiler.hooks.invalid.tap('webpack-dev-server', () => {
      if (this.webSocketServer) {
        this.sendMessage(this.webSocketServer.clients, 'invalid');
      }
    });
    this.compiler.hooks.done.tap('webpack-dev-server', (stats) => {
      this.cb(null, stats);
      if (this.webSocketServer) {
        this.sendStats(this.webSocketServer.clients, this.getStats(stats));
      }

      this.stats = stats;
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

  setupProxyFeature() {
    const { createProxyMiddleware } = require('http-proxy-middleware');

    const getProxyMiddleware = (proxyConfig) => {
      // It is possible to use the `bypass` method without a `target` or `router`.
      // However, the proxy middleware has no use in this case, and will fail to instantiate.
      if (proxyConfig.target) {
        const context = proxyConfig.context || proxyConfig.path;

        return createProxyMiddleware(context, proxyConfig);
      }

      if (proxyConfig.router) {
        return createProxyMiddleware(proxyConfig);
      }
    };
    /**
     * Assume a proxy configuration specified as:
     * proxy: [
     *   {
     *     context: "value",
     *     ...options,
     *   },
     *   // or:
     *   function() {
     *     return {
     *       context: "context",
     *       ...options,
     *     };
     *   }
     * ]
     */
    this.options.proxy.forEach((proxyConfigOrCallback) => {
      let proxyMiddleware;

      let proxyConfig = typeof proxyConfigOrCallback === 'function' ? proxyConfigOrCallback() : proxyConfigOrCallback;

      proxyMiddleware = getProxyMiddleware(proxyConfig);

      if (proxyConfig.ws) {
        this.webSocketProxies.push(proxyMiddleware);
      }

      const handle = async (req, res, next) => {
        if (typeof proxyConfigOrCallback === 'function') {
          const newProxyConfig = proxyConfigOrCallback(req, res, next);

          if (newProxyConfig !== proxyConfig) {
            proxyConfig = newProxyConfig;
            proxyMiddleware = getProxyMiddleware(proxyConfig);
          }
        }

        // - Check if we have a bypass function defined
        // - In case the bypass function is defined we'll retrieve the
        // bypassUrl from it otherwise bypassUrl would be null
        // TODO remove in the next major in favor `context` and `router` options
        const isByPassFuncDefined = typeof proxyConfig.bypass === 'function';
        const bypassUrl = isByPassFuncDefined ? await proxyConfig.bypass(req, res, proxyConfig) : null;

        if (typeof bypassUrl === 'boolean') {
          // skip the proxy
          req.url = null;
          next();
        } else if (typeof bypassUrl === 'string') {
          // byPass to that url
          req.url = bypassUrl;
          next();
        } else if (proxyMiddleware) {
          return proxyMiddleware(req, res, next);
        } else {
          next();
        }
      };

      this.app.use(handle);
      // Also forward error requests to the proxy so it can handle them.
      this.app.use((error, req, res, next) => handle(req, res, next));
    });
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

  setupMagicHtmlFeature() {
    this.app.get('*', this.serveMagicHtml.bind(this));
  }

  setupFeatures() {
    const features = {
      compress: () => {
        if (this.options.compress) {
          this.setupCompressFeature();
        }
      },
      proxy: () => {
        if (this.options.proxy) {
          this.setupProxyFeature();
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
      magicHtml: () => {
        this.setupMagicHtmlFeature();
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

    if (this.options.proxy) {
      runnableFeatures.push('proxy', 'middleware');
    }

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

    if (this.options.magicHtml) {
      runnableFeatures.push('magicHtml');
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
      throw error;
    });
  }

  // TODO: remove `--web-socket-server` in favor of `--web-socket-server-type`
  createWebSocketServer() {
    this.webSocketServer = new (this.getServerTransport())(this);
    this.webSocketServer.implementation.on('connection', (client, request) => {
      client.on('close', () => {
        this.logger.warn('HMR ws client is closed.');
      });

      const headers = typeof request !== 'undefined'
        ? request.headers
        : typeof client.headers !== 'undefined'
          ? client.headers
          : undefined;

      if (!headers) {
        this.logger.warn('webSocketServer implementation must pass headers for the "connection" event');
      }

      if (!headers || !this.checkHeader(headers, 'host') || !this.checkHeader(headers, 'origin')) {
        this.sendMessage([client], 'error', 'Invalid Host/Origin header');

        // With https enabled, the sendMessage above is encrypted asynchronously so not yet sent
        // Terminate would prevent it sending, so use close to allow it to be sent
        client.close();

        return;
      }
      this.logger.info('HMR ws client is connected.');

      if (this.options.hot === true || this.options.hot === 'only') {
        this.logger.info('enable HMR');
        this.sendMessage([client], 'hot');
      }

      if (this.options.liveReload) {
        this.logger.info('enable live reload');
        this.sendMessage([client], 'liveReload');
      }

      if (this.options.client && this.options.client.progress) {
        this.sendMessage([client], 'progress', this.options.client.progress);
      }

      if (this.options.client && this.options.client.reconnect) {
        this.sendMessage([client], 'reconnect', this.options.client.reconnect);
      }

      if (this.options.client && this.options.client.overlay) {
        this.sendMessage([client], 'overlay', this.options.client.overlay);
      }

      if (!this.stats) {
        return;
      }

      this.sendStats([client], this.getStats(this.stats), true);
    });
  }

  openBrowser(defaultOpenTarget) {
    const open = require('open');

    Promise.all(this.options.open.map((item) => {
      let openTarget;

      if (item.target === '<url>') {
        openTarget = defaultOpenTarget;
      } else {
        openTarget = Server.isAbsoluteURL(item.target)
          ? item.target
          : new URL(item.target, defaultOpenTarget).toString();
      }

      return open(openTarget, item.options).catch(() => {
        this.logger.warn(`Unable to open "${openTarget}" page${
          // eslint-disable-next-line no-nested-ternary
          item.options.app
            ? ` in "${item.options.app.name}" app${
              item.options.app.arguments ? ` with "${item.options.app.arguments.join(' ')}" arguments` : ''
            }`
            : ''
        }. If you are running in a headless environment, please do not use the "open" option or related flags like "--open", "--open-target", and "--open-app".`);
      });
    }));
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
    const { isColorSupported, cyan, red } = require('colorette');

    const getColorsOption = (compilerOptions) => {
      let colorsEnabled;

      if (compilerOptions.stats && typeof compilerOptions.stats.colors !== 'undefined') {
        colorsEnabled = compilerOptions.stats;
      } else {
        colorsEnabled = isColorSupported;
      }

      return colorsEnabled;
    };

    const colors = {
      info(useColor, msg) {
        if (useColor) {
          return cyan(msg);
        }

        return msg;
      },
      error(useColor, msg) {
        if (useColor) {
          return red(msg);
        }

        return msg;
      },
    };
    const useColor = getColorsOption(this.getCompilerOptions());

    if (this.options.ipc) {
      this.logger.info(`Project is running at: "${this.server.address()}"`);
    } else {
      const protocol = this.options.server.type === 'http' ? 'http' : 'https';
      const { address, port } = this.server.address();
      const prettyPrintURL = newHostname => url.format({ protocol, hostname: newHostname, port, pathname: '/' });

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

        const networkIPv4 = Server.internalIPSync('v4');

        if (networkIPv4) {
          networkUrlIPv4 = prettyPrintURL(networkIPv4);
        }

        const networkIPv6 = Server.internalIPSync('v6');

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
        networkUrlIPv4 =          parsedIP.kind() === 'ipv6' && parsedIP.isIPv4MappedAddress()
          ? prettyPrintURL(parsedIP.toIPv4Address().toString())
          : prettyPrintURL(address);

        if (parsedIP.kind() === 'ipv6') {
          networkUrlIPv6 = prettyPrintURL(address);
        }
      }

      this.logger.info('Project is running at:');

      if (server) {
        this.logger.info(`Server: ${colors.info(useColor, server)}`);
      }

      if (localhost || loopbackIPv4 || loopbackIPv6) {
        const loopbacks = []
          .concat(localhost ? [colors.info(useColor, localhost)] : [])
          .concat(loopbackIPv4 ? [colors.info(useColor, loopbackIPv4)] : [])
          .concat(loopbackIPv6 ? [colors.info(useColor, loopbackIPv6)] : []);

        this.logger.info(`Loopback: ${loopbacks.join(', ')}`);
      }

      if (networkUrlIPv4) {
        this.logger.info(`On Your Network (IPv4): ${colors.info(useColor, networkUrlIPv4)}`);
      }

      if (networkUrlIPv6) {
        this.logger.info(`On Your Network (IPv6): ${colors.info(useColor, networkUrlIPv6)}`);
      }

      if (this.options.open.length > 0) {
        const openTarget = prettyPrintURL(this.options.host || 'localhost');

        this.openBrowser(openTarget);
      }
    }

    if (this.options.static && this.options.static.length > 0) {
      this.logger.info(`Content not from webpack is served from '${colors.info(
        useColor,
        this.options.static.map(staticOption => staticOption.directory).join(', '),
      )}' directory`);
    }

    if (this.options.historyApiFallback) {
      this.logger.info(`404s will fallback to '${colors.info(useColor, this.options.historyApiFallback.index || '/index.html')}'`);
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
    const isValidHostname =      ipaddr.IPv4.isValid(hostname)
      || ipaddr.IPv6.isValid(hostname)
      || hostname === 'localhost'
      || hostname === this.options.host;

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

    // Also allow if `client.webSocketURL.hostname` provided
    if (this.options.client && typeof this.options.client.webSocketURL !== 'undefined') {
      return this.options.client.webSocketURL.hostname === hostname;
    }

    // disallow
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  sendMessage(clients, type, data, params) {
    for (const client of clients) {
      // `sockjs` uses `1` to indicate client is ready to accept data
      // `ws` uses `WebSocket.OPEN`, but it is mean `1` too
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type, data, params }));
      }
    }
  }

  serveMagicHtml(req, res, next) {
    this.middleware.waitUntilValid(() => {
      const _path = req.path;

      try {
        const filename = this.middleware.getFilenameFromUrl(`${_path}.js`);
        const isFile = this.middleware.context.outputFileSystem.statSync(filename).isFile();

        if (!isFile) {
          return next();
        }

        // Serve a page that executes the javascript
        const queries = req._parsedUrl.search || '';
        const responsePage = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body><script type="text/javascript" charset="utf-8" src="${_path}.js${queries}"></script></body></html>`;

        res.send(responsePage);
      } catch (error) {
        return next();
      }
    });
  }

  // Send stats to a socket or multiple sockets
  sendStats(clients, stats, force) {
    const shouldEmit =      !force
      && stats
      && (!stats.errors || stats.errors.length === 0)
      && (!stats.warnings || stats.warnings.length === 0)
      && this.currentHash === stats.hash;

    if (shouldEmit) {
      this.sendMessage(clients, 'still-ok');

      return;
    }

    this.currentHash = stats.hash;
    this.sendMessage(clients, 'hash', stats.hash);

    if (stats.errors.length > 0 || stats.warnings.length > 0) {
      const hasErrors = stats.errors.length > 0;

      if (stats.warnings.length > 0) {
        let params;

        if (hasErrors) {
          params = { preventReloading: true };
        }

        this.sendMessage(clients, 'warnings', stats.warnings, params);
      }

      if (stats.errors.length > 0) {
        this.sendMessage(clients, 'errors', stats.errors);
      }
    } else {
      this.sendMessage(clients, 'ok');
    }
  }

  watchFiles(watchPath, watchOptions) {
    const chokidar = require('chokidar');
    const watcher = chokidar.watch(watchPath, watchOptions);

    // disabling refreshing on changing the content
    if (this.options.liveReload) {
      watcher.on('change', (item) => {
        if (this.webSocketServer) {
          this.sendMessage(this.webSocketServer.clients, 'static-changed', item);
        }
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

    if (this.options.ipc) {
      await new Promise((resolve, reject) => {
        const net = require('net');
        const socket = new net.Socket();

        socket.on('error', (error) => {
          if (error.code === 'ECONNREFUSED') {
            // No other server listening on this socket so it can be safely removed
            fs.unlinkSync(this.options.ipc);

            resolve();

            return;
          }
          if (error.code === 'ENOENT') {
            resolve();

            return;
          }

          reject(error);
        });

        socket.connect({ path: this.options.ipc }, () => {
          throw new Error(`IPC "${this.options.ipc}" is already used`);
        });
      });
    } else {
      this.options.host = await Server.getHostname(this.options.host);
      this.options.port = await Server.getFreePort(this.options.port);
    }

    await this.initialize();

    const listenOptions = this.options.ipc
      ? { path: this.options.ipc }
      : { host: this.options.host, port: this.options.port };

    await new Promise((resolve) => {
      this.server.listen(listenOptions, () => {
        resolve();
      });
    });

    if (this.options.ipc) {
      // chmod 666 (rw rw rw)
      const READ_WRITE = 438;

      await fs.promises.chmod(this.options.ipc, READ_WRITE);
    }

    if (this.options.webSocketServer) {
      this.createWebSocketServer();
    }

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

    await Promise.all(this.staticWatchers.map(watcher => watcher.close()));

    this.staticWatchers = [];

    if (this.webSocketServer) {
      await new Promise((resolve) => {
        this.webSocketServer.implementation.close(() => {
          this.webSocketServer = null;
          this.logger.warn('HMR ws server is closed.');

          resolve();
        });

        for (const client of this.webSocketServer.clients) {
          client.terminate();
        }

        this.webSocketServer.clients = [];
      });
    }

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
  listen(port, hostname, fn) {
    util.deprecate(
      () => {},
      '\'listen\' is deprecated. Please use async \'start\' or \'startCallback\' methods.',
      'DEP_WEBPACK_DEV_SERVER_LISTEN',
    )();

    this.logger = this.compiler.getInfrastructureLogger('webpack-dev-server');

    if (typeof port === 'function') {
      fn = port;
    }

    if (typeof port !== 'undefined' && typeof this.options.port !== 'undefined' && port !== this.options.port) {
      this.options.port = port;

      this.logger.warn('The "port" specified in options is different from the port passed as an argument. Will be used from arguments.');
    }

    if (!this.options.port) {
      this.options.port = port;
    }

    if (typeof hostname !== 'undefined' && typeof this.options.host !== 'undefined' && hostname !== this.options.host) {
      this.options.host = hostname;

      this.logger.warn('The "host" specified in options is different from the host passed as an argument. Will be used from arguments.');
    }

    if (!this.options.host) {
      this.options.host = hostname;
    }

    return this.start()
      .then(() => {
        if (fn) {
          fn.call(this.server);
        }
      })
      .catch((error) => {
        // Nothing
        if (fn) {
          fn.call(this.server, error);
        }
      });
  }

  // TODO remove in the next major release
  close(callback) {
    util.deprecate(
      () => {},
      '\'close\' is deprecated. Please use async \'stop\' or \'stopCallback\' methods.',
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
