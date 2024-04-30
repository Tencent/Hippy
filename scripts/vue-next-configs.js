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
const { babel } = require('@rollup/plugin-babel');
const cjs = require('@rollup/plugin-commonjs');
const replace = require('@rollup/plugin-replace');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const typescript = require('rollup-plugin-typescript2');
const { apiExtractor } = require('rollup-plugin-api-extractor');

const VueVersion = require('../packages/hippy-vue-next/node_modules/@vue/runtime-core/package.json').version;
const hippyVueNextPackage = require('../packages/hippy-vue-next/package.json');
const hippyStyleParserPackage = require('../packages/hippy-vue-next-style-parser/package.json');
const hippyCompilerSsrPackage = require('../packages/hippy-vue-next-compiler-ssr/package.json');
const hippyServerRendererPackage = require('../packages/hippy-vue-next-server-renderer/package.json');
const { banner, resolvePackage } = require('./utils');
const bannerStrAndHippyVueString = `\n * (Using Vue v${VueVersion} and Hippy-Vue-Next v${hippyVueNextPackage.version})`;

const builds = {
  '@hippy/hippy-vue-next-style-parser-cjs': {
    entry: resolvePackage('hippy-vue-next-style-parser', 'src/index.ts'),
    dest: resolvePackage('hippy-vue-next-style-parser', 'dist/index.js'),
    format: 'cjs',
    moduleName: 'hippy-vue-next-style-parser',
    banner: banner('@hippy/hippy-vue-next-style-parser', hippyStyleParserPackage.version, bannerStrAndHippyVueString, 2022),
    external: ['@vue/shared'],
  },
  '@hippy/hippy-vue-next-style-parser-esm': {
    entry: resolvePackage('hippy-vue-next-style-parser', 'src/index.ts'),
    dest: resolvePackage('hippy-vue-next-style-parser', 'dist/index.esm.js'),
    format: 'es',
    moduleName: 'hippy-vue-next-style-parser',
    banner: banner('@hippy/hippy-vue-next-style-parser', hippyStyleParserPackage.version, bannerStrAndHippyVueString, 2022),
    external: ['@vue/shared'],
  },
  '@hippy/vue-next-cjs': {
    entry: resolvePackage('hippy-vue-next', 'src/index.ts'),
    dest: resolvePackage('hippy-vue-next', 'dist/index.js'),
    format: 'cjs',
    banner: banner('@hippy/vue-next', hippyVueNextPackage.version, bannerStrAndHippyVueString, 2022),
    name: 'hippy-vue-next',
    external: ['@vue/runtime-core', '@vue/shared'],
  },
  '@hippy/vue-next-esm': {
    entry: resolvePackage('hippy-vue-next', 'src/index.ts'),
    dest: resolvePackage('hippy-vue-next', 'dist/index.esm.js'),
    format: 'es',
    banner: banner('@hippy/vue-next', hippyVueNextPackage.version, bannerStrAndHippyVueString, 2022),
    name: 'hippy-vue-next',
    external: ['@vue/runtime-core', '@vue/shared'],
  },
  '@hippy/vue-next-server-renderer-cjs': {
    entry: resolvePackage('hippy-vue-next-server-renderer', 'src/index.ts'),
    dest: resolvePackage('hippy-vue-next-server-renderer', 'dist/index.js'),
    format: 'cjs',
    moduleName: 'hippy-vue-next-server-renderer',
    banner: banner('@hippy/vue-next-server-renderer', hippyServerRendererPackage.version, bannerStrAndHippyVueString, 2022),
    external: ['@vue/server-renderer', '@vue/runtime-core', '@vue/shared'],
  },
  '@hippy/vue-next-server-renderer-esm': {
    entry: resolvePackage('hippy-vue-next-server-renderer', 'src/index.ts'),
    dest: resolvePackage('hippy-vue-next-server-renderer', 'dist/index.esm.js'),
    format: 'es',
    moduleName: 'hippy-vue-next-server-renderer',
    banner: banner('@hippy/vue-next-server-renderer', hippyServerRendererPackage.version, bannerStrAndHippyVueString, 2022),
    external: ['@vue/server-renderer', '@vue/runtime-core', '@vue/shared'],
  },
  '@hippy/vue-next-compiler-ssr': {
    entry: resolvePackage('hippy-vue-next-compiler-ssr', 'src/index.ts'),
    dest: resolvePackage('hippy-vue-next-compiler-ssr', 'dist/index.js'),
    format: 'cjs',
    moduleName: 'hippy-vue-next-compiler-ssr',
    banner: banner('@hippy/vue-next-compiler-ssr', hippyCompilerSsrPackage.version, bannerStrAndHippyVueString, 2022),
    external: ['@vue/compiler-core', '@vue/compiler-dom', '@vue/shared'],
  },
};

/**
 * 获取 babel 配置
 *
 * @param opts - package 配置项
 */
function getBabelConfig(opts) {
  if (opts.name === 'hippy-vue-next-style-parser') {
    return [];
  }

  return opts.name === 'hippy-vue-next' ? [
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
  ] : [
    babel({
      babelHelpers: 'runtime',
    }),
  ];
}

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
          'process.env.HIPPY_VUE_VERSION': `"${hippyVueNextPackage.version}"`,
          // enable vue-devtools if __VUE_DEVTOOLS_GLOBAL_HOOK__ exist
          'inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__': 'global.__VUE_DEVTOOLS_GLOBAL_HOOK__',
          // set __SSR__ to true when package is server-renderer
          __SSR__: opts.name === 'hippy-vue-next-server-renderer',
        },
      }),
      typescript({
        typescript: require('ttypescript'),
        tsconfigDefaults: {
          compilerOptions: {
            plugins: [
              // only deal with d.ts，ignore js
              // do not transform external npm package path in d.ts
              { transform: 'typescript-transform-paths', afterDeclarations: true, exclude: ['**/@vue/runtime-core/**'] },
            ],
          },
        },
        tsconfig: path.resolve(__dirname, '../tsconfig.json'),
        tsconfigOverride: {
          compilerOptions: {
            declaration: true,
            declarationMap: false,
          },
          exclude: ['**/__tests__/*.test.*'],
          include: [
            'packages/hippy-vue-*/src',
            'packages/global.d.ts',
            'node_modules/@types/web/index.d.ts',
            'node_modules/@types/node/index.d.ts',
          ],
        },
      }),
      apiExtractor({
        configFile: path.resolve(__dirname, '../packages/', opts.name || opts.moduleName, './api-extractor.json'),
        configuration: {
          projectFolder: '.',
          compiler: {
            tsconfigFilePath: './tsconfig.json',
          },
        },
        // set true will cause compilerMessageReporting config error
        cleanUpRollup: false,
      }),
      nodeResolve({
        preferBuiltins: true,
      }),
    ].concat(getBabelConfig(opts)).concat([cjs()])
      .concat(opts.plugins || []),
    output: {
      file: opts.dest,
      format: opts.format,
      banner: opts.banner,
      name: opts.moduleName || 'hippy-vue-next',
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
