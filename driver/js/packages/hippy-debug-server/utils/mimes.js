/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
