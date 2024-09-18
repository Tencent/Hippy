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

import type { HippyElement } from '../element/hippy-element';
import { HippyNode, NodeType } from '../node/hippy-node';
import type { SsrNode } from '../../types';

/**
 * hippy text node
 */
export class HippyText extends HippyNode {
  public text: string;
  // used to hydrate, same to vue
  public data: string;

  constructor(text: string, ssrNode?: SsrNode) {
    super(NodeType.TextNode, ssrNode);
    this.text = text;
    this.data = text;

    // text nodes do not need to be inserted into Native
    this.isNeedInsertToNative = false;
  }

  public setText(text: string): void {
    this.text = text;
    if (this.parentNode && this.parentNode.nodeType === NodeType.ElementNode) {
      (this.parentNode as HippyElement).setText(text);
    }
  }
}
