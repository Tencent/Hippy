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
import ViewNode from '../../renderer/view-node';
import { SelectorsMatch } from '../css-selectors-match';
import { SelectorCore } from './core-selector';

export class SimpleSelector extends SelectorCore {
  // rarity of style
  public rarity = 0;

  public combinator?: string;

  public accumulateChanges(node: ElementNode, map: SelectorsMatch): boolean {
    if (!this.dynamic) {
      return this.match(node);
    }
    if (this.mayMatch(node)) {
      this.trackChanges(node, map);
      return true;
    }
    return false;
  }

  /**
   * determine if the node matches
   * @param node - target node
   */
  public mayMatch(node: ViewNode): boolean {
    return this.match(node);
  }

  /**
   * prejudgment
   * @param _node - target node
   */
  public match(_node?: ViewNode): boolean {
    return false;
  }
}
