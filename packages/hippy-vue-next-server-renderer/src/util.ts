/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

import type { NeedToTyped, SsrNode } from './index';

const unescapeRE = /&quot;|&amp;|&#39;|&lt;|&gt;/;

/**
 * unescape xss html entity
 *
 * @param string - html entity string
 */
export function unescapeHtml(string: string): string {
  let str = string;
  const match = unescapeRE.exec(str);

  // return if non match
  if (!match) {
    return str;
  }

  // unescape
  str = str.replace(/&quot;/g, '"');
  str = str.replace(/&amp;/g, '&');
  str = str.replace(/&#39;/g, '\'');
  str = str.replace(/&lt;/g, '<');
  str = str.replace(/&gt;/g, '>');

  return str;
}

/**
 * remove unnecessary punctuation in node string, and parse node string to object
 */
export function getObjectNodeList(nodeString: (string | string[])[], rootNode?: SsrNode): NeedToTyped {
  // flat nested array and connect
  // for example [
  //       '{"id":22,"index":0,"name":"View","tagName":"div","props":{},"children":[',
  //       [ '{"id":23,"index":0,"name":"View","tagName":"div","props":{},},' ],
  //       '],},'
  //     ]
  // transform to
  // ['{"id":22,"index":0,"name":"View","tagName":"div","props":{},"children":
  // [','{"id":23,"index":0,"name":"View","tagName":"div","props":{},},', '],},']
  const rawString = nodeString.flat(Infinity).join('');
  // remove unnecessary punctuation
  let parsedStr = rawString
    .replace(/,}|,]/g, match => match.slice(1))
    .replace(/,$/, '')
    .replace(/\n/g, '\\n');
  let ssrNodeTree: NeedToTyped;
  try {
    if (rootNode) {
      const rootNodeStr = JSON.stringify(rootNode);
      parsedStr = rootNodeStr.replace('"children":[]', `"children":[${parsedStr}]`);
    }
    // parse json string to json object
    ssrNodeTree = JSON.parse(parsedStr);
    return ssrNodeTree;
  } catch (e) {
    return null;
  }
}
