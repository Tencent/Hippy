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

/* eslint-disable no-param-reassign */

/**
 * Selector Map
 */
class SelectorsMatch {
  changeMap: any;
  constructor() {
    this.changeMap = new Map();
  }

  addAttribute(node: any, attribute: any) {
    const deps = this.properties(node);
    if (!deps.attributes) {
      deps.attributes = new Set();
    }
    deps.attributes.add(attribute);
  }

  addPseudoClass(node: any, pseudoClass: any) {
    const deps = this.properties(node);
    if (!deps.pseudoClasses) {
      deps.pseudoClasses = new Set();
    }
    deps.pseudoClasses.add(pseudoClass);
  }

  properties(node: any) {
    let set = this.changeMap.get(node);
    if (!set) {
      this.changeMap.set(node, set = {});
    }
    return set;
  }
}

class SelectorsMap {
  class: any;
  id: any;
  position: any;
  ruleSets: any;
  type: any;
  universal: any;
  constructor(ruleSets: any) {
    this.id = {};
    this.class = {};
    this.type = {};
    this.universal = [];
    this.position = 0;
    this.ruleSets = ruleSets;
    ruleSets.forEach((rule: any) => rule.lookupSort(this));
  }

  append(appendRules: any) {
    this.ruleSets = this.ruleSets.concat(appendRules);
    appendRules.forEach((rule: any) => rule.lookupSort(this));
  }

  delete(hash: any) {
    const removedRuleSets: any = [];
    this.ruleSets = this.ruleSets.filter((rule: any) => {
      if (rule.hash !== hash) return true;
      removedRuleSets.push(rule);
      return false;
    });
    // @ts-expect-error TS(7006): Parameter 'rule' implicitly has an 'any' type.
    removedRuleSets.forEach(rule => rule.removeSort(this));
  }

  query(node: any) {
    const { tagName, id, classList } = node;
    const selectorClasses = [
      this.universal,
      this.id[id],
      this.type[tagName],
    ];
    if (classList.size) {
      classList.forEach((c: any) => selectorClasses.push(this.class[c]));
    }
    const selectors = selectorClasses
      .filter(arr => !!arr)
      .reduce((cur, next) => cur.concat(next || []), []);

    const selectorsMatch = new SelectorsMatch();

    (selectorsMatch as any).selectors = selectors
      .filter((sel: any) => sel.sel.accumulateChanges(node, selectorsMatch))
      .sort((a: any, b: any) => a.sel.specificity - b.sel.specificity || a.pos - b.pos)
      .map((docSel: any) => docSel.sel);

    return selectorsMatch;
  }

  sortById(id: any, sel: any) {
    this.addToMap(this.id, id, sel);
  }

  sortByClass(cssClass: any, sel: any) {
    this.addToMap(this.class, cssClass, sel);
  }

  sortByType(cssType: any, sel: any) {
    this.addToMap(this.type, cssType, sel);
  }

  removeById(id: any, sel: any) {
    this.removeFromMap(this.id, id, sel);
  }

  removeByClass(cssClass: any, sel: any) {
    this.removeFromMap(this.class, cssClass, sel);
  }

  removeByType(cssType: any, sel: any) {
    this.removeFromMap(this.type, cssType, sel);
  }

  sortAsUniversal(sel: any) {
    this.universal.push(this.makeDocSelector(sel));
  }

  removeAsUniversal(sel: any) {
    const index = this.universal.findIndex((item: any) => item.sel.ruleSet.hash === sel.ruleSet.hash);
    if (index !== -1) {
      this.universal.splice(index);
    }
  }

  addToMap(map: any, head: any, sel: any) {
    this.position += 1;
    const list = map[head];
    if (list) {
      list.push(this.makeDocSelector(sel));
    } else {
      map[head] = [this.makeDocSelector(sel)];
    }
  }

  removeFromMap(map: any, head: any, sel: any) {
    const list = map[head];
    const index = list.findIndex((item: any) => item.sel.ruleSet.hash === sel.ruleSet.hash);
    if (index !== -1) {
      list.splice(index, 1);
    }
  }

  makeDocSelector(sel: any) {
    this.position += 1;
    return { sel, pos: this.position };
  }
}

export {
  SelectorsMap,
};
