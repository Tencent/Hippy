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

// 全局css map
let globalCssMap: SelectorsMap;
export function getCssMap(): SelectorsMap {
  // 来自css文件生成的样式map，这里是基于外部内联到文件中的内容，故而ignore
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const styleCssMap = global[HIPPY_GLOBAL_STYLE_NAME];

  /**
   * To support dynamic import, globalCssMap can be loaded from different js file.
   * globalCssMap should be create/append if global[GLOBAL_STYLE_NAME] exists;
   *
   * 因为支持了动态import，所以每个js bundle内都可能包含global[GLOBAL_STYLE_NAME]，所以如果新加载的
   * bundle内存在global[HIPPY_GLOBAL_STYLE_NAME]，则将其append到样式map中
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

  // 全局样式处理完成后，移除该对象的值
  // 来自css文件生成的样式map，这里是基于外部内联到文件中的内容，故而ignore
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global[HIPPY_GLOBAL_STYLE_NAME] = undefined;

  // 如果当前有过期样式，则进行热更新样式处理
  if (global[HIPPY_GLOBAL_DISPOSE_STYLE_NAME]) {
    // 新的css样式生成时会带上hash id，因此可以通过id来进行移除
    global[HIPPY_GLOBAL_DISPOSE_STYLE_NAME].forEach((id) => {
      // 移除过期样式
      globalCssMap.delete(id);
    });

    // 移除保存的过期样式
    global[HIPPY_GLOBAL_DISPOSE_STYLE_NAME] = undefined;
  }

  return globalCssMap;
}
