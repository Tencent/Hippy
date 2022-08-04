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

import {
  HIPPY_GLOBAL_STYLE_NAME,
  HIPPY_GLOBAL_DISPOSE_STYLE_NAME,
} from '@hippy-shared/index';

import { SelectorsMap } from './css-selectors-match';

import { fromAstNodes } from './index';

// global css map
let globalCssMap: SelectorsMap;
export function getCssMap(): SelectorsMap {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const styleCssMap = global[HIPPY_GLOBAL_STYLE_NAME];

  /**
   * To support dynamic import, globalCssMap can be loaded from different js file.
   * globalCssMap should be created/appended if global[GLOBAL_STYLE_NAME] exists;
   */
  if (globalCssMap && !styleCssMap) {
    return globalCssMap;
  }
  /**
   *  Here is a secret startup option: beforeStyleLoadHook.
   *  Usage for process the styles while styles loading.
   */
  const cssRules = fromAstNodes(styleCssMap);
  if (globalCssMap) {
    globalCssMap.append(cssRules);
  } else {
    globalCssMap = new SelectorsMap(cssRules);
  }

  // after the global style processing is complete, remove the value of this object
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global[HIPPY_GLOBAL_STYLE_NAME] = undefined;

  // if there are currently expired styles, hot update style processing
  if (global[HIPPY_GLOBAL_DISPOSE_STYLE_NAME]) {
    // the new css style will be generated with hash id, so it can be removed by id
    global[HIPPY_GLOBAL_DISPOSE_STYLE_NAME].forEach((id) => {
      // remove outdated styles
      globalCssMap.delete(id);
    });

    // remove saved expired styles
    global[HIPPY_GLOBAL_DISPOSE_STYLE_NAME] = undefined;
  }

  return globalCssMap;
}
