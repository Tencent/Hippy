const path = require('path');
const fs = require('fs');

function dir(url, reqPath) {
  const contentList = fs.readdirSync(reqPath)
    .map((filePath) => {
      const isDir = fs.lstatSync(filePath).isDirectory();
      return {
        path,
        isDir,
      };
    })
    .sort((a, b) => (b.isDir && 1) || -1)
    .map(item => item.path);
  let html = '<ul>';
  contentList.forEach((item) => {
    html += `<li><a href="${url === '/' ? '' : url}/${item}">${item}</a></li>`;
  });
  html += '</ul>';

  return html;
}

function content(ctx, fullStaticPath) {
  const reqPath = path.join(fullStaticPath, ctx.path);
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
