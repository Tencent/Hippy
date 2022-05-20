#!/usr/bin/env node

const yargs = require('yargs');
const { webpack, getWebpackConfig } = require('./server/webpack');

const { argv } = yargs
  .alias('v', 'version')
  .describe('v', 'show version information')
  .alias('h', 'help')
  .alias('c', 'config')
  .demand('config')
  .help()
  .version()
  .option('config', {
    type: 'string',
    default: '',
    describe: 'webpack config file',
  })
  .epilog(`Copyright (C) 2017-${new Date().getFullYear()} THL A29 Limited, a Tencent company.`);

if (argv.verbose) {
  process.env.VERBOSE = true;
}

if (argv.help) {
  yargs.showHelp().exit();
}

if (argv.version) {
  yargs.version().exit();
}

// Execute command
const webpackConfig = getWebpackConfig(argv.config);
webpack(webpackConfig);
