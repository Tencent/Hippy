/* eslint-disable global-require */

const path = require('path');
const fs = require('fs');
const findUp = require('find-up');

function getProjectRootPath(opts) {
  const cwd = opts && opts.cwd ? opts.cwd : process.cwd();
  const p = findUp.sync('package.json', { cwd });
  return p ? path.dirname(p) : p;
}

function getPackageVersion(packageName, opts) {
  const rootPath = getProjectRootPath(opts);
  if (!rootPath) {
    return null;
  }
  const packagePath = path.resolve(`${rootPath}/node_modules/${packageName}`);
  if (!fs.existsSync(packagePath)) {
    return null;
  }
  try {
    /* eslint-disable-next-line import/no-dynamic-require */
    const pkg = require(path.resolve(`${packagePath}/package.json`));
    return pkg.version;
  } catch (err) {
    return null;
  }
}

function getFrameworkVersion(opts) {
  let framework = null;

  const projectRootPath = getProjectRootPath(opts);

  if (!projectRootPath) {
    return null;
  }

  try {
    /* eslint-disable-next-line import/no-dynamic-require */
    const projectPackage = require(path.resolve(projectRootPath, './package.json'));
    if (typeof projectPackage.bundleConfig === 'object') {
      ({ framework } = projectPackage.bundleConfig);
    }
    if (!framework) {
      const { dependencies } = projectPackage;
      const dependencyList = Object.keys(dependencies);
      switch (true) {
        case dependencyList.includes('@tencent/hippy-react-qb'):
          framework = 'hippy-react-qb';
          break;
        case dependencyList.includes('hippy-react') || dependencyList.includes('hippy-react'):
          framework = 'hippy-react';
          break;
        case dependencyList.includes('hippy-vue') || dependencyList.includes('hippy-vue'):
          framework = 'hippy-vue';
          break;
        default:
          // pass
      }
    }
  } catch (err) {
    return null;
  }

  if (framework) {
    // Try to get the version
    let package = framework;
    if (framework === 'hippy-react-qb') {
      package = `@tencent/${framework}`;
    }
    let frameworkVersion = getPackageVersion(package, opts);
    // Otherwise the version from public scope
    if (!frameworkVersion) {
      frameworkVersion = getPackageVersion(framework, opts);
    }
    return [framework, frameworkVersion];
  }
  return null;
}

module.exports = {
  getFrameworkVersion,
  getPackageVersion,
};
