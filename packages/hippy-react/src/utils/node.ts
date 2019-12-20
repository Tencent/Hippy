/* eslint-disable no-constant-condition */
/* eslint-disable no-continue */

import { Fiber } from 'react-reconciler';
import { trace } from './index';
import '@localTypes/global';

type RootContainer = any;

const componentName = ['%c[root]%c', 'color: blue', 'color: auto'];

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

function findNodeByCondition(condition: (node: Fiber) => boolean) {
  if (!rootContainer) {
    return null;
  }
  const start = Date.now();
  const { current: root } = rootContainer;
  const queue = [root];
  while (queue.length) {
    const targetNode = queue.shift();
    if (condition(targetNode)) {
      trace(...componentName, 'findNodeById spend', Date.now() - start, targetNode);
      return targetNode;
    }
    if (targetNode.child) {
      queue.push(targetNode.child);
    }
    if (targetNode.sibling) {
      queue.push(targetNode.sibling);
    }
  }
  trace(...componentName, 'findNodeById spend', Date.now() - start, 'ms', null);
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
