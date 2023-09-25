/**
 * build js script for ssr production
 */
const { arch } = require('os');
const { exec, rm, cp } = require('shelljs');

let envPrefixStr = 'cross-env-os os="Windows_NT,Linux,Darwin" minVersion=17 NODE_OPTIONS=--openssl-legacy-provider';
const isArmCpu = arch()
  .toLowerCase()
  .includes('arm');
if (isArmCpu) {
  envPrefixStr = '';
}

/**
 * get executed script
 *
 * @param configFile - config file name
 */
function getScriptCommand(configFile) {
  return `${envPrefixStr} webpack --config scripts/webpack-ssr-config/${configFile} --mode production`;
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
 */
function buildServerEntry() {
  // build server entry
  runScript(getScriptCommand('server.entry.js'));
}

/**
 * build ssr sever and client bundle
 */
function buildJsBundle() {
  // build Android client bundle
  runScript(getScriptCommand('client.android.js'));
  // build iOS client bundle
  runScript(getScriptCommand('client.ios.js'));
  // 3. build client entry
  runScript(getScriptCommand('client.entry.js'));
}

/**
 * build js vendor for production
 */
function buildJsVendor() {
  // ios
  runScript(getScriptCommand('client.ios.vendor.js'));
  // android
  runScript(getScriptCommand('client.android.vendor.js'));
}

/**
 * generate client entry js bundle for production
 */
function generateClientEntryForProduction() {
  // copy js entry to every platform
  // ios
  cp('-f', './dist/index.js', './dist/ios/index.ios.js');
  // android
  cp('-f', './dist/index.js', './dist/android/index.android.js');
}

/**
 * copy generated files to native demo
 */
function copyFilesToNativeDemo() {
  cp('-Rf', './dist/ios/*', '../ios-demo/res/'); // Update the ios demo project
  cp('-Rf', './dist/android/*', '../android-demo/res/'); // # Update the android project
}

/**
 * build production bundle
 */
function buildProduction() {
  // production, build all entry bundle, ssr server should execute by user
  // first, remove dist directory
  rm('-rf', './dist');
  // second, build js vendor
  buildJsVendor();
  // third, build all js bundle
  buildJsBundle();
  // fourth, build client entry
  buildServerEntry();
  // fifth, build every platform's client entry
  generateClientEntryForProduction();
  // last, copy all files to native demo
  copyFilesToNativeDemo();
}

// build production bundle
buildProduction();


