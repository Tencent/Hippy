const fs = require('fs');
const mimes = require('./mimes');

function walk(reqPath) {
  const files = fs.readdirSync(reqPath);
  const dirList = [];
  const fileList = [];

  files.forEach((item) => {
    const itemArr = item.split('.');
    let itemMime;
    if (itemArr.length > 1) {
      itemMime = itemArr[itemArr.length - 1];
    } else {
      itemMime = 'undefined';
    }
    if (mimes[itemMime] === undefined) {
      dirList.push(item);
    } else {
      fileList.push(item);
    }
  });

  return [...dirList, ...fileList];
}

module.exports = walk;
