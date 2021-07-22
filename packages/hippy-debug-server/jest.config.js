// const { default: tsjPreset } = require('ts-jest/presets');

module.exports = {
  // setupFiles: [
  //   '<rootDir>/jest.setup.js',
  // ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    // '.*\\.(vue)$': 'vue-jest',
    '^.+\\.tsx?$': 'ts-jest',
    // 'node_modules/variables/.+\\.(j|t)sx?$': 'ts-jest'
  },
  transformIgnorePatterns: ['node_modules/(?!variables/.*)'],
  rootDir: './',
  // transform: {
  //   ...tsjPreset.transform,
  // },
  testRegex: '(src/__test__/.*\\.(test|spec))\\.[tj]sx?$',
  testPathIgnorePatterns: ['node_modules', 'dist'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'vue'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '.vue$': 'jest-transform-stub',
  },
  globals: {},
};
