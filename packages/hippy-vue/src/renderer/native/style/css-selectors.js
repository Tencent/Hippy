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

/**
 * Base classes
 */
class SelectorCore {
  lookupSort(sorter, base) {
    sorter.sortAsUniversal(base || this);
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
    this.head = selectors.reduce((prev, curr) => {
      return !prev || (curr.rarity > prev.rarity) ? curr : prev;
    }, null);
    this.dynamic = selectors.some(sel => sel.dynamic);
    this.selectors = selectors;
  }

  toString() {
    return `${this.selectors.join('')}${this.combinator}`;
  }

  match(node) {
    return this.selectors.every(sel => sel.match(node));
  }

  mayMatch(node) {
    return this.selectors.every(sel => sel.mayMatch(node));
  }

  trackChanges(node, map) {
    this.selectors.forEach(sel => sel.trackChanges(node, map));
  }

  lookupSort(sorter, base) {
    this.head.lookupSort(sorter, base || this);
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
    return `*${this.combinator}`;
  }

  match() { return true; }
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
    return `#${this.id}${this.combinator}`;
  }

  match(node) {
    return node.id === this.id;
  }

  lookupSort(sorter, base) {
    sorter.sortById(this.id, base || this);
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
    return `${this.cssType}${this.combinator}`;
  }

  match(node) {
    return node.cssType === this.cssType;
  }

  lookupSort(sorter, base) {
    sorter.sortByType(this.cssType, base || this);
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
    return `.${this.className}${this.combinator}`;
  }

  match(node) {
    return node.classList.size && node.classList.has(this.className);
  }

  lookupSort(sorter, base) {
    sorter.sortByClass(this.className, base || this);
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
    this.dynamic = true;
    this.cssPseudoClass = cssPseudoClass;
  }

  toString() {
    return `:${this.cssPseudoClass}${this.combinator}`;
  }

  match(node) {
    return node.cssPseudoClasses && node.cssPseudoClasses.has(this.cssPseudoClass);
  }

  mayMatch() {
    return true;
  }

  trackChanges(node, map) {
    map.addPseudoClass(node, this.cssPseudoClass);
  }
}

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
      this.match = node => !!node[attribute];
      return;
    }

    if (!value) {
      this.match = () => false;
    }

    const escapedValue = value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    let regexp = null;
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

    if (regexp) {
      this.match = node => regexp.test(`${node[attribute]}`);
      return;
    }
    this.match = () => false;
  }

  toString() {
    return `[${this.attribute}${this.test}${(this.test && this.value) || ''}]${this.combinator}`;
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
}

class ChildGroup {
  constructor(selectors) {
    this.selectors = selectors;
    this.dynamic = selectors.some(sel => sel.dynamic);
  }

  match(node) {
    const pass = this.selectors.every((sel, i) => {
      if (i !== 0) {
        node = node.parentNode;
      }
      return !!node && !!sel.match(node);
    });
    return pass ? node : null;
  }

  mayMatch(node) {
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
    const pass = this.selectors.every((sel, i) => {
      if (i !== 0) {
        node = node.nextSibling;
      }
      return !!node && !!sel.match(node);
    });
    return pass ? node : null;
  }

  mayMatch(node) {
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
  constructor(selectors, declarations) {
    selectors.forEach((sel) => {
      sel.ruleSet = this;                    // FIXME: It makes circular dependency
      return null;
    });
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
