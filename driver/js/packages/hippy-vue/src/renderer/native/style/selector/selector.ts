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

import { ChildGroup } from '../group/child-group';
import { SiblingGroup } from '../group/sibling-group';
import { SelectorCore } from './core-selector';
import { SimpleSelector } from './simple-selector';

export class Selector extends SelectorCore {
  public groups: any;
  public last: SelectorCore;
  public selectors: SimpleSelector[];

  public constructor(selectors: SimpleSelector[]) {
    super();
    const supportedCombinator = [undefined, ' ', '>', '+'];
    let siblingGroup;
    let lastGroup;
    const groups: any = [];
    this.selectors = selectors;
    this.selectors.reverse().forEach((sel: any) => {
      if (supportedCombinator.indexOf(sel.combinator) === -1) {
        throw new Error(`Unsupported combinator "${sel.combinator}".`);
      }
      if (sel.combinator === undefined || sel.combinator === ' ') {
        groups.push(lastGroup = [siblingGroup = []]);
      }
      if (sel.combinator === '>') {
        lastGroup.push(siblingGroup = []);
      }
      siblingGroup.push(sel);
    });
    // @ts-expect-error TS(7006): Parameter 'g' implicitly has an 'any' type.
    this.groups = groups.map(g => new ChildGroup(g.map((sg: any) => new SiblingGroup(sg))));
    this.last = selectors[0];
    this.specificity = selectors.reduce((sum: any, sel: any) => sel.specificity + sum, 0);
    this.dynamic = selectors.some((sel: any) => sel.dynamic);
  }

  toString() {
    return this.selectors.join('');
  }

  public match(node: any) {
    return this.groups.every((group: any, i: any) => {
      if (i === 0) {
        node = group.match(node);
        return !!node;
      }
      let ancestor = node;
      while (ancestor = ancestor.parentNode) {
        if (node = group.match(ancestor)) {
          return true;
        }
      }
      return false;
    });
  }

  public lookupSort(sorter: any) {
    this.last.lookupSort(sorter, this);
  }

  public removeSort(sorter: any) {
    this.last.removeSort(sorter, this);
  }

  public accumulateChanges(node: any, map: any) {
    if (!this.dynamic) {
      return this.match(node);
    }

    const bounds: any = [];
    const mayMatch = this.groups.every((group: any, i: any) => {
      if (i === 0) {
        const nextNode = group.mayMatch(node);
        bounds.push({ left: node, right: node });
        node = nextNode;
        return !!node;
      }
      let ancestor = node;
      while (ancestor = ancestor.parentNode) {
        const nextNode = group.mayMatch(ancestor);
        if (nextNode) {
          bounds.push({ left: ancestor, right: null });
          node = nextNode;
          return true;
        }
      }
      return false;
    });

    // Calculating the right bounds for each selectors won't save much
    if (!mayMatch) {
      return false;
    }

    if (!map) {
      return mayMatch;
    }

    for (let i = 0; i < this.groups.length; i += 1) {
      const group = this.groups[i];
      if (!group.dynamic) {
        continue;
      }
      const bound = bounds[i];
      let leftBound = bound.left;
      do {
        if (group.mayMatch(leftBound)) {
          group.trackChanges(leftBound, map);
        }
      } while ((leftBound !== bound.right) && (leftBound = node.parentNode));
    }

    return mayMatch;
  }
}

