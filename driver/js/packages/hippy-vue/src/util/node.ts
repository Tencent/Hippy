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

import ViewNode from '../renderer/view-node';
import { NeedToTyped } from '../types/native';

/* eslint-disable no-param-reassign */

const nodeCache = new Map();

/**
 * preCacheNode - cache ViewNode
 * @param {ViewNode} targetNode
 * @param {number} nodeId
 */
function preCacheNode(targetNode: ViewNode, nodeId: number) {
  nodeCache.set(nodeId, targetNode);
}

/**
 * unCacheNode - delete ViewNode from cache
 * @param {number} nodeId
 */
function unCacheNode(nodeId: number) {
  nodeCache.delete(nodeId);
}

/**
 * getNodeById - get ViewNode by nodeId
 * @param {number} nodeId
 */
function getNodeById(nodeId: number) {
  return nodeCache.get(nodeId) || null;
}

/**
 * unCacheViewNodeOnIdle - recursively delete ViewNode cache on idle
 * @param {ViewNode|number} node
 */
function unCacheNodeOnIdle(node: ViewNode) {
  requestIdleCallback((deadline) => {
    // if idle time exists or callback invoked when timeout
    if (deadline.timeRemaining() > 0 || deadline.didTimeout) {
      recursivelyUnCacheNode(node);
    }
  }, { timeout: 50 });  // 50ms to avoid blocking user operation
}

/**
 * recursivelyUnCacheNode - delete ViewNode cache recursively
 * @param {ViewNode|number} node
 */
function recursivelyUnCacheNode(node: ViewNode) {
  unCacheNode(node.nodeId);
  node.childNodes?.forEach((node: ViewNode) => recursivelyUnCacheNode(node));
}

/**
 * requestIdleCallback polyfill
 * @param {Function} cb
 * @param {{timeout: number}} [options]
 */
function requestIdleCallback(callback: any, options?: any) {
  if (!global.requestIdleCallback) {
    return setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining() {
          return Infinity;
        },
      });
    }, 1);
  }
  return global.requestIdleCallback(callback, options);
}

/**
 * cancelIdleCallback polyfill
 * @param {ReturnType<typeof setTimeout>} id
 */
function cancelIdleCallback(id: number) {
  if (!global.cancelIdleCallback) {
    clearTimeout(id);
  } else {
    global.cancelIdleCallback(id);
  }
}

/**
 * isStyleMatched - judge whether selector matching
 * @param matchedSelector
 * @param targetNode
 * @returns {boolean|*}
 */
function isStyleMatched(matchedSelector: NeedToTyped, targetNode: ViewNode) {
  if (!targetNode || !matchedSelector) return false;
  return matchedSelector.match(targetNode);
}

/**
 * findNotToSkipNode - find out a node that need sent to native
 * @param nodes
 * @param startIndex
 * @returns {*}
 */
function findNotToSkipNode(nodes: ViewNode[] = [], startIndex = 0) {
  let targetNode = nodes[startIndex];
  for (let i = startIndex; i < nodes.length; i++) {
    const node = nodes[i];
    if (node && (node as any).meta && !(node as any).meta.skipAddToDom) {
      targetNode = node;
      break;
    }
  }
  return targetNode;
}

const RelativeToRefType = {
  BEFORE: -1,
  AFTER: 1,
};

function isHippyTextNode(targetNode) {
  return targetNode.meta?.component && targetNode.meta.component.name === 'Text';
}

export {
  RelativeToRefType,
  findNotToSkipNode,
  recursivelyUnCacheNode,
  requestIdleCallback,
  cancelIdleCallback,
  preCacheNode,
  unCacheNode,
  getNodeById,
  unCacheNodeOnIdle,
  isStyleMatched,
  isHippyTextNode,
};
