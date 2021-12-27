const fs = require('fs');
const path = require('path');
const Webpack = require('webpack');
const {
  logger,
  exec,
} = require('../utils');
const WebpackDevServer = require('../webpack-dev-server/lib/Server');

const startWebpackDevServer = async (args) => {
  const {
    verbose,
    config,
  } = args;
  const { webpackConfig, hmrPort } = getWebpackConfig(config);
  try  {
    if (hmrPort) {
      const reversePort = `tcp:${hmrPort}`;
      await exec('adb', ['reverse', reversePort, reversePort]);
    }
  } catch (e) {
    logger.warn('Port reverse failed, For iOS app debug only just ignore the message.');
    logger.warn('Otherwise please check adb devices command working correctly');
    if (verbose) {
      logger.error(e);
    }
  }

  const compiler = Webpack(webpackConfig);
  const server = new WebpackDevServer(webpackConfig.devServer, compiler);
  await server.start();
};


function getWebpackConfig(configPath) {
  let hmrPort;
  let webpackConfig;
  const webpackConfigPath = path.resolve(process.cwd(), configPath);
  if (configPath && fs.existsSync(webpackConfigPath)) {
    webpackConfig = require(webpackConfigPath);
    hmrPort = (webpackConfig.devServer && webpackConfig.devServer.port) || 38988;
  }
  return { webpackConfig, hmrPort };
}


module.exports = { startWebpackDevServer };
