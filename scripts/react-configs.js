const path = require('path');
const fs = require('fs');
const typescript = require('rollup-plugin-typescript2');
const replace = require('@rollup/plugin-replace');
// const alias = require('@rollup/plugin-alias');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const hippyReactPackage = require('../packages/hippy-react/package.json');
const hippyReactWebPackage = require('../packages/hippy-react-web/package.json');

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

const hippyReactWebPath = path.resolve(__dirname, '../packages/hippy-react-web');
const hippyReactWebComponentsPath = `${hippyReactWebPath}/src/components`;
const hippyReactWebModulesPath = `${hippyReactWebPath}/src/modules`;
const getHippyReactWebModules = () => {
  const hippyReactWebmodules = [];
  fs.readdirSync(hippyReactWebModulesPath).forEach((file) => {
    const moduleFilePath = `${hippyReactWebModulesPath}/${file}`;
    if (fs.lstatSync(moduleFilePath).isDirectory()) {
      if (fs.lstatSync(`${moduleFilePath}/index.ts`).isFile()) {
        hippyReactWebmodules.push(`${moduleFilePath}/index.ts`);
      }
    } else {
      hippyReactWebmodules.push(moduleFilePath);
    }
  });
  return hippyReactWebmodules;
};
const hippyReactWebComponents = fs.readdirSync(hippyReactWebComponentsPath).map(filename => `${hippyReactWebComponentsPath}/${filename}`);
const hippyReactWebModules = getHippyReactWebModules();

const builds = {
  '@hippy/react': {
    entry: './packages/hippy-react/src/index.ts',
    dest: './packages/hippy-react/dist/index.js',
    format: 'es',
    banner: banner('@hippy/react', hippyReactPackage.version),
    external(id) {
      return !![
        'react',
        'react-reconciler',
        '@hippy/react-reconciler',
      ].find(ext => id.startsWith(ext));
    },
  },
  '@hippy/react-web': {
    entry: [
      './packages/hippy-react-web/src/index.ts',
      ...hippyReactWebComponents,
      ...hippyReactWebModules,
    ],
    dest: './packages/hippy-react-web/dist/index.js',
    format: 'es',
    banner: banner('@hippy/react-web', hippyReactWebPackage.version),
    output: {
      dir: './packages/hippy-react-web/dist',
      format: 'es',
      entryFileNames: (bundle) => {
        if (bundle.facadeModuleId.includes('src/index.ts')) return '[name].js';
        if (bundle.facadeModuleId.includes('src/modules/')) return 'modules/[name].js';
        return 'lib/[name].js';
      },
      chunkFileNames: 'chunk/[name].[hash].js',
    },
    external(id) {
      return !![
        'react',
        'react-dom',
        'swiper',
        '@hippy/rmc-list-view',
        'rmc-pull-to-refresh',
      ].find(ext => id.startsWith(ext));
    },
    onwarn(warning) {
      //  ignore warning from package 'rmc-pull-to-refresh'
      if (warning.code === 'THIS_IS_UNDEFINED') {
        return;
      }
    },
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
          'process.env.HIPPY_REACT_VERSION': `"${hippyReactPackage.version}"`,
          'process.env.HIPPY_REACT_WEB_VERSION': `"${hippyReactWebPackage.version}"`,
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
    output: opts?.output ? opts.output : {
      name,
      file: opts.dest,
      format: opts.format,
      banner: opts.banner,
      exports: 'auto',
    },
    onwarn: opts?.onwarn ? opts.onwarn : (msg, warn) => {
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
