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

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { pushd, popd, exec } = require('shelljs');

const cmdPrefix = 'npm dist-tag add';
const customizedVersion = process.argv[2];
console.log(chalk.blue(`Customized Version is ${customizedVersion ? customizedVersion : 'undefined, use package version.'}`));
const packagesPath = path.resolve(__dirname, '../packages');
const packages = fs.readdirSync(packagesPath);
packages.forEach((packageName) => {
  // skip non-hippy directory
  if (!packageName.includes('hippy')) return;
  const packagePath = path.resolve(packagesPath, packageName);
  pushd(packagePath);
  const pkg = fs.readFileSync(path.resolve(packagePath, './package.json'));
  if (pkg) {
    const { name, version: pkgVersion } = require(path.resolve(packagePath, './package.json'));
    if (!name) {
      console.error(chalk.red('package name is undefined in package.json'));
      return process.exit(1);
    }
    const version = customizedVersion || pkgVersion;
    if (version === 'unspecified' || !version) {
      console.error(chalk.red(`npm package version [${version}] is invalid.`));
      return process.exit(1);
    }
    const fullCmd = `${cmdPrefix} ${name}@${version} latest`;
    console.log(chalk.grey(`execute cmd: ${fullCmd}`));
    const result = exec(fullCmd);
    if (result.code === 0) {
      console.log(chalk.green(`${name}@${version} set to latest tag [DONE]`));
    } else {
      console.error(chalk.red(`${name}@${version} set to latest tag [Error]: ${result.stderr}`));
      process.exit(1);
    }
  }
  popd();
});

console.log(chalk.green('All packages dist tags are set to latest'));
