#!/usr/bin/env node

const yargs = require('yargs');
const startServer = require('./server');

const { argv } = yargs
  .alias('v', 'version')
  .describe('v', 'show version information')
  .alias('h', 'help')
  .help()
  .version()
  .option('entry', {
    type: 'string',
    default: 'dist/dev/index.bundle',
    describe: 'Path of the jsbundle for debugging',
  })
  .option('static', {
    type: 'string',
    describe: 'Path of the static files such as images',
  })
  .option('host', {
    type: 'string',
    default: 'localhost',
    describe: 'The host the debug server will listen to',
  })
  .option('port', {
    type: 'string',
    default: '38989',
    describe: 'The port the debug server will listen to',
  })
  .option('verbose', {
    type: 'boolean',
    default: false,
    describe: 'Output error detals',
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
startServer(argv);
