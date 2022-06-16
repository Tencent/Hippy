/* eslint-disable no-console */
const path = require('path');
const {
  exec,
  pushd,
  test,
  rm,
} = require('shelljs');

const cmdExample = 'please execute command like \'npm run init:example hippy-react-demo\' or \'npm run init:example hippy-vue-demo\'';
const example = process.argv[2];
if (!example) {
  console.error(`❌ No example argument found, ${cmdExample}`);
  return;
}
const BASE_PATH = process.cwd();
// Target demo project path
const DEMO_PATH = path.join(BASE_PATH, 'examples', example);
if (!test('-d', DEMO_PATH)) {
  console.error(`❌ Can not find demo project: ${example}, ${cmdExample}`);
  return;
}

pushd(DEMO_PATH);

const execOptions = { stdio: 'inherit' };
console.log(`1/2 Start to install ${example} dependencies.`);
rm('-rf', './node_modules');
exec('npm install --legacy-peer-deps', execOptions);

console.log(`${example} dependencies have been installed.`);
