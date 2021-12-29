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
    const compiler = Webpack(webpackConfig, cb);
    startWebpackDevServer(webpackConfig, compiler);
    return compiler;
  },
  getWebpackConfig: (configPath) => {
    let hmrPort;
    let webpackConfig;
    const webpackConfigPath = path.resolve(process.cwd(), configPath);
    if (configPath && fs.existsSync(webpackConfigPath)) {
      webpackConfig = require(webpackConfigPath);
      hmrPort = (webpackConfig.devServer && webpackConfig.devServer.port) || 38988;
    }
    return { webpackConfig, hmrPort };
  },
};

async function startWebpackDevServer(webpackConfig, compiler) {
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

  const server = new WebpackDevServer(webpackConfig.devServer, compiler);
  await server.start();
}
