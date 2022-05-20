const startDebugServer = require('./server');
const { webpack } = require('./server/webpack');

module.exports = {
  startDebugServer: (options = {}) => {
    startDebugServer({
      host: '0.0.0.0',
      port: '38989',
      entry: 'dist/dev/index.bundle',
      verbose: false,
      ...options,
    });
  },
  webpack,
};
