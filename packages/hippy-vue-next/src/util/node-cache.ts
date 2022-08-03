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

/**
 * Node Cache Operation
 */
import { type HippyNode } from '../runtime/node/hippy-node';

import {
  type HippyCachedInstanceType,
  getHippyCachedInstance,
} from './instance';

/**
 * the map that cached hippy-node to increase node select performance
 */
const nodeCache = new Map();

/**
 * preCacheNode - cache HippyNode
 *
 * @param targetNode - cached node
 * @param nodeId - cached node's id
 */
export function preCacheNode(targetNode: HippyNode, nodeId: number): void {
  nodeCache.set(nodeId, targetNode);
}

/**
 * unCacheNode - delete HippyNode from cache
 *
 * @param nodeId - delete node's id
 */
export function unCacheNode(nodeId: number): void {
  nodeCache.delete(nodeId);
}

/**
 * getNodeById - get cached hippy-node by nodeId
 *
 * @param nodeId - cached node's id
 */
export function getNodeById(nodeId: number): HippyNode {
  return nodeCache.get(nodeId) || null;
}

/**
 * recursivelyUnCacheNode - delete ViewNode cache recursively
 *
 * @param  node - cached node or nodeId
 */
export function recursivelyUnCacheNode(node: HippyNode | number): void {
  if (typeof node === 'number') {
    // if leaf node (e.g. text node)
    unCacheNode(node);
  } else if (node) {
    unCacheNode(node.nodeId);
    node.childNodes?.forEach(childNode => recursivelyUnCacheNode(childNode));
  }
}

/**
 * requestIdleCallback polyfill
 *
 * @param cb - callback
 * @param options - options
 */
export function requestIdleCallback(
  cb: IdleRequestCallback,
  options?: IdleRequestOptions | undefined,
): number {
  if (!global.requestIdleCallback) {
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining() {
          return Infinity;
        },
      });
    }, 1) as unknown as number;
  }
  return global.requestIdleCallback(cb, options);
}

/**
 * cancelIdleCallback polyfill
 *
 * @param id - callback id
 */
export function cancelIdleCallback(id: number): void {
  if (!global.cancelIdleCallback) {
    clearTimeout(id);
  } else {
    global.cancelIdleCallback(id);
  }
}

/**
 * unCacheViewNodeOnIdle - recursively delete ViewNode cache on idle
 *
 * @param node - cached node or nodeId
 */
export function unCacheNodeOnIdle(node: HippyNode | number): void {
  requestIdleCallback(
    (deadline) => {
      // if idle time exists or callback invoked when timeout
      if (deadline.timeRemaining() > 0 || deadline.didTimeout) {
        recursivelyUnCacheNode(node);
      }
    },
    { timeout: 50 },
  ); // 50ms to avoid blocking user operation
}

/**
 * find target node by nodeId with Vue Node Tree.
 * This function is the lower performance funtion, do not recommend to use.
 *
 * @param targetNodeId - 目标节点的id
 */
export function findTargetNode(targetNodeId: number): HippyNode | null {
  const vueInstance: Partial<HippyCachedInstanceType> = getHippyCachedInstance();

  if (vueInstance.instance) {
    const { $el: rootNode } = vueInstance.instance;

    return rootNode.findChild((node: HippyNode) => node.nodeId === targetNodeId);
  }

  return null;
}
