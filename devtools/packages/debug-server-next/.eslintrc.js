module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2019,
    sourceType: 'module',
    createDefaultProgram: true,
  },
  extends: [
    'plugin:import/recommended',
    'plugin:import/typescript',
    'eslint-config-tencent',
    'eslint-config-tencent/ts',
    'eslint-config-tencent/prettier',
  ],
  plugins: ['import', '@typescript-eslint', 'header'],
  rules: {
    '@typescript-eslint/explicit-member-accessibility': 'warn',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        pathGroups: [
          {
            pattern: '@debug-server-next/**',
            group: 'external',
            position: 'after',
          },
        ],
      },
    ],
    'chalk/chalk': 'off',
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: false,
      },
    ],
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
      files: ['src/@types/**/*'],
      rules: {
        '@typescript-eslint/triple-slash-reference': 'off',
        'no-var': 'off',
      },
    },
    {
      files: ['src/index.ts', 'src/index-dev.ts', 'src/index-debug.ts', 'src/__test__', 'src/__mock__', 'src/@types/index.d.ts'],
      rules: {
        "header/header": 'off',
      },
    },
  ],
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  globals: {
    appArgv: true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
};
