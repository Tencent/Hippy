#!/usr/bin/env node

import createDebug from 'debug';
import yargs from 'yargs';
import { DevtoolsEnv } from './@types/enum';
import { Application } from './app';

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
  .option('useTunnel', {
    type: 'boolean',
    default: true,
    describe: 'weature use tunnel, which integrated ios_webkit_debug_proxy',
  })
  .option('startIWDP', {
    type: 'boolean',
    default: false,
    describe: 'weature use ios_webkit_debug_proxy',
  })
  .option('startAdb', {
    type: 'boolean',
    default: true,
    describe: 'weature use adb reverse',
  })
  .option('iwdpPort', {
    type: 'number',
    default: 9000,
    describe: 'Device list port of ios_webkit_debug_proxy',
  })
  .option('iwdpStartPort', {
    type: 'number',
    default: 9200,
    describe: 'Start device port of ios_webkit_debug_proxy',
  })
  .option('iwdpEndPort', {
    type: 'number',
    default: 9300,
    describe: 'End device port of ios_webkit_debug_proxy',
  })
  .option('env', {
    type: 'string',
    default: DevtoolsEnv.Hippy,
    choices: [DevtoolsEnv.Hippy, DevtoolsEnv.Voltron, DevtoolsEnv.TDF],
  })
  .epilog(`Copyright (C) 2017-${new Date().getFullYear()} THL A29 Limited, a Tencent company.`) as any;

if (argv.verbose) {
  createDebug.enable('*');
}

if (argv.help) {
  yargs.showHelp().exit(0, null);
}

if (argv.version) {
  yargs.version().exit(0, null);
}

Application.startServer(argv);
