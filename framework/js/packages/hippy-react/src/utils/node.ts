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

/* eslint-disable no-constant-condition */
/* eslint-disable no-continue */

import { Fiber } from 'react-reconciler';
import '@localTypes/global';
import ElementNode from '../dom/element-node';

type RootContainer = any;

// Single root instance
let rootContainer: RootContainer;
let rootViewId: number;
const fiberNodeCache = new Map();

function setRootContainer(rootId: number, root: RootContainer) {
  rootViewId = rootId;
  rootContainer = root;
}

function getRootContainer(): RootContainer {
  return rootContainer;
}

function getRootViewId() {
  if (!rootViewId) {
    throw new Error('getRootViewId must execute after setRootContainer');
  }
  return rootViewId;
}

function findNodeByCondition(condition: (node: Fiber) => boolean): null | Fiber {
  if (!rootContainer) {
    return null;
  }
  const { current: root } = rootContainer;
  const queue: Fiber[] = [root];
  while (queue.length) {
    const targetNode = queue.shift();
    if (!targetNode) {
      break;
    }
    if (condition(targetNode)) {
      return targetNode;
    }
    if (targetNode.child) {
      queue.push(targetNode.child);
    }
    if (targetNode.sibling) {
      queue.push(targetNode.sibling);
    }
  }
  return null;
}

function findNodeById(nodeId: number) {
  return findNodeByCondition(node => node.stateNode && node.stateNode.nodeId === nodeId);
}

/**
 * preCacheFiberNode - cache FiberNode
 * @param {Fiber} targetNode
 * @param {number} nodeId
 */
function preCacheFiberNode(targetNode: Fiber, nodeId: number): void {
  fiberNodeCache.set(nodeId, targetNode);
}

/**
 * unCacheFiberNode - delete Fiber Node from cache
 * @param {number} nodeId
 */
function unCacheFiberNode(nodeId: number): void {
  fiberNodeCache.delete(nodeId);
}

/**
 * getFiberNodeFromId - get FiberNode by nodeId
 * @param {number} nodeId
 */
function getFiberNodeFromId(nodeId: number) {
  return fiberNodeCache.get(nodeId) || null;
}

/**
 * unCacheFiberNodeOnIdle - recursively delete FiberNode cache on idle
 * @param {ElementNode|number} node
 */
function unCacheFiberNodeOnIdle(node: ElementNode | number) {
  requestIdleCallback((deadline: { timeRemaining: Function, didTimeout: boolean }) => {
    // if idle time exists or callback invoked when timeout
    if (deadline.timeRemaining() > 0 || deadline.didTimeout) {
      recursivelyUnCacheFiberNode(node);
    }
  }, { timeout: 50 }); // 50ms to avoid blocking user operation
}

/**
 * recursivelyUnCacheFiberNode - delete ViewNode cache recursively
 * @param {ElementNode|number} node
 */
function recursivelyUnCacheFiberNode(node: ElementNode | number): void {
  if (typeof node === 'number') {
    // if leaf node (e.g. text node)
    unCacheFiberNode(node);
  } else if (node) {
    unCacheFiberNode(node.nodeId);
    node.childNodes && node.childNodes.forEach(node => recursivelyUnCacheFiberNode(node as ElementNode));
  }
}

/**
 * requestIdleCallback polyfill
 * @param {Function} cb
 * @param {{timeout: number}} [options]
 */
function requestIdleCallback(cb: Function, options?: { timeout: number }): ReturnType<typeof setTimeout> {
  // @ts-ignore
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
  // @ts-ignore
  return global.requestIdleCallback(cb, options);
}

/**
 * cancelIdleCallback polyfill
 * @param {ReturnType<typeof setTimeout>} id
 */
function cancelIdleCallback(id: ReturnType<typeof setTimeout>): void {
  // @ts-ignore
  if (!global.cancelIdleCallback) {
    clearTimeout(id);
  } else {
    // @ts-ignore
    global.cancelIdleCallback(id);
  }
}

export {
  requestIdleCallback,
  cancelIdleCallback,
  setRootContainer,
  getRootContainer,
  getRootViewId,
  findNodeByCondition,
  findNodeById,
  preCacheFiberNode,
  unCacheFiberNode,
  getFiberNodeFromId,
  unCacheFiberNodeOnIdle,
  recursivelyUnCacheFiberNode,
};
