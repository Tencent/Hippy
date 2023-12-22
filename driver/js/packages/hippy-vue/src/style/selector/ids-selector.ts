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
 * id 选择器实现
 */
export class IdSelector extends SimpleSelector {
  public id: string;

  constructor(id: string) {
    super();
    this.specificity = 0x00010000;
    this.rarity = 3;
    this.dynamic = false;
    this.id = id;
  }

  public toString(): string {
    return `#${this.id}${wrap(this.combinator || '')}`;
  }

  public match(node: ElementNode): boolean {
    if (!node) {
      return false;
    }
    return node.id === this.id;
  }

  public lookupSort(sorter: SelectorsMap, base: SelectorCore): void {
    sorter.sortById(this.id, base ?? this);
  }

  public removeSort(sorter: SelectorsMap, base: SelectorCore): void {
    sorter.removeById(this.id, base ?? this);
  }
}
