/* eslint-disable import/prefer-default-export */
/* eslint-disable no-param-reassign */

/**
 * Selector Map
 */
class SelectorsMatch {
  constructor() {
    this.changeMap = new Map();
  }

  addAttribute(node, attribute) {
    const deps = this.properties(node);
    if (!deps.attributes) {
      deps.attributes = new Set();
    }
    deps.attributes.add(attribute);
  }

  addPseudoClass(node, pseudoClass) {
    const deps = this.properties(node);
    if (!deps.pseudoClasses) {
      deps.pseudoClasses = new Set();
    }
    deps.pseudoClasses.add(pseudoClass);
  }

  properties(node) {
    let set = this.changeMap.get(node);
    if (!set) {
      this.changeMap.set(node, set = {});
    }
    return set;
  }
}

class SelectorsMap {
  constructor(ruleSets) {
    this.id = {};
    this.class = {};
    this.type = {};
    this.universal = [];
    this.position = 0;
    this.ruleSets = ruleSets;
    ruleSets.forEach(rule => rule.lookupSort(this));
  }

  query(node) {
    const { tagName, id, classList } = node;
    const selectorClasses = [
      this.universal,
      this.id[id],
      this.type[tagName],
    ];
    if (classList.size) {
      classList.forEach(c => selectorClasses.push(this.class[c]));
    }
    const selectors = selectorClasses
      .filter(arr => !!arr)
      .reduce((cur, next) => cur.concat(next), []);

    const selectorsMatch = new SelectorsMatch();

    selectorsMatch.selectors = selectors
      .filter(sel => sel.sel.accumulateChanges(node, selectorsMatch))
      .sort((a, b) => a.sel.specificity - b.sel.specificity || a.pos - b.pos)
      .map(docSel => docSel.sel);

    return selectorsMatch;
  }

  sortById(id, sel) {
    this.addToMap(this.id, id, sel);
  }

  sortByClass(cssClass, sel) {
    this.addToMap(this.class, cssClass, sel);
  }

  sortByType(cssType, sel) {
    this.addToMap(this.type, cssType, sel);
  }

  sortAsUniversal(sel) {
    this.universal.push(this.makeDocSelector(sel));
  }

  addToMap(map, head, sel) {
    this.position += 1;
    const list = map[head];
    if (list) {
      list.push(this.makeDocSelector(sel));
    } else {
      map[head] = [this.makeDocSelector(sel)];
    }
  }

  makeDocSelector(sel) {
    this.position += 1;
    return { sel, pos: this.position };
  }
}

export {
  SelectorsMap,
};
