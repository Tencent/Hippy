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
