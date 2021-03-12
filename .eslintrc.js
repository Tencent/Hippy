module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint-config-tencent',
    'plugin:react/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  plugins: [
    '@typescript-eslint',
    'jsx-a11y',
  ],
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
      legacyDecorators: true,
      experimentalObjectRestSpread: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  globals: {
    __PLATFORM__: true,
    __GLOBAL__: true,
    Hippy: true,
  },
  rules: {
    indent: 2,
    'no-multi-spaces': 2,
    'no-restricted-syntax': [
      'warn',
      {
        selector: 'ForInStatement',
        message: 'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],
    'no-mixed-operators': ['error', {
      groups: [
        ['%', '**'],
        ['%', '+'],
        ['%', '-'],
        ['%', '*'],
        ['%', '/'],
        ['&', '|', '<<', '>>', '>>>'],
        ['==', '!=', '===', '!=='],
        ['&&', '||'],
      ],
      allowSamePrecedence: false
    }],
    'func-call-spacing': 'off',
    'new-cap': [
      'error',
      {
        newIsCap: true,
        newIsCapExceptions: [],
        capIsNew: false,
        capIsNewExceptions: ['Immutable.Map', 'Immutable.Set', 'Immutable.List'],
        properties: false,
      }
    ],
    'prefer-destructuring': [
      'warn',
      {   VariableDeclarator: {
          array: false,
          object: true,
        },
        AssignmentExpression: {
          array: true,
          object: false,
        },
      },
      {
        enforceForRenamedProperties: false,
      },
    ],
    quotes: [
      'error',
      'single',
      {
        allowTemplateLiterals: false,
      },
    ],
    'react/no-deprecated': 0,
    // Ignore the dependency by each package
    'import/no-unresolved': 'off',

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
          '__ISHIPPY__',
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
          ['he', './packages/hippy-vue/util/entity-decoder'],
          ['@localTypes', './packages/types'],
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
};
