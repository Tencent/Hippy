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

import { getNodeAttrVal, wrap } from '../util';
import { SelectorsMatch } from '../css-selectors-match';
import { isNullOrUndefined } from '../../util';
import ElementNode from '../../renderer/element-node';
import { SimpleSelector } from './simple-selector';

/**
 * 属性选择器实现
 */
export class AttributeSelector extends SimpleSelector {
  // attribute of node
  public attribute = '';

  // property Test Conditions
  public test = '';

  // value of node
  public value = '';

  constructor(attribute: string, test = '', value = '') {
    super();
    this.specificity = 0x00000100;
    this.rarity = 0;
    this.dynamic = true;
    this.attribute = attribute;
    this.test = test;
    this.value = value;
  }

  public match(node: ElementNode) {
    if (!this.test) {
      // HasAttribute
      if (!node || !node.attributes) return false;
      return !isNullOrUndefined(getNodeAttrVal(node, this.attribute));
    }

    if (!this.value) {
      return false;
    }

    if (!node || !node.attributes) return false;
    // const escapedValue = value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    const attr = `${getNodeAttrVal(node, this.attribute)}`;

    if (this.test === '=') {
      // Equals
      return attr === this.value;
    }

    if (this.test === '^=') {
      // PrefixMatch
      return attr.startsWith(this.value);
    }

    if (this.test === '$=') {
      // SuffixMatch
      return attr.endsWith(this.value);
    }

    if (this.test === '*=') {
      // SubstringMatch
      return attr.indexOf(this.value) !== -1;
    }

    if (this.test === '~=') {
      // Includes
      const words = attr.split(' ');
      return words && words.indexOf(this.value) !== -1;
    }

    if (this.test === '|=') {
      // DashMatch
      return attr === this.value || attr.startsWith(`${this.value}-`);
    }
    return false;
  }

  public toString(): string {
    return `[${this.attribute}${wrap(this.test)}${(this.test && this.value) || ''}]${wrap(this.combinator || '')}`;
  }

  public mayMatch(): boolean {
    return true;
  }

  public trackChanges(node: ElementNode, map: SelectorsMatch) {
    map.addAttribute(node, this.attribute);
  }
}
