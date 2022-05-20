const fs = require('fs');
const path = require('path');
const Webpack = require('webpack');
const {
  logger,
  exec,
} = require('../utils');
const WebpackDevServer = require('../webpack-dev-server/lib/Server');

module.exports = {
  webpack: (webpackConfig, cb) => {
    const compiler = Webpack(webpackConfig);
    startWebpackDevServer(webpackConfig, compiler, cb);
    return compiler;
  },
  getWebpackConfig: (configPath) => {
    let webpackConfig;
    const webpackConfigPath = path.resolve(process.cwd(), configPath);
    if (configPath && fs.existsSync(webpackConfigPath)) {
      webpackConfig = require(webpackConfigPath);
    }
    return webpackConfig;
  },
};

async function startWebpackDevServer(webpackConfig, compiler, cb) {
  const hmrPort = (webpackConfig.devServer && webpackConfig.devServer.port) || 38988;
  try  {
    if (hmrPort) {
      const reversePort = `tcp:${hmrPort}`;
      await exec('adb', ['reverse', reversePort, reversePort]);
    }
  } catch (e) {
    logger.warn('Port reverse failed, For iOS app debug only just ignore the message.');
    logger.warn('Otherwise please check adb devices command working correctly');
  }

  const server = new WebpackDevServer(webpackConfig.devServer, compiler, cb);
  await server.start();
}
