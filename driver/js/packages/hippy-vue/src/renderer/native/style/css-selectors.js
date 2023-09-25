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

function wrap(text) {
  return text ? ` ${text} ` : '';
}

/**
 * Base classes
 */
class SelectorCore {
  lookupSort(sorter, base) {
    sorter.sortAsUniversal(base || this);
  }

  removeSort(sorter, base) {
    sorter.removeAsUniversal(base || this);
  }
}

class SimpleSelector extends SelectorCore {
  accumulateChanges(node, map) {
    if (!this.dynamic) {
      return this.match(node);
    }
    if (this.mayMatch(node)) {
      this.trackChanges(node, map);
      return true;
    }
    return false;
  }

  mayMatch(node) {
    return this.match(node);
  }

  trackChanges() {
    return null;
  }
}

class SimpleSelectorSequence extends SimpleSelector {
  constructor(selectors) {
    super();
    this.specificity = selectors.reduce((sum, sel) => sel.specificity + sum, 0);
    this.head = selectors.reduce((prev, curr) => (!prev || (curr.rarity > prev.rarity) ? curr : prev), null);
    this.dynamic = selectors.some(sel => sel.dynamic);
    this.selectors = selectors;
  }

  toString() {
    return `${this.selectors.join('')}${wrap(this.combinator)}`;
  }

  match(node) {
    if (!node) return false;
    return this.selectors.every(sel => sel.match(node));
  }

  mayMatch(node) {
    if (!node) return false;
    return this.selectors.every(sel => sel.mayMatch(node));
  }

  trackChanges(node, map) {
    this.selectors.forEach(sel => sel.trackChanges(node, map));
  }

  lookupSort(sorter, base) {
    this.head.lookupSort(sorter, base || this);
  }

  removeSort(sorter, base) {
    this.head.removeSort(sorter, base || this);
  }
}

/**
 * Universal Selector
 */
class UniversalSelector extends SimpleSelector {
  constructor() {
    super();
    this.specificity = 0x00000000;
    this.rarity = 0;
    this.dynamic = false;
  }

  toString() {
    return `*${wrap(this.combinator)}`;
  }

  match() {
    return true;
  }
}

/**
 * Id Selector
 */
class IdSelector extends SimpleSelector {
  constructor(id) {
    super();
    this.specificity = 0x00010000;
    this.rarity = 3;
    this.dynamic = false;
    this.id = id;
  }

  toString() {
    return `#${this.id}${wrap(this.combinator)}`;
  }

  match(node) {
    if (!node) return false;
    return node.id === this.id;
  }

  lookupSort(sorter, base) {
    sorter.sortById(this.id, base || this);
  }

  removeSort(sorter, base) {
    sorter.removeById(this.id, base || this);
  }
}


/**
 * Type Selector
 */
class TypeSelector extends SimpleSelector {
  constructor(cssType) {
    super();
    this.specificity = 0x00000001;
    this.rarity = 1;
    this.dynamic = false;
    this.cssType = cssType;
  }

  toString() {
    return `${this.cssType}${wrap(this.combinator)}`;
  }

  match(node) {
    if (!node) return false;
    return node.tagName === this.cssType;
  }

  lookupSort(sorter, base) {
    sorter.sortByType(this.cssType, base || this);
  }

  removeSort(sorter, base) {
    sorter.removeByType(this.cssType, base || this);
  }
}

/**
 * Class Selector
 */
class ClassSelector extends SimpleSelector {
  constructor(className) {
    super();
    this.specificity = 0x00000100;
    this.rarity = 2;
    this.dynamic = false;
    this.className = className;
  }

  toString() {
    return `.${this.className}${wrap(this.combinator)}`;
  }

  match(node) {
    if (!node) return false;
    return node.classList && node.classList.size && node.classList.has(this.className);
  }

  lookupSort(sorter, base) {
    sorter.sortByClass(this.className, base || this);
  }

  removeSort(sorter, base) {
    sorter.removeByClass(this.className, base || this);
  }
}

/**
 * Pseudo Class Selector
 */
class PseudoClassSelector extends SimpleSelector {
  constructor(cssPseudoClass) {
    super();
    this.specificity = 0x00000100;
    this.rarity = 0;
    this.dynamic = false;
    this.cssPseudoClass = cssPseudoClass;
  }

