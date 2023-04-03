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
const { rollup } = require('rollup');
const reactBuilds = require('./react-configs').getAllBuilds();
const reactWebBuilds = require('./react-web-configs').getAllBuilds();
const vueBuilds = require('./vue-configs').getAllBuilds();
const vueNextBuilds = require('./vue-next-configs').getAllBuilds();
const webRendererBuilds = require('./web-renderer-configs').getAllBuilds();
let builds = [...reactBuilds, ...reactWebBuilds, ...vueBuilds, ...vueNextBuilds, ...webRendererBuilds];

// filter builds via command line arg
if (process.argv[2]) {
  const filters = process.argv[2].split(',');
  builds = builds.filter(b => filters.some(f => b.output.file.indexOf(f) > -1 || b.output.name.indexOf(f) > -1));
}

function blue(str) {
  return `\x1b[1m\x1b[34m${str}\x1b[39m\x1b[22m`;
}

function getSize(code) {
  return `${(code.length / 1024).toFixed(2)}kb`;
}

function logError(e) {
  console.error('build js packages error', e);
  process.exit(1);
}

/**
 * remove typescript declaration files that generated by rollup plugin.
 *
 * 1. auto generate typescript declaration files by rollup-plugin-typescript2
 * 2. declaration files rollup to index.d.ts by rollup-plugin-dts
 * 3. remove auto generated declaration files
 *
 * @param filePath
 */
function cleanTypescriptDeclarationFiles(filePath) {
  if (filePath) {
    let isDir = fs.statSync(filePath);
    const dir = isDir.isDirectory() ? filePath : path.dirname(filePath);
    const subDirs = fs.readdirSync(dir);
    if (subDirs.length) {
      for (let i = 0; i <= subDirs.length; i++) {
        if (subDirs[i]) {
          const dirPath = `${dir}/${subDirs[i]}`;
          isDir = fs.statSync(dirPath);
          if (isDir?.isDirectory() && subDirs[i].startsWith('hippy-')) {
            fs.rmSync(dirPath, {
              force: true,
              recursive: true,
            });
          }
        }
      }
    }
  }
}

async function buildEntry(config) {
  const { output } = config;
  const { file = '', dir = '' } = output;
  const bundle = await rollup(config);
  await bundle.generate(output);
  const { output: [{ code }] } = await bundle.write(output);
  console.log(`${blue(path.relative(process.cwd(), file ? file : `${dir}/index.js`))} ${getSize(code)}`);

  cleanTypescriptDeclarationFiles(file || dir);
}

function build(buildSets) {
  let built = 0;
  const total = builds.length;
  const next = () => {
    buildEntry(buildSets[built])
      .then(() => {
        built += 1;
        if (built < total) {
          next();
        }
      })
      .catch(logError);
  };
  next();
}

build(builds);
