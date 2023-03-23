/**
 * build script for ssr
 */
const { arch } = require('os');
const { exec, rm } = require('shelljs');
const { watch } = require('chokidar');

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
 * get executed script
 *
 * @param configFile - config file name
 * @param env - environment
 */
function getScriptCommand(configFile, env = '--mode development') {
  return `${envPrefixStr} webpack --config scripts/webpack-ssr-config/${configFile} ${env}`;
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

/**
 * build ssr client entry bundle
 *
 * @param env - environment
 */
function buildServerEntry(env = '') {
  // build server entry
  runScript(getScriptCommand('server.entry.js', env));
}

/**
 * build ssr sever and client bundle
 *
 * @param env - environment
 */
function buildJsBundle(env = '') {
  // 1. build server bundle
  runScript(getScriptCommand('server.bundle.js', env));
  // 2. build async client bundle(include Android and iOS)
  // build Android client bundle
  runScript(getScriptCommand('client.android.js', env));
  // build iOS client bundle
  runScript(getScriptCommand('client.ios.js', env));
  // 3. build client entry
  runScript(getScriptCommand('client.entry.js', env));
}

/**
 * build production bundle
 */
function buildProduction() {
  // production, build all entry bundle, ssr server should execute by user
  // first, remove dist directory
  rm('-rf', './dist');
  // second, build all js bundle
  buildJsBundle(mode);
  // third, build client entry
  buildServerEntry(mode);
}

/**
 * build development bundle
 */
function buildDevelopment() {
  // development, build all entry bundle and execute all server, watching
  // first, remove dist directory
  rm('-rf', './dist');
  // second, build all js bundle
  buildJsBundle();
  // third, build server entry
  buildServerEntry();
}

// build bundle
isProd ? buildProduction() : buildDevelopment();

// development watch and rebuild
if (!isProd) {
  // watch all js
  watch('./src').on('change', (eventName, path, stats) => {
    console.log(`file changed: ${eventName}, path: ${path}, status: ${stats}. rebuild all js bundle.`);
    buildJsBundle();
    buildServerEntry();
  });


  // watch server entry
  watch('./server.ts').on('change', (eventName, path, stats) => {
    console.log(`file changed: ${eventName}, path: ${path}, status: ${stats}. rebuild server entry.`);
    buildServerEntry();
  });
}


