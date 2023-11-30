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

import { wrap } from '../util';
import { SimpleSelector } from './simple-selector';

/**
 * Class Selector
 */
export class ClassSelector extends SimpleSelector {
  className: string;

  constructor(className: string) {
    super();
    this.specificity = 0x00000100;
    this.rarity = 2;
    this.dynamic = false;
    this.className = className;
  }

  toString() {
    return `.${this.className}${wrap(this.combinator)}`;
  }

  public match(node: any) {
    if (!node) return false;
    return node.classList?.size && node.classList.has(this.className);
  }

  public lookupSort(sorter: any, base: any) {
    sorter.sortByClass(this.className, base || this);
  }

  public removeSort(sorter: any, base: any) {
    sorter.removeByClass(this.className, base || this);
  }
}
