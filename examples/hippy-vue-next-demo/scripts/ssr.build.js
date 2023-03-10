/**
 * build script for ssr
 */
const { arch } = require('os');
const { exec } = require('shelljs');

let envPrefixStr = 'cross-env-os os="Windows_NT,Linux,Darwin" minVersion=17 NODE_OPTIONS=--openssl-legacy-provider HIPPY_SSR=true';
const isArmCpu = arch()
  .toLowerCase()
  .includes('arm');
if (isArmCpu) {
  envPrefixStr = '';
}

const isProd = process.argv[process.argv.length - 1] !== 'development';
const mode = isProd ? '--mode production' : '--mode development';

/**
 * execute script
 *
 * @param scriptStr - script content
 * @param options - shelljs options
 */
function runScript(scriptStr, options) {
  const result = exec(scriptStr, options);
  if (result.code !== 0) {
    console.error(`❌ execute cmd - "${scriptStr}" error: ${result.stderr}`);
    process.exit(1);
  }
}

// 1. build server bundle
console.log('building server bundle:');
runScript(`${envPrefixStr} vite build -c scripts/vite.config.main-server.js ${mode}`);

// 2. build async client bundle(include Android and iOS)
console.log('\nbuilding client bundle:');

// 3. build server entry
console.log('\nbuilding server entry:');
runScript(`${envPrefixStr} vite build -c scripts/vite.config.entry-server.js ${mode}`);

// 4. build ssr entry
console.log('\nbuilding ssr entry:');
runScript(`${envPrefixStr} vite build -c scripts/vite.config.entry-ssr.js ${mode}`);
