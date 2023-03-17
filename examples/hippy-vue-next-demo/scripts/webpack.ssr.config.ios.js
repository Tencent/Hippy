const { getWebpackSsrBaseConfig } = require('./webpack.ssr.config.base');

const isProd = process.argv[process.argv.length - 1] !== 'development';

module.exports = getWebpackSsrBaseConfig('ios', isProd ? 'production' : 'development');
