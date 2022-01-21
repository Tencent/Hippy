const path = require('path');
const typescript = require('rollup-plugin-typescript2');
const replace = require('@rollup/plugin-replace');
// const alias = require('@rollup/plugin-alias');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

const hippyWebRendererPackage = require('../packages/hippy-web-renderer/package.json');
function banner(name, version) {
  const startYear = 2017;
  const thisYear = new Date().getFullYear();
  let copyRightYears = thisYear;
  if (startYear !== thisYear) {
    copyRightYears = `${startYear}-${thisYear}`;
  }

  return `/*!
 * ${name} v${version}
 * Build at: ${new Date()}
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) ${copyRightYears} THL A29 Limited, a Tencent company.
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
`;
}

const builds = {
  '@hippy/web-render': {
    entry: './packages/hippy-web-renderer/src/index.ts',
    dest: './packages/hippy-web-renderer/dist/index.js',
    format: 'es',
    banner: banner('@hippy/web-renderer', hippyWebRendererPackage.version),
  },
};

function genConfig(name) {
  const opts = builds[name];
  const config = {
    input: opts.entry,
    external: opts.external,
    plugins: [
      replace({
        preventAssignment: true,
        values: {
          'process.env.HIPPY_WEB_RENDERER_VERSION': `"${hippyWebRendererPackage.version}"`,
        },
      }),
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: path.resolve(__dirname, '../tsconfig.json'),
        tsconfigOverride: {
          compilerOptions: {
            declaration: false,
            declarationMap: false,
          },
          exclude: ['**/__tests__/*.test.*'],
        },
      }),
    ].concat(opts.plugins || []),
    output: {
      name,
      file: opts.dest,
      format: opts.format,
      banner: opts.banner,
      exports: 'auto',
    },
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg);
      }
    },
  };

  if (opts.env) {
    config.plugins.push(replace({
      'process.env.NODE_ENV': JSON.stringify(opts.env),
    }));
  }

  return config;
}

if (process.env.TARGET) {
  module.exports = genConfig(process.env.TARGET);
} else {
  module.exports.getBuild = genConfig;
  module.exports.getAllBuilds = () => Object.keys(builds).map(genConfig);
}
