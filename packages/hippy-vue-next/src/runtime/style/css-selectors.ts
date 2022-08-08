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

/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
/* eslint-disable prefer-destructuring */
/* eslint-disable key-spacing */
/* eslint-disable no-cond-assign */
/* eslint-disable arrow-body-style */
/* eslint-disable no-useless-escape */
/* eslint-disable max-len */
/* eslint-disable no-continue */
/* eslint-disable no-param-reassign */
// eslint-disable-next-line max-classes-per-file
import type { CssDeclarationType } from '@hippy-vue-next-style-parser/index';

import type { HippyElement } from '../element/hippy-element';

import type { SelectorsMap, SelectorsMatch } from './css-selectors-match';

/**
 * Base classes
 */
class SelectorCore {
  // is it a dynamic style
  public dynamic?: boolean;

  // style weight
  public specificity = 0;

  // rule set
  public ruleSet?: RuleSet;

  /**
   * Sort and store style rules according to categories,
   * such as id selectors are grouped into one category, class names are grouped into one category, etc.
   *
   * @param sorter - sort rules
   * @param base - base
   */
  lookupSort(sorter: SelectorsMap, base?: SelectorCore): void {
    sorter.sortAsUniversal(base ?? this);
  }

  /**
   * remove sort
   *
   * @param sorter - sort rules
   * @param base - base
   */
  removeSort(sorter: SelectorsMap, base?: SelectorCore): void {
    sorter.removeAsUniversal(base ?? this);
  }
}

/**
 * Simple selector type
 * provides the method for judging whether a node matches and the method for tracking node attributes
 */
class SimpleSelector extends SelectorCore {
  // rarity of style
  public rarity = 0;

  public combinator?: string;

  public accumulateChanges(node: HippyElement, match: SelectorsMatch) {
    if (!this.dynamic) {
      return this.match(node);
    }
    if (this.mayMatch(node)) {
      this.trackChanges(node, match);
      return true;
    }
    return false;
  }

  /**
   * determine if the node matches
   *
   * @param node - target node
   */
  public match(node: HippyElement): boolean {
    return !!node;
  }

  /**
   * prejudgment
   *
   * @param node - target node
   */
  public mayMatch(node: HippyElement) {
    return this.match(node);
  }

  /**
   * track changes of node
   *
   * @param node - target node
   * @param match - SelectorsMatch
   */
  public trackChanges(node?: HippyElement, match?: SelectorsMatch): void {
    if (node && match) {
      /**
       * fixme This should be defined as an abstract method, but because some selectors do not need this method,
       * it is not sure which methods do not need it, so leave it blank first
       */
    }
  }
}

class SimpleSelectorSequence extends SimpleSelector {
  public head: SimpleSelector | null | boolean;

  // list of selector
  public selectors: SimpleSelector[];

  constructor(selectors: SimpleSelector[]) {
    super();
    this.specificity = selectors.reduce((sum, sel) => sel.specificity + sum, 0);
    this.head = selectors.reduce(
      (prev: null | boolean | SimpleSelector, curr: SimpleSelector) => {
        return !prev
          || (prev instanceof SimpleSelector && curr.rarity > prev.rarity)
          ? curr
          : prev;
      },
      null,
    );
    this.dynamic = selectors.some(sel => sel.dynamic);
    this.selectors = selectors;
  }

  toString(): string {
    return `${this.selectors.join('')}${this.combinator}`;
  }

  match(node: HippyElement): boolean {
    return this.selectors.every(sel => sel.match(node));
  }

  mayMatch(node: HippyElement): boolean {
    return this.selectors.every(sel => sel.mayMatch(node));
  }

  trackChanges(node: HippyElement, match: SelectorsMatch): void {
    this.selectors.forEach(sel => sel.trackChanges(node, match));
  }

  lookupSort(sorter: SelectorsMap, base: SelectorCore): void {
    if (this.head && this.head instanceof SimpleSelector) {
      this.head.lookupSort(sorter, base ?? this);
    }
  }

  removeSort(sorter: SelectorsMap, base?: SelectorCore): void {
    if (this.head && this.head instanceof SimpleSelector) {
      this.head.removeSort(sorter, base ?? this);
    }
  }
}

