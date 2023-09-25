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
import type { CssDeclarationType, StyleNode, StyleNodeList } from '../index';
import type { SelectorsMap, SelectorsMatch } from './css-selectors-match';

/**
 * determine if the value is null or undefined
 *
 * @param value - value
 */
export function isNullOrUndefined(value: any): boolean {
  return typeof value === 'undefined' || value === null;
}

/**
 * wrap string text
 *
 * @param text - string
 */
function wrap(text: string | undefined): string {
  return text ? ` ${text}` : '';
}

/**
 * get node's parent node, in client side, node has parentNode props. in server side, find parentNode
 * by pId
 *
 * @param node - child node
 * @param ssrNodes - ssr node list
 *
 * @internal
 */
function getParentNode(node: StyleNode, ssrNodes?: StyleNodeList): StyleNode | null {
  if (ssrNodes) {
    // in server side mode, find parent node with pId
    if (node?.pId && ssrNodes[node.pId]) {
      return ssrNodes[node.pId];
    }
    return null;
  }
  return node?.parentNode;
}

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

  public accumulateChanges(node: StyleNode, match: SelectorsMatch) {
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
  public match(node: StyleNode): boolean {
    return !!node;
  }

  /**
   * prejudgment
   *
   * @param node - target node
   */
  public mayMatch(node: StyleNode) {
    return this.match(node);
  }

  /**
   * track changes of node
   *
   * @param node - target node
   * @param match - SelectorsMatch
   */
  public trackChanges(node?: StyleNode, match?: SelectorsMatch): void {
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
    return `${this.selectors.join('')}${wrap(this.combinator)}`;
  }

  match(node?: StyleNode): boolean {
    if (!node) {
      return false;
    }
    return this.selectors.every(sel => sel.match(node));
  }

  mayMatch(node?: StyleNode): boolean {
    if (!node) {
      return false;
    }
    return this.selectors.every(sel => sel.mayMatch(node));
  }

  trackChanges(node: StyleNode, match: SelectorsMatch): void {
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
    return `*${wrap(this.combinator)}`;
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
    return `#${this.id}${wrap(this.combinator)}`;
  }

  match(node?: StyleNode): boolean {
    if (!node) {
      return false;
    }
    // ssr node's id is native id, the dom id is attribute's id
    return node.props?.attributes?.id === this.id || node.id === this.id;
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
    return `${this.cssType}${wrap(this.combinator)}`;
  }

  match(node?: StyleNode): boolean {
    if (!node) {
      return false;
    }
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
    return `.${this.className}${wrap(this.combinator)}`;
  }

  match(node?: StyleNode): boolean {
    if (!node) {
      return false;
    }
    // props and attributes exist means this node is generated from server side(except development).
    // so we need to use these props when we are ssr
    const classList = node.classList
      ?? new Set((node.props?.attributes?.class || '')
        .split(' ')
        .filter(x => x.trim()));

    return !!(classList.size && classList.has(this.className));
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
    return `:${this.cssPseudoClass}${wrap(this.combinator)}`;
  }

  match(): boolean {
    return false;
  }

  mayMatch(): boolean {
    return true;
  }

  trackChanges(node: StyleNode, match: SelectorsMatch): void {
    match.addPseudoClass(node, this.cssPseudoClass);
  }
}


/**
 * get node attribute or styleScopeId value
 * @param node
 * @param attribute
 * @returns {*}
 */
