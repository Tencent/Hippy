#!/usr/bin/env node

import yargs from 'yargs';
import { startServer } from './server';
import path from 'path';

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
    type: 'number',
    default: 38989,
    describe: 'The port the debug server will listen to',
  })
  .option('wsPath', {
    type: 'string',
    default: '/debugger-proxy',
    describe: '',
  })
  .option('verbose', {
    type: 'boolean',
    default: false,
    describe: 'Output error details',
  })
  .option('iwdpPort', {
    type: 'number',
    default: 9000,
    describe: 'Port of ios_webkit_debug_proxy'
  })
  .epilog(`Copyright (C) 2017-${new Date().getFullYear()} THL A29 Limited, a Tencent company.`) as any;

if (argv.verbose) {
  process.env.VERBOSE = 'true';
}

if (argv.help) {
  yargs.showHelp().exit(0, null);
}

if (argv.version) {
  yargs.version().exit(0, null);
}

// Execute command
startServer(argv);