/**
 * Generic selector type, eg. *
 */
class UniversalSelector extends SimpleSelector {
  constructor() {
    super();
    this.specificity = 0x00000000;
    this.rarity = 0;
    this.dynamic = false;
  }

  toString(): string {
    return `*${this.combinator}`;
  }

  match(): boolean {
    // universal selectors can all match
    return true;
  }
}

/**
 * ID selector, eg. #root
 */
class IdSelector extends SimpleSelector {
  public id: string;

  constructor(id: string) {
    super();
    this.specificity = 0x00010000;
    this.rarity = 3;
    this.dynamic = false;
    this.id = id;
  }

  toString(): string {
    return `#${this.id}${this.combinator}`;
  }

  match(node: HippyElement): boolean {
    return node.id === this.id;
  }

  lookupSort(sorter: SelectorsMap, base: SelectorCore): void {
    sorter.sortById(this.id, base ?? this);
  }

  removeSort(sorter: SelectorsMap, base?: SelectorCore): void {
    sorter.removeById(this.id, base ?? this);
  }
}

/**
 * tag selector, eg. div, ul
 */
class TypeSelector extends SimpleSelector {
  public cssType: string;

  constructor(cssType: string) {
    super();
    this.specificity = 0x00000001;
    this.rarity = 1;
    this.dynamic = false;
    this.cssType = cssType;
  }

  toString(): string {
    return `${this.cssType}${this.combinator}`;
  }

  match(node: HippyElement): boolean {
    return node.tagName === this.cssType;
  }

  lookupSort(sorter: SelectorsMap, base: SelectorCore): void {
    sorter.sortByType(this.cssType, base ?? this);
  }

  removeSort(sorter: SelectorsMap, base?: SelectorCore): void {
    sorter.removeByType(this.cssType, base ?? this);
  }
}

/**
 * class selector
 */
class ClassSelector extends SimpleSelector {
  public className: string;

  constructor(className: string) {
    super();
    this.specificity = 0x00000100;
    this.rarity = 2;
    this.dynamic = false;
    this.className = className;
  }

  toString(): string {
    return `.${this.className}${this.combinator}`;
  }

  match(node: HippyElement): boolean {
    return !!(node.classList.size && node.classList.has(this.className));
  }

  lookupSort(sorter: SelectorsMap, base: SelectorCore): void {
    sorter.sortByClass(this.className, base ?? this);
  }

  removeSort(sorter: SelectorsMap, base?: SelectorCore): void {
    sorter.removeByClass(this.className, base ?? this);
  }
}

/**
 * pseudo class selector, not currently supported
 */
class PseudoClassSelector extends SimpleSelector {
  public cssPseudoClass: string;

  constructor(cssPseudoClass: string) {
    super();
    this.specificity = 0x00000100;
    this.rarity = 0;
    this.dynamic = true;
    this.cssPseudoClass = cssPseudoClass;
  }

  toString(): string {
    return `:${this.cssPseudoClass}${this.combinator}`;
  }

  match(): boolean {
    return false;
  }

  mayMatch(): boolean {
    return true;
  }

  trackChanges(node: HippyElement, match: SelectorsMatch): void {
    match.addPseudoClass(node, this.cssPseudoClass);
  }
}

/**
 * Attribute Selector
 */

class AttributeSelector extends SimpleSelector {
  // attribute of node
  public attribute = '';

  // property Test Conditions
  public test = '';

  // value of node
  public value = '';