const getNodeAttrVal = (node, attribute) => {
  // node.props is ssrNode's attributes list
  const attr = node?.props?.[attribute] || node?.attributes?.[attribute];
  if (typeof attr !== 'undefined') {
    return attr;
  }
  if (Array.isArray(node?.styleScopeId) && node?.styleScopeId?.includes(attribute)) {
    return attribute;
  }
};

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
      this.match = (node: StyleNode) => {
        if (!node || (!node?.attributes && !node?.props)) {
          // in client side render, node not exist or do not have attributes props means no attribute
          // in server side render, node do not have attribute in props means no attribute
          return false;
        }

        return !isNullOrUndefined(getNodeAttrVal(node, attribute));
      };
      return;
    }

    if (!value) {
      this.match = () => false;
      return;
    }

    this.match = (node?: StyleNode) => {
      // props and attributes exist means this node is generated from server side(except development).
      // so we need to use these props when we are ssr
      if (!node || (!node?.attributes && !node?.props[attribute])) {
        return false;
      }
      const attr = `${getNodeAttrVal(node, attribute)}`;
      if (test === '=') {
        // Equal
        return attr === value;
      }

      if (test === '^=') {
        // PrefixMatch
        return attr.startsWith(value);
      }

      if (test === '$=') {
        // SuffixMatch
        return attr.endsWith(value);
      }

      if (test === '*=') {
        // SubstringMatch
        return attr.indexOf(value) !== -1;
      }

      if (test === '~=') {
        // Includes
        const words = attr.split(' ');
        return words?.indexOf(value) !== -1;
      }

      if (test === '|=') {
        // DashMatch
        return attr === value || attr.startsWith(`${value}-`);
      }

      return false;
    };
  }

  toString(): string {
    return `[${this.attribute}${wrap(this.test)}${(this.test && this.value) || ''}]${
      wrap(this.combinator)
    }`;
  }

  /**
   * return false
   *
   * @param node - target node
   */
  match(node?: StyleNode): boolean {
    return node ? !node : false;
  }

  mayMatch(): boolean {
    return true;
  }

  trackChanges(node: StyleNode, match: SelectorsMatch): void {
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
    if (!node) {
      return false;
    }
    const pass = this.selectors.every((sel, i) => {
      if (i !== 0) {
        node = node.parentNode;
      }
      return !!node && (sel as SimpleSelector).match(node);
    });
    return pass ? node : null;
  }

  mayMatch(node) {
    if (!node) {
      return false;
    }
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
    if (!node) {
      return false;
    }
    const pass = this.selectors.every((sel, i) => {
      if (i !== 0) {
        node = node.nextSibling;
      }
      return !!node && (sel as SimpleSelector).match(node);
    });
    return pass ? node : null;
  }

  mayMatch(node) {
    if (!node) {
      return false;
    }
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
    const supportedCombinator = [undefined, ' ', '>', '+', '~'];
    let siblingGroup: SimpleSelector[] = [];
    let lastGroup: SimpleSelector[][] = [];
    const groups: SimpleSelector[][][] = [];
    const selectorList = [...selectors];
    const length = selectorList.length - 1;
    this.specificity = 0;
    this.dynamic = false;

    for (let i = length; i >= 0; i--) {
      const sel = selectorList[i];

      if (supportedCombinator.indexOf(sel.combinator) === -1) {
        console.error(`Unsupported combinator "${sel.combinator}".`);
        throw new Error(`Unsupported combinator "${sel.combinator}".`);
      }

      if (sel.combinator === undefined || sel.combinator === ' ') {
        groups.push(lastGroup = [(siblingGroup = [])]);
      }
      if (sel.combinator === '>') {
        lastGroup.push((siblingGroup = []));
      }

      this.specificity += sel.specificity;

      if (sel.dynamic) {
        this.dynamic = true;
      }

      siblingGroup.push(sel);
    }

    this.groups = groups.map(g => new ChildGroup(g.map(sg => new SiblingGroup(sg))));
    this.last = selectorList[length];
  }

  toString(): string {
    return this.selectors.join('');
  }

  match(node?: StyleNode, ssrNodes?: StyleNodeList): boolean {
    if (!node) {
      return false;
    }
    return this.groups.every((group, i) => {
      if (i === 0) {
        node = group.match(node);
        return !!node;
      }
      let ancestor = getParentNode(node as StyleNode, ssrNodes);
      while (ancestor) {
        if ((node = group.match(ancestor))) {
          return true;
        }
        ancestor = getParentNode(ancestor, ssrNodes);
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

  accumulateChanges(node: StyleNode, map: SelectorsMap, ssrNodes?: StyleNodeList): boolean {
    if (!this.dynamic) {
      return this.match(node, ssrNodes);
    }

    const bounds: {
      left: StyleNode;
      right: StyleNode | null;
    }[] = [];
    const mayMatch = this.groups.every((group, i) => {
      if (i === 0) {
        const nextNode = group.mayMatch(node);
        bounds.push({ left: node, right: node });
        node = nextNode;
        return !!node;
      }
      let ancestor = getParentNode(node, ssrNodes);
      while (ancestor) {
        const nextNode = group.mayMatch(ancestor);
        if (nextNode) {
          bounds.push({ left: ancestor, right: null });
          node = nextNode;
          return true;
        }
        ancestor = getParentNode(ancestor, ssrNodes);
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
      let node = bound.left;
      do {
        if (group.mayMatch(node)) {
          group.trackChanges(node, map);
        }
      } while (
        node !== bound.right
        && (node = node.parentNode as StyleNode)
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
