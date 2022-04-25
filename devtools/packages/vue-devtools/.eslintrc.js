module.exports = {
  root: true,
  env: {
    browser: true,
  },
  extends: [
    'plugin:vue/recommended',
    '@vue/standard',
    '@vue/typescript/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  globals: {
    bridge: true,
    chrome: true,
    localStorage: 'off',
    HTMLDocument: true,
    name: 'off',
    browser: true,
  },
  rules: {
    'vue/html-closing-bracket-newline': [
      'error',
      {
        singleline: 'never',
        multiline: 'always',
      },
    ],
    'no-var': ['error'],
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        multiline: {
          delimiter: 'none',
        },
        singleline: {
          delimiter: 'comma',
        },
      },
    ],
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    camelcase: 'warn',
    'no-prototype-builtins': 'off',
    'no-use-before-define': 'off',
    'no-console': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'space-before-function-paren': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    '@typescript-eslint/no-unused-vars': 'off',
    'vue/require-default-prop': 'off',
    'vue/require-prop-types': 'off',
  },
  ignorePatterns: [
    'node_modules/',
    'lib/',
    'dist/',
    'build/',
    '/legacy',
  ],
  overrides: [
    {
      files: [
        'release.js',
        'sign-firefox.js',
        'extension-zips.js',
        'packages/build-tools/**',
        'packages/shell-electron/**',
        '**webpack.config.js',
      ],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/camelcase': 'off',
      },
    },
  ],
}
