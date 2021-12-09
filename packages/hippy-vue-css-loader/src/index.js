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

import { getOptions } from 'loader-utils';
import { GLOBAL_STYLE_NAME } from '@vue/runtime/constants';
import parseCSS from './css-parser';
import translateColor from './color-parser';

let sourceId = 0;

/**
 * Convert the CSS text to AST that able to parse by selector parser.
 */
function hippyVueCSSLoader(source) {
  const options = getOptions(this);
  const parsed = parseCSS(source, { source: sourceId });
  sourceId += 1;
  const rulesAst = parsed.stylesheet.rules.filter(n => n.type === 'rule').map(n => ({
    selectors: n.selectors,
    declarations: n.declarations.map((dec) => {
      let { value } = dec;
      // FIXME: Should have a strict property with colors map.
      if (dec.property && dec.property.toLowerCase().indexOf('color') > -1) {
        value = translateColor(value, options);
      }
      return {
        type: dec.type,
        property: dec.property,
        value,
      };
    }),
  }));
  const code = `(function() {
    if (!global['${GLOBAL_STYLE_NAME}']) {
      global['${GLOBAL_STYLE_NAME}'] = [];
    }
    global['${GLOBAL_STYLE_NAME}'] = global['${GLOBAL_STYLE_NAME}'].concat(${JSON.stringify(rulesAst)});
    return global['${GLOBAL_STYLE_NAME}'];
  })()`;
  return `module.exports=${code}`;
}

export default hippyVueCSSLoader;
