/* eslint-disable no-constant-condition */
/* eslint-disable no-continue */

import { Fiber } from 'react-reconciler';
import '@localTypes/global';

type RootContainer = any;

// Single root instance
let rootContainer: RootContainer;
let rootViewId: number;

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

export {
  setRootContainer,
  getRootContainer,
  getRootViewId,
  findNodeByCondition,
  findNodeById,
};
