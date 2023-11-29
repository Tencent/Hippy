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

/* eslint-disable import/prefer-default-export */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-cond-assign */
/* eslint-disable no-useless-escape */
/* eslint-disable no-param-reassign */

import { isNullOrUndefined } from '../../../util';

function wrap(text: any) {
  return text ? ` ${text} ` : '';
}

/**
 * Base classes
 */
class SelectorCore {
  lookupSort(sorter: any, base: any) {
    sorter.sortAsUniversal(base || this);
  }

  removeSort(sorter: any, base: any) {
    sorter.removeAsUniversal(base || this);
  }
}

class SimpleSelector extends SelectorCore {
  dynamic: any;
  match: any;
  accumulateChanges(node: any, map: any) {
    if (!this.dynamic) {
      return this.match(node);
    }
    if (this.mayMatch(node)) {
      // @ts-expect-error TS(2554): Expected 0 arguments, but got 2.
      this.trackChanges(node, map);
      return true;
    }
    return false;
  }

  mayMatch(node: any) {
    return this.match(node);
  }

  trackChanges() {
    return null;
  }
}

class SimpleSelectorSequence extends SimpleSelector {
  combinator: any;
  dynamic: any;
  head: any;
  selectors: any;
  specificity: any;
  constructor(selectors: any) {
    super();
    this.specificity = selectors.reduce((sum: any, sel: any) => sel.specificity + sum, 0);
    this.head = selectors.reduce((prev: any, curr: any) => (!prev || (curr.rarity > prev.rarity) ? curr : prev), null);
    this.dynamic = selectors.some((sel: any) => sel.dynamic);
    this.selectors = selectors;
  }

  toString() {
    return `${this.selectors.join('')}${wrap(this.combinator)}`;
  }

  // @ts-expect-error TS(2425): Class 'SimpleSelector' defines instance member pro... Remove this comment to see the full error message
  match(node: any) {
    if (!node) return false;
    return this.selectors.every((sel: any) => sel.match(node));
  }

  mayMatch(node: any) {
    if (!node) return false;
    return this.selectors.every((sel: any) => sel.mayMatch(node));
  }

  // @ts-expect-error TS(2416): Property 'trackChanges' in type 'SimpleSelectorSeq... Remove this comment to see the full error message
  trackChanges(node: any, map: any) {
    this.selectors.forEach((sel: any) => sel.trackChanges(node, map));
  }

  lookupSort(sorter: any, base: any) {
    this.head.lookupSort(sorter, base || this);
  }

  removeSort(sorter: any, base: any) {
    this.head.removeSort(sorter, base || this);
  }
}

/**
 * Universal Selector
 */
class UniversalSelector extends SimpleSelector {
  combinator: any;
  dynamic: any;
  rarity: any;
  specificity: any;
  constructor() {
    super();
    this.specificity = 0x00000000;
    this.rarity = 0;
    this.dynamic = false;
  }

  toString() {
    return `*${wrap(this.combinator)}`;
  }

  // @ts-expect-error TS(2425): Class 'SimpleSelector' defines instance member pro... Remove this comment to see the full error message
  match() {
    return true;
  }
}

/**
 * Id Selector
 */
class IdSelector extends SimpleSelector {
  combinator: any;
  dynamic: any;
  id: any;
  rarity: any;
  specificity: any;
  constructor(id: any) {
    super();
    this.specificity = 0x00010000;
    this.rarity = 3;
    this.dynamic = false;
    this.id = id;
  }

  toString() {
    return `#${this.id}${wrap(this.combinator)}`;
  }

  // @ts-expect-error TS(2425): Class 'SimpleSelector' defines instance member pro... Remove this comment to see the full error message
  match(node: any) {
    if (!node) return false;
    return node.id === this.id;
  }

  lookupSort(sorter: any, base: any) {
    sorter.sortById(this.id, base || this);
  }

  removeSort(sorter: any, base: any) {
    sorter.removeById(this.id, base || this);
  }
}


/**
 * Type Selector
 */
class TypeSelector extends SimpleSelector {
  combinator: any;
  cssType: any;
  dynamic: any;
  rarity: any;
  specificity: any;
  constructor(cssType: any) {
    super();
    this.specificity = 0x00000001;
    this.rarity = 1;
    this.dynamic = false;
    this.cssType = cssType;
  }

  toString() {
    return `${this.cssType}${wrap(this.combinator)}`;
  }

  // @ts-expect-error TS(2425): Class 'SimpleSelector' defines instance member pro... Remove this comment to see the full error message
  match(node: any) {
    if (!node) return false;
    return node.tagName === this.cssType;
  }

