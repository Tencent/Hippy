module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'airbnb',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  plugins: [
    '@typescript-eslint',
  ],
  env: {
    browser: true,
    node: true,
  },
  globals: {
    __PLATFORM__: true,
    __GLOBAL__: true,
    Hippy: true,
  },
  rules: {
    // Ignore the dependency by each package
    'import/no-unresolved': 'off',

    // Allow comment or require align with space
    'no-multi-spaces': 'off',

    // Allow import name different with file name
    'import/no-named-as-default': 'off',

    // Allow imoprt cycle
    'import/no-cycle': 'off',

    // Disable prop-types
    'react/prop-types': 'off',

    // Turn of extensions checking temporary
    'import/extensions': 'off',

    // https://github.com/benmosher/eslint-plugin-import/tree/master/docs/rules/namespace.md#allowcomputed
    'import/namespace': [
      'error',
      {
        allowComputed: true,
      },
    ],

    // Allow import from devDependencies
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          'scripts/*.js',
          'packages/**/types/*.d.ts', // FIXME: seems not working
          'packages/**/__tests__/*.test.js',
          'examples/**/scripts/*.js',
        ],
      },
    ],

    // Allow tsx as the jsx file
    'react/jsx-filename-extension': [
      'error',
      {
        extensions: ['.tsx', '.jsx'],
      },
    ],

    // Allow global underscore in dangle
    'no-underscore-dangle': [
      'error',
      {
        allow: [
          '__GLOBAL__',
          '__HIPPYNATIVEGLOBAL__',
          '__instanceId__',
          '_reactInternalFiber',
        ],
      },
    ],
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['vue', 'vue/src/core/index'],
          ['compiler', 'vue/src/compiler'],
          ['web', 'vue/src/platforms/web'],
          ['core', 'vue/src/core'],
          ['shared', 'vue/src/shared'],
          ['sfc', 'vue/src/sfc'],
          ['he', './packages/hippy-vue/util/entity-decoder'],
          ['@localTypes', './types'],
          ['@vue', './packages/hippy-vue/src'],
          ['@router', './packages/hippy-vue-router/src'],
          ['@css-loader', './packages/hippy-vue-css-loader/src'],
          ['@native-components', './packages/hippy-vue-native-components/src'],
        ],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      },
    },
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        // Allow interface export
        'no-undef': 'off',

        // Disable props checking
        'react/prop-types': 'off',

        // Force use 2 space for indent
        '@typescript-eslint/indent': ['error', 2],

        // Note you must disable the base rule as it can report incorrect errors
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
            'error',
            {
              vars: 'all',
              args: 'after-used',
              ignoreRestSiblings: false,
            },
        ],
      },
    },
  ],
}
