const { Signale } = require('signale');

const logger = new Signale({
  stream: process.stdout,
});

logger.config({
  displayLabel: false,
});

const timerLogger = new Signale({
  stream: process.stdout,
});

timerLogger.config({
  displayLabel: false,
  displayTimestamp: true,
});

function verboseInfo(...args) {
  if (process.env.VERBOSE) {
    timerLogger.info(...args);
  }
}

module.exports = {
  logger,
  timerLogger,
  verboseInfo,
};
