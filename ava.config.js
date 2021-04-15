import os from 'os';

const numCPUs = os.cpus().length;

export default {
  verbose: true,
  modules: false,
  cache: false,
  concurrency: numCPUs,
  failWithoutAssertions: true,
  tap: false,
  babel: false,
  extensions: false,
  compileEnhancements: false,
  files: [
    'packages/**/__tests__/*.test.js',
  ],
  sources: [
    'packages/**/*.js',
  ],
  require: [
    'esm', // Use ES modules in NodeJS.
    'module-alias/register', // Use _moduleDirectories defined package.json
    './scripts/flow-remove-types', // Remove flow definition from Vue.
    './scripts/mock-global', // Define the global
  ],
};
