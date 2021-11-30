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

const nodeCache = new Map();

/**
 * preCacheNode - cache ViewNode
 * @param {ViewNode} targetNode
 * @param {number} nodeId
 */
function preCacheNode(targetNode, nodeId) {
  nodeCache.set(nodeId, targetNode);
}

/**
 * unCacheNode - delete ViewNode from cache
 * @param {number} nodeId
 */
function unCacheNode(nodeId) {
  nodeCache.delete(nodeId);
}

/**
 * getNodeById - get ViewNode by nodeId
 * @param {number} nodeId
 */
function getNodeById(nodeId) {
  return nodeCache.get(nodeId) || null;
}

/**
 * unCacheViewNodeOnIdle - recursively delete ViewNode cache on idle
 * @param {ViewNode|number} node
 */
function unCacheNodeOnIdle(node) {
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
function recursivelyUnCacheNode(node) {
  if (typeof node === 'number') {
    // if leaf node (e.g. text node)
    unCacheNode(node);
  } else if (node) {
    unCacheNode(node.nodeId);
    node.childNodes && node.childNodes.forEach(node => recursivelyUnCacheNode(node));
  }
}

/**
 * requestIdleCallback polyfill
 * @param {Function} cb
 * @param {{timeout: number}} [options]
 */
function requestIdleCallback(cb, options) {
  if (!global.requestIdleCallback) {
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining() {
          return Infinity;
        },
      });
    }, 1);
  }
  return global.requestIdleCallback(cb, options);
}

/**
 * cancelIdleCallback polyfill
 * @param {ReturnType<typeof setTimeout>} id
 */
function cancelIdleCallback(id) {
  if (!global.cancelIdleCallback) {
    clearTimeout(id);
  } else {
    global.cancelIdleCallback(id);
  }
}

export {
  recursivelyUnCacheNode,
  requestIdleCallback,
  cancelIdleCallback,
  preCacheNode,
  unCacheNode,
  getNodeById,
  unCacheNodeOnIdle,
};