  // eslint-disable-next-line complexity
  constructor(attribute: string, test = '', value = '') {
    super();

    this.specificity = 0x00000100;
    this.rarity = 0;
    this.dynamic = true;
    this.attribute = attribute;
    this.test = test;
    this.value = value;

    if (!test) {
      // HasAttribute
      this.match = (node: HippyElement) => !!node[attribute];
      return;
    }

    if (!value) {
      this.match = () => false;
    }

    const escapedValue = value.replace(/[\-\[\]\/{}()*+?.\\^$|]/g, '\\$&');
    let regexp: RegExp | undefined;
    switch (test) {
      case '^=': // PrefixMatch
        regexp = new RegExp(`^${escapedValue}`);
        break;
      case '$=': // SuffixMatch
        regexp = new RegExp(`${escapedValue}$`);
        break;
      case '*=': // SubstringMatch
        regexp = new RegExp(escapedValue);
        break;
      case '=': // Equals
        regexp = new RegExp(`^${escapedValue}$`);
        break;
      case '~=': // Includes
        if (/\s/.test(value)) {
          this.match = () => false;
          return;
        }
        regexp = new RegExp(`(^|\\s)${escapedValue}(\\s|$)`);
        break;
      case '|=': // DashMatch
        regexp = new RegExp(`^${escapedValue}(-|$)`);
        break;
      default:
        break;
    }

    if (typeof regexp !== 'undefined') {
      this.match = node => (regexp ? regexp.test(`${node[attribute]}`) : false);
      return;
    }
    this.match = () => false;
  }

  toString(): string {
    return `[${this.attribute}${this.test}${(this.test && this.value) || ''}]${
      this.combinator
    }`;
  }

  /**
   * return false
   *
   * @param node - target node
   */
  match(node: HippyElement): boolean {
    return node ? !node : false;
  }

  mayMatch(): boolean {
    return true;
  }

  trackChanges(node: HippyElement, match: SelectorsMatch): void {
    match.addAttribute(node, this.attribute);
  }
}

/**
 * Invalid Selector
 */
class InvalidSelector extends SimpleSelector {
  public error: Error;

  constructor(error: Error) {
    super();
    this.specificity = 0x00000000;
    this.rarity = 4;
    this.dynamic = false;
    this.combinator = undefined;
    this.error = error;
  }

  toString(): string {
    return `<error: ${this.error}>`;
  }

  match(): boolean {
    return false;
  }

  lookupSort(): null {
    return null;
  }

  removeSort(): null {
    return null;
  }
}

/**
 * child node group
 */
class ChildGroup {
  // list of selector
  public selectors: SelectorCore[];

  // is dynamic
  public dynamic: boolean;

  constructor(selectors) {
    this.selectors = selectors;
    this.dynamic = selectors.some(sel => sel.dynamic);
  }

  match(node) {
    const pass = this.selectors.every((sel, i) => {
      if (i !== 0) {
        node = node.parentNode;
      }
      return !!node && (sel as SimpleSelector).match(node);
    });
    return pass ? node : null;
  }

  mayMatch(node) {
    const pass = this.selectors.every((sel, i) => {
      if (i !== 0) {
        node = node.parentNode;
      }
      return !!node && (sel as SimpleSelector).mayMatch(node);
    });
    return pass ? node : null;
  }

  trackChanges(node, map) {
    this.selectors.forEach((sel, i) => {
      if (i !== 0) {
        node = node.parentNode;
      }
      if (!node) {
        return;
      }
      (sel as SimpleSelector).trackChanges(node, map);
    });
  }
}

/**
 * Sibling node group
 */
class SiblingGroup {
  // list of selector
  public selectors: SelectorCore[];

  // is dynamic selector
  public dynamic: boolean;

  constructor(selectors) {
    this.selectors = selectors;
    this.dynamic = selectors.some(sel => sel.dynamic);
  }

  match(node) {
    const pass = this.selectors.every((sel, i) => {
      if (i !== 0) {
        node = node.nextSibling;
      }
      return !!node && (sel as SimpleSelector).match(node);
    });
    return pass ? node : null;
  }

  mayMatch(node) {
    const pass = this.selectors.every((sel, i) => {
      if (i !== 0) {
        node = node.nextSibling;
      }
      return !!node && (sel as SimpleSelector).mayMatch(node);
    });
    return pass ? node : null;
  }

  trackChanges(node, map) {
    this.selectors.forEach((sel, i) => {
      if (i !== 0) {
        node = node.nextSibling;
      }
      if (!node) {
        return;
      }
      (sel as SimpleSelector).trackChanges(node, map);
    });
  }
}

/**
 * selector class
 */
class Selector extends SelectorCore {
  public groups;

