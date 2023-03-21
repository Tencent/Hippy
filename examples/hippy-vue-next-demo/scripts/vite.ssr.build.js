/**
 * build script for ssr
 */
const { arch } = require('os');
const { exec, rm } = require('shelljs');

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
 * 获取待执行的脚本文件
 *
 * @param configFile - config file name
 */
function getScriptCommand(configFile) {
  return `${envPrefixStr} vite build -c scripts/${configFile} ${mode}`;
}

/**
 * execute script
 *
 * @param scriptStr - script content
 * @param options - shelljs options
 */
function runScript(scriptStr, options = { silent: false }) {
  const result = exec(scriptStr, options);
  if (result.code !== 0) {
    console.error(`❌ execute cmd - "${scriptStr}" error: ${result.stderr}`);
    process.exit(1);
  }
}

// 0. remove dist directory
// console.log('remove dist directory:');
// rm('-rf', './dist');
// 1. build server bundle
console.log('building server bundle:');
runScript(getScriptCommand('vite.config.main-server.js'));

// 2. build async client bundle(include Android and iOS)
// console.log('\nbuilding Android client bundle:');
// build Android client bundle
// runScript(getScriptCommand('vite.config.android.js'));
// console.log('\nbuilding iOS client bundle:');
// build iOS client bundle
// runScript(getScriptCommand('vite.config.ios.js'));

// 3. build server entry
console.log('\nbuilding server entry:');
runScript(getScriptCommand('vite.config.entry-server.js'));

// 4. build ssr entry
console.log('\nbuilding ssr entry:');
runScript(getScriptCommand('vite.config.entry-ssr.js'));
