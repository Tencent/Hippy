const spawn = require('cross-spawn');
const { logger } = require('./logger');

function exec(cmd, argv, options = {}) {
  const { disableOutput } = options;
  return new Promise((resolve, reject) => {
    const command = spawn(cmd, argv);
    if (!disableOutput) {
      command.stdout.on('data', log => logger.info(log.toString()));
      command.stderr.on('data', err => logger.error(err.toString()));
    }
    command.on('error', err => reject(err));
    command.on('close', (code) => {
      if (code) {
        return reject(new Error(`Execting ${cmd} returns: ${code}`));
      }
      return resolve();
    });
  });
}

module.exports = exec;
