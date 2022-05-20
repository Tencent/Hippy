import logger from '../modules/logger/index';

const name = 'webpack-dev-server';
// default level is set on the client side, so it does not need
// to be set by the CLI or API
const defaultLevel = 'info';

function setLogLevel(level) {
  logger.configureDefaultLogger({ level });
}

setLogLevel(defaultLevel);

const log = logger.getLogger(name);

export { log, setLogLevel };
