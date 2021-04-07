const path = require('path');
const mime = require('mime');

mime.define({
  'application/javascript': ['bundle'],
  'application/octet-stream': ['unknown'],
  'text/css': ['css'],
  'image/gif': ['gif'],
  'text/html': ['html'],
  'image/x-icon': ['ico'],
  'image/jpeg': ['jpeg', 'jpg'],
  'text/javascript': ['js'],
  'application/json': ['json'],
  'application/pdf': ['pdf'],
  'image/png': ['png'],
  'image/svg+xml': ['svg'],
  'application/x-shockwave-flash': ['swf'],
  'image/tiff': ['tiff'],
  'text/plain': ['txt'],
  'audio/x-wav': ['wav'],
  'audio/x-ms-wma': ['wma'],
  'video/x-ms-wmv': ['wmv'],
  'text/xml': ['xml'],
}, true);

function parseMimeType(pathName) {
  let extName = path.extname(pathName);
  extName = extName ? extName.slice(1) : 'unknown';
  return mime.getType(extName) || extName;
}

module.exports = parseMimeType;
