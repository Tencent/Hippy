/* eslint-disable no-console */
const path = require('path');
const {
  exec,
  pushd,
  popd,
} = require('shelljs');

module.exports = buildDebugServer;

function buildDebugServer() {
  const DEBUG_SERVER_PATH = path.join(__dirname, '../packages/hippy-debug-server');

  pushd(DEBUG_SERVER_PATH);

  const execOptions = { stdio: 'inherit' };

  console.log('1/1 Start to build project @hippy/debug-server');
  exec('npm run build', execOptions, (code, stdout, stderr) => {
    if (code) {
      console.error('Executing buildDebugServer with error code', code);
      console.error('Executing buildDebugServer stdout', stdout);
      console.error('Executing buildDebugServer stderr', stderr);
      process.exit(1);
    }
  });

  console.log('👌 All done, you can debug your hippy app now, enjoy.');
  popd();
}