  toString() {
    return `:${this.cssPseudoClass}${wrap(this.combinator)}`;
  }

  match(node) {
    return !!node;
  }

  mayMatch() {
    return true;
  }

  trackChanges(node, map) {
    map.addPseudoClass(node, this.cssPseudoClass);
  }
}

/**
 * get node attribute or styleScopeId value
 * @param node
 * @param attribute
 * @returns {*}
 */
const getNodeAttrVal = (node, attribute) => {
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
  constructor(attribute, test, value) {
    super();
    this.specificity = 0x00000100;
    this.rarity = 0;
    this.dynamic = true;
    this.attribute = attribute;
    this.test = test;
    this.value = value;

    if (!test) {
      // HasAttribute
      this.match = (node) => {
        if (!node || !node.attributes) return false;
        return !isNullOrUndefined(getNodeAttrVal(node, attribute));
      };
      return;
    }

    if (!value) {
      this.match = () => false;
      return;
    }

    this.match = (node) => {
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

  match() {
    return false;
  }

  mayMatch() {
    return true;
  }

  trackChanges(node, map) {
    map.addAttribute(node, this.attribute);
  }
}

/**
 * Invalid Selector
 */
class InvalidSelector extends SimpleSelector {
  constructor(err) {
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
  constructor(selectors) {
    this.selectors = selectors;
    this.dynamic = selectors.some(sel => sel.dynamic);
  }

  match(node) {
    if (!node) return false;
    const pass = this.selectors.every((sel, i) => {
      if (i !== 0) {
        node = node.parentNode;
      }
      return !!node && !!sel.match(node);
    });
    return pass ? node : null;
  }

  mayMatch(node) {
    if (!node) return false;
    const pass = this.selectors.every((sel, i) => {
      if (i !== 0) {
        node = node.parentNode;
      }
      return !!node && !!sel.mayMatch(node);
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
      sel.trackChanges(node, map);
    });
  }
}

class SiblingGroup {
  constructor(selectors) {
    this.selectors = selectors;
    this.dynamic = selectors.some(sel => sel.dynamic);
  }

  match(node) {
    if (!node) return false;
    const pass = this.selectors.every((sel, i) => {
      if (i !== 0) {
        node = node.nextSibling;
      }
      return !!node && !!sel.match(node);
    });
    return pass ? node : null;
  }

  mayMatch(node) {
    if (!node) return false;
    const pass = this.selectors.every((sel, i) => {
      if (i !== 0) {
        node = node.nextSibling;
      }
      return !!node && !!sel.mayMatch(node);
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
      sel.trackChanges(node, map);
    });
  }
}

/**
 * Big  Selector
 */
class Selector extends SelectorCore {
  constructor(selectors) {
    super();
    const supportedCombinator = [undefined, ' ', '>', '+'];
    let siblingGroup;
    let lastGroup;
    const groups = [];
    selectors.reverse().forEach((sel) => {
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
    this.groups = groups.map(g => new Selector.ChildGroup(g.map(sg => new Selector.SiblingGroup(sg))));
    this.last = selectors[0];
    this.specificity = selectors.reduce((sum, sel) => sel.specificity + sum, 0);
    this.dynamic = selectors.some(sel => sel.dynamic);
  }

  toString() {
    return this.selectors.join('');
  }

  match(node) {
    return this.groups.every((group, i) => {
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

  lookupSort(sorter) {
    this.last.lookupSort(sorter, this);
  }

  removeSort(sorter) {
    this.last.removeSort(sorter, this);
  }

  accumulateChanges(node, map) {
    if (!this.dynamic) {
      return this.match(node);
    }

    const bounds = [];
    const mayMatch = this.groups.every((group, i) => {
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
  constructor(selectors, declarations, hash) {
    selectors.forEach((sel) => {
      sel.ruleSet = this; // FIXME: It makes circular dependency
      return null;
    });
    this.hash = hash;
    this.selectors = selectors;
    this.declarations = declarations;
  }

  toString() {
    return `${this.selectors.join(', ')} {${
      this.declarations.map((d, i) => `${i === 0 ? ' ' : ''}${d.property}: ${d.value}`).join('; ')
    }}`;
  }

  lookupSort(sorter) {
    this.selectors.forEach(sel => sel.lookupSort(sorter));
  }

  removeSort(sorter) {
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
};
