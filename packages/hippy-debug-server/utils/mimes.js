const path = require('path');

const mimeTypes = {
  unknown: 'application/octet-stream',
  css: 'text/css',
  less: 'text/css',
  gif: 'image/gif',
  html: 'text/html',
  ico: 'image/x-icon',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  js: 'text/javascript',
  json: 'application/json',
  pdf: 'application/pdf',
  png: 'image/png',
  svg: 'image/svg+xml',
  swf: 'application/x-shockwave-flash',
  tiff: 'image/tiff',
  txt: 'text/plain',
  wav: 'audio/x-wav',
  wma: 'audio/x-ms-wma',
  wmv: 'video/x-ms-wmv',
  xml: 'text/xml',
  bundle: 'application/javascript',
};

function parseMimeType(pathName) {
  let extName = path.extname(pathName);
  extName = extName ? extName.slice(1) : 'unknown';
  return mimeTypes[extName];
}

module.exports = parseMimeType;
