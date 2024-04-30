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
const alias = require('@rollup/plugin-alias');
const { babel } = require('@rollup/plugin-babel');
const cjs = require('@rollup/plugin-commonjs');
const replace = require('@rollup/plugin-replace');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const flow = require('rollup-plugin-flow-no-whitespace');

const VueVersion = require('vue/package.json').version;
const hippyVuePackage = require('../packages/hippy-vue/package.json');
const cssLoaderPackage = require('../packages/hippy-vue-css-loader/package.json');
const nativeComponentsPackage = require('../packages/hippy-vue-native-components/package.json');
const routerPackage = require('../packages/hippy-vue-router/package.json');
const { banner, resolvePackage } = require('./utils');
const bannerStr = `\n * (Using Vue v${VueVersion})`;
const bannerStrAndHippyVueString = `\n * (Using Vue v${VueVersion} and Hippy-Vue v${hippyVuePackage.version})`;


function resolveVue(p) {
  return path.resolve(__dirname, '../node_modules/vue/src/', p);
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
  '@hippy/vue': {
    entry: resolvePackage('hippy-vue', 'src/index.js'),
    dest: resolvePackage('hippy-vue', 'dist/index.js'),
    format: 'es',
    banner: banner('@hippy/vue', hippyVuePackage.version, bannerStr),
  },
  '@hippy/vue-css-loader': {
    entry: {
      index: resolvePackage('hippy-vue-css-loader', 'src/index.js'),
      'css-loader': resolvePackage('hippy-vue-css-loader', 'src/css-loader.js'),
    },
    dir: resolvePackage('hippy-vue-css-loader', 'dist'),
    entryFileNames: '[name].js',
    format: 'cjs',
    moduleName: 'hippy-vue-css-loader',
    banner: banner('@hippy/vue-css-loader', cssLoaderPackage.version, bannerStrAndHippyVueString),
    external(id) {
      return id in Object.keys(cssLoaderPackage.dependencies);
    },
  },
  '@hippy/vue-native-components': {
    entry: resolvePackage('hippy-vue-native-components', 'src/index.js'),
    dest: resolvePackage('hippy-vue-native-components', 'dist/index.js'),
    format: 'es',
    moduleName: 'hippy-vue-native-components',
    banner: banner('@hippy/vue-native-components', nativeComponentsPackage.version, bannerStrAndHippyVueString),
  },
  '@hippy/vue-router': {
    entry: resolvePackage('hippy-vue-router', 'src/index.js'),
    dest: resolvePackage('hippy-vue-router', 'dist/index.js'),
    format: 'es',
    moduleName: 'hippy-vue-router',
    banner: banner('@hippy/vue-router', routerPackage.version, bannerStrAndHippyVueString),
  },
};

function genConfig(name) {
  const opts = builds[name];
  const config = {
    input: opts.entry,
    external: opts.external,
    treeshake: {
      moduleSideEffects: id => !id.startsWith('weex'),
    },
    plugins: [
      replace({
        preventAssignment: true,
        values: {
          __WEEX__: false,
          __VERSION__: VueVersion,
          'let _isServer': 'let _isServer = false',
          'process.env.VUE_VERSION': `"${VueVersion}"`,
          'process.env.HIPPY_VUE_VERSION': `"${hippyVuePackage.version}"`,
          // enable vue-devtools if __VUE_DEVTOOLS_GLOBAL_HOOK__ exist
          'inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__': 'global.__VUE_DEVTOOLS_GLOBAL_HOOK__',
        },
      }),
      flow(),
      alias({
        entries: aliases,
      }),
      nodeResolve({
        preferBuiltins: true,
      }),
      cjs(),
      babel({
        presets: [
          [
            '@babel/env',
            {
              targets: {
                chrome: '57',
              },
            },
          ],
        ],
        plugins: [
          [
            '@babel/plugin-transform-runtime',
            {
              corejs: false,
            },
          ],
        ],
        babelHelpers: 'runtime',
      }),
    ].concat(opts.plugins || []),
    output: {
      entryFileNames: opts.entryFileNames,
      dir: opts.dir,
      file: opts.dest,
      format: opts.format,
      banner: opts.banner,
      name: opts.moduleName || 'hippy-vue',
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

  Object.defineProperty(config, '_name', {
    enumerable: false,
    value: name,
  });

  return config;
}

module.exports.getAllBuilds = () => Object.keys(builds).map(genConfig);
