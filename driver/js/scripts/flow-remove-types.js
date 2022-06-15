const os = require('os');
const flowRemoveTypes = require('flow-remove-types/register');

const frt = flowRemoveTypes({
  exclude: (() => {
    if (os.platform() === 'win32') {
      return '/\node_modules(?!\vue)/';
    }
    return '/node_modules(?!/vue)/';
  })(),
});

module.exports = frt;
