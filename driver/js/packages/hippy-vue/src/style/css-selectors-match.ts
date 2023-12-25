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
import { CommonMapParams, NeedToTyped } from '../types/native';

/**
 * Selector Map
 */
export class SelectorsMatch {
  public changeMap: NeedToTyped;
  public selectors: SelectorsMatch[] | undefined;

  constructor() {
    this.changeMap = new Map();
  }

  public addAttribute(node: ElementNode, attribute: NeedToTyped): void {
    const deps = this.properties(node);
    if (!deps.attributes) {
      deps.attributes = new Set();
    }
    deps.attributes.add(attribute);
  }

  public addPseudoClass(node: ElementNode, pseudoClass: string): void {
    const deps = this.properties(node);
    if (!deps.pseudoClasses) {
      deps.pseudoClasses = new Set();
    }
    deps.pseudoClasses.add(pseudoClass);
  }

  public properties(node: ElementNode): CommonMapParams {
    let set = this.changeMap.get(node);
    if (!set) {
      this.changeMap.set(node, set = {});
    }
    return set;
  }
}