  public selectors;

  public last: SelectorCore;

  constructor(selectors: SimpleSelector[]) {
    super();
    const supportedCombinator = [undefined, ' ', '>', '+'];
    let siblingGroup: SimpleSelector[];
    let lastGroup: SimpleSelector[][];
    const groups: SimpleSelector[][][] = [];
    selectors.reverse().forEach((sel) => {
      if (supportedCombinator.indexOf(sel.combinator) === -1) {
        throw new Error(`Unsupported combinator "${sel.combinator}".`);
      }
      if (sel.combinator === undefined || sel.combinator === ' ') {
        siblingGroup = [];
        lastGroup = [siblingGroup];
        groups.push(lastGroup);
      }
      if (sel.combinator === '>') {
        lastGroup.push((siblingGroup = []));
      }
      siblingGroup.push(sel);
    });
    this.groups = groups.map(g => new ChildGroup(g.map(sg => new SiblingGroup(sg))));
    this.last = selectors[0];
    this.specificity = selectors.reduce((sum, sel) => sel.specificity + sum, 0);
    this.dynamic = selectors.some(sel => sel.dynamic);
  }

  toString(): string {
    return this.selectors.join('');
  }

  match(node: HippyElement): boolean {
    return this.groups.every((group, i) => {
      if (i === 0) {
        node = group.match(node);
        return !!node;
      }
      let ancestor = node.parentNode;
      while (ancestor) {
        if ((node = group.match(ancestor))) {
          return true;
        }
        ancestor = ancestor.parentNode;
      }
      return false;
    });
  }

  lookupSort(sorter: SelectorsMap): void {
    this.last.lookupSort(sorter, this);
  }

  removeSort(sorter: SelectorsMap): void {
    this.last.removeSort(sorter, this);
  }

  accumulateChanges(node: HippyElement, map: SelectorsMap): boolean {
    if (!this.dynamic) {
      return this.match(node);
    }

    const bounds: {
      left: HippyElement;
      right: HippyElement | null;
    }[] = [];
    const mayMatch = this.groups.every((group, i) => {
      if (i === 0) {
        const nextNode = group.mayMatch(node);
        bounds.push({ left: node, right: node });
        node = nextNode;
        return !!node;
      }
      let ancestor = node;
      while ((ancestor = ancestor.parentNode as HippyElement)) {
        const nextNode = group.mayMatch(ancestor);
        if (nextNode) {
          bounds.push({ left: ancestor, right: null });
          node = nextNode;
          return true;
        }
      }
      return false;
    });

    // Calculating the right bounds for each selector won't save much
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
      } while (
        leftBound !== bound.right
        && (leftBound = node.parentNode as HippyElement)
      );
    }

    return mayMatch;
  }
}

// rule set selector type
type RuleSetSelector = SelectorCore & { ruleSet: RuleSet };

/**
 * Rule Set
 */
class RuleSet {
  public selectors: SelectorCore[];

  public declarations: CssDeclarationType[];

  public hash: string;

  constructor(
    selectors: RuleSetSelector[],
    declarations: CssDeclarationType[],
    hash: string,
  ) {
    selectors.forEach((sel) => {
      sel.ruleSet = this; // FIXME: It makes circular dependency
      return null;
    });
    this.selectors = selectors;
    this.declarations = declarations;
    this.hash = hash;
  }

  toString(): string {
    return `${this.selectors.join(', ')} {${this.declarations
      .map((d, i) => `${i === 0 ? ' ' : ''}${d.property}: ${d.value}`)
      .join('; ')}}`;
  }

  lookupSort(sorter: SelectorsMap): void {
    this.selectors.forEach(sel => sel.lookupSort(sorter));
  }

  removeSort(sorter: SelectorsMap): void {
    this.selectors.forEach(sel => sel.removeSort(sorter));
  }
}

export {
  InvalidSelector,
  UniversalSelector,
  IdSelector,
  TypeSelector,
  ClassSelector,
  PseudoClassSelector,
  AttributeSelector,
  SimpleSelectorSequence,
  Selector,
  RuleSet,
  SelectorCore,
};