  lookupSort(sorter: any, base: any) {
    sorter.sortByType(this.cssType, base || this);
  }

  removeSort(sorter: any, base: any) {
    sorter.removeByType(this.cssType, base || this);
  }
}

/**
 * Class Selector
 */
class ClassSelector extends SimpleSelector {
  className: any;
  combinator: any;
  dynamic: any;
  rarity: any;
  specificity: any;
  constructor(className: any) {
    super();
    this.specificity = 0x00000100;
    this.rarity = 2;
    this.dynamic = false;
    this.className = className;
  }

  toString() {
    return `.${this.className}${wrap(this.combinator)}`;
  }

  // @ts-expect-error TS(2425): Class 'SimpleSelector' defines instance member pro... Remove this comment to see the full error message
  match(node: any) {
    if (!node) return false;
    return node.classList && node.classList.size && node.classList.has(this.className);
  }

  lookupSort(sorter: any, base: any) {
    sorter.sortByClass(this.className, base || this);
  }

  removeSort(sorter: any, base: any) {
    sorter.removeByClass(this.className, base || this);
  }
}

/**
 * Pseudo Class Selector
 */
class PseudoClassSelector extends SimpleSelector {
  combinator: any;
  cssPseudoClass: any;
  dynamic: any;
  rarity: any;
  specificity: any;
  constructor(cssPseudoClass: any) {
    super();
    this.specificity = 0x00000100;
    this.rarity = 0;
    this.dynamic = false;
    this.cssPseudoClass = cssPseudoClass;
  }

  toString() {
    return `:${this.cssPseudoClass}${wrap(this.combinator)}`;
  }

  // @ts-expect-error TS(2425): Class 'SimpleSelector' defines instance member pro... Remove this comment to see the full error message
  match(node: any) {
    return !!node;
  }

  mayMatch() {
    return true;
  }

  // @ts-expect-error TS(2416): Property 'trackChanges' in type 'PseudoClassSelect... Remove this comment to see the full error message
  trackChanges(node: any, map: any) {
    map.addPseudoClass(node, this.cssPseudoClass);
  }
}

/**
 * get node attribute or styleScopeId value
 * @param node
 * @param attribute
 * @returns {*}
 */
const getNodeAttrVal = (node: any, attribute: any) => {
  const attr = node.attributes[attribute];
  if (typeof attr !== 'undefined') {
    return attr;
  }
  if (Array.isArray(node.styleScopeId) && node.styleScopeId.includes(attribute)) {
    return attribute;
  }
};

/**
 * Attribute Selector
 */
class AttributeSelector extends SimpleSelector {
  attribute: any;
  combinator: any;
  dynamic: any;
  rarity: any;
  specificity: any;
  test: any;
  value: any;
  constructor(attribute: any, test: any, value: any) {
    super();
    this.specificity = 0x00000100;
    this.rarity = 0;
    this.dynamic = true;
    this.attribute = attribute;
    this.test = test;
    this.value = value;

    if (!test) {
      // HasAttribute
      // @ts-expect-error TS(2322): Type '(node: any) => boolean' is not assignable to... Remove this comment to see the full error message
      this.match = (node: any) => {
        if (!node || !node.attributes) return false;
        return !isNullOrUndefined(getNodeAttrVal(node, attribute));
      };
      return;
    }

    if (!value) {
      this.match = () => false;
      return;
    }

    // @ts-expect-error TS(2322): Type '(node: any) => boolean' is not assignable to... Remove this comment to see the full error message
    this.match = (node: any) => {
      if (!node || !node.attributes) return false;
      // const escapedValue = value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
      const attr = `${getNodeAttrVal(node, attribute)}`;

      if (test === '=') {
        // Equals
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
        return words && words.indexOf(value) !== -1;
      }

      if (test === '|=') {
        // DashMatch
        return attr === value || attr.startsWith(`${value}-`);
      }
      return false;
    };
  }

  toString() {
    return `[${this.attribute}${wrap(this.test)}${(this.test && this.value) || ''}]${wrap(this.combinator)}`;
  }

  // @ts-expect-error TS(2425): Class 'SimpleSelector' defines instance member pro... Remove this comment to see the full error message
  match() {
    return false;
  }

  mayMatch() {
    return true;
  }

  // @ts-expect-error TS(2416): Property 'trackChanges' in type 'AttributeSelector... Remove this comment to see the full error message
  trackChanges(node: any, map: any) {
    map.addAttribute(node, this.attribute);
  }
}

/**
 * Invalid Selector
 */
