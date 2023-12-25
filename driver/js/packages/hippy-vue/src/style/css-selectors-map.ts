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

import ElementNode from '../renderer/element-node';
import { CommonMapParams } from '../types/native';
import { SelectorsMatch } from './css-selectors-match';
import { RuleSet } from './ruleset';
import { SelectorCore } from './selector/core-selector';
import { SimpleSelector } from './selector/simple-selector';

export type CssAttribute = CommonMapParams;
export interface DocSelector {
  sel: SelectorCore;
  pos: number;
}
export class SelectorsMap {
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
    ruleSets.forEach((rule: RuleSet) => rule.lookupSort(this));
  }

  public append(appendRules: RuleSet[]) {
    this.ruleSets = this.ruleSets.concat(appendRules);
    appendRules.forEach((rule: RuleSet) => rule.lookupSort(this));
  }

  public delete(hash: string) {
    const removedRuleSets: RuleSet[] = [];
    this.ruleSets = this.ruleSets.filter((rule: RuleSet) => {
      if (rule.hash !== hash) {
        return true;
      }
      removedRuleSets.push(rule);
      return false;
    });
    removedRuleSets.forEach(rule => rule.removeSort(this));
  }

  public query(node: ElementNode) {
    const { tagName, id, classList } = node;
    const selectorClasses = [
      this.universal,
      this.id[id],
      this.type[tagName],
    ];
    if (classList.size) {
      classList.forEach((c: string) => selectorClasses.push(this.class[c]));
    }
    const selectors = selectorClasses
      .filter(arr => !!arr)
      .reduce((cur, next) => cur.concat(next || []), []);

    const selectorsMatch = new SelectorsMatch();

    selectorsMatch.selectors = selectors
      .filter((sel: DocSelector) => (sel.sel as SimpleSelector).accumulateChanges(node, selectorsMatch))
      .sort((a: DocSelector, b: DocSelector) => a.sel.specificity - b.sel.specificity || a.pos - b.pos)
      .map((docSel: DocSelector) => docSel.sel);

    return selectorsMatch;
  }

  public sortById(id: string, sel: SelectorCore) {
    this.addToMap(this.id, id, sel);
  }

  public sortByClass(cssClass: string, sel: SelectorCore) {
    this.addToMap(this.class, cssClass, sel);
  }

  public sortByType(cssType: string, sel: SelectorCore) {
    this.addToMap(this.type, cssType, sel);
  }

  public removeById(id: string, sel: SelectorCore) {
    this.removeFromMap(this.id, id, sel);
  }

  public removeByClass(cssClass: string, sel: SelectorCore) {
    this.removeFromMap(this.class, cssClass, sel);
  }

  public removeByType(cssType: string, sel: SelectorCore) {
    this.removeFromMap(this.type, cssType, sel);
  }

  public sortAsUniversal(sel: SelectorCore) {
    this.universal.push(this.makeDocSelector(sel));
  }

  public removeAsUniversal(sel: SelectorCore) {
    const index = this.universal.findIndex((item: DocSelector) => item.sel.ruleSet?.hash === sel.ruleSet?.hash);
    if (index !== -1) {
      this.universal.splice(index);
    }
  }

  public addToMap(attribute: CssAttribute, head: string, sel: SelectorCore) {
    const map = attribute;
    this.position += 1;
    const list = map[head];
    if (list) {
      list.push(this.makeDocSelector(sel));
    } else {
      map[head] = [this.makeDocSelector(sel)];
    }
  }

  public removeFromMap(attribute: CssAttribute, head: string, sel: SelectorCore) {
    const map = attribute;
    const list = map[head];
    const index = list.findIndex((item: DocSelector) => item.sel.ruleSet?.hash === sel.ruleSet?.hash);
    if (index !== -1) {
      list.splice(index, 1);
    }
  }

  public makeDocSelector(sel: SelectorCore) {
    this.position += 1;
    return { sel, pos: this.position };
  }
}


