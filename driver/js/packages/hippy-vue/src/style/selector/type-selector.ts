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
import { wrap } from '../util';
import { SelectorCore } from './core-selector';
import { SimpleSelector } from './simple-selector';

/**
 * 类型选择器实现
 */
export class TypeSelector extends SimpleSelector {
  public cssType: string;

  public constructor(cssType: string) {
    super();
    this.specificity = 0x00000001;
    this.rarity = 1;
    this.dynamic = false;
    this.cssType = cssType;
  }

  public toString(): string {
    return `${this.cssType}${wrap(this.combinator || '')}`;
  }

  public match(node: ElementNode): boolean {
    if (!node) return false;
    return node.tagName === this.cssType;
  }

  public lookupSort(sorter: SelectorsMap, base: SelectorCore) {
    sorter.sortByType(this.cssType, base || this);
  }

  public removeSort(sorter: SelectorsMap, base: SelectorCore) {
    sorter.removeByType(this.cssType, base || this);
  }
}
