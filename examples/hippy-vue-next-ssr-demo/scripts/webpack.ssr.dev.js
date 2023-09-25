/**
 * build script for ssr
 */

const webpack = require('webpack');
const { exec } = require('shelljs');
const serverConfig = require('./webpack-ssr-config/server.dev');

const compiler = webpack(serverConfig);
let childProcess = null;

/**
 * execute script
 *
 * @param scriptStr - script content
 * @param options - shelljs options
 */
function runScript(scriptStr, options) {
  if (childProcess) {
    // kill process first
    childProcess.kill();
  }
  childProcess = exec(scriptStr, options, (code, stdout, stderr) => {
    if (code) {
      console.error(`❌ execute cmd - "${scriptStr}" error: ${stderr}`);
      process.exit(1);
    }
  });
}

compiler.hooks.done.tap('DonePlugin', () => {
  // restart node process after build success
  setTimeout(() => {
    runScript('node ./dist/server/index.js', { async: true, silent: false });
  }, 0);
});

// watch server entry change
compiler.watch({}, () => {});
