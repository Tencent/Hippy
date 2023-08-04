const fs = require('fs-extra');
const chalk = require('chalk');
const yargs = require('yargs');
const glob = require('glob');
const { banner } = require('./utils');

let packages = glob.sync('packages/[!global]*').map(o => o.replace('packages/', ''));

if (yargs.argv._) {
  const filters = yargs.argv._.map(o => o.trim());
  packages = packages.filter(p => filters.includes(p));
}
const updateList = [];
const updatedList = [];
const needUpdateList = [];
/** update file */
const updateFile = (file, content, replace = false) => {
  const copyright = banner(undefined, undefined, undefined, undefined, false);
  let fileContent;
  if (replace) {
    fileContent = content.replace(/\/\*(\s|.)*?\*\//, copyright);
  } else {
    fileContent = `${copyright}\n${content}`;
  }
  updateList.push(new Promise(r => fs.writeFile(file, fileContent, 'utf8', (err) =>  {
    if (err) return console.error(err);
    updatedList.push(file);
    r();
  })));
};

/**
 * @example node scripts/copyright.js hippy-react hippy-react-web
 * @example node scripts/copyright.js hippy-react hippy-react-web --force  强制更新
 */
console.log('choise packages', packages);
packages.forEach((pkg) => {
  const files = glob.sync(`packages/${pkg}/src/**/*.ts`, {
    ignore: ['**/node_modules/**', '**/dist/**'],
  });
  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    if (!content.includes('* Copyright (C) 2017-') || !content.includes('THL A29 Limited, a Tencent company')) {
      // not found copyright, add it.
      updateFile(file, content);
    } else if (!content.includes(banner(undefined, undefined, undefined, undefined, false)) && file === 'packages/hippy-react/src/adapters/animated.ts') {
      if (yargs.argv.force) {
        updateFile(file, content, true);
      } else {
        needUpdateList.push(file);
      }
    }
  });


  Promise.all(updateList).then(() => {
    if (updatedList.length) {
      console.log(chalk.cyan('\nauto add copyright header:'));
      console.log(chalk.green(updatedList.join('\n')));
    } else {
      console.log(chalk.green('all files check copyright is ok.'));
    }
  })
    .catch((e) => {
      console.log(chalk.yellow('add copyright found err'), e);
    })
    .finally(() => {
      if (needUpdateList.length) {
        console.log(chalk.yellow('\nneed to update copyright:'));
        console.log(chalk.grey(needUpdateList.join('\n')));
      }
    });
});
