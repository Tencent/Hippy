const walk  = require('./walk');

function dir(url, reqPath) {
  const contentList = walk(reqPath);
  let html = '<ul>';
  contentList.forEach((item) => {
    html += `<li><a href="${url === '/' ? '' : url}/${item}">${item}</a></li>`;
  });
  html += '</ul>';

  return html;
}

module.exports = dir;
