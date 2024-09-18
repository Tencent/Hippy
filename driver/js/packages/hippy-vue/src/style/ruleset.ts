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

import { SelectorsMap } from './css-selectors-map';
import { SelectorCore } from './selector/core-selector';

/**
 * css node declaration type
 *
 * @public
 */
export interface CssDeclarationType {
  type: string;
  property: string;
  value: string | number;
}

type RuleSetSelector = SelectorCore & { ruleSet: RuleSet };

/**
 * Rule Set
 */
export class RuleSet {
  public selectors: SelectorCore[];
  public declarations: CssDeclarationType[];
  public hash: string;

  public constructor(
    selectors: RuleSetSelector[],
    declarations: CssDeclarationType[],
    hash: string,
  ) {
    selectors.forEach((curSelector) => {
      const selector = curSelector;
      selector.ruleSet = this;
      return null;
    });
    this.hash = hash;
    this.selectors = selectors;
    this.declarations = declarations;
  }

  public toString(): string {
    return `${this.selectors.join(', ')} {${
      this.declarations.map((d: CssDeclarationType, i: number) => `${i === 0 ? ' ' : ''}${d.property}: ${d.value}`).join('; ')
    }}`;
  }

  public lookupSort(sorter: SelectorsMap): void {
    this.selectors.forEach((sel: SelectorCore) => sel.lookupSort(sorter));
  }

  public removeSort(sorter: SelectorsMap): void {
    this.selectors.forEach((sel: SelectorCore) => sel.removeSort(sorter));
  }
}
