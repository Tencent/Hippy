/* eslint-disable no-console */
const path = require('path');
const fs = require('fs');
const {
  exec,
  pushd,
  test,
} = require('shelljs');

const cmdExample = 'please execute command like \'npm run debugexample hippy-react-demo dev\' or \'npm run debugexample hippy-react-demo debug\'';

const example = process.argv[2];
if (!example) {
  console.error(`❌ No example argument found, ${cmdExample}`);
  process.exit(1);
  return;
}
const cmd = process.argv[3];
if (!cmd) {
  console.error(`❌ No cmd argument found, ${cmdExample}`);
  process.exit(1);
  return;
}
const BASE_PATH = process.cwd();
// Target demo project path
const DEMO_PATH = path.join(BASE_PATH, 'examples', example);
if (!test('-d', DEMO_PATH)) {
  console.error(`❌ Can not find demo project: ${example}, ${cmdExample}.`);
  process.exit(1);
  return;
}

pushd(DEMO_PATH);

const execOptions = { stdio: 'inherit' };
if (!fs.existsSync(path.resolve(DEMO_PATH, 'node_modules'))) {
  console.error(`❌ ${example} dependencies have not been installed, please execute 'npm run init:example ${example}' first.`);
  process.exit(1);
  return;
}

console.log(`Start to start ${example} with cmd 'npm run hippy:${cmd}'.`);
exec(`npm run hippy:${cmd}`, execOptions); // start to build dev js
