/* eslint-disable no-underscore-dangle */

import { Fiber } from 'react-reconciler';
import { Bridge, Device, UIManager } from '../global';
import { getRootViewId, findNodeById, findNodeByCondition } from '../utils/node';
import { warn } from '../utils';

const {
  createNode,
  updateNode,
  deleteNode,
  flushBatch,
  startBatch,
  endBatch,
  sendRenderError,
} = UIManager;

const getNodeById = findNodeById;

function getNodeIdByRef(stringRef: string): Fiber {
  return findNodeByCondition((node: Fiber) => {
    if (!node.return || !node.return.ref || !(node.return.ref as any)._stringRef) {
      return false;
    }
    return (node.return.ref as any)._stringRef === stringRef;
  });
}

function callUIFunction(...args: any[]): void {
  const [targetNode, funcName, ...options] = args;
  let { nativeName: componentName, nodeId } = targetNode;

  if ((!nodeId || !componentName) && targetNode._reactInternalFiber) {
    warn('[callUIFunction] Passing component instance as targetNode will affect performance, use ref to instead.');
    const node = targetNode._reactInternalFiber.child;
    componentName = (node
      && node.memoizedProps
      && node.memoizedProps.nativeName)
      || targetNode._reactInternalFiber.type.name;

    nodeId = node && node.stateNode ? node.stateNode.nodeId : 0;
  }

  if (!componentName) {
    throw new Error('callUIFunction is calling a unnamed component');
  }

  if (!nodeId) {
    throw new Error('callUIFunction is calling a component have no nodeId');
  }

  let [paramList, callback] = options;
  if (typeof paramList === 'function') {
    callback = paramList;
    paramList = [];
  }

  const rootViewId = getRootViewId();

  if (rootViewId === null) {
    return;
  }

  if (Device.platform.OS === 'ios') {
    if (typeof callback === 'function' && Array.isArray(paramList)) {
      paramList.push(callback);
    }
    Bridge.callNative('UIManagerModule', 'callUIFunction', [componentName, nodeId, funcName, paramList]);
  } else if (Device.platform.OS === 'android') {
    if (typeof callback === 'function') {
      Bridge.callNative('UIManagerModule', 'callUIFunction', [nodeId, funcName, paramList], callback);
    } else {
      Bridge.callNative('UIManagerModule', 'callUIFunction', [nodeId, funcName, paramList]);
    }
  }
}

function measureInWindow(node: Fiber, callBack: Function) {
  let targetNode = (node as any)._reactInternalFiber.child;
  while (targetNode && targetNode.tag !== 5) {
    targetNode = targetNode.child;
  }
  if (targetNode && targetNode.stateNode) {
    const { nodeId } = targetNode.stateNode;
    Bridge.callNative('UIManagerModule', 'measureInWindow', nodeId, callBack);
  }
}

export {
  createNode,
  updateNode,
  deleteNode,
  flushBatch,
  startBatch,
  endBatch,
  sendRenderError,
  getNodeById,
  getNodeIdByRef,
  callUIFunction,
  measureInWindow,
};
