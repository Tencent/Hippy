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

export {
  setRootContainer,
  getRootContainer,
  getRootViewId,
  findNodeByCondition,
  findNodeById,
  preCacheFiberNode,
  unCacheFiberNode,
  getFiberNodeFromId,
  recursivelyUnCacheFiberNode,
};
