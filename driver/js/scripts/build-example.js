/* eslint-disable no-console */
const path = require('path');
const {
  cp,
  exec,
  pushd,
  popd,
  test,
} = require('shelljs');

const cmdExample = 'please execute command like \'npm run buildexample hippy-react-demo\' or \'npm run buildexample hippy-vue-demo\'';
const example = process.argv[2];
if (!example) {
  console.error(`❌ No example argument found, ${cmdExample}.`);
  process.exit(1);
  return;
}
const BASE_PATH = process.cwd();
// Target demo project path
const DEMO_PATH = path.join(BASE_PATH, 'examples', example);
if (!test('-d', DEMO_PATH)) {
  console.error(`❌ Can not find demo project: ${example}, ${cmdExample}`);
  process.exit(1);
  return;
}

pushd(DEMO_PATH);

const execOptions = { stdio: 'inherit' };
console.log(`1/3 Start to install ${example} dependencies.`);
exec('npm install --legacy-peer-deps', execOptions);

console.log(`2/3 Start to build project ${example}.`);
exec('npm run hippy:vendor', execOptions); // Build vendor js
exec('npm run hippy:build', execOptions); // Build index js

console.log('3/3 Copy the built files to native.');
cp('-Rf', './dist/ios/*', '../ios-demo/res/'); // Update the ios demo project
cp('-Rf', './dist/android/*', '../android-demo/res/'); // # Update the android project

console.log('👌 All done, you can open your native app now, enjoy.');
popd();
