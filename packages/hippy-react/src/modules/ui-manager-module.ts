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
import { Bridge, Device, UIManager } from '../global';
import { getRootViewId, findNodeById, findNodeByCondition } from '../utils/node';
import { isFunction, warn, trace } from '../utils';
import Element from '../dom/element-node';

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

/**
 * Get the nodeId from FiberNode ref.
 *
 * @param {Fiber} ref - ref instance.
 */
function getElementFromFiberRef(ref: Fiber | Element) {
  if (ref instanceof Element) {
    return ref;
  }
  // FIXME: should not use the private _reactInternalFiber
  const internalFiber = (ref as any)._reactInternalFiber || (ref as any)._reactInternals;
  if (internalFiber?.child) {
    let targetNode = internalFiber.child;
    while (targetNode && !(targetNode.stateNode instanceof Element)) {
      targetNode = targetNode.child;
    }
    if (!targetNode || !targetNode.stateNode) {
      return null;
    }
    return targetNode.stateNode;
  }
  return null;
}

/**
 * Get the nodeId number by ref
 * Most use in the module access components.
 *
 * @param {string | Fiber | Fiber} ref - ref instance, reference to the class is recommend
 */
function getNodeIdByRef(ref: string | Fiber | Element): number {
  // typeof ref === 'string'
  let tempRef = ref;
  if (typeof ref === 'string') {
    warn(`getNodeIdByRef('${ref}') use string ref will affect to performance, recommend use reference to the ref instead`);
    const targetElement = findNodeByCondition((node: Fiber) => {
      /* eslint-disable-next-line no-underscore-dangle */
      if (!node.return || !node.return.ref || !(node.return.ref as any)._stringRef) {
        return false;
      }
      /* eslint-disable-next-line no-underscore-dangle */
      return (node.return.ref as any)._stringRef === ref;
    });
    if (!targetElement || !targetElement.stateNode) {
      return 0;
    }
    tempRef = targetElement.stateNode;
  }

  // typeof fiberRef === 'Fiber'
  if (!(tempRef as Element).nodeId) {
    const targetElement = getElementFromFiberRef(tempRef as Element);
    if (!targetElement) {
      return 0;
    }
    return targetElement.nodeId;
  }
  // typeof ref === 'Element'
  return (tempRef as Element).nodeId;
}

/**
 * Component access UI functions
 *
 * @param {ViewNode} ref - Element ref that have nodeId.
 * @param {string} funcName - function name.
 * @param {Array} options - function options.
 */
function callUIFunction(ref: Element | Fiber, funcName: string, ...options: any[]): void {
  let { nativeName: componentName, nodeId } = ref as Element;

  if (!nodeId || !componentName) {
    const targetElement = getElementFromFiberRef(ref);
    if (targetElement) {
      ({ nodeId, nativeName: componentName } = targetElement);
    }
  }

  if (!componentName) {
    throw new Error('callUIFunction is calling a unnamed component');
  }

  if (!nodeId) {
    throw new Error('callUIFunction is calling a component have no nodeId');
  }

  let [paramList = [], callback] = options;
  if (isFunction(paramList)) {
    callback = paramList;
    paramList = [];
  }

  const rootViewId = getRootViewId();

  if (rootViewId === null) {
    return;
  }
  trace('callUIFunction', { nodeId, funcName, paramList });
  if (Device.platform.OS === 'ios') {
    if (isFunction(callback) && Array.isArray(paramList)) {
      paramList.push(callback);
    }
    Bridge.callNative('UIManagerModule', 'callUIFunction', [componentName, nodeId, funcName, paramList]);
  } else if (Device.platform.OS === 'android') {
    if (isFunction(callback)) {
      Bridge.callNative('UIManagerModule', 'callUIFunction', [nodeId, funcName, paramList], callback);
    } else {
      Bridge.callNative('UIManagerModule', 'callUIFunction', [nodeId, funcName, paramList]);
    }
  }
}

/**
 * Get the ref position and size in the visible window.
 * > For the position and size in the layout, use onLayout event.
 *
 * @param {string} method
 * @param {Fiber | Element} ref - ref that need to measure.
 * @param {function} callback
 */
function measureInWindowByMethod(
  method: string,
  ref: Fiber,
  callback?: (layout: HippyTypes.LayoutEvent | string) => void,
) {
  const nodeId = getNodeIdByRef(ref);
  return new Promise((resolve, reject) => {
    if (!nodeId) {
      if (callback && isFunction(callback)) {
        // Forward compatibility for old callback
        callback('this view is null');
      }
      return reject(new Error(`${method} cannot get nodeId`));
    }
    trace('callUIFunction', { nodeId, funcName: method, paramList: [] });
    return Bridge.callNative('UIManagerModule', method, nodeId, (layout: HippyTypes.LayoutEvent | string) => {
      if (callback && isFunction(callback)) {
        callback(layout);
      }
      if (layout === 'this view is null') {
        return reject(new Error('Android cannot get the node'));
      }
      return resolve(layout);
    });
  });
}

/**
 * Get the ref position and size in the visible window.
 * > For the position and size in the layout, use onLayout event.
 * P.S. iOS can only obtains the layout of rootView container,
 * so measureInAppWindow method is recommended
 *
 * @deprecated
 * @param {Fiber | Element} ref - ref that need to measure.
 * @param {Function} callback
 */
function measureInWindow(ref: Fiber, callback?: (layout: HippyTypes.LayoutEvent | string) => void) {
  return measureInWindowByMethod('measureInWindow', ref, callback);
}

/**
 * Get the ref position and size in the App visible window.
 * > For the position and size in the layout, use onLayout event.
 *
 * @param {Fiber | Element} ref - ref that need to measure.
 * @param {Function} callback
 */
function measureInAppWindow(ref: Fiber, callback?: (layout: HippyTypes.LayoutEvent | string) => void) {
  if (Device.platform.OS === 'android') {
    return measureInWindowByMethod('measureInWindow', ref, callback);
  }

  return measureInWindowByMethod('measureInAppWindow', ref, callback);
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
  getElementFromFiberRef,
  callUIFunction,
  measureInWindow,
  measureInAppWindow,
};
