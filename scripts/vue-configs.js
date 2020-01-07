const path        = require('path');
const alias       = require('rollup-plugin-alias');
const buble       = require('rollup-plugin-buble');
const cjs         = require('rollup-plugin-commonjs');
const replace     = require('rollup-plugin-replace');
const node        = require('rollup-plugin-node-resolve');
const flow        = require('rollup-plugin-flow-no-whitespace');

const VueVersion  = require('vue/package.json').version;
const hippyVuePackage = require('../packages/hippy-vue/package.json');
const cssLoaderPackage = require('../packages/hippy-vue-css-loader/package.json');
const nativeComponentsPackage = require('../packages/hippy-vue-native-components/package.json');
const routerPackage = require('../packages/hippy-vue-router/package.json');

const andHippyVueString = ` and Hippy-Vue v${hippyVuePackage.version}`;

function banner(name, version) {
  const startYear = 2017;
  const thisYear = new Date().getFullYear();
  let copyRightYears = thisYear;
  if (startYear !== thisYear) {
    copyRightYears = `${startYear}-${thisYear}`;
  }

  return `/*!
 * ${name} v${version}
 * (Using Vue v${VueVersion}${name !== 'hippy-vue' ? andHippyVueString : ''})
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

function resolveVue(p) {
  return path.resolve(__dirname, '../node_modules/vue/src/', p);
}

function resolvePackage(src, extra = 'src') {
  return path.resolve(__dirname,  '../packages/', src, extra);
}

const aliases = {
  vue: resolveVue('core/index'),
  compiler: resolveVue('compiler'),
  web: resolveVue('platforms/web'),
  core: resolveVue('core'),
  shared: resolveVue('shared'),
  sfc: resolveVue('sfc'),
  he: path.resolve(__dirname, '../packages/hippy-vue/src/util/entity-decoder'),
  '@vue': resolvePackage('hippy-vue'),
  '@router': resolvePackage('hippy-vue-router'),
  '@css-loader': resolvePackage('hippy-vue-css-loader'),
  '@native-components': resolvePackage('hippy-vue-native-components'),
};

const builds = {
  'hippy-vue': {
    entry: resolvePackage('hippy-vue', 'src/index.js'),
    dest: resolvePackage('hippy-vue', 'dist/index.js'),
    format: 'es',
    banner: banner('hippy-vue', hippyVuePackage.version),
  },
  'hippy-vue-css-loader': {
    entry: resolvePackage('hippy-vue-css-loader', 'src/index.js'),
    dest: resolvePackage('hippy-vue-css-loader', 'dist/index.js'),
    format: 'cjs',
    moduleName: 'hippy-vue-css-loader',
    banner: banner('hippy-vue-css-loader', cssLoaderPackage.version),
    external(id) {
      return id in Object.keys(cssLoaderPackage.dependencies);
    },
  },
  'hippy-vue-native-components': {
    entry: resolvePackage('hippy-vue-native-components', 'src/index.js'),
    dest: resolvePackage('hippy-vue-native-components', 'dist/index.js'),
    format: 'es',
    moduleName: 'hippy-vue-native-components',
    banner: banner('hippy-vue-native-components', nativeComponentsPackage.version),
  },
  'hippy-vue-router': {
    entry: resolvePackage('hippy-vue-router', 'src/index.js'),
    dest: resolvePackage('hippy-vue-router', 'dist/index.js'),
    format: 'es',
    moduleName: 'hippy-vue-router',
    banner: banner('hippy-vue-router', routerPackage.version),
  },
};

function genConfig(name) {
  const opts = builds[name];
  const config = {
    input: opts.entry,
    external: opts.external,
    treeshake: {
      pureExternalModules: id => id.startsWith('weex'),
    },
    plugins: [
      replace({
        __WEEX__: false,
        __VERSION__: VueVersion,
        'let _isServer': 'let _isServer = false',
        'process.env.VUE_VERSION': `"${VueVersion}"`,
        'process.env.HIPPY_VUE_VERSION': `"${hippyVuePackage.version}"`,
      }),
      flow(),
      buble({
        objectAssign: 'Object.assign',
        transforms: {
          arrow: true,
          modules: false,
          dangerousForOf: true,
        },
      }),
      alias(aliases),
      node({
        preferBuiltins: true,
      }),
      cjs(),
    ].concat(opts.plugins || []),
    output: {
      file: opts.dest,
      format: opts.format,
      banner: opts.banner,
      name: opts.moduleName || 'hippy-vue',
    },
  };

  if (opts.env) {
    config.plugins.push(replace({
      'process.env.NODE_ENV': JSON.stringify(opts.env),
    }));
  }

  Object.defineProperty(config, '_name', {
    enumerable: false,
    value: name,
  });

  return config;
}

module.exports.getAllBuilds = () => Object.keys(builds).map(genConfig);
