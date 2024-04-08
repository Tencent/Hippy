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

import ViewNode from '../../renderer/view-node';
import { SelectorsMap } from '../css-selectors-map';
import { SelectorsMatch } from '../css-selectors-match';
import { ChildGroup } from '../group/child-group';
import { SiblingGroup } from '../group/sibling-group';
import { SelectorCore } from './core-selector';
import { SimpleSelector } from './simple-selector';

export class Selector extends SelectorCore {
  public groups: ChildGroup[];
  public last: SelectorCore;
  public selectors: SimpleSelector[];

  public constructor(selectors: SimpleSelector[]) {
    super();
    const supportedCombinator = [undefined, ' ', '>', '+'];
    let siblingGroup: SimpleSelector[] = [];
    let lastGroup: SimpleSelector[][] = [];
    const groups: SimpleSelector[][][] = [];
    this.selectors = selectors;
    this.selectors.reverse().forEach((sel: SimpleSelector) => {
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
    this.groups = groups.map(g => new ChildGroup(g.map(sg => new SiblingGroup(sg))));
    const [firstSelector] = selectors;
    this.last = firstSelector;
    this.specificity = selectors.reduce((sum: number, sel: SimpleSelector) => sel.specificity + sum, 0);
    this.dynamic = selectors.some((sel: SimpleSelector) => sel.dynamic);
  }

  public toString(): string {
    return this.selectors.join('');
  }

  public match(matchNode?: ViewNode): boolean {
    let node: ViewNode | undefined = matchNode;
    return this.groups.every((group: ChildGroup, i: number) => {
      if (i === 0) {
        node = group.match(matchNode);
        return !!node;
      }
      let ancestor: ViewNode | undefined = node;
      while (ancestor = ancestor?.parentNode) {
        if (node = group.match(ancestor)) {
          return true;
        }
      }
      return false;
    });
  }

  public lookupSort(sorter: SelectorsMap): void {
    this.last.lookupSort(sorter, this);
  }

  public removeSort(sorter: SelectorsMap): void {
    this.last.removeSort(sorter, this);
  }

  public accumulateChanges(matchNode: ViewNode, map: SelectorsMatch): boolean {
    let node: ViewNode | undefined = matchNode;
    if (!this.dynamic) {
      return this.match(node);
    }

    const bounds: {
      left: ViewNode;
      right: ViewNode | undefined;
    }[] = [];
    const mayMatch = this.groups.every((group: ChildGroup, i: number) => {
      if (i === 0) {
        const nextNode = group.mayMatch(matchNode);
        bounds.push({ left: matchNode, right: matchNode });
        node = nextNode;
        return !!node;
      }
      let ancestor: ViewNode | undefined = matchNode;
      while (ancestor = ancestor.parentNode) {
        const nextNode = group.mayMatch(ancestor);
        if (nextNode) {
          bounds.push({ left: ancestor, right: undefined });
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
      let leftBound: ViewNode | undefined = bound.left;
      do {
        if (group.mayMatch(leftBound)) {
          group.trackChanges(leftBound, map);
        }
      } while ((leftBound !== bound.right) && (leftBound = leftBound.parentNode));
    }

    return mayMatch;
  }
}

