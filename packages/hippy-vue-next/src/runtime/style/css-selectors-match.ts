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
import type { NeedToTyped } from '@hippy-shared/index';
import type { CommonMapParams } from '../../../global';
import type { HippyElement } from '../element/hippy-element';
import type { RuleSet, SelectorCore } from './css-selectors';

/**
 * 样式节点的类型
 *
 * @public
 */
export type CssAttribute = CommonMapParams;

/**
 * 节点选择器类型
 *
 * @public
 */
export interface DocSelector {
  sel: SelectorCore;
  pos: number;
}

/**
 * 节点选择器适配类，存储节点所匹配的Selector列表
 */
class SelectorsMatch {
  // 存储节点的属性map
  public changeMap;

  // 节点所匹配的选择器类列表
  public selectors;

  constructor() {
    this.changeMap = new Map();
  }

  /**
   * 添加选择器属性
   *
   * @param node - 待添加的节点
   * @param attribute - 待添加待属性
   */
  addAttribute(node: HippyElement, attribute: NeedToTyped): void {
    const deps = this.properties(node);
    if (!deps.attributes) {
      deps.attributes = new Set();
    }
    deps.attributes.add(attribute);
  }

  /**
   * 给节点添加伪类
   *
   * @param node - 节点
   * @param pseudoClass - 伪类名称
   */
  addPseudoClass(node: HippyElement, pseudoClass: string): void {
    const deps = this.properties(node);
    if (!deps.pseudoClasses) {
      deps.pseudoClasses = new Set();
    }
    deps.pseudoClasses.add(pseudoClass);
  }

  /**
   * 获取节点cache的属性map，如果没有cache过，则cache
   *
   * @param node - hippy节点
   */
  properties(node: HippyElement): CommonMapParams {
    let set = this.changeMap.get(node);
    if (!set) {
      this.changeMap.set(node, (set = {}));
    }
    return set;
  }
}

/**
 * 选择器适配类
 */
class SelectorsMap {
  /**
   * 移除样式规则map中的样式
   *
   * @param map - 样式 map
   * @param head - 样式标识
   * @param sel - 选择器类
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

  // 节点的id
  public id: CssAttribute;

  // 节点的class
  public class: CssAttribute;

  // 节点的type
  public type: CssAttribute;

  // 节点的通用选择器，如*
  public universal: DocSelector[];

  // 节点的位置
  public position: number;

  // 规则集合列表
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
   * 附加新的样式规则列表
   *
   * @param appendRules - 需要添加的样式规则列表
   */
  public append(appendRules: RuleSet[]): void {
    this.ruleSets = this.ruleSets.concat(appendRules);
    appendRules.forEach(rule => rule.lookupSort(this));
  }

  /**
   * 找出样式规则列表中需要移除的样式并删除
   *
   * @param hash - 样式 chunk 的 hash 值
   */
  public delete(hash: string): void {
    const removeRuleSets: RuleSet[] = [];
    // 根据要删除的hash，选出当前样式规则列表中hash匹配的规则
    this.ruleSets = this.ruleSets.filter((rule) => {
      if (rule.hash !== hash) {
        return true;
      }

      removeRuleSets.push(rule);
      return false;
    });
    // 调用移除规则api移除失活的样式规则
    removeRuleSets.forEach(rule => rule.removeSort(this));
  }

  /**
   * 根据hippy node的id，class，属性等标识，找出匹配的样式信息
   *
   * @param node - 待查询待节点
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
   * 将样式选择器添加到map中
   *
   * @param map - 样式 map
   * @param head - 样式标识
   * @param sel - 选择器类
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
