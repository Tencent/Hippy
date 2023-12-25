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

import ElementNode from '../../renderer/element-node';
import { SelectorsMap } from '../css-selectors-map';
import { SelectorsMatch } from '../css-selectors-match';
import { RuleSet } from '../ruleset';

/**
 * 选择器基类
 */
export class SelectorCore {
  // is it a dynamic style
  public dynamic?: boolean;

  // style weight
  public specificity = 0;

  // rule set
  public ruleSet?: RuleSet;

  public lookupSort(sorter: SelectorsMap, base?: SelectorCore): void {
    sorter.sortAsUniversal(base || this);
  }

  public removeSort(sorter: SelectorsMap, base?: SelectorCore): void {
    sorter.removeAsUniversal(base || this);
  }

  public trackChanges(node: ElementNode, map: SelectorsMatch) {
    if (this.dynamic) {
      // 插入动态属性
      map.addAttribute(node, '');
    }
  }
}
