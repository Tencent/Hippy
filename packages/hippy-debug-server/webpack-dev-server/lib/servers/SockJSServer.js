'use strict';

/* eslint-disable
  class-methods-use-this
*/
const sockjs = require('sockjs');
const BaseServer = require('./BaseServer');

// Workaround for sockjs@~0.3.19
// sockjs will remove Origin header, however Origin header is required for checking host.
// See https://github.com/webpack/webpack-dev-server/issues/1604 for more information
{
  const SockjsSession = require('sockjs/lib/transport').Session;
  const { decorateConnection } = SockjsSession.prototype;

  // eslint-disable-next-line func-names
  SockjsSession.prototype.decorateConnection = function (req) {
    decorateConnection.call(this, req);

    const { connection } = this;

    if (
      connection.headers
      && !('origin' in connection.headers)
      && 'origin' in req.headers
    ) {
      connection.headers.origin = req.headers.origin;
    }
  };
}

module.exports = class SockJSServer extends BaseServer {
  // options has: error (function), debug (function), server (http/s server), path (string)
  constructor(server) {
    super(server);

    this.implementation = sockjs.createServer({
      // Use provided up-to-date sockjs-client
      sockjs_url: '/__webpack_dev_server__/sockjs.bundle.js',
      // Default logger is very annoy. Limit useless logs.
      log: (severity, line) => {
        if (severity === 'error') {
          this.server.logger.error(line);
        } else if (severity === 'info') {
          this.server.logger.log(line);
        } else {
          this.server.logger.debug(line);
        }
      },
    });

    const getPrefix = (options) => {
      if (typeof options.prefix !== 'undefined') {
        return options.prefix;
      }

      return options.path;
    };

    this.implementation.installHandlers(this.server.server, {
      ...this.server.options.webSocketServer.options,
      prefix: getPrefix(this.server.options.webSocketServer.options),
    });

    this.implementation.on('connection', (client) => {
      // Implement the the same API as for `ws`
      client.send = client.write;
      client.terminate = client.close;

      this.clients.push(client);

      client.on('close', () => {
        this.clients.splice(this.clients.indexOf(client), 1);
      });
    });

    this.implementation.close = (callback) => {
      callback();
    };
  }
};
