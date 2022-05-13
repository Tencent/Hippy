#!/usr/bin/env node
/* eslint-disable import/first -- should add module alias before use */
import path from 'path';
import moduleAlias from 'module-alias';
moduleAlias.addAliases({
  '@debug-server-next': __dirname,
});
import yargs from 'yargs';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, './.env') });
import '@debug-server-next/utils/aegis';
import { webpack } from '@debug-server-next/app-dev';
import { getWebpackConfig } from '@debug-server-next/utils/webpack';
import { Logger } from '@debug-server-next/utils/log';
import { version } from '../package.json';
import './process-handler';

const { argv } = yargs
  .alias('v', 'version')
  .describe('v', 'show version information ')
  .alias('h', 'help')
  .alias('c', 'config')
  .demand('config')
  .help()
  .version()
  .option('config', {
    type: 'string',
    default: '',
    describe: 'webpack config file ',
  })
  .epilog(`Copyright (C) 2017-${new Date().getFullYear()} THL A29 Limited, a Tencent company.`);

type Argv = typeof argv & {
  version: string;
  help: string;
  config: string;
};
const fullArgv = argv as Argv;
if (fullArgv.help) yargs.showHelp().exit(0, null);
if (fullArgv.version) yargs.version().exit(0, null);

const log = new Logger('entry');
log.info('version: %s', version);

(async () => {
  log.info('start dev argv: %j', fullArgv);
  const webpackConfig = await getWebpackConfig(fullArgv.config);
  webpack(webpackConfig);
})();
