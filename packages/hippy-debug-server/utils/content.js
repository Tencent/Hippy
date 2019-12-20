const path = require('path');
const fs = require('fs');
const dir = require('./dir');

function content(ctx, fullStaticPath) {
  let reqPath = path.join(fullStaticPath, ctx.url);
  if (reqPath.indexOf('?') > -1) {
    [reqPath] = reqPath.split('?');
  }
  const exist = fs.existsSync(reqPath);
  let returns = '';

  if (!exist) {
    returns = `${reqPath} is not found.`;
  } else {
    const stat = fs.statSync(reqPath);

    if (stat.isDirectory()) {
      returns = dir(ctx.url, reqPath);
    } else {
      returns = fs.readFileSync(reqPath, 'binary');
    }
  }

  return returns;
}

module.exports = content;