class InvalidSelector extends SimpleSelector {
  combinator: any;
  dynamic: any;
  err: any;
  rarity: any;
  specificity: any;
  constructor(err: any) {
    super();
    this.specificity = 0x00000000;
    this.rarity = 4;
    this.dynamic = false;
    this.combinator = undefined;
    this.err = err;
  }

  toString() {
    return `<error: ${this.err}>`;
  }

  // @ts-expect-error TS(2425): Class 'SimpleSelector' defines instance member pro... Remove this comment to see the full error message
  match() {
    return false;
  }

  lookupSort() {
    return null;
  }

  removeSort() {
    return null;
  }
}

class ChildGroup {
  dynamic: any;
  selectors: any;
  constructor(selectors: any) {
    this.selectors = selectors;
    this.dynamic = selectors.some((sel: any) => sel.dynamic);
  }

  match(node: any) {
    if (!node) return false;
    const pass = this.selectors.every((sel: any, i: any) => {
      if (i !== 0) {
        node = node.parentNode;
      }
      return !!node && !!sel.match(node);
    });
    return pass ? node : null;
  }

  mayMatch(node: any) {
    if (!node) return false;
    const pass = this.selectors.every((sel: any, i: any) => {
      if (i !== 0) {
        node = node.parentNode;
      }
      return !!node && !!sel.mayMatch(node);
    });
    return pass ? node : null;
  }

  trackChanges(node: any, map: any) {
    this.selectors.forEach((sel: any, i: any) => {
      if (i !== 0) {
        node = node.parentNode;
      }
      if (!node) {
        return;
      }
      sel.trackChanges(node, map);
    });
  }
}

class SiblingGroup {
  dynamic: any;
  selectors: any;
  constructor(selectors: any) {
    this.selectors = selectors;
    this.dynamic = selectors.some((sel: any) => sel.dynamic);
  }

  match(node: any) {
    if (!node) return false;
    const pass = this.selectors.every((sel: any, i: any) => {
      if (i !== 0) {
        node = node.nextSibling;
      }
      return !!node && !!sel.match(node);
    });
    return pass ? node : null;
  }

  mayMatch(node: any) {
    if (!node) return false;
    const pass = this.selectors.every((sel: any, i: any) => {
      if (i !== 0) {
        node = node.nextSibling;
      }
      return !!node && !!sel.mayMatch(node);
    });
    return pass ? node : null;
  }

  trackChanges(node: any, map: any) {
    this.selectors.forEach((sel: any, i: any) => {
      if (i !== 0) {
        node = node.nextSibling;
      }
      if (!node) {
        return;
      }
      sel.trackChanges(node, map);
    });
  }
}

/**
 * Big  Selector
 */
class Selector extends SelectorCore {
  static ChildGroup: any;

  static SiblingGroup: any;

  dynamic: any;
  groups: any;
  last: any;
  selectors: any;
  specificity: any;

  constructor(selectors: any) {
    super();
    const supportedCombinator = [undefined, ' ', '>', '+'];
    let siblingGroup;
    let lastGroup;
    const groups: any = [];
    selectors.reverse().forEach((sel: any) => {
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
    this.groups = groups.map(g => new Selector.ChildGroup(g.map((sg: any) => new Selector.SiblingGroup(sg))));
    this.last = selectors[0];
    this.specificity = selectors.reduce((sum: any, sel: any) => sel.specificity + sum, 0);
    this.dynamic = selectors.some((sel: any) => sel.dynamic);
  }

  toString() {
    return this.selectors.join('');
  }

  match(node: any) {
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

  lookupSort(sorter: any) {
    this.last.lookupSort(sorter, this);
  }

  removeSort(sorter: any) {
    this.last.removeSort(sorter, this);
  }

  accumulateChanges(node: any, map: any) {
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
Selector.ChildGroup = ChildGroup;
Selector.SiblingGroup = SiblingGroup;

/**
 * Rule Set
 */
class RuleSet {
  declarations: any;
  hash: any;
  selectors: any;
  constructor(selectors: any, declarations: any, hash: any) {
    selectors.forEach((sel: any) => {
      sel.ruleSet = this; // FIXME: It makes circular dependency
      return null;
    });
    this.hash = hash;
    this.selectors = selectors;
    this.declarations = declarations;
  }

  toString() {
    return `${this.selectors.join(', ')} {${
      this.declarations.map((d: any, i: any) => `${i === 0 ? ' ' : ''}${d.property}: ${d.value}`).join('; ')
    }}`;
  }

  lookupSort(sorter: any) {
    this.selectors.forEach((sel: any) => sel.lookupSort(sorter));
  }

  removeSort(sorter: any) {
    this.selectors.forEach((sel: any) => sel.removeSort(sorter));
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
};
