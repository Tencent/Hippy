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
import ViewNode from '../../renderer/view-node';
import { SelectorsMap } from '../css-selectors-map';
import { SelectorsMatch } from '../css-selectors-match';
import { SelectorCore } from '../selector/core-selector';
import { SimpleSelector } from '../selector/simple-selector';
import { wrap } from '../util';

export class SimpleSelectorSequence extends SimpleSelector {
  public head: SimpleSelector | null | boolean;
  public selectors: SimpleSelector[];

  public constructor(selectors: SimpleSelector[]) {
    super();
    this.specificity = selectors.reduce((sum, sel) => sel.specificity + sum, 0);
    this.head = selectors.reduce(
      (prev: null | boolean | SimpleSelector, curr: SimpleSelector) => (!prev
          || (prev instanceof SimpleSelector && curr.rarity > prev.rarity)
        ? curr
        : prev),
      null,
    );
    this.dynamic = selectors.some((sel: SimpleSelector) => sel.dynamic);
    this.selectors = selectors;
  }

  public toString() {
    return `${this.selectors.join('')}${wrap(this.combinator || '')}`;
  }

  public match(node: ViewNode): boolean {
    if (!node) return false;
    return this.selectors.every((sel: SimpleSelector) => sel.match(node));
  }

  public mayMatch(node: ViewNode): boolean {
    if (!node) return false;
    return this.selectors.every((sel: SimpleSelector) => sel.mayMatch(node));
  }

  public trackChanges(node: ViewNode, match: SelectorsMatch) {
    this.selectors.forEach((sel: SimpleSelector) => sel.trackChanges(node as ElementNode, match));
  }

  public lookupSort(sorter: SelectorsMap, base: SelectorCore) {
    if (this.head && this.head instanceof SimpleSelector) {
      this.head.lookupSort(sorter, base || this);
    }
  }

  public removeSort(sorter: SelectorsMap, base: SelectorCore) {
    if (this.head && this.head instanceof SimpleSelector) {
      this.head.removeSort(sorter, base || this);
    }
  }
}
