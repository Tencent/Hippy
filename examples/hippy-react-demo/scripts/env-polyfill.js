const { exec } = require('shelljs');

const runScript = (scriptStr) => {
  console.log(`Full command execute: "${scriptStr}"`);
  const result = exec(scriptStr, { stdio: 'inherit' });
  if (result.code !== 0) {
    console.error(`❌ Execute cmd - "${scriptStr}" error: ${result.stderr}`);
    process.exit(1);
  }
};

const toNum = (originalNum) => {
  const num = `${originalNum}`;
  const versionList = num.split('.');
  const currentSplitLength = versionList.length;
  if (currentSplitLength !== 4) {
    let index = currentSplitLength;
    while (index < 4) {
      versionList.push('0');
      index += 1;
    }
  }
  const r = ['0000', '000', '00', '0', ''];
  for (let i = 0; i < versionList.length; i += 1) {
    let len = versionList[i].length;
    if (len > 4) {
      len = 4;
      versionList[i] = versionList[i].slice(0, 4);
    }
    versionList[i] = r[len] + versionList[i];
  }
  return versionList.join('');
};

const versionCompare = (targetVer, currentVer) => {
  if (!targetVer || !currentVer) return 1;
  const numA = toNum(currentVer);
  const numB = toNum(targetVer);
  if (numA === numB) {
    return 0;
  }
  return numA < numB ? -1 : 1;
};

const LEGACY_OPENSSL_VERSION = '3.0.0';
const scriptString = process.argv.slice(2).join(' ');
let envPrefixStr = '';

console.log(`Start to execute cmd: "${scriptString}"`);
console.log(`Current openssl version: ${process.versions.openssl}`);

const result = /^(\d+\.\d+\.\d+).*$/.exec(process.versions.openssl.toString().trim());
if (result && result[1]) {
  const currentVersion = result[1];
  const compareResult = versionCompare(LEGACY_OPENSSL_VERSION, currentVersion);
  if (compareResult >= 0) {
    envPrefixStr += 'cross-env-os NODE_OPTIONS=--openssl-legacy-provider';
  }
}

runScript(`${envPrefixStr} ${scriptString}`); // start to execute cmd
