module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2019,
    sourceType: 'module',
    createDefaultProgram: true,
  },
  extends: [
    '@tencent/eslint-config-tencent',
    '@tencent/eslint-config-tencent/ts',
    '@tencent/eslint-config-tencent/prettier',
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/explicit-member-accessibility': 'warn',
  },
  env: {
    // 指定代码的运行环境
    browser: true,
    node: true,
    // 自动启用es6语法和ES6全局变量
    es6: true,
  },
  globals: {},
};
