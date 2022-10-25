const { exec } = require('shelljs');

const scriptString = process.argv.slice(2).join(' ');

const execOptions = { stdio: 'inherit' };
function runScript(scriptStr) {
  const result = exec(scriptStr, execOptions);
  if (result.code !== 0) {
    console.error(`❌ execute cmd - "${scriptStr}" error: ${result.stderr}`);
    process.exit(1);
  }
}

console.log(`Start to execute cmd "${scriptString}"`);
let envPrefixStr = 'cross-env-os os="Windows_NT,Linux,Darwin" minVersion=17 NODE_OPTIONS=--openssl-legacy-provider';
const isArmCpu = !!require('os').arch()
  .toLowerCase()
  .includes('arm');
if (isArmCpu) {
  envPrefixStr = '';
}
runScript(`${envPrefixStr} ${scriptString}`); // start to execute cmd
