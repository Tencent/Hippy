const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs-extra');

const example = process.argv[2];
console.log(example);
console.log(process.cwd());

var BASE_PATH = process.cwd();
// Target demo project path
var DEMO_PATH = path.join(BASE_PATH, "examples", example);
console.log(DEMO_PATH)
if (!fs.existsSync(DEMO_PATH)) {
  console.log(`❌ Can not find demo project ${example}`);
  return
}

process.chdir(DEMO_PATH);

console.log(`1/3 Start to install ${example} dependencies`);
execSync('npm  install');

console.log(`2/3 Start to build project ${example}`);
execSync('npm run hippy:vendor'); // Build vendor js
execSync('npm run hippy:build'); // Build index js

console.log(`3/3 Copy the built files to native`);
fs.copySync('./dist/ios/', '../ios-demo/res/') // Update the ios demo project
fs.copySync('./dist/android', '../android-demo/res/') // # Update the android project

console.log(`👌 All done, you can open your native app now, enjoy.`);
