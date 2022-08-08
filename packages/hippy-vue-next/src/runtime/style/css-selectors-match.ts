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
/* eslint-disable no-param-reassign */

// eslint-disable-next-line max-classes-per-file
import type { NeedToTyped, CommonMapParams } from '../../config';
import type { HippyElement } from '../element/hippy-element';
import type { RuleSet, SelectorCore } from './css-selectors';

export type CssAttribute = CommonMapParams;

export interface DocSelector {
  sel: SelectorCore;
  pos: number;
}

/**
 * stores the Selector list matched by the node
 */
class SelectorsMatch {
  public changeMap;

  public selectors;

  constructor() {
    this.changeMap = new Map();
  }

  /**
   * Add attribute
   *
   * @param node - target node
   * @param attribute - attribute name
   */
  addAttribute(node: HippyElement, attribute: NeedToTyped): void {
    const deps = this.properties(node);
    if (!deps.attributes) {
      deps.attributes = new Set();
    }
    deps.attributes.add(attribute);
  }

  /**
   * add pseudo class
   *
   * @param node - target node
   * @param pseudoClass - pseudo class
   */
  addPseudoClass(node: HippyElement, pseudoClass: string): void {
    const deps = this.properties(node);
    if (!deps.pseudoClasses) {
      deps.pseudoClasses = new Set();
    }
    deps.pseudoClasses.add(pseudoClass);
  }

  properties(node: HippyElement): CommonMapParams {
    let set = this.changeMap.get(node);
    if (!set) {
      this.changeMap.set(node, (set = {}));
    }
    return set;
  }
}


class SelectorsMap {
  /**
   * Remove the specified style from the style rules map
   *
   * @param map - style map
   * @param head - style key
   * @param sel - selector
   */
  static removeFromMap(
    map: CssAttribute,
    head: string,
    sel: SelectorCore,
  ): void {
    const list = map[head];
    const index = list.findIndex(item => item.sel.ruleSet.hash === sel.ruleSet?.hash);

    if (index !== -1) {
      list.splice(index, 1);
    }
  }

  public id: CssAttribute;

  public class: CssAttribute;

  public type: CssAttribute;

  // generic selector for nodes, eg.*
  public universal: DocSelector[];

  // position of node
  public position: number;

  // rule set
  public ruleSets: RuleSet[];

  constructor(ruleSets: RuleSet[]) {
    this.id = {};
    this.class = {};
    this.type = {};
    this.universal = [];
    this.position = 0;
    this.ruleSets = ruleSets;
    ruleSets.forEach(rule => rule.lookupSort(this));
  }

  /**
   * Append a new list of style rules
   *
   * @param appendRules - list of style rules
   */
  public append(appendRules: RuleSet[]): void {
    this.ruleSets = this.ruleSets.concat(appendRules);
    appendRules.forEach(rule => rule.lookupSort(this));
  }

  /**
   * Find the style in the list of style rules according to the hash value and delete it
   *
   * @param hash - hash of style chunk
   */
  public delete(hash: string): void {
    const removeRuleSets: RuleSet[] = [];
    // Find the style in the list of style rules according to the hash value
    this.ruleSets = this.ruleSets.filter((rule) => {
      if (rule.hash !== hash) {
        return true;
      }

      removeRuleSets.push(rule);
      return false;
    });
    // Call the remove rule api to remove the deactivated style rule
    removeRuleSets.forEach(rule => rule.removeSort(this));
  }

  /**
   * Find the matching style information according to the id, class, attribute of the hippy node
   *
   * @param node - target node
   */
  public query(node: HippyElement): SelectorsMatch {
    const { tagName, id, classList } = node;
    const selectorClasses = [this.universal, this.id[id], this.type[tagName]];
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

  public removeById(id: string, sel: SelectorCore): void {
    SelectorsMap.removeFromMap(this.id, id, sel);
  }

  public sortById(id: string, sel: SelectorCore): void {
    this.addToMap(this.id, id, sel);
  }

  public removeByClass(cssClass: string, sel: SelectorCore): void {
    SelectorsMap.removeFromMap(this.class, cssClass, sel);
  }

  public sortByClass(cssClass: string, sel: SelectorCore): void {
    this.addToMap(this.class, cssClass, sel);
  }

  public removeByType(cssType: string, sel: SelectorCore): void {
    SelectorsMap.removeFromMap(this.type, cssType, sel);
  }

  public sortByType(cssType: string, sel: SelectorCore): void {
    this.addToMap(this.type, cssType, sel);
  }

  public removeAsUniversal(sel: SelectorCore): void {
    const index = this.universal.findIndex(item => item.sel.ruleSet?.hash === sel.ruleSet?.hash);

    if (index !== -1) {
      this.universal.splice(index);
    }
  }

  public sortAsUniversal(sel: SelectorCore): void {
    this.universal.push(this.makeDocSelector(sel));
  }

  /**
   * add style selector to map
   *
   * @param map - style map
   * @param head - style key
   * @param sel - selector
   */
  public addToMap(map: CssAttribute, head: string, sel: SelectorCore): void {
    this.position += 1;
    const list = map[head];
    if (list) {
      list.push(this.makeDocSelector(sel));
    } else {
      map[head] = [this.makeDocSelector(sel)];
    }
  }

  public makeDocSelector(sel: SelectorCore): DocSelector {
    this.position += 1;
    return { sel, pos: this.position };
  }
}

export { SelectorsMap, SelectorsMatch };
