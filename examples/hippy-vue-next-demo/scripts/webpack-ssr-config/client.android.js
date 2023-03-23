const { getWebpackSsrBaseConfig } = require('./client.base');

const isProd = process.argv[process.argv.length - 1] !== 'development';

module.exports = getWebpackSsrBaseConfig('android', isProd ? 'production' : 'development');
