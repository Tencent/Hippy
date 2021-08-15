/* eslint-disable no-console */

const path = require('path');
const { rollup } = require('rollup');
const reactBuilds = require('./react-configs').getAllBuilds();
const vueBuilds = require('./vue-configs').getAllBuilds();

let builds = [...reactBuilds, ...vueBuilds];

// filter builds via command line arg
if (process.argv[2]) {
  const filters = process.argv[2].split(',');
  builds = builds.filter(b => filters.some(f => b.output.file.indexOf(f) > -1 || b.name.indexOf(f) > -1));
}

function blue(str) {
  return `\x1b[1m\x1b[34m${str}\x1b[39m\x1b[22m`;
}

function getSize(code) {
  return `${(code.length / 1024).toFixed(2)}kb`;
}

function logError(e) {
  console.error(e);
}

async function buildEntry(config) {
  const { output } = config;
  const { file } = output;
  const bundle = await rollup(config);
  await bundle.generate(output);
  const { output: [{ code }] } = await bundle.write(output);
  console.log(`${blue(path.relative(process.cwd(), file))} ${getSize(code)}`);
}

function build(buildSets) {
  let built = 0;
  const total = builds.length;
  const next = () => {
    buildEntry(buildSets[built])
      .then(() => {
        built += 1;
        if (built < total) {
          next();
        }
      })
      .catch(logError);
  };

  next();
}

build(builds);
