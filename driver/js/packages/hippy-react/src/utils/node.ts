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

import { Fiber } from '@hippy/react-reconciler';
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
 * getElementFromFiber - get ElementNode by Fiber
 * @param {number} fiberNode
 */
function getElementFromFiber(fiberNode: Fiber) {
  return fiberNode?.stateNode || null;
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
    if (Array.isArray(node.childNodes)) {
      node.childNodes.forEach(node => recursivelyUnCacheFiberNode(node as ElementNode));
    }
  }
}

/**
 * requestIdleCallback polyfill
 * @param {Function} cb
 * @param {{timeout: number}} [options]
 */
function requestIdleCallback(
  cb: IdleRequestCallback,
  options?: { timeout: number },
): ReturnType<typeof setTimeout> | number {
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
 * @param {ReturnType<typeof requestIdleCallback>} id
 */
function cancelIdleCallback(id: ReturnType<typeof requestIdleCallback>): void {
  if (!global.cancelIdleCallback) {
    clearTimeout(id as ReturnType<typeof setTimeout>);
  } else {
    global.cancelIdleCallback(id as number);
  }
}

interface EventNamesMap {
  [propName: string]: string[];
}

// Event Name Index
const NATIVE_EVENT_INDEX = 1;
const eventHandlerType = {
  ADD: 0,
  REMOVE: 1,
};
const relativeToRefType = {
  BEFORE: -1,
  AFTER: 1,
};
const eventNamesMap: EventNamesMap = {
  // onPressIn: ['onPressIn', 'onTouchDown'],
  // onPressOut: ['onPressOut', 'onTouchEnd'],
  onTouchStart: ['onTouchStart', 'onTouchDown'],
  onPress: ['onPress', 'onClick'],
};

const DOMEventPhase = {
  NONE: 0,
  CAPTURING_PHASE: 1,
  AT_TARGET: 2,
  BUBBLING_PHASE: 3,
};

const nativeEventMap = {
  onClick: 'click',
  onLongClick: 'longclick',
  // onPressIn: 'touchstart', // normalization
  // onPressOut: 'touchend', // normalization
  onPressIn: 'pressin',
  onPressOut: 'pressout',
  onTouchDown: 'touchstart', // compatible with w3c standard name touchstart
  onTouchStart: 'touchstart',
  onTouchEnd: 'touchend',
  onTouchMove: 'touchmove',
  onTouchCancel: 'touchcancel',
};

function isNativeGesture(name) {
  return !!nativeEventMap[name];
}

function translateToNativeEventName(name) {
  return name.replace(/^(on)?/g, '').toLocaleLowerCase();
}

function isTextNode(targetNode: ElementNode) {
  return (targetNode && targetNode.nativeName === 'Text') || ['p', 'span'].indexOf(targetNode.tagName) !== -1;
}

export {
  relativeToRefType,
  NATIVE_EVENT_INDEX,
  DOMEventPhase,
  eventHandlerType,
  eventNamesMap,
  nativeEventMap,
  isNativeGesture,
  translateToNativeEventName,
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
  getElementFromFiber,
  unCacheFiberNodeOnIdle,
  recursivelyUnCacheFiberNode,
  isTextNode,
};
