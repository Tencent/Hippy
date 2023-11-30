import { wrap } from '../util';
import { SimpleSelector } from './simple-selector';

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

/**
 * Id Selector
 */
export class IdSelector extends SimpleSelector {
  id: any;

  constructor(id: any) {
    super();
    this.specificity = 0x00010000;
    this.rarity = 3;
    this.dynamic = false;
    this.id = id;
  }

  toString() {
    return `#${this.id}${wrap(this.combinator)}`;
  }

  match(node: any) {
    if (!node) return false;
    return node.id === this.id;
  }

  lookupSort(sorter: any, base: any) {
    sorter.sortById(this.id, base || this);
  }

  removeSort(sorter: any, base: any) {
    sorter.removeById(this.id, base || this);
  }
}
