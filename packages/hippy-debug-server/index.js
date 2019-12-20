#!/usr/bin/env node

const yargs       = require('yargs');
const startServer = require('./server');

const { argv } = yargs()
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
  .epilog('copyright 2019');

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
startServer({
  entry: argv.entry,
  host: argv.host,
  port: argv.port,
});
