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

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const mzfs = require('mz/fs');
const colors = require('colors-console');
const compareImages = require('resemblejs/compareImages');
const puppeteer = require('puppeteer');
const current = path.join(__dirname);
const DeviceType = 'iPhone 11 Pro';
const Entry = 'http://localhost:3000/index.html';
const MochaConfig = {
  main: path.join(current, './mocha.jscore.bundle'),
  chai: 'https://cdn.staticfile.org/chai/4.0.0-canary.1/chai.js',
};
const testPath = path.join(current, '../dist/core.build.js');
const globalConfigPath = path.join(current, './global.js');


(async () => {
  console.log('Step:', colors('green', 'begin init env'));
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 10,
    devtools: true,
    isMobile: true,
  });
  const page = await browser.newPage();
  await page.emulate(puppeteer.devices[DeviceType]);
  await page.goto(Entry, {
    waitUntil: 'networkidle2',
  });
  const beginTimestamp = Date.now();
  console.log('Step:', colors('green', 'inject api'));
  await page.exposeFunction('snapshot', (delayTime, namePre, nameEnd, allPath) => snapshotAndCompare(delayTime, namePre, nameEnd, allPath, page));
  await page.exposeFunction('innerPrint', (event, data, runner) => {
    testReporter(event, data, runner, beginTimestamp, page, browser);
  });
  console.log('Step:', colors('green', 'inject mocha test lib'));
  await page.addScriptTag({ path: MochaConfig.main });
  console.log('Step:', colors('green', 'inject chai test lib'));
  await page.addScriptTag({ url: MochaConfig.chai });
  console.log('Step:', colors('green', 'set mocha type BDD'));
  await page.evaluate('mocha.setup(\'bdd\');');
  console.log('Step:', colors('green', 'inject global config'));
  await page.addScriptTag({ path: globalConfigPath });
  console.log('Step:', colors('green', 'load test bundle'));
  await page.addScriptTag({ path: testPath });
  console.log('Step:', colors('green', 'begin test'));
  await page.evaluate('mocha.run();');
})();

async function snapshotAndCompare(delayTime, namePre, nameEnd, allPath, page) {
  return new Promise(async (resolve) => {
    const dirPath = path.dirname(path.join(current, allPath));
    const nameMD5 = crypto.createHash('md5').update(`${namePre}${nameEnd}`)
      .digest('hex');
    const name = `${path.basename(path.join(current, allPath))}.${nameMD5}.png`;
    const tempName = `${path.basename(path.join(current, allPath))}.${nameMD5}.diff.png`;
    const imgPath = path.join(dirPath, `./${name}`);
    const imgTempPath = path.join(dirPath, `./${tempName}`);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    setTimeout(async () => {
      if (!fs.existsSync(imgPath)) {
        await page.screenshot({
          path: imgPath,
        });
        resolve(true);
        return;
      }
      await page.screenshot({
        path: imgTempPath,
      });
      const options = {
        output: {
          errorColor: {
            red: 255,
            green: 0,
            blue: 255,
          },
          errorType: 'movement',
          transparency: 0.3,
          largeImageThreshold: 1200,
          useCrossOrigin: false,
          outputDiff: true,
        },
        scaleToSameSize: true,
        ignore: 'antialiasing',
      };
      try {
        const data = await compareImages(await mzfs.readFile(imgTempPath), await mzfs.readFile(imgPath), options);
        if (data.rawMisMatchPercentage > 0.01) {
          resolve(false);
          return;
        }
        fs.unlinkSync(imgTempPath);
        resolve(true);
      } catch (error) {
        resolve(false);
      }
    }, 1000 * delayTime);
  });
}
function testReporter(event, data, runner, beginTimestamp, page, browser) {
  if (event === 'pass') {
    console.log(colors('green', event), '--------------------', data.parent.title, data.title);
  }
  if (event === 'fail') {
    console.log(colors('red', event), '--------------------', data.parent.title, data.title);
    console.log(colors('red', `timedOut: ${data.timedOut} `));
  }
  if (event === 'end') {
    console.log(
      colors('yellow', 'TestFinish'), `total test: ${data.tests.length}`,
      colors('green', `pass: ${data.passes.length}`),
      colors('red', `fail: ${data.failures.length}`),
      colors('yellow', `pass rate: ${(data.passes.length / data.tests.length * 100).toFixed(3)}%`),
      `useTime: ${((Date.now() - beginTimestamp) / 1000).toFixed(2)}s`,
    );
    if (data.failures.length > 0) {
      console.log(colors('red', 'failed test list:'));
      data.failures.forEach((item) => {
        console.log(colors('red', `fail test: ${item.fullTitle}`));
        console.log(colors('red', `error: ${JSON.stringify(item.err)}`));
      });
    }
    browser.close();
  }
}
