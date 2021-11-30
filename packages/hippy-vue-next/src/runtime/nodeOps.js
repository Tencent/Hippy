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

import document from '../renderer/document-node';
import { unCacheNodeOnIdle } from '../util/node';

export const nodeOps = {
  insert: (child, parent, anchor) => {
    if (parent.childNodes.indexOf(child) >= 0) {
      // move it if the node has existed
      parent.moveChild(child, anchor);
    } else {
      parent.insertBefore(child, anchor);
    }
  },

  remove: (child) => {
    const { parentNode } = child;
    if (parentNode) {
      parentNode.removeChild(child);
      unCacheNodeOnIdle(child);
    }
  },

  createElement: tag => document.createElement(tag),

  createText: text => document.createTextNode(text),

  createComment: text => document.createComment(text),

  setText: (node, text) => {
    node.setText(text);
  },

  setElementText: (node, text) => {
    node.setText(text);
  },

  parentNode: node => node.parentNode,

  nextSibling: node => node.nextSibling,

  querySelector: () => {
    // noop
  },
};
