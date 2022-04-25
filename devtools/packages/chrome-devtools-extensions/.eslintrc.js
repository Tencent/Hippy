const path = require('path');

module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    project: [path.resolve(__dirname, './tsconfig.json')],
    parser: '@typescript-eslint/parser',
    extraFileExtensions: ['.vue'],
    ecmaVersion: 2019,
    sourceType: 'module',
    createDefaultProgram: true,
  },
  extends: [
    '@vue/typescript/recommended',
    'eslint-config-tencent',
    'eslint-config-tencent/ts',
    'eslint-config-tencent/prettier',
  ],
  plugins: ['header'],
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  globals: {
    __static: 'readonly',
    SERVER_DOMAIN: 'readonly',
  },
  ignorePatterns: ['node_modules/', '/packages/*/lib/', 'dist/', 'build/', 'build-node/', '/legacy', 'vue-devtools/'],
  rules: {
    '@typescript-eslint/explicit-member-accessibility': 'warn',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      },
    ],
    'chalk/chalk': 'off',
    'header/header': [
      'warn',
      'block',
      [
        '',
        ' * Tencent is pleased to support the open source community by making',
        ' * Hippy available.',
        ' *',
        ' * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.',
        ' * All rights reserved.',
        ' *',
        ' * Licensed under the Apache License, Version 2.0 (the "License");',
        ' * you may not use this file except in compliance with the License.',
        ' * You may obtain a copy of the License at',
        ' *',
        ' *   http://www.apache.org/licenses/LICENSE-2.0',
        ' *',
        ' * Unless required by applicable law or agreed to in writing, software',
        ' * distributed under the License is distributed on an "AS IS" BASIS,',
        ' * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.',
        ' * See the License for the specific language governing permissions and',
        ' * limitations under the License.',
        '',
      ],
      2,
    ],
  },
  overrides: [
    {
      files: ['{vue.config.js,.eslintrc.js}'],
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['__tests__', '__mocks__', 'src/@types/index.d.ts', 'src/**/*.{vue,css,scss}'],
      rules: {
        "header/header": 'off',
      },
    },
  ],
};
