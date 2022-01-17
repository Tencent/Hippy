const path = require('path');

function resolveVue(p) {
  return path.resolve(__dirname, './node_modules/vue/src/', p);
}

function resolvePackage(src, extra = 'src') {
  return path.resolve(__dirname, './framework/js/packages/', src, extra);
}

module.exports = {
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaFeatures: {
      jsx: true,
      legacyDecorators: true,
      experimentalObjectRestSpread: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  extends: [
    'eslint-config-tencent',
    'plugin:react/recommended',
    'plugin:vue/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  plugins: [
    'vue',
    '@typescript-eslint',
    'jsx-a11y',
  ],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        // Allow interface export
        'no-undef': 'off',
        // Force use 2 space for indent
        '@typescript-eslint/indent': ['error', 2],
        // Note you must disable the base rule as it can report incorrect errors
        'no-unused-vars': 'off',
        '@typescript-eslint/explicit-member-accessibility': ['error'],
        '@typescript-eslint/member-ordering': ['error'],
        '@typescript-eslint/adjacent-overload-signatures': ['error'],
        '@typescript-eslint/unified-signatures': ['error'],
        '@typescript-eslint/consistent-type-assertions': ['error'],
        '@typescript-eslint/no-inferrable-types': ['error'],
        '@typescript-eslint/typedef': ['error'],
        '@typescript-eslint/prefer-function-type': ['error'],
        '@typescript-eslint/no-parameter-properties': ['error'],
        '@typescript-eslint/no-namespace': ['error'],
        '@typescript-eslint/prefer-namespace-keyword': ['error'],
        '@typescript-eslint/no-non-null-asserted-optional-chain': ['error'],
        '@typescript-eslint/no-unused-expressions': ['error'],
        '@typescript-eslint/triple-slash-reference': ['error'],
        '@typescript-eslint/type-annotation-spacing': ['error'],
        '@typescript-eslint/method-signature-style': ['error'],
        '@typescript-eslint/consistent-type-definitions': ['error'],
      },
    },
  ],
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  globals: {
    __PLATFORM__: 'writable',
    __GLOBAL__: 'writable',
    Hippy: 'writable',
    WebSocket: 'writable',
    requestIdleCallback: 'writable',
    cancelIdleCallback: 'writable',
  },
  rules: {
    'no-restricted-globals': 'off',
    semi: ['error', 'always'],
    // Allow more than one component per file
    'vue/one-component-per-file': 'off',

    // Allow no default value
    'vue/require-default-prop': 'off',

    // Allow no prop type
    'vue/require-prop-types': 'off',

    // Allow event name not kebab-case
    'vue/custom-event-name-casing': 'off',

    'import/no-unresolved': 'off',

    // Allow import name different with file name
    'import/no-named-as-default': 'off',

    // Allow import cycle
    'import/no-cycle': 'off',

    // Disable prop-types
    'react/prop-types': 'off',

    // Disable deprecated
    'react/no-deprecated': 'off',

    'import/namespace': [
      'error',
      {
        allowComputed: true,
      },
    ],
    // Allow tsx as the jsx file
    'react/jsx-filename-extension': [
      'error',
      {
        extensions: ['.tsx', '.jsx'],
      },
    ],
    // Auto range order of imported module
    'import/order': ['error'],
    // Allow global underscore in dangle
    'no-underscore-dangle': [
      'warn',
      {
        allow: [
          '__PLATFORM__',
          '__HIPPYCURDIR__',
          '__ISHIPPY__',
          '__GLOBAL__',
          '__HIPPYNATIVEGLOBAL__',
          '__instanceId__',
          '_reactInternalFiber',
          '_reactInternals',
        ],
      },
    ],
  },
  settings: {
    react: {
      version: 'detect', // React version. "detect" automatically picks the version you have installed.
    },
    'import/ignore': [resolveVue('/')],
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', 'd.ts'],
      },
      alias: {
        map: [
          ['@vue', resolvePackage('hippy-vue')],
          ['@router', resolvePackage('hippy-vue-router')],
          ['@css-loader', resolvePackage('hippy-vue-css-loader')],
          ['@native-components', resolvePackage('hippy-vue-native-components')],
          ['vue', resolveVue('core/index')],
          ['web', resolveVue('platforms/web')],
          ['core', resolveVue('core')],
          ['shared', resolveVue('shared')],
          ['sfc', resolveVue('sfc')],
          ['he', path.resolve(__dirname, './framework/js/packages/hippy-vue/src/util/entity-decoder')],
        ],
      },
    },
  },
};
