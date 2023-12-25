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

import ElementNode from '../../renderer/element-node';
import { SelectorsMatch } from '../css-selectors-match';
import { wrap } from '../util';
import { SimpleSelector } from './simple-selector';

/**
 * 伪类选择器实现
 */
export class PseudoClassSelector extends SimpleSelector {
  public cssPseudoClass: string;

  public constructor(cssPseudoClass: string) {
    super();
    this.specificity = 0x00000100;
    this.rarity = 0;
    this.dynamic = true;
    this.cssPseudoClass = cssPseudoClass;
  }

  public toString(): string {
    return `:${this.cssPseudoClass}${wrap(this.combinator || '')}`;
  }

  public match(node: ElementNode): boolean {
    return !!node;
  }

  public mayMatch(): boolean {
    return true;
  }

  public trackChanges(node: ElementNode, map: SelectorsMatch) {
    map.addPseudoClass(node, this.cssPseudoClass);
  }
}

