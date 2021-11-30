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

  append(appendRules) {
    this.ruleSets.concat(appendRules);
    appendRules.forEach(rule => rule.lookupSort(this));
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
