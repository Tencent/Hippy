/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-console */
const path = require('path');
const {
  cp,
  exec,
  pushd,
  popd,
  test,
} = require('shelljs');

const cmdExample = 'please execute command like \'npm run buildexample hippy-react-demo\' or \'npm run buildexample hippy-vue-demo|hippy-vue-next-demo\'';
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
function runScript(scriptStr) {
  const result = exec(scriptStr, execOptions);
  if (result.code !== 0) {
    console.error(`❌ build example - ${example} error: ${result.stderr}`);
    process.exit(1);
  }
}

console.log(`1/3 Start to install ${example} dependencies.`);
runScript('npm install --legacy-peer-deps');

console.log(`2/3 Start to build project ${example}.`);
runScript('npm run hippy:vendor'); // Build vendor js
runScript('npm run hippy:build'); // Build index js

console.log('3/3 Copy the built files to native.');
let jsPath = '';
if (example === 'hippy-react-demo') {
  jsPath = 'react/';
} else if (example === 'hippy-vue-demo') {
  jsPath = 'vue2/';
} else if (example === 'hippy-vue-next-demo') {
  jsPath = 'vue3/';
}

cp('-Rf', './dist/ios/*', `../../../../framework/examples/ios-demo/res/${jsPath}`); // Update the ios demo project
cp('-Rf', './dist/android/*', `../../../../framework/examples/android-demo/res/${jsPath}`); // # Update the android project
cp('-Rf', './dist/ohos/*', `../../../../framework/examples/ohos-demo/src/main/resources/rawfile/${jsPath}`); // # Update the ohos project
cp('-Rf', './dist/android/*', `../../../../framework/voltron/example/assets/jsbundle/${jsPath}`); // # Update the flutter project, ios and android use same bundle

console.log('👌 All done, you can open your native app now, enjoy.');
popd();
