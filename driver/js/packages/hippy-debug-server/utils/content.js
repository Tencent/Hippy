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
    returns = null;
  } else {
    const stat = fs.statSync(reqPath);

    if (stat.isDirectory()) {
      returns = dir(ctx.url, reqPath);
    } else {
      returns = fs.readFileSync(reqPath);
    }
  }

  return returns;
}

module.exports = content;
